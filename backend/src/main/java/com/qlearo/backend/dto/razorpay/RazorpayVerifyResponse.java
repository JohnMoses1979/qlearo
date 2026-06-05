package com.qlearo.backend.dto.razorpay;

import com.qlearo.backend.dto.subscription.SubscriptionPaymentResponse;

public class RazorpayVerifyResponse {

    private boolean verified;
    private String message;
    private SubscriptionPaymentResponse payment;

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public SubscriptionPaymentResponse getPayment() {
        return payment;
    }

    public void setPayment(SubscriptionPaymentResponse payment) {
        this.payment = payment;
    }
}
