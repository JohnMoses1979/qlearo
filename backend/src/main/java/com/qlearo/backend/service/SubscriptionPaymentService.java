package com.qlearo.backend.service;

import com.qlearo.backend.dto.subscription.SubscriptionPaymentResponse;
import com.qlearo.backend.dto.subscription.SubscriptionPaymentSaveRequest;
import java.util.List;

public interface SubscriptionPaymentService {

    List<SubscriptionPaymentResponse> getAllPayments();

    List<SubscriptionPaymentResponse> getStudentPayments(String studentId);

    SubscriptionPaymentResponse getPayment(String paymentId);

    SubscriptionPaymentResponse createPayment(SubscriptionPaymentSaveRequest request);

    void deletePayment(String paymentId);
}
