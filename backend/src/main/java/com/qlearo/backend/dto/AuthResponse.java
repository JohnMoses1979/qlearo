package com.qlearo.backend.dto;

public class AuthResponse {

    private String token;
    private StudentProfileResponse student;

    public AuthResponse() {
    }

    public AuthResponse(String token, StudentProfileResponse student) {
        this.token = token;
        this.student = student;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public StudentProfileResponse getStudent() {
        return student;
    }

    public void setStudent(StudentProfileResponse student) {
        this.student = student;
    }
}
