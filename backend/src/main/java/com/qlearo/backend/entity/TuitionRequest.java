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
@Table(name = "tuition_requests")
public class TuitionRequest {

    @Id
    @Column(name = "id", nullable = false, updatable = false, length = 64)
    private String id;

    @Column(name = "conversation_id", length = 64)
    private String conversationId;

    @Column(name = "teacher_id", nullable = false, length = 32)
    private String teacherId;

    @Column(name = "teacher_name", nullable = false)
    private String teacherName;

    @Column(name = "teacher_avatar")
    private String teacherAvatar;

    @Column(name = "student_id", nullable = false, length = 32)
    private String studentId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "student_avatar")
    private String studentAvatar;

    @Column(name = "class_name")
    private String className;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "topic", nullable = false)
    private String topic;

    @Column(name = "focus")
    private String focus;

    @Lob
    @Column(name = "note")
    private String note;

    @Lob
    @Column(name = "message")
    private String message;

    @Column(name = "duration")
    private String duration;

    @Column(name = "requested_time")
    private String requestedTime;

    @Column(name = "preferred_date")
    private String preferredDate;

    @Column(name = "session_type")
    private String sessionType;

    @Column(name = "mode")
    private String mode;

    @Column(name = "language")
    private String language;

    @Column(name = "level")
    private String level;

    @Column(name = "status", nullable = false, length = 24)
    private String status;

    @Column(name = "student_viewed", nullable = false)
    private boolean studentViewed;

    @Column(name = "teacher_viewed", nullable = false)
    private boolean teacherViewed;

    @Lob
    @Column(name = "proposal_json")
    private String proposalJson;

    @Column(name = "session_id")
    private String sessionId;

    @Lob
    @Column(name = "decline_reason")
    private String declineReason;

    @Lob
    @Column(name = "cancel_reason")
    private String cancelReason;

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

    public String getTeacherAvatar() {
        return teacherAvatar;
    }

    public void setTeacherAvatar(String teacherAvatar) {
        this.teacherAvatar = teacherAvatar;
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

    public String getStudentAvatar() {
        return studentAvatar;
    }

    public void setStudentAvatar(String studentAvatar) {
        this.studentAvatar = studentAvatar;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
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

    public String getFocus() {
        return focus;
    }

    public void setFocus(String focus) {
        this.focus = focus;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getRequestedTime() {
        return requestedTime;
    }

    public void setRequestedTime(String requestedTime) {
        this.requestedTime = requestedTime;
    }

    public String getPreferredDate() {
        return preferredDate;
    }

    public void setPreferredDate(String preferredDate) {
        this.preferredDate = preferredDate;
    }

    public String getSessionType() {
        return sessionType;
    }

    public void setSessionType(String sessionType) {
        this.sessionType = sessionType;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public String getProposalJson() {
        return proposalJson;
    }

    public void setProposalJson(String proposalJson) {
        this.proposalJson = proposalJson;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getDeclineReason() {
        return declineReason;
    }

    public void setDeclineReason(String declineReason) {
        this.declineReason = declineReason;
    }

    public String getCancelReason() {
        return cancelReason;
    }

    public void setCancelReason(String cancelReason) {
        this.cancelReason = cancelReason;
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
        if (status == null || status.isBlank()) {
            status = "pending";
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = Instant.now();
    }
}
