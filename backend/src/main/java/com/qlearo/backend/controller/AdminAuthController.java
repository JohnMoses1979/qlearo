package com.qlearo.backend.controller;

import com.qlearo.backend.dto.AdminLoginRequest;
import com.qlearo.backend.dto.ApiMessageResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AdminAuthController {

    @Value("${app.admin.email:admin@gmail.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@12345}")
    private String adminPassword;

    @PostMapping("/admin/login")
    @ResponseStatus(HttpStatus.OK)
    public ApiMessageResponse login(@RequestBody AdminLoginRequest request) {
        String email = request == null || request.getEmail() == null ? "" : request.getEmail().trim();
        String password = request == null || request.getPassword() == null ? "" : request.getPassword().trim();

        if (!adminEmail.equalsIgnoreCase(email) || !adminPassword.equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin email or password");
        }

        return new ApiMessageResponse("Admin login successful");
    }
}
