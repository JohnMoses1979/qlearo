package com.qlearo.backend.service;

import com.qlearo.backend.dto.doubt.DoubtAnswerRequest;
import com.qlearo.backend.dto.doubt.DoubtResponse;
import com.qlearo.backend.dto.doubt.DoubtSaveRequest;
import com.qlearo.backend.dto.mocktest.StudentNotificationResponse;
import java.util.List;

public interface DoubtService {

    DoubtResponse submitDoubt(String studentId, DoubtSaveRequest request);

    List<DoubtResponse> getStudentDoubts(String studentId);

    List<DoubtResponse> getTeacherDoubts(String teacherId);

    DoubtResponse acceptDoubt(String teacherId, String doubtId, String teacherName);

    DoubtResponse answerDoubt(String teacherId, String doubtId, DoubtAnswerRequest request);

    List<StudentNotificationResponse> getNotifications(String recipientRole, String recipientId);

    StudentNotificationResponse markNotificationRead(String recipientRole, String recipientId, String notificationId);

    long getUnreadNotificationCount(String recipientRole, String recipientId);

    StudentNotificationResponse createNotification(
        String recipientRole,
        String recipientId,
        String title,
        String message,
        String type,
        String relatedId,
        String categoryTitle,
        String subjectId
    );
}
