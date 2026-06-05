package com.qlearo.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qlearo.backend.dto.razorpay.RazorpayOrderCreateRequest;
import com.qlearo.backend.dto.razorpay.RazorpayOrderResponse;
import com.qlearo.backend.dto.razorpay.RazorpayVerifyRequest;
import com.qlearo.backend.dto.razorpay.RazorpayVerifyResponse;
import com.qlearo.backend.dto.subscription.SubscriptionPaymentResponse;
import com.qlearo.backend.dto.subscription.SubscriptionPaymentSaveRequest;
import com.qlearo.backend.service.RazorpayPaymentService;
import com.qlearo.backend.service.SubscriptionPaymentService;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RazorpayPaymentServiceImpl implements RazorpayPaymentService {

    private static final String RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper;
    private final SubscriptionPaymentService subscriptionPaymentService;

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency:INR}")
    private String razorpayCurrency;

    public RazorpayPaymentServiceImpl(
        ObjectMapper objectMapper,
        SubscriptionPaymentService subscriptionPaymentService
    ) {
        this.objectMapper = objectMapper;
        this.subscriptionPaymentService = subscriptionPaymentService;
    }

    @Override
    public RazorpayOrderResponse createOrder(RazorpayOrderCreateRequest request) {
        validateRequest(request);
        ensureRazorpayConfigured();

        long amountInPaise = Math.max(1L, request.getAmount() == null ? 0L : request.getAmount()) * 100L;
        String receipt = firstValue(request.getTransactionId(), generateReceipt(request.getStudentId()));

        Map<String, Object> payload = new HashMap<>();
        payload.put("amount", amountInPaise);
        payload.put("currency", razorpayCurrency);
        payload.put("receipt", receipt);
        payload.put("payment_capture", 1);
        payload.put("notes", Map.of(
            "studentId", firstValue(request.getStudentId(), ""),
            "studentName", firstValue(request.getStudentName(), ""),
            "planName", firstValue(request.getPlanName(), ""),
            "durationLabel", firstValue(request.getDurationLabel(), "")
        ));

        try {
            String json = objectMapper.writeValueAsString(payload);
            String auth = Base64.getEncoder().encodeToString(
                (razorpayKeyId + ":" + razorpayKeySecret).getBytes(StandardCharsets.UTF_8)
            );

            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(RAZORPAY_ORDERS_URL))
                .header("Authorization", "Basic " + auth)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to create Razorpay order"
                );
            }

            JsonNode orderJson = objectMapper.readTree(response.body());
            JsonNode orderIdNode = orderJson.get("id");

            if (orderIdNode == null || orderIdNode.asText().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Razorpay order id missing");
            }

            RazorpayOrderResponse orderResponse = new RazorpayOrderResponse();
            orderResponse.setKeyId(razorpayKeyId);
            orderResponse.setOrderId(orderIdNode.asText());
            orderResponse.setAmount(request.getAmount());
            orderResponse.setCurrency(razorpayCurrency);
            orderResponse.setName("Qlearo");
            orderResponse.setDescription(firstValue(request.getPlanName(), "Subscription Plan"));
            orderResponse.setPlanName(firstValue(request.getPlanName(), "Subscription Plan"));
            orderResponse.setDurationLabel(firstValue(request.getDurationLabel(), "subscription"));
            orderResponse.setPaymentMode(firstValue(request.getPaymentMode(), "Online"));
            orderResponse.setStudentId(firstValue(request.getStudentId(), ""));
            orderResponse.setStudentName(firstValue(request.getStudentName(), ""));
            orderResponse.setClassName(firstValue(request.getClassName(), ""));
            orderResponse.setPlanId(firstValue(request.getPlanId(), ""));
            orderResponse.setTransactionId(receipt);
            return orderResponse;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unable to create Razorpay order"
            );
        }
    }

    @Override
    public RazorpayVerifyResponse verifyAndSave(RazorpayVerifyRequest request) {
        validateVerifyRequest(request);
        ensureRazorpayConfigured();

        if (!verifySignature(request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Razorpay signature");
        }

        SubscriptionPaymentSaveRequest saveRequest = new SubscriptionPaymentSaveRequest();
        saveRequest.setPaymentId(firstValue(request.getRazorpayPaymentId(), request.getTransactionId()));
        saveRequest.setStudentId(request.getStudentId());
        saveRequest.setStudentName(request.getStudentName());
        saveRequest.setClassName(request.getClassName());
        saveRequest.setPlanId(request.getPlanId());
        saveRequest.setPlanName(request.getPlanName());
        saveRequest.setBillingType(request.getBillingType());
        saveRequest.setDurationLabel(request.getDurationLabel());
        saveRequest.setAmount(request.getAmount());
        saveRequest.setPaymentMode(request.getPaymentMode());
        saveRequest.setTransactionId(firstValue(request.getTransactionId(), request.getRazorpayPaymentId()));
        saveRequest.setStatus(firstValue(request.getStatus(), "Paid"));
        saveRequest.setPaidAt(request.getPaidAt());
        saveRequest.setExpiresAt(request.getExpiresAt());

        SubscriptionPaymentResponse payment = subscriptionPaymentService.createPayment(saveRequest);

        RazorpayVerifyResponse response = new RazorpayVerifyResponse();
        response.setVerified(true);
        response.setMessage("Payment verified successfully");
        response.setPayment(payment);
        return response;
    }

    private void validateRequest(RazorpayOrderCreateRequest request) {
        if (request == null
            || isBlank(request.getStudentId())
            || isBlank(request.getStudentName())
            || isBlank(request.getPlanName())
            || request.getAmount() == null
            || request.getAmount() <= 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Student, plan and amount are required"
            );
        }
    }

    private void validateVerifyRequest(RazorpayVerifyRequest request) {
        if (request == null
            || isBlank(request.getRazorpayOrderId())
            || isBlank(request.getRazorpayPaymentId())
            || isBlank(request.getRazorpaySignature())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Razorpay payment details are required"
            );
        }

        validateRequest(request);
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = bytesToHex(digest);
            return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception exception) {
            return false;
        }
    }

    private void ensureRazorpayConfigured() {
        if (isBlank(razorpayKeyId) || isBlank(razorpayKeySecret)) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Razorpay keys are not configured");
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder builder = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) {
            builder.append(String.format(Locale.ROOT, "%02x", value));
        }
        return builder.toString();
    }

    private String firstValue(String value, String fallback) {
        return isBlank(value) ? fallback : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String generateReceipt(String studentId) {
        return "QLEARO_" + firstValue(studentId, "STUDENT") + "_" + System.currentTimeMillis();
    }
}
