package com.qlearo.backend.dto.mocktest;

import java.util.List;

public class MockTestSubjectResponse {

    private String id;
    private String name;
    private String teacherId;
    private String desc;
    private String emoji;
    private String color;
    private String soft;
    private String time;
    private int tests;
    private int questions;
    private List<MockTestResponse> list;

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

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
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

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public int getTests() {
        return tests;
    }

    public void setTests(int tests) {
        this.tests = tests;
    }

    public int getQuestions() {
        return questions;
    }

    public void setQuestions(int questions) {
        this.questions = questions;
    }

    public List<MockTestResponse> getList() {
        return list;
    }

    public void setList(List<MockTestResponse> list) {
        this.list = list;
    }
}
