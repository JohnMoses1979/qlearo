package com.qlearo.backend.controller;

import com.qlearo.backend.service.LiveSessionMessageService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/live-sessions")
public class LiveSessionController {

    private final LiveSessionMessageService liveSessionMessageService;

    public LiveSessionController(LiveSessionMessageService liveSessionMessageService) {
        this.liveSessionMessageService = liveSessionMessageService;
    }

    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<List<Map<String, Object>>> getMessages(@PathVariable String sessionId) {
        return ResponseEntity.ok(liveSessionMessageService.getMessages(sessionId));
    }

    @PostMapping("/{sessionId}/messages")
    public ResponseEntity<Map<String, Object>> saveMessage(
        @PathVariable String sessionId,
        @RequestBody Map<String, Object> request
    ) {
        return ResponseEntity.ok(liveSessionMessageService.saveMessage(sessionId, request));
    }
}
