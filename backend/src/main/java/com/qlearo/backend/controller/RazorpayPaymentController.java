package com.qlearo.backend.controller;

import com.qlearo.backend.dto.razorpay.RazorpayOrderCreateRequest;
import com.qlearo.backend.dto.razorpay.RazorpayOrderResponse;
import com.qlearo.backend.dto.razorpay.RazorpayVerifyRequest;
import com.qlearo.backend.dto.razorpay.RazorpayVerifyResponse;
import com.qlearo.backend.service.RazorpayPaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/razorpay")
public class RazorpayPaymentController {

    private final RazorpayPaymentService razorpayPaymentService;

    public RazorpayPaymentController(RazorpayPaymentService razorpayPaymentService) {
        this.razorpayPaymentService = razorpayPaymentService;
    }

    @PostMapping("/order")
    @ResponseStatus(HttpStatus.CREATED)
    public RazorpayOrderResponse createOrder(@RequestBody RazorpayOrderCreateRequest request) {
        return razorpayPaymentService.createOrder(request);
    }

    @PostMapping("/verify")
    public RazorpayVerifyResponse verify(@RequestBody RazorpayVerifyRequest request) {
        return razorpayPaymentService.verifyAndSave(request);
    }
}
