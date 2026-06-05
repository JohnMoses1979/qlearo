package com.qlearo.backend.controller;

import com.qlearo.backend.service.ClarivoChatService;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clarivo-chat")
@CrossOrigin(origins = "*")
public class ClarivoChatController {

    private final ClarivoChatService clarivoChatService;

    public ClarivoChatController(ClarivoChatService clarivoChatService) {
        this.clarivoChatService = clarivoChatService;
    }

    @GetMapping(value = "/sessions", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Map<String, Object>>> getSessions(
        @RequestParam String userId,
        @RequestParam String userRole
    ) {
        return ResponseEntity.ok(clarivoChatService.getSessions(userId, userRole));
    }

    @GetMapping(value = "/sessions/{sessionId}/messages", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Map<String, Object>>> getMessages(@PathVariable String sessionId) {
        return ResponseEntity.ok(clarivoChatService.getMessages(sessionId));
    }

    @PostMapping(value = "/sessions", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createSession(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(
            clarivoChatService.createSession(
                stringValue(request.get("userId")),
                stringValue(request.get("userRole")),
                stringValue(request.get("title"))
            )
        );
    }

    @PostMapping(value = "/sessions/{sessionId}/messages", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> sendMessage(
        @PathVariable String sessionId,
        @RequestBody Map<String, Object> request
    ) {
        return ResponseEntity.ok(clarivoChatService.sendMessage(sessionId, request));
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
