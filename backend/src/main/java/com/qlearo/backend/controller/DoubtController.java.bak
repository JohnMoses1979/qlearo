package com.qlearo.backend.controller;

import com.qlearo.backend.dto.doubt.DoubtAnswerRequest;
import com.qlearo.backend.dto.doubt.DoubtResponse;
import com.qlearo.backend.dto.doubt.DoubtSaveRequest;
import com.qlearo.backend.dto.mocktest.StudentNotificationResponse;
import com.qlearo.backend.service.DoubtService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/doubts")
public class DoubtController {

    private final DoubtService doubtService;

    public DoubtController(DoubtService doubtService) {
        this.doubtService = doubtService;
    }

    @PostMapping("/students/{studentId}")
    @ResponseStatus(HttpStatus.CREATED)
    public DoubtResponse submitDoubt(@PathVariable String studentId, @RequestBody DoubtSaveRequest request) {
        return doubtService.submitDoubt(studentId, request);
    }

    @GetMapping("/students/{studentId}")
    public List<DoubtResponse> getStudentDoubts(@PathVariable String studentId) {
        return doubtService.getStudentDoubts(studentId);
    }

    @GetMapping("/teachers/{teacherId}")
    public List<DoubtResponse> getTeacherDoubts(@PathVariable String teacherId) {
        return doubtService.getTeacherDoubts(teacherId);
    }

    @PostMapping("/teachers/{teacherId}/{doubtId}/accept")
    public DoubtResponse acceptDoubt(
        @PathVariable String teacherId,
        @PathVariable String doubtId,
        @RequestBody(required = false) DoubtAnswerRequest request
    ) {
        String teacherName = request == null ? null : request.getTeacherName();
        return doubtService.acceptDoubt(teacherId, doubtId, teacherName);
    }

    @PostMapping("/teachers/{teacherId}/{doubtId}/answer")
    public DoubtResponse answerDoubt(
        @PathVariable String teacherId,
        @PathVariable String doubtId,
        @RequestBody DoubtAnswerRequest request
    ) {
        return doubtService.answerDoubt(teacherId, doubtId, request);
    }

    @GetMapping("/notifications/{recipientRole}/{recipientId}")
    public List<StudentNotificationResponse> getNotifications(
        @PathVariable String recipientRole,
        @PathVariable String recipientId
    ) {
        return doubtService.getNotifications(recipientRole, recipientId);
    }

    @GetMapping("/notifications/{recipientRole}/{recipientId}/unread-count")
    public long getUnreadNotificationCount(
        @PathVariable String recipientRole,
        @PathVariable String recipientId
    ) {
        return doubtService.getUnreadNotificationCount(recipientRole, recipientId);
    }

    @PostMapping("/notifications")
    public StudentNotificationResponse createNotification(@RequestBody java.util.Map<String, Object> request) {
        return doubtService.createNotification(
            stringValue(request.get("recipientRole")),
            stringValue(request.get("recipientId")),
            stringValue(request.get("title")),
            stringValue(request.get("message")),
            stringValue(request.get("type")),
            stringValue(request.get("relatedId")),
            stringValue(request.get("categoryTitle")),
            stringValue(request.get("subjectId"))
        );
    }

    @PostMapping("/notifications/{recipientRole}/{recipientId}/{notificationId}/read")
    public StudentNotificationResponse markNotificationRead(
        @PathVariable String recipientRole,
        @PathVariable String recipientId,
        @PathVariable String notificationId
    ) {
        return doubtService.markNotificationRead(recipientRole, recipientId, notificationId);
    }
}
