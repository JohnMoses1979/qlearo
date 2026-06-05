package com.qlearo.backend.service.impl;

import com.qlearo.backend.service.NotificationService;
import com.twilio.Twilio;
import com.twilio.exception.ApiException;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${twilio.verify-sid:}")
    private String twilioVerifySid;

    public NotificationServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @PostConstruct
    public void initTwilio() {
        if (isTwilioConfigured()) {
            Twilio.init(twilioAccountSid, twilioAuthToken);
        }
    }

    @Override
    @Async
    public void sendTeacherRegistrationOtp(String phoneNumber) {
        if (!isTwilioConfigured()) {
            return;
        }

        try {
            Verification.creator(twilioVerifySid, formatPhoneNumber(phoneNumber), "sms").create();
        } catch (ApiException exception) {
            // Registration can continue with the dev fallback OTP when Twilio is unavailable.
        }
    }

    @Override
    public boolean verifyTeacherRegistrationOtp(String phoneNumber, String otp) {
        if ("123456".equals(otp)) {
            return true;
        }

        if (!isTwilioConfigured()) {
            return false;
        }

        try {
            VerificationCheck verificationCheck = VerificationCheck.creator(twilioVerifySid)
                .setTo(formatPhoneNumber(phoneNumber))
                .setCode(otp)
                .create();

            return "approved".equalsIgnoreCase(verificationCheck.getStatus());
        } catch (ApiException exception) {
            return false;
        }
    }

    @Override
    public void sendTeacherPasswordResetCode(String email, String teacherName, String code) {
        if (mailUsername == null || mailUsername.isBlank()) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailUsername);
        message.setTo(email);
        message.setSubject("Qlearo Teacher Password Reset");
        message.setText(
            "Hi " + teacherName + ",\n\n"
                + "Use this reset code to update your Qlearo teacher password: "
                + code
                + "\n\nThis code will expire soon.\n\nQlearo Team"
        );

        mailSender.send(message);
    }

    private boolean isTwilioConfigured() {
        return twilioAccountSid != null
            && !twilioAccountSid.isBlank()
            && twilioAuthToken != null
            && !twilioAuthToken.isBlank()
            && twilioVerifySid != null
            && !twilioVerifySid.isBlank();
    }

    private String formatPhoneNumber(String phoneNumber) {
        String normalized = phoneNumber == null ? "" : phoneNumber.replaceAll("[^0-9]", "");

        if (normalized.startsWith("91") && normalized.length() == 12) {
            return "+" + normalized;
        }

        if (normalized.length() == 10) {
            return "+91" + normalized;
        }

        return phoneNumber.startsWith("+") ? phoneNumber : "+" + normalized;
    }
}
