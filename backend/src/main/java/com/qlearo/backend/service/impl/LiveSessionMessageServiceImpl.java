package com.qlearo.backend.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qlearo.backend.entity.LiveSessionMessage;
import com.qlearo.backend.repository.LiveSessionMessageRepository;
import com.qlearo.backend.service.LiveSessionMessageService;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class LiveSessionMessageServiceImpl implements LiveSessionMessageService {

    private final LiveSessionMessageRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public LiveSessionMessageServiceImpl(LiveSessionMessageRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Map<String, Object>> getMessages(String sessionId) {
        return repository.findBySessionIdOrderByCreatedAtAsc(sessionId)
            .stream()
            .map(this::toMessageMap)
            .toList();
    }

    @Override
    public Map<String, Object> saveMessage(String sessionId, Map<String, Object> request) {
        String safeSessionId = firstText(sessionId, "demo-session");
        String type = firstText(textValue(request.get("type")), firstText(textValue(request.get("action")), "chat"));
        String normalizedType = "message".equalsIgnoreCase(type) ? "chat" : type.toLowerCase();
        String createdAt = firstText(textValue(request.get("createdAt")), Instant.now().toString());

        LiveSessionMessage message = new LiveSessionMessage();
        message.setId("LIVE_" + UUID.randomUUID().toString().replace("-", "").substring(0, 18));
        message.setSessionId(safeSessionId);
        message.setClientId(firstText(textValue(request.get("clientId")), textValue(request.get("id"))));
        message.setSenderId(firstText(textValue(request.get("senderId")), ""));
        message.setSenderName(firstText(textValue(request.get("senderName")), textValue(request.get("sender"))));
        message.setSenderRole(firstText(textValue(request.get("senderRole")), "student"));
        message.setMessageType(normalizedType);
        message.setTextContent(firstText(
            textValue(request.get("text")),
            firstText(textValue(request.get("title")), firstText(textValue(request.get("message")), ""))
        ));
        message.setPayloadJson(writePayload(request));
        message.setCreatedAt(parseInstant(createdAt));
        message.setUpdatedAt(parseInstant(createdAt));

        LiveSessionMessage saved = repository.save(message);
        return toMessageMap(saved);
    }

    private Map<String, Object> toMessageMap(LiveSessionMessage message) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", message.getId());
        map.put("clientId", message.getClientId());
        map.put("sessionId", message.getSessionId());
        map.put("senderId", message.getSenderId());
        map.put("senderName", message.getSenderName());
        map.put("sender", message.getSenderName());
        map.put("senderRole", message.getSenderRole());
        map.put("type", message.getMessageType());
        map.put("text", message.getTextContent());
        map.put("createdAt", message.getCreatedAt() == null ? null : message.getCreatedAt().toString());
        map.put("updatedAt", message.getUpdatedAt() == null ? null : message.getUpdatedAt().toString());
        map.put("time", message.getCreatedAt() == null ? null : message.getCreatedAt().toString());

        Map<String, Object> payload = readPayload(message.getPayloadJson());
        if (!payload.isEmpty()) {
            map.put("payload", payload);
            if (payload.containsKey("strokes")) {
                map.put("strokes", payload.get("strokes"));
            }
            if (payload.containsKey("imageUri")) {
                map.put("imageUri", payload.get("imageUri"));
            }
            if (payload.containsKey("title") && map.get("text") == null) {
                map.put("text", payload.get("title"));
            }
        }

        return map;
    }

    private String writePayload(Map<String, Object> request) {
        try {
            Map<String, Object> payload = new LinkedHashMap<>(request);
            payload.remove("action");
            payload.remove("sessionId");
            return objectMapper.writeValueAsString(payload);
        } catch (Exception exception) {
            return "{}";
        }
    }

    private Map<String, Object> readPayload(String payloadJson) {
        if (payloadJson == null || payloadJson.isBlank()) {
            return Map.of();
        }

        try {
            return objectMapper.readValue(payloadJson, new TypeReference<Map<String, Object>>() {});
        } catch (Exception exception) {
            return Map.of();
        }
    }

    private Instant parseInstant(String value) {
        try {
            return Instant.parse(value);
        } catch (Exception exception) {
            return Instant.now();
        }
    }

    private String firstText(String value, String fallback) {
        return value == null || value.trim().isEmpty() ? fallback : value.trim();
    }

    private String textValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
