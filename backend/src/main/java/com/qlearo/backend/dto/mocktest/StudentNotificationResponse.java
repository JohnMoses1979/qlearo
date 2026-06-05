package com.qlearo.backend.dto.mocktest;

import java.time.Instant;

public class StudentNotificationResponse {

    private String id;
    private String recipientRole;
    private String recipientId;
    private String title;
    private String message;
    private String type;
    private String relatedTestId;
    private String relatedVideoId;
    private String categoryTitle;
    private String subjectId;
    private boolean read;
    private Instant createdAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRecipientRole() {
        return recipientRole;
    }

    public void setRecipientRole(String recipientRole) {
        this.recipientRole = recipientRole;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRelatedTestId() {
        return relatedTestId;
    }

    public void setRelatedTestId(String relatedTestId) {
        this.relatedTestId = relatedTestId;
    }

    public String getRelatedVideoId() {
        return relatedVideoId;
    }

    public void setRelatedVideoId(String relatedVideoId) {
        this.relatedVideoId = relatedVideoId;
    }

    public String getCategoryTitle() {
        return categoryTitle;
    }

    public void setCategoryTitle(String categoryTitle) {
        this.categoryTitle = categoryTitle;
    }

    public String getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(String subjectId) {
        this.subjectId = subjectId;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
