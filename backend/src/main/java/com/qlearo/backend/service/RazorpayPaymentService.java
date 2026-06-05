package com.qlearo.backend.service;

import com.qlearo.backend.dto.razorpay.RazorpayOrderCreateRequest;
import com.qlearo.backend.dto.razorpay.RazorpayOrderResponse;
import com.qlearo.backend.dto.razorpay.RazorpayVerifyRequest;
import com.qlearo.backend.dto.razorpay.RazorpayVerifyResponse;

public interface RazorpayPaymentService {

    RazorpayOrderResponse createOrder(RazorpayOrderCreateRequest request);

    RazorpayVerifyResponse verifyAndSave(RazorpayVerifyRequest request);
}
