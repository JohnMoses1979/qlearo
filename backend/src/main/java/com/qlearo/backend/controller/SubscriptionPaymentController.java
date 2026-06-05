package com.qlearo.backend.controller;

import com.qlearo.backend.dto.ApiMessageResponse;
import com.qlearo.backend.dto.subscription.SubscriptionPaymentResponse;
import com.qlearo.backend.dto.subscription.SubscriptionPaymentSaveRequest;
import com.qlearo.backend.service.SubscriptionPaymentService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SubscriptionPaymentController {

    private final SubscriptionPaymentService subscriptionPaymentService;

    public SubscriptionPaymentController(SubscriptionPaymentService subscriptionPaymentService) {
        this.subscriptionPaymentService = subscriptionPaymentService;
    }

    @GetMapping("/subscription-payments")
    public List<SubscriptionPaymentResponse> getAllPayments() {
        return subscriptionPaymentService.getAllPayments();
    }

    @GetMapping("/students/{studentId}/subscription-payments")
    public List<SubscriptionPaymentResponse> getStudentPayments(@PathVariable String studentId) {
        return subscriptionPaymentService.getStudentPayments(studentId);
    }

    @GetMapping("/subscription-payments/{paymentId}")
    public SubscriptionPaymentResponse getPayment(@PathVariable String paymentId) {
        return subscriptionPaymentService.getPayment(paymentId);
    }

    @PostMapping("/subscription-payments")
    @ResponseStatus(HttpStatus.CREATED)
    public SubscriptionPaymentResponse createPayment(@RequestBody SubscriptionPaymentSaveRequest request) {
        return subscriptionPaymentService.createPayment(request);
    }

    @DeleteMapping("/subscription-payments/{paymentId}")
    public ApiMessageResponse deletePayment(@PathVariable String paymentId) {
        subscriptionPaymentService.deletePayment(paymentId);
        return new ApiMessageResponse("Subscription payment deleted successfully");
    }
}
