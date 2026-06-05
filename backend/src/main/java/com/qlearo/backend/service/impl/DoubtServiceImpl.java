package com.qlearo.backend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qlearo.backend.dto.doubt.DoubtAnswerRequest;
import com.qlearo.backend.dto.doubt.DoubtResponse;
import com.qlearo.backend.dto.doubt.DoubtSaveRequest;
import com.qlearo.backend.dto.mocktest.StudentNotificationResponse;
import com.qlearo.backend.entity.Doubt;
import com.qlearo.backend.entity.StudentNotification;
import com.qlearo.backend.repository.DoubtRepository;
import com.qlearo.backend.repository.StudentNotificationRepository;
import com.qlearo.backend.service.DoubtService;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class DoubtServiceImpl implements DoubtService {

    private final DoubtRepository doubtRepository;
    private final StudentNotificationRepository notificationRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public DoubtServiceImpl(DoubtRepository doubtRepository, StudentNotificationRepository notificationRepository) {
        this.doubtRepository = doubtRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public DoubtResponse submitDoubt(String studentId, DoubtSaveRequest request) {
        Doubt doubt = new Doubt();
        doubt.setId("DOUBT_" + System.currentTimeMillis());
        doubt.setConversationId("CHAT_" + System.currentTimeMillis());
        doubt.setStudentId(firstValue(request.getStudentId(), studentId));
        doubt.setStudentName(firstValue(request.getStudentName(), "Student"));
        doubt.setStudentPhoto(request.getStudentPhoto());
        doubt.setTeacherId(request.getTeacherId());
        doubt.setTeacherName(request.getTeacherName());
        doubt.setSubject(firstValue(request.getSubject(), "General"));
        doubt.setTopic(firstValue(request.getTopic(), ""));
        doubt.setClassName(firstValue(request.getClassName(), ""));
        doubt.setQuestion(firstValue(request.getQuestion(), request.getDescription(), ""));
        doubt.setDescription(firstValue(request.getDescription(), request.getQuestion(), ""));
        doubt.setPreferredLanguage(firstValue(request.getPreferredLanguage(), "English"));
        doubt.setPreferredAnswerType(firstValue(request.getPreferredAnswerType(), "Text"));
        doubt.setAttachmentsJson(writeJson(request.getAttachments()));
        doubt.setCameraImagesJson(writeJson(request.getCameraImages()));
        doubt.setGalleryImagesJson(writeJson(request.getGalleryImages()));
        doubt.setDocumentsJson(writeJson(request.getDocuments()));
        doubt.setAudioUri(request.getAudioUri());
        doubt.setVideoUri(request.getVideoUri());
        doubt.setStatus("Pending");
        doubt.setAccepted(false);
        doubt.setAnswered(false);
        doubt.setStudentViewed(false);
        doubt.setTeacherViewed(false);
        doubt.setReviewAdded(false);
        doubt.setRating(0);

        Doubt saved = doubtRepository.save(doubt);
        safeCreateNotification(
            "student",
            saved.getStudentId(),
            "Doubt Submitted",
            "Your doubt \"" + firstValue(saved.getTopic(), saved.getSubject()) + "\" was submitted.",
            "doubt",
            saved.getId(),
            saved.getSubject(),
            null
        );
        safeCreateNotification(
            "teacher",
            null,
            "New Doubt",
            saved.getStudentName() + " submitted a " + saved.getSubject() + " doubt.",
            "doubt",
            saved.getId(),
            saved.getSubject(),
            null
        );

        return toResponse(saved);
    }

    @Override
    public List<DoubtResponse> getStudentDoubts(String studentId) {
        return doubtRepository.findByStudentIdOrderByUpdatedAtDesc(studentId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public List<DoubtResponse> getTeacherDoubts(String teacherId) {
        List<Doubt> doubts = doubtRepository.findAllByOrderByUpdatedAtDesc();
        return doubts.stream().map(this::toResponse).toList();
    }

    @Override
    public DoubtResponse acceptDoubt(String teacherId, String doubtId, String teacherName) {
        Doubt doubt = doubtRepository.findById(doubtId)
            .orElseThrow(() -> new IllegalArgumentException("Doubt not found"));

        doubt.setTeacherId(firstValue(teacherId, doubt.getTeacherId()));
        doubt.setTeacherName(firstValue(teacherName, doubt.getTeacherName(), "Teacher"));
        doubt.setAccepted(true);
        doubt.setAnswered(false);
        doubt.setStatus("In Progress");
        doubt.setTeacherViewed(true);
        doubt.setStudentViewed(false);
        doubt.setLastMessageAt(Instant.now());

        Doubt saved = doubtRepository.save(doubt);

        safeCreateNotification(
            "student",
            saved.getStudentId(),
            "Doubt Accepted",
            firstValue(saved.getTeacherName(), "Teacher") + " accepted your doubt.",
            "doubt",
            saved.getId(),
            saved.getSubject(),
            null
        );

        return toResponse(saved);
    }

    @Override
    public DoubtResponse answerDoubt(String teacherId, String doubtId, DoubtAnswerRequest request) {
        Doubt doubt = doubtRepository.findById(doubtId)
            .orElseThrow(() -> new IllegalArgumentException("Doubt not found"));

        doubt.setTeacherId(firstValue(teacherId, doubt.getTeacherId()));
        doubt.setTeacherName(firstValue(request.getTeacherName(), doubt.getTeacherName(), "Teacher"));
        doubt.setAnswerType(firstValue(request.getAnswerType(), "Text"));
        doubt.setAnswerText(request.getAnswerText());
        doubt.setAnswerAudio(request.getAnswerAudio());
        doubt.setAnswerVideo(request.getAnswerVideo());
        doubt.setStatus("Answered");
        doubt.setAccepted(true);
        doubt.setAnswered(true);
        doubt.setStudentViewed(false);
        doubt.setTeacherViewed(true);
        doubt.setLastMessageAt(Instant.now());

        Doubt saved = doubtRepository.save(doubt);

        safeCreateNotification(
            "student",
            saved.getStudentId(),
            saved.getAnswerType() + " Answer Received",
            "Your doubt has been answered.",
            "doubt_answer",
            saved.getId(),
            saved.getSubject(),
            null
        );

        return toResponse(saved);
    }

    @Override
    public List<StudentNotificationResponse> getNotifications(String recipientRole, String recipientId) {
        String normalizedRecipientId =
            recipientId == null || recipientId.isBlank() || "all".equalsIgnoreCase(recipientId)
                ? null
                : recipientId;

        List<StudentNotification> notifications =
            normalizedRecipientId == null
                ? notificationRepository.findByRecipientRoleAndRecipientIdIsNullOrderByCreatedAtDesc(recipientRole)
                : notificationRepository.findByRecipientRoleAndRecipientIdOrderByCreatedAtDesc(recipientRole, normalizedRecipientId);

        return notifications.stream().map(this::toResponse).toList();
    }

    @Override
    public StudentNotificationResponse markNotificationRead(String recipientRole, String recipientId, String notificationId) {
        String normalizedRecipientId =
            recipientId == null || recipientId.isBlank() || "all".equalsIgnoreCase(recipientId)
                ? null
                : recipientId;

        Optional<StudentNotification> existing =
            notificationRepository.findById(notificationId);

        if (existing.isEmpty()) {
            throw new IllegalArgumentException("Notification not found");
        }

        StudentNotification notification = existing.get();
        if (!recipientRole.equals(notification.getRecipientRole())) {
            throw new IllegalArgumentException("Notification role mismatch");
        }
        if (normalizedRecipientId != null && notification.getRecipientId() != null
            && !normalizedRecipientId.equals(notification.getRecipientId())) {
            throw new IllegalArgumentException("Notification recipient mismatch");
        }

        notification.setRead(true);
        notification = notificationRepository.save(notification);
        return toResponse(notification);
    }

    @Override
    public long getUnreadNotificationCount(String recipientRole, String recipientId) {
        if (recipientId == null || recipientId.isBlank() || "all".equalsIgnoreCase(recipientId)) {
            return notificationRepository.countByRecipientRoleAndRecipientIdIsNullAndReadFalse(recipientRole);
        }

        return notificationRepository.countByRecipientRoleAndRecipientIdAndReadFalse(recipientRole, recipientId);
    }

    @Override
    public StudentNotificationResponse createNotification(
        String recipientRole,
        String recipientId,
        String title,
        String message,
        String type,
        String relatedId,
        String categoryTitle,
        String subjectId
    ) {
        StudentNotification notification = new StudentNotification();
        notification.setId("NOTIF_" + System.currentTimeMillis());
        notification.setRecipientRole(firstValue(recipientRole, "student"));
        notification.setRecipientId(
            recipientId == null || recipientId.isBlank() || "all".equalsIgnoreCase(recipientId)
                ? null
                : recipientId
        );
        notification.setTitle(firstValue(title, "Notification"));
        notification.setMessage(firstValue(message, ""));
        notification.setType(firstValue(type, "chat"));
        notification.setRelatedTestId(relatedId);
        notification.setCategoryTitle(categoryTitle);
        notification.setSubjectId(subjectId);
        notification.setRead(false);

        StudentNotification saved = notificationRepository.save(notification);
        return toResponse(saved);
    }

    private void createNotification(
        String recipientRole,
        String recipientId,
        String title,
        String message,
        String type,
        String relatedId,
        String categoryTitle,
        String subjectId
    ) {
        StudentNotification notification = new StudentNotification();
        notification.setId("NOTIF_" + System.currentTimeMillis());
        notification.setRecipientRole(recipientRole);
        notification.setRecipientId(recipientId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedTestId(relatedId);
        notification.setCategoryTitle(categoryTitle);
        notification.setSubjectId(subjectId);
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    private void safeCreateNotification(
        String recipientRole,
        String recipientId,
        String title,
        String message,
        String type,
        String relatedId,
        String categoryTitle,
        String subjectId
    ) {
        try {
            createNotification(
                recipientRole,
                recipientId,
                title,
                message,
                type,
                relatedId,
                categoryTitle,
                subjectId
            );
        } catch (Exception exception) {
            System.err.println("Failed to create doubt notification: " + exception.getMessage());
        }
    }

    private DoubtResponse toResponse(Doubt doubt) {
        DoubtResponse response = new DoubtResponse();
        response.setId(doubt.getId());
        response.setConversationId(doubt.getConversationId());
        response.setStudentId(doubt.getStudentId());
        response.setStudentName(doubt.getStudentName());
        response.setStudentPhoto(doubt.getStudentPhoto());
        response.setTeacherId(doubt.getTeacherId());
        response.setTeacherName(doubt.getTeacherName());
        response.setSubject(doubt.getSubject());
        response.setTopic(doubt.getTopic());
        response.setClassName(doubt.getClassName());
        response.setQuestion(doubt.getQuestion());
        response.setDescription(doubt.getDescription());
        response.setPreferredLanguage(doubt.getPreferredLanguage());
        response.setPreferredAnswerType(doubt.getPreferredAnswerType());
        response.setAttachments(readJsonList(doubt.getAttachmentsJson()));
        response.setCameraImages(readJsonList(doubt.getCameraImagesJson()));
        response.setGalleryImages(readJsonList(doubt.getGalleryImagesJson()));
        response.setDocuments(readJsonList(doubt.getDocumentsJson()));
        response.setAudioUri(doubt.getAudioUri());
        response.setVideoUri(doubt.getVideoUri());
        response.setAnswerType(doubt.getAnswerType());
        response.setAnswerText(doubt.getAnswerText());
        response.setAnswerAudio(doubt.getAnswerAudio());
        response.setAnswerVideo(doubt.getAnswerVideo());
        response.setStatus(doubt.getStatus());
        response.setAccepted(doubt.isAccepted());
        response.setAnswered(doubt.isAnswered());
        response.setStudentViewed(doubt.isStudentViewed());
        response.setTeacherViewed(doubt.isTeacherViewed());
        response.setReviewAdded(doubt.isReviewAdded());
        response.setRating(doubt.getRating());
        response.setReview(doubt.getReview());
        response.setLastMessageAt(doubt.getLastMessageAt());
        response.setCreatedAt(doubt.getCreatedAt());
        response.setUpdatedAt(doubt.getUpdatedAt());
        return response;
    }

    private StudentNotificationResponse toResponse(StudentNotification notification) {
        StudentNotificationResponse response = new StudentNotificationResponse();
        response.setId(notification.getId());
        response.setRecipientRole(notification.getRecipientRole());
        response.setRecipientId(notification.getRecipientId());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType());
        response.setRelatedTestId(notification.getRelatedTestId());
        response.setRelatedVideoId(notification.getRelatedVideoId());
        response.setCategoryTitle(notification.getCategoryTitle());
        response.setSubjectId(notification.getSubjectId());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }

    private String writeJson(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values == null ? Collections.emptyList() : values);
        } catch (JsonProcessingException exception) {
            return "[]";
        }
    }

    private List<String> readJsonList(String json) {
        if (json == null || json.isBlank()) {
            return new ArrayList<>();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception exception) {
            return new ArrayList<>();
        }
    }

    private String firstValue(String... values) {
        if (values == null) {
            return null;
        }

        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
