package com.qlearo.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qlearo.backend.entity.ClarivoChatMessage;
import com.qlearo.backend.entity.ClarivoChatSession;
import com.qlearo.backend.repository.ClarivoChatMessageRepository;
import com.qlearo.backend.repository.ClarivoChatSessionRepository;
import com.qlearo.backend.service.ClarivoChatService;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class ClarivoChatServiceImpl implements ClarivoChatService {

    private final ClarivoChatSessionRepository sessionRepository;
    private final ClarivoChatMessageRepository messageRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${clarivo.ai.groq.api.key:}")
    private String groqApiKey;

    @Value("${clarivo.ai.groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    public ClarivoChatServiceImpl(
        ClarivoChatSessionRepository sessionRepository,
        ClarivoChatMessageRepository messageRepository
    ) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
    }

    @Override
    public List<Map<String, Object>> getSessions(String userId, String userRole) {
        String safeUserId = firstText(userId, "");
        String safeUserRole = firstText(userRole, "student");

        return sessionRepository.findByUserIdAndUserRoleOrderByUpdatedAtDesc(safeUserId, safeUserRole)
            .stream()
            .map(this::toSessionMap)
            .toList();
    }

    @Override
    public List<Map<String, Object>> getMessages(String sessionId) {
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
            .stream()
            .map(this::toMessageMap)
            .toList();
    }

    @Override
    public Map<String, Object> createSession(String userId, String userRole, String title) {
        String safeUserId = requireText(userId, "userId is required");
        String safeUserRole = firstText(userRole, "student");
        String safeTitle = firstText(title, "New Chat");

        ClarivoChatSession session = new ClarivoChatSession();
        session.setId("CHAT_" + UUID.randomUUID().toString().replace("-", "").substring(0, 18));
        session.setUserId(safeUserId);
        session.setUserRole(safeUserRole);
        session.setTitle(safeTitle);
        session.setMessageCount(0);
        session.setLastMessagePreview("Start a new chat");
        ClarivoChatSession saved = sessionRepository.save(session);

        ClarivoChatMessage greeting = new ClarivoChatMessage();
        greeting.setId("CHATMSG_" + UUID.randomUUID().toString().replace("-", "").substring(0, 18));
        greeting.setSessionId(saved.getId());
        greeting.setUserId(safeUserId);
        greeting.setUserRole(safeUserRole);
        greeting.setRole("assistant");
        greeting.setContent(defaultGreeting(safeUserRole));
        messageRepository.save(greeting);

        saved.setMessageCount(1);
        saved.setLastMessagePreview(trimPreview(greeting.getContent()));
        saved = sessionRepository.save(saved);

        return Map.of(
            "session", toSessionMap(saved),
            "messages", getMessages(saved.getId())
        );
    }

    @Override
    public Map<String, Object> sendMessage(String sessionId, Map<String, Object> request) {
        String safeSessionId = requireText(sessionId, "sessionId is required");
        String userId = firstText(stringValue(request.get("userId")), "");
        String userRole = firstText(stringValue(request.get("userRole")), "student");
        String content = requireText(stringValue(request.get("content")), "content is required");

        ClarivoChatSession session = sessionRepository.findById(safeSessionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat session not found"));

        ClarivoChatMessage userMessage = saveMessage(session, userId, userRole, "user", content);
        String assistantReply = generateReply(session, userMessage, request);
        saveMessage(session, userId, userRole, "assistant", assistantReply);

        session.setMessageCount(messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId()).size());
        session.setLastMessagePreview(trimPreview(assistantReply));
        sessionRepository.save(session);

        return Map.of(
            "session", toSessionMap(session),
            "messages", getMessages(session.getId()),
            "assistantMessage", toMessageMap(lastAssistantMessage(session.getId()))
        );
    }

    private ClarivoChatMessage saveMessage(
        ClarivoChatSession session,
        String userId,
        String userRole,
        String role,
        String content
    ) {
        ClarivoChatMessage message = new ClarivoChatMessage();
        message.setId("CHATMSG_" + UUID.randomUUID().toString().replace("-", "").substring(0, 18));
        message.setSessionId(session.getId());
        message.setUserId(firstText(userId, session.getUserId()));
        message.setUserRole(firstText(userRole, session.getUserRole()));
        message.setRole(role);
        message.setContent(content);
        return messageRepository.save(message);
    }

    private ClarivoChatMessage lastAssistantMessage(String sessionId) {
        List<ClarivoChatMessage> messages = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        for (int i = messages.size() - 1; i >= 0; i--) {
            if ("assistant".equalsIgnoreCase(messages.get(i).getRole())) {
                return messages.get(i);
            }
        }
        return messages.isEmpty() ? null : messages.get(messages.size() - 1);
    }

    private String generateReply(
        ClarivoChatSession session,
        ClarivoChatMessage userMessage,
        Map<String, Object> request
    ) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            return "Clarivo AI backend is not configured with a Groq API key yet.";
        }

        try {
            List<ClarivoChatMessage> history = messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
            List<Map<String, Object>> apiMessages = new ArrayList<>();
            apiMessages.add(Map.of(
                "role",
                "system",
                "content",
                buildSystemPrompt(session.getUserRole(), request)
            ));

            int startIndex = Math.max(0, history.size() - 14);
            for (int i = startIndex; i < history.size(); i++) {
                ClarivoChatMessage message = history.get(i);
                if ("assistant".equalsIgnoreCase(message.getRole()) || "user".equalsIgnoreCase(message.getRole())) {
                    apiMessages.add(Map.of(
                        "role",
                        message.getRole(),
                        "content",
                        message.getContent()
                    ));
                }
            }

            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                .header("Authorization", "Bearer " + groqApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(Map.of(
                    "model", groqModel,
                    "messages", apiMessages,
                    "max_tokens", 1200,
                    "temperature", 0.55
                ))))
                .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return "I could not reach the AI service right now. Please try again.";
            }

            JsonNode root = objectMapper.readTree(response.body());
            String reply = root.path("choices").path(0).path("message").path("content").asText("");
            if (reply.isBlank()) {
                return "No response received. Please try again.";
            }

            return reply.trim();
        } catch (Exception exception) {
            return "I could not generate a response right now. Please try again.";
        }
    }

    private String buildSystemPrompt(String userRole, Map<String, Object> request) {
        String role = firstText(userRole, "student").toLowerCase();
        String roleContext = "teacher".equals(role)
            ? "You are Clarivo AI for teachers. Help with teaching, doubts, classes, sessions, videos, mock tests, and classroom management."
            : "You are Clarivo AI for students. Help with doubts, homework, mock tests, videos, classes, session preparation, app help, and outside/general questions.";

        return roleContext
            + " Keep answers concise but helpful. If the user asks for study help, explain step by step with examples.";
    }

    private Map<String, Object> toSessionMap(ClarivoChatSession session) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", session.getId());
        map.put("userId", session.getUserId());
        map.put("userRole", session.getUserRole());
        map.put("title", session.getTitle());
        map.put("lastMessagePreview", session.getLastMessagePreview());
        map.put("messageCount", session.getMessageCount());
        map.put("createdAt", session.getCreatedAt());
        map.put("updatedAt", session.getUpdatedAt());
        return map;
    }

    private Map<String, Object> toMessageMap(ClarivoChatMessage message) {
        if (message == null) {
            return Map.of();
        }
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", message.getId());
        map.put("sessionId", message.getSessionId());
        map.put("userId", message.getUserId());
        map.put("userRole", message.getUserRole());
        map.put("role", message.getRole());
        map.put("content", message.getContent());
        map.put("createdAt", message.getCreatedAt());
        return map;
    }

    private String defaultGreeting(String userRole) {
        String role = firstText(userRole, "student").toLowerCase();
        if ("teacher".equals(role)) {
            return "Hi! I am Clarivo AI for teachers. Ask me about doubts, classes, sessions, mock tests, uploaded videos, or platform help.";
        }
        return "Hi! I am your Clarivo AI Tutor. You can ask me study doubts, mock tests, app help, live session help, explanation video help, and also outside/general questions. What do you want to ask today?";
    }

    private String trimPreview(String value) {
        if (value == null) {
            return null;
        }
        String clean = value.trim();
        if (clean.length() <= 120) {
            return clean;
        }
        return clean.substring(0, 117) + "...";
    }

    private String requireText(String value, String message) {
        String clean = firstText(value, "");
        if (clean.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return clean;
    }

    private String firstText(String value, String fallback) {
        return value == null || String.valueOf(value).trim().isEmpty() ? fallback : String.valueOf(value).trim();
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
