package com.qlearo.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions/razorpay")
@CrossOrigin(origins = "*")
public class RazorpayGatewayController {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency:INR}")
    private String razorpayCurrency;

    @PostConstruct
    public void init() {
        if (razorpayCurrency == null || razorpayCurrency.isBlank()) {
            razorpayCurrency = "INR";
        }
    }

    @PostMapping(value = "/order", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> payload) {
        try {
            int amountInRupees = toInt(payload.get("amount"));
            if (amountInRupees <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(error("amount is required and must be greater than 0"));
            }

            String receipt = stringValue(payload.get("receipt"));
            if (receipt == null || receipt.isBlank()) {
                receipt = "qlearo-" + UUID.randomUUID();
            }

            int amountInPaise = amountInRupees * 100;
            Map<String, Object> orderRequest = new LinkedHashMap<>();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", razorpayCurrency);
            orderRequest.put("receipt", receipt);
            orderRequest.put("payment_capture", 1);

            Map<String, Object> notes = new LinkedHashMap<>();
            putIfPresent(notes, "studentId", payload.get("studentId"));
            putIfPresent(notes, "studentName", payload.get("studentName"));
            putIfPresent(notes, "planId", payload.get("planId"));
            putIfPresent(notes, "planName", payload.get("planName"));
            putIfPresent(notes, "planDurationMonths", payload.get("planDurationMonths"));
            if (!notes.isEmpty()) {
                orderRequest.put("notes", notes);
            }

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.razorpay.com/v1/orders"))
                    .header("Authorization", basicAuthHeader())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(orderRequest)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(error("Unable to create Razorpay order"));
            }

            JsonNode body = objectMapper.readTree(response.body());
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("success", true);
            result.put("keyId", razorpayKeyId);
            result.put("orderId", body.path("id").asText(null));
            result.put("amount", body.path("amount").asInt(amountInPaise));
            result.put("currency", body.path("currency").asText(razorpayCurrency));
            result.put("receipt", body.path("receipt").asText(receipt));
            result.put("raw", body);
            return ResponseEntity.ok(result);
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error(exception.getMessage() == null ? "Unable to create Razorpay order" : exception.getMessage()));
        }
    }

    @PostMapping(value = "/verify", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, Object> payload) {
        try {
            String orderId = firstString(payload, "orderId", "razorpay_order_id");
            String paymentId = firstString(payload, "paymentId", "razorpay_payment_id");
            String signature = firstString(payload, "signature", "razorpay_signature");

            if (orderId == null || paymentId == null || signature == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(error("orderId, paymentId and signature are required"));
            }

            String expectedSignature = createSignature(orderId + "|" + paymentId, razorpayKeySecret);
            boolean verified = constantTimeEquals(expectedSignature, signature);

            if (!verified) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(error("Razorpay signature verification failed"));
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("success", true);
            result.put("verified", true);
            result.put("orderId", orderId);
            result.put("paymentId", paymentId);
            result.put("signature", signature);
            return ResponseEntity.ok(result);
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error(exception.getMessage() == null ? "Unable to verify Razorpay payment" : exception.getMessage()));
        }
    }

    private String basicAuthHeader() {
        String token = razorpayKeyId + ":" + razorpayKeySecret;
        return "Basic " + Base64.getEncoder().encodeToString(token.getBytes(StandardCharsets.UTF_8));
    }

    private String createSignature(String payload, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        return bytesToHex(digest);
    }

    private boolean constantTimeEquals(String left, String right) {
        return MessageDigestHolder.constantTimeEquals(left, right);
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", false);
        result.put("message", message);
        return result;
    }

    private int toInt(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(value).trim());
        } catch (Exception ignored) {
            return 0;
        }
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value).trim();
    }

    private String firstString(Map<String, Object> payload, String firstKey, String secondKey) {
        String first = stringValue(payload.get(firstKey));
        if (first != null && !first.isBlank()) {
            return first;
        }
        String second = stringValue(payload.get(secondKey));
        if (second != null && !second.isBlank()) {
            return second;
        }
        return null;
    }

    private void putIfPresent(Map<String, Object> map, String key, Object value) {
        String stringValue = stringValue(value);
        if (stringValue != null && !stringValue.isBlank()) {
            map.put(key, stringValue);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder builder = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) {
            builder.append(String.format("%02x", value));
        }
        return builder.toString();
    }

    private static final class MessageDigestHolder {
        private MessageDigestHolder() {
        }

        private static boolean constantTimeEquals(String left, String right) {
            if (left == null || right == null) {
                return false;
            }
            byte[] leftBytes = left.getBytes(StandardCharsets.UTF_8);
            byte[] rightBytes = right.getBytes(StandardCharsets.UTF_8);
            return java.security.MessageDigest.isEqual(leftBytes, rightBytes);
        }
    }
}
