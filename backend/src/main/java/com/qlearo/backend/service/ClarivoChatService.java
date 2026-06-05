package com.qlearo.backend.service;

import java.util.List;
import java.util.Map;

public interface ClarivoChatService {

    List<Map<String, Object>> getSessions(String userId, String userRole);

    List<Map<String, Object>> getMessages(String sessionId);

    Map<String, Object> createSession(String userId, String userRole, String title);

    Map<String, Object> sendMessage(String sessionId, Map<String, Object> request);
}
