package com.qlearo.backend.service;

import com.qlearo.backend.dto.mocktest.MockTestAttemptResponse;
import com.qlearo.backend.dto.mocktest.MockTestAttemptSaveRequest;
import com.qlearo.backend.dto.mocktest.MockTestCategoryResponse;
import com.qlearo.backend.dto.mocktest.MockTestCategorySaveRequest;
import com.qlearo.backend.dto.mocktest.MockTestResponse;
import com.qlearo.backend.dto.mocktest.MockTestSaveRequest;
import com.qlearo.backend.dto.mocktest.MockTestSubjectResponse;
import com.qlearo.backend.dto.mocktest.MockTestSubjectSaveRequest;
import com.qlearo.backend.dto.mocktest.TeacherMockTestAttemptResponse;
import com.qlearo.backend.dto.mocktest.StudentNotificationResponse;
import java.util.List;

public interface MockTestService {

    List<MockTestCategoryResponse> getCatalog();

    List<MockTestCategoryResponse> getTeacherCatalog(String teacherId);

    MockTestCategoryResponse createCategory(String teacherId, MockTestCategorySaveRequest request);

    MockTestSubjectResponse createSubject(
        String teacherId,
        String categoryTitle,
        MockTestSubjectSaveRequest request
    );

    MockTestResponse saveTest(String teacherId, MockTestSaveRequest request);

    void deleteTest(String teacherId, String testId);

    MockTestResponse getTest(String testId);

    List<MockTestAttemptResponse> getStudentResults(String studentId);

    List<TeacherMockTestAttemptResponse> getTeacherAttempts(
        String teacherId,
        String categoryTitle,
        String subjectId,
        String testId
    );

    MockTestAttemptResponse saveStudentAttempt(String studentId, MockTestAttemptSaveRequest request);

    List<StudentNotificationResponse> getStudentNotifications(String studentId);

    StudentNotificationResponse markStudentNotificationRead(String studentId, String notificationId);

    long getUnreadNotificationCount(String studentId);
}
