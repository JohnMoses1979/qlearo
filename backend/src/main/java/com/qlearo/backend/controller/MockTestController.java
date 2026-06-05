package com.qlearo.backend.controller;

import com.qlearo.backend.dto.mocktest.MockTestAttemptResponse;
import com.qlearo.backend.dto.mocktest.MockTestAttemptSaveRequest;
import com.qlearo.backend.dto.mocktest.MockTestCategoryResponse;
import com.qlearo.backend.dto.mocktest.MockTestCategorySaveRequest;
import com.qlearo.backend.dto.mocktest.MockTestResponse;
import com.qlearo.backend.dto.mocktest.MockTestSaveRequest;
import com.qlearo.backend.dto.mocktest.MockTestSubjectResponse;
import com.qlearo.backend.dto.mocktest.MockTestSubjectSaveRequest;
import com.qlearo.backend.dto.mocktest.StudentNotificationResponse;
import com.qlearo.backend.dto.mocktest.TeacherMockTestAttemptResponse;
import com.qlearo.backend.service.MockTestService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MockTestController {

    private final MockTestService mockTestService;

    public MockTestController(MockTestService mockTestService) {
        this.mockTestService = mockTestService;
    }

    @GetMapping("/mock-tests/catalog")
    public List<MockTestCategoryResponse> getCatalog() {
        return mockTestService.getCatalog();
    }

    @GetMapping("/teachers/{teacherId}/mock-tests/catalog")
    public List<MockTestCategoryResponse> getTeacherCatalog(@PathVariable String teacherId) {
        return mockTestService.getTeacherCatalog(teacherId);
    }

    @PostMapping("/teachers/{teacherId}/mock-tests/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public MockTestCategoryResponse createCategory(
        @PathVariable String teacherId,
        @RequestBody MockTestCategorySaveRequest request
    ) {
        return mockTestService.createCategory(teacherId, request);
    }

    @PostMapping("/teachers/{teacherId}/mock-tests/categories/{categoryTitle}/subjects")
    @ResponseStatus(HttpStatus.CREATED)
    public MockTestSubjectResponse createSubject(
        @PathVariable String teacherId,
        @PathVariable String categoryTitle,
        @RequestBody MockTestSubjectSaveRequest request
    ) {
        return mockTestService.createSubject(teacherId, categoryTitle, request);
    }

    @PostMapping("/teachers/{teacherId}/mock-tests/tests")
    @ResponseStatus(HttpStatus.CREATED)
    public MockTestResponse saveTest(
        @PathVariable String teacherId,
        @RequestBody MockTestSaveRequest request
    ) {
        return mockTestService.saveTest(teacherId, request);
    }

    @DeleteMapping("/teachers/{teacherId}/mock-tests/tests/{testId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTest(@PathVariable String teacherId, @PathVariable String testId) {
        mockTestService.deleteTest(teacherId, testId);
    }

    @GetMapping("/mock-tests/{testId}")
    public MockTestResponse getTest(@PathVariable String testId) {
        return mockTestService.getTest(testId);
    }

    @GetMapping("/teachers/{teacherId}/mock-tests/attempts")
    public List<TeacherMockTestAttemptResponse> getTeacherAttempts(
        @PathVariable String teacherId,
        @RequestParam(required = false) String categoryTitle,
        @RequestParam(required = false) String subjectId,
        @RequestParam(required = false) String testId
    ) {
        return mockTestService.getTeacherAttempts(teacherId, categoryTitle, subjectId, testId);
    }

    @GetMapping("/students/{studentId}/mock-tests/results")
    public List<MockTestAttemptResponse> getStudentResults(@PathVariable String studentId) {
        return mockTestService.getStudentResults(studentId);
    }

    @PostMapping("/students/{studentId}/mock-tests/attempts")
    @ResponseStatus(HttpStatus.CREATED)
    public MockTestAttemptResponse saveStudentAttempt(
        @PathVariable String studentId,
        @RequestBody MockTestAttemptSaveRequest request
    ) {
        return mockTestService.saveStudentAttempt(studentId, request);
    }

    @GetMapping("/students/{studentId}/notifications")
    public List<StudentNotificationResponse> getStudentNotifications(@PathVariable String studentId) {
        return mockTestService.getStudentNotifications(studentId);
    }

    @GetMapping("/students/{studentId}/notifications/unread-count")
    public long getUnreadNotificationCount(@PathVariable String studentId) {
        return mockTestService.getUnreadNotificationCount(studentId);
    }

    @PostMapping("/students/{studentId}/notifications/{notificationId}/read")
    public StudentNotificationResponse markStudentNotificationRead(
        @PathVariable String studentId,
        @PathVariable String notificationId
    ) {
        return mockTestService.markStudentNotificationRead(studentId, notificationId);
    }
}
