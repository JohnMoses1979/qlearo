package com.qlearo.backend.controller;

import com.qlearo.backend.dto.tuition.TuitionRequestActionRequest;
import com.qlearo.backend.dto.tuition.TuitionRequestResponse;
import com.qlearo.backend.dto.tuition.TuitionRequestSaveRequest;
import com.qlearo.backend.service.TuitionRequestService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/tuition-request", "/api/tuition-requests"})
public class TuitionRequestController {

    private final TuitionRequestService tuitionRequestService;

    public TuitionRequestController(TuitionRequestService tuitionRequestService) {
        this.tuitionRequestService = tuitionRequestService;
    }

    @PostMapping
    public ResponseEntity<TuitionRequestResponse> createRequest(
            @RequestBody TuitionRequestSaveRequest request) {
        return ResponseEntity.ok(tuitionRequestService.createRequest(request));
    }

    @GetMapping
    public ResponseEntity<List<TuitionRequestResponse>> getRequests(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String studentId) {
        return ResponseEntity.ok(tuitionRequestService.getRequests(teacherId, studentId));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<TuitionRequestResponse>> getSessions(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String studentId) {
        return ResponseEntity.ok(tuitionRequestService.getSessions(teacherId, studentId));
    }

    @PutMapping("/{requestId}/accept")
    public ResponseEntity<TuitionRequestResponse> acceptRequest(
            @PathVariable String requestId,
            @RequestParam String teacherId,
            @RequestBody(required = false) TuitionRequestActionRequest request) {
        return ResponseEntity.ok(tuitionRequestService.acceptRequest(requestId, teacherId, request));
    }

    @PutMapping("/{requestId}/decline")
    public ResponseEntity<TuitionRequestResponse> declineRequest(
            @PathVariable String requestId,
            @RequestParam String teacherId,
            @RequestBody(required = false) TuitionRequestActionRequest request) {
        return ResponseEntity.ok(tuitionRequestService.declineRequest(requestId, teacherId, request));
    }

    @PutMapping("/{requestId}/view")
    public ResponseEntity<TuitionRequestResponse> markViewed(
            @PathVariable String requestId,
            @RequestParam String role) {
        return ResponseEntity.ok(tuitionRequestService.markViewed(requestId, role));
    }

    @PostMapping("/sessions")
    public ResponseEntity<TuitionRequestResponse> createSession(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(tuitionRequestService.createSession(request));
    }

    @PutMapping("/sessions/{sessionId}")
    public ResponseEntity<TuitionRequestResponse> updateSession(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(tuitionRequestService.updateSession(sessionId, request));
    }
}
