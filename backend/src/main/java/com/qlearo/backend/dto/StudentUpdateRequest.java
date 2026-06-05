package com.qlearo.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class StudentUpdateRequest {

    private String fullName;
    private String email;
    private String phone;
    private String className;
    private String school;
    private List<String> favoriteSubjects = new ArrayList<>();
    private String avatar;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSchool() {
        return school;
    }

    public void setSchool(String school) {
        this.school = school;
    }

    public List<String> getFavoriteSubjects() {
        return favoriteSubjects;
    }

    public void setFavoriteSubjects(List<String> favoriteSubjects) {
        this.favoriteSubjects = favoriteSubjects;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}
