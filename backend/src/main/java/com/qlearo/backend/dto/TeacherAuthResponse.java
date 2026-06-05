package com.qlearo.backend.dto;

public class TeacherAuthResponse {

    private String token;
    private String message;
    private TeacherProfileResponse teacher;

    public TeacherAuthResponse() {
    }

    public TeacherAuthResponse(String token, String message, TeacherProfileResponse teacher) {
        this.token = token;
        this.message = message;
        this.teacher = teacher;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public TeacherProfileResponse getTeacher() {
        return teacher;
    }

    public void setTeacher(TeacherProfileResponse teacher) {
        this.teacher = teacher;
    }
}
