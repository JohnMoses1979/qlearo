package com.qlearo.backend.service;

import java.util.List;
import java.util.Map;

public interface LiveSessionMessageService {
    List<Map<String, Object>> getMessages(String sessionId);

    Map<String, Object> saveMessage(String sessionId, Map<String, Object> request);
}
