package com.qlearo.backend.service;

import com.twilio.Twilio;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwilioVerifyService {

    @Value("${TWILIO_ACCOUNT_SID}")
    private String accountSid;

    @Value("${TWILIO_AUTH_TOKEN}")
    private String authToken;

    @Value("${TWILIO_VERIFY_SID}")
    private String verifySid;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }

    public void sendOtp(String phoneNumber) {
        String phone = normalizePhone(phoneNumber);

        Verification.creator(
                verifySid,
                phone,
                "sms"
        ).create();
    }

    public boolean verifyOtp(String phoneNumber, String otp) {
        String phone = normalizePhone(phoneNumber);

        VerificationCheck check = VerificationCheck.creator(verifySid)
                .setTo(phone)
                .setCode(otp)
                .create();

        return "approved".equalsIgnoreCase(check.getStatus());
    }

    private String normalizePhone(String phoneNumber) {
        String phone = phoneNumber == null ? "" : phoneNumber.trim().replaceAll("\\s+", "");

        if (phone.startsWith("+")) {
            return phone;
        }

        if (phone.length() == 10) {
            return "+91" + phone;
        }

        return phone;
    }
}
