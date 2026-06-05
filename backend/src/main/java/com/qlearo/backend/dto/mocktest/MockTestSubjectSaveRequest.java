package com.qlearo.backend.dto.mocktest;

public class MockTestSubjectSaveRequest {

    private String id;
    private String name;
    private String desc;
    private String time;
    private String emoji;
    private String color;
    private String soft;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
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
}
