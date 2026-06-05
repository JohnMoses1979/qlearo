package com.qlearo.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "explanation_videos")
public class ExplanationVideo {

    @Id
    @Column(name = "id", nullable = false, updatable = false, length = 64)
    private String id;

    @Column(name = "video_id", nullable = false, unique = true, length = 64)
    private String videoId;

    @Column(name = "teacher_id", nullable = false)
    private String teacherId;

    @Column(name = "teacher_name", nullable = false)
    private String teacherName;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "category_id")
    private String categoryId;

    @Column(name = "category_title")
    private String categoryTitle;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "topic", nullable = false)
    private String topic;

    @Column(name = "class_name")
    private String className;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "duration")
    private String duration;

    @Column(name = "views")
    private String views;

    @Column(name = "likes")
    private String likes;

    @Column(name = "comments")
    private String comments;

    @Column(name = "rating")
    private String rating;

    @Column(name = "visibility", nullable = false)
    private String visibility;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "thumbnail", length = 2000)
    private String thumbnail;

    @Column(name = "video_url", length = 2000)
    private String videoUrl;

    @Column(name = "source_url", length = 2000)
    private String url;

    @Column(name = "color", length = 32)
    private String color;

    @Column(name = "recipient_student_id")
    private String recipientStudentId;

    @Column(name = "recipient_student_name")
    private String recipientStudentName;

    @Column(name = "uploaded_ago")
    private String uploadedAgo;

    @Column(name = "time_label")
    private String time;

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

    public String getVideoId() {
        return videoId;
    }

    public void setVideoId(String videoId) {
        this.videoId = videoId;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryTitle() {
        return categoryTitle;
    }

    public void setCategoryTitle(String categoryTitle) {
        this.categoryTitle = categoryTitle;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getViews() {
        return views;
    }

    public void setViews(String views) {
        this.views = views;
    }

    public String getLikes() {
        return likes;
    }

    public void setLikes(String likes) {
        this.likes = likes;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public String getRating() {
        return rating;
    }

    public void setRating(String rating) {
        this.rating = rating;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getRecipientStudentId() {
        return recipientStudentId;
    }

    public void setRecipientStudentId(String recipientStudentId) {
        this.recipientStudentId = recipientStudentId;
    }

    public String getRecipientStudentName() {
        return recipientStudentName;
    }

    public void setRecipientStudentName(String recipientStudentName) {
        this.recipientStudentName = recipientStudentName;
    }

    public String getUploadedAgo() {
        return uploadedAgo;
    }

    public void setUploadedAgo(String uploadedAgo) {
        this.uploadedAgo = uploadedAgo;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
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
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = Instant.now();
    }
}
