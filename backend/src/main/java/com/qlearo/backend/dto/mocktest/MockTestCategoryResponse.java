package com.qlearo.backend.dto.mocktest;

import java.util.List;

public class MockTestCategoryResponse {

    private String title;
    private String teacherId;
    private String subtitle;
    private String description;
    private String emoji;
    private String color;
    private String soft;
    private List<MockTestSubjectResponse> subjects;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEmoji() {
        return emoji;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getSoft() {
        return soft;
    }

    public void setSoft(String soft) {
        this.soft = soft;
    }

    public List<MockTestSubjectResponse> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<MockTestSubjectResponse> subjects) {
        this.subjects = subjects;
    }
}
