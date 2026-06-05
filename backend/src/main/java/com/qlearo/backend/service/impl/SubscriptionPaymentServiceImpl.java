package com.qlearo.backend.service.impl;

import com.qlearo.backend.dto.subscription.SubscriptionPaymentResponse;
import com.qlearo.backend.dto.subscription.SubscriptionPaymentSaveRequest;
import com.qlearo.backend.entity.SubscriptionPayment;
import com.qlearo.backend.repository.SubscriptionPaymentRepository;
import com.qlearo.backend.service.SubscriptionPaymentService;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SubscriptionPaymentServiceImpl implements SubscriptionPaymentService {

    private final SubscriptionPaymentRepository subscriptionPaymentRepository;

    public SubscriptionPaymentServiceImpl(SubscriptionPaymentRepository subscriptionPaymentRepository) {
        this.subscriptionPaymentRepository = subscriptionPaymentRepository;
    }

    @Override
    public List<SubscriptionPaymentResponse> getAllPayments() {
        return subscriptionPaymentRepository.findAllByOrderByPaidAtDesc()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<SubscriptionPaymentResponse> getStudentPayments(String studentId) {
        return subscriptionPaymentRepository.findByStudentIdOrderByPaidAtDesc(studentId)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    public SubscriptionPaymentResponse getPayment(String paymentId) {
        return toResponse(getPaymentEntityOrThrow(paymentId));
    }

    @Override
    public SubscriptionPaymentResponse createPayment(SubscriptionPaymentSaveRequest request) {
        validateRequest(request);

        String paymentId = firstValue(request.getPaymentId(), generateId("PAY"));

        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setId(paymentId);
        payment.setPaymentId(paymentId);
        payment.setStudentId(request.getStudentId().trim());
        payment.setStudentName(request.getStudentName().trim());
        payment.setClassName(trimToNull(request.getClassName()));
        payment.setPlanId(trimToNull(request.getPlanId()));
        payment.setPlanName(request.getPlanName().trim());
        payment.setBillingType(trimToNull(request.getBillingType()));
        payment.setDurationLabel(trimToNull(request.getDurationLabel()));
        payment.setAmount(request.getAmount());
        payment.setPaymentMode(firstValue(request.getPaymentMode(), "Online"));
        payment.setTransactionId(firstValue(request.getTransactionId(), generateId("TXN")));
        payment.setStatus(firstValue(request.getStatus(), "Paid"));
        payment.setPaidAt(firstNonNull(request.getPaidAt(), Instant.now()));
        payment.setExpiresAt(request.getExpiresAt());

        return toResponse(subscriptionPaymentRepository.save(payment));
    }

    @Override
    public void deletePayment(String paymentId) {
        SubscriptionPayment payment = getPaymentEntityOrThrow(paymentId);
        subscriptionPaymentRepository.delete(payment);
    }

    private SubscriptionPayment getPaymentEntityOrThrow(String paymentId) {
        return subscriptionPaymentRepository.findById(paymentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription payment not found"));
    }

    private SubscriptionPaymentResponse toResponse(SubscriptionPayment payment) {
        SubscriptionPaymentResponse response = new SubscriptionPaymentResponse();
        response.setId(payment.getId());
        response.setPaymentId(payment.getPaymentId());
        response.setStudentId(payment.getStudentId());
        response.setStudentName(payment.getStudentName());
        response.setClassName(payment.getClassName());
        response.setPlanId(payment.getPlanId());
        response.setPlanName(payment.getPlanName());
        response.setBillingType(payment.getBillingType());
        response.setDurationLabel(payment.getDurationLabel());
        response.setAmount(payment.getAmount());
        response.setPaymentMode(payment.getPaymentMode());
        response.setTransactionId(payment.getTransactionId());
        response.setStatus(payment.getStatus());
        response.setPaidAt(payment.getPaidAt());
        response.setExpiresAt(payment.getExpiresAt());
        response.setCreatedAt(payment.getCreatedAt());
        response.setUpdatedAt(payment.getUpdatedAt());
        return response;
    }

    private void validateRequest(SubscriptionPaymentSaveRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subscription payment payload is required");
        }

        if (isBlank(request.getStudentId())
            || isBlank(request.getStudentName())
            || isBlank(request.getPlanName())
            || request.getAmount() == null
            || isBlank(request.getTransactionId())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Student, plan, amount and transaction information are required"
            );
        }
    }

    private String firstValue(String value, String fallback) {
        return isBlank(value) ? fallback : value.trim();
    }

    private Instant firstNonNull(Instant value, Instant fallback) {
        return value != null ? value : fallback;
    }

    private String trimToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String generateId(String prefix) {
        return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT);
    }
}
