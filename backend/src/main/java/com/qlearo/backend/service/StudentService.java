package com.qlearo.backend.service;

import com.qlearo.backend.dto.AuthResponse;
import com.qlearo.backend.dto.StudentLoginRequest;
import com.qlearo.backend.dto.StudentProfileResponse;
import com.qlearo.backend.dto.StudentRegisterRequest;
import com.qlearo.backend.dto.StudentUpdateRequest;
import org.springframework.web.multipart.MultipartFile;

public interface StudentService {

    AuthResponse register(StudentRegisterRequest request);

    AuthResponse login(StudentLoginRequest request);

    StudentProfileResponse getProfile(String id);

    StudentProfileResponse updateProfile(String id, StudentUpdateRequest request);

    StudentProfileResponse uploadAvatar(String id, MultipartFile file);
}
