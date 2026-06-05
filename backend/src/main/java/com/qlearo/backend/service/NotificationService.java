package com.qlearo.backend.service;

public interface NotificationService {

    void sendTeacherRegistrationOtp(String phoneNumber);

    boolean verifyTeacherRegistrationOtp(String phoneNumber, String otp);

    void sendTeacherPasswordResetCode(String email, String teacherName, String code);
}
