package com.qlearo.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "doubts")
public class Doubt {

    @Id
    @Column(name = "id", nullable = false, updatable = false, length = 64)
    private String id;

    @Column(name = "conversation_id")
    private String conversationId;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "student_photo")
    private String studentPhoto;

    @Column(name = "teacher_id")
    private String teacherId;

    @Column(name = "teacher_name")
    private String teacherName;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "topic")
    private String topic;

    @Column(name = "class_name")
    private String className;

    @Lob
    @Column(name = "question", columnDefinition = "LONGTEXT")
    private String question;

    @Lob
    @Column(name = "description", columnDefinition = "LONGTEXT")
    private String description;

    @Column(name = "preferred_language")
    private String preferredLanguage;

    @Column(name = "preferred_answer_type")
    private String preferredAnswerType;

    @Lob
    @Column(name = "attachments_json", columnDefinition = "LONGTEXT")
    private String attachmentsJson;

    @Lob
    @Column(name = "camera_images_json", columnDefinition = "LONGTEXT")
    private String cameraImagesJson;

    @Lob
    @Column(name = "gallery_images_json", columnDefinition = "LONGTEXT")
    private String galleryImagesJson;

    @Lob
    @Column(name = "documents_json", columnDefinition = "LONGTEXT")
    private String documentsJson;

    @Lob
    @Column(name = "audio_uri", columnDefinition = "LONGTEXT")
    private String audioUri;

    @Lob
    @Column(name = "video_uri", columnDefinition = "LONGTEXT")
    private String videoUri;

    @Column(name = "answer_type")
    private String answerType;

    @Lob
    @Column(name = "answer_text", columnDefinition = "LONGTEXT")
    private String answerText;

    @Lob
    @Column(name = "answer_audio", columnDefinition = "LONGTEXT")
    private String answerAudio;

    @Lob
    @Column(name = "answer_video", columnDefinition = "LONGTEXT")
    private String answerVideo;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "accepted", nullable = false)
    private boolean accepted;

    @Column(name = "answered", nullable = false)
    private boolean answered;

    @Column(name = "student_viewed", nullable = false)
    private boolean studentViewed;

    @Column(name = "teacher_viewed", nullable = false)
    private boolean teacherViewed;

    @Column(name = "review_added", nullable = false)
    private boolean reviewAdded;

    @Column(name = "rating")
    private int rating;

    @Lob
    @Column(name = "review", columnDefinition = "LONGTEXT")
    private String review;

    @Column(name = "last_message_at")
    private Instant lastMessageAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentPhoto() {
        return studentPhoto;
    }

    public void setStudentPhoto(String studentPhoto) {
        this.studentPhoto = studentPhoto;
    }

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }

    public String getPreferredAnswerType() {
        return preferredAnswerType;
    }

    public void setPreferredAnswerType(String preferredAnswerType) {
        this.preferredAnswerType = preferredAnswerType;
    }

    public String getAttachmentsJson() {
        return attachmentsJson;
    }

    public void setAttachmentsJson(String attachmentsJson) {
        this.attachmentsJson = attachmentsJson;
    }

    public String getCameraImagesJson() {
        return cameraImagesJson;
    }

    public void setCameraImagesJson(String cameraImagesJson) {
        this.cameraImagesJson = cameraImagesJson;
    }

    public String getGalleryImagesJson() {
        return galleryImagesJson;
    }

    public void setGalleryImagesJson(String galleryImagesJson) {
        this.galleryImagesJson = galleryImagesJson;
    }

    public String getDocumentsJson() {
        return documentsJson;
    }

    public void setDocumentsJson(String documentsJson) {
        this.documentsJson = documentsJson;
    }

    public String getAudioUri() {
        return audioUri;
    }

    public void setAudioUri(String audioUri) {
        this.audioUri = audioUri;
    }

    public String getVideoUri() {
        return videoUri;
    }

    public void setVideoUri(String videoUri) {
        this.videoUri = videoUri;
    }

    public String getAnswerType() {
        return answerType;
    }

    public void setAnswerType(String answerType) {
        this.answerType = answerType;
    }

    public String getAnswerText() {
        return answerText;
    }

    public void setAnswerText(String answerText) {
        this.answerText = answerText;
    }

    public String getAnswerAudio() {
        return answerAudio;
    }

    public void setAnswerAudio(String answerAudio) {
        this.answerAudio = answerAudio;
    }

    public String getAnswerVideo() {
        return answerVideo;
    }

    public void setAnswerVideo(String answerVideo) {
        this.answerVideo = answerVideo;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isAccepted() {
        return accepted;
    }

    public void setAccepted(boolean accepted) {
        this.accepted = accepted;
    }

    public boolean isAnswered() {
        return answered;
    }

    public void setAnswered(boolean answered) {
        this.answered = answered;
    }

    public boolean isStudentViewed() {
        return studentViewed;
    }

    public void setStudentViewed(boolean studentViewed) {
        this.studentViewed = studentViewed;
    }

    public boolean isTeacherViewed() {
        return teacherViewed;
    }

    public void setTeacherViewed(boolean teacherViewed) {
        this.teacherViewed = teacherViewed;
    }

    public boolean isReviewAdded() {
        return reviewAdded;
    }

    public void setReviewAdded(boolean reviewAdded) {
        this.reviewAdded = reviewAdded;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getReview() {
        return review;
    }

    public void setReview(String review) {
        this.review = review;
    }

    public Instant getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(Instant lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PrePersist
    public void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (lastMessageAt == null) {
            lastMessageAt = now;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = Instant.now();
    }
}
