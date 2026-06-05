package com.qlearo.backend.websocket;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qlearo.backend.service.LiveSessionMessageService;
import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class LiveSessionWebSocketHandler extends TextWebSocketHandler {

    private final LiveSessionMessageService liveSessionMessageService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, CopyOnWriteArraySet<WebSocketSession>> rooms = new ConcurrentHashMap<>();

    public LiveSessionWebSocketHandler(LiveSessionMessageService liveSessionMessageService) {
        this.liveSessionMessageService = liveSessionMessageService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = readSessionId(session);
        session.getAttributes().put("sessionId", sessionId);
        rooms.computeIfAbsent(sessionId, key -> new CopyOnWriteArraySet<>()).add(session);

        sendJson(session, Map.of(
            "action", "history",
            "sessionId", sessionId,
            "messages", liveSessionMessageService.getMessages(sessionId)
        ));

        broadcast(sessionId, buildPresencePayload(
            "joined",
            sessionId,
            readQueryValue(session.getUri(), "userId"),
            readQueryValue(session.getUri(), "userName"),
            readQueryValue(session.getUri(), "userRole")
        ));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Map<String, Object> payload = parse(message.getPayload());
        String sessionId = firstText(textValue(payload.get("sessionId")), readSessionId(session));
        String action = firstText(textValue(payload.get("action")), firstText(textValue(payload.get("type")), "message")).toLowerCase();

        if ("join".equals(action)) {
            broadcast(sessionId, buildPresencePayload(
                "joined",
                sessionId,
                textValue(payload.get("senderId")),
                textValue(payload.get("senderName")),
                textValue(payload.get("senderRole"))
            ));
            return;
        }

        if ("leave".equals(action)) {
            broadcast(sessionId, buildPresencePayload(
                "left",
                sessionId,
                textValue(payload.get("senderId")),
                textValue(payload.get("senderName")),
                textValue(payload.get("senderRole"))
            ));
            return;
        }

        if ("typing".equals(action)) {
            Map<String, Object> typingPayload = new LinkedHashMap<>();
            typingPayload.put("action", "typing");
            typingPayload.put("sessionId", sessionId);
            typingPayload.put("senderId", firstText(textValue(payload.get("senderId")), ""));
            typingPayload.put("senderName", firstText(textValue(payload.get("senderName")), ""));
            typingPayload.put("senderRole", firstText(textValue(payload.get("senderRole")), ""));
            typingPayload.put("isTyping", payload.get("isTyping"));
            broadcast(sessionId, typingPayload);
            return;
        }

        Map<String, Object> savedMessage = liveSessionMessageService.saveMessage(sessionId, payload);
        broadcast(sessionId, Map.of(
            "action", "message",
            "sessionId", sessionId,
            "message", savedMessage
        ));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String sessionId = firstText(textValue(session.getAttributes().get("sessionId")), readSessionId(session));
        CopyOnWriteArraySet<WebSocketSession> room = rooms.get(sessionId);

        if (room != null) {
            room.remove(session);
            if (room.isEmpty()) {
                rooms.remove(sessionId);
            }
        }

        broadcast(sessionId, buildPresencePayload(
            "left",
            sessionId,
            readQueryValue(session.getUri(), "userId"),
            readQueryValue(session.getUri(), "userName"),
            readQueryValue(session.getUri(), "userRole")
        ));
    }

    private void broadcast(String sessionId, Map<String, Object> payload) throws IOException {
        CopyOnWriteArraySet<WebSocketSession> room = rooms.get(sessionId);
        if (room == null || room.isEmpty()) {
            return;
        }

        TextMessage message = new TextMessage(objectMapper.writeValueAsString(payload));
        for (WebSocketSession socketSession : room) {
            if (socketSession != null && socketSession.isOpen()) {
                try {
                    socketSession.sendMessage(message);
                } catch (IOException exception) {
                    room.remove(socketSession);
                }
            }
        }
    }

    private void sendJson(WebSocketSession session, Map<String, Object> payload) throws IOException {
        if (session != null && session.isOpen()) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
        }
    }

    private Map<String, Object> buildPresencePayload(
        String event,
        String sessionId,
        String senderId,
        String senderName,
        String senderRole
    ) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("action", "presence");
        payload.put("event", event);
        payload.put("sessionId", sessionId);
        payload.put("senderId", firstText(senderId, ""));
        payload.put("senderName", firstText(senderName, ""));
        payload.put("senderRole", firstText(senderRole, ""));
        return payload;
    }

    private Map<String, Object> parse(String payload) {
        try {
            return objectMapper.readValue(payload, new TypeReference<Map<String, Object>>() {});
        } catch (Exception exception) {
            return new LinkedHashMap<>();
        }
    }

    private String readSessionId(WebSocketSession session) {
        return firstText(readQueryValue(session.getUri(), "sessionId"), "demo-session");
    }

    private String readQueryValue(URI uri, String key) {
        if (uri == null || uri.getQuery() == null || uri.getQuery().isBlank()) {
            return null;
        }

        String[] parts = uri.getQuery().split("&");
        for (String part : parts) {
            String[] pair = part.split("=", 2);
            if (pair.length == 2 && key.equals(pair[0])) {
                return URLDecoder.decode(pair[1], StandardCharsets.UTF_8);
            }
        }

        return null;
    }

    private String firstText(String value, String fallback) {
        return value == null || value.trim().isEmpty() ? fallback : value.trim();
    }

    private String textValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
