package com.qlearo.backend.service;

import com.qlearo.backend.dto.ApiMessageResponse;
import com.qlearo.backend.dto.TeacherAuthResponse;
import com.qlearo.backend.dto.TeacherCompleteRegistrationRequest;
import com.qlearo.backend.dto.TeacherForgotPasswordRequest;
import com.qlearo.backend.dto.TeacherLoginRequest;
import com.qlearo.backend.dto.TeacherOtpRequest;
import com.qlearo.backend.dto.TeacherProfileResponse;
import com.qlearo.backend.dto.TeacherRegisterInitiateRequest;
import com.qlearo.backend.dto.TeacherResetPasswordRequest;
import com.qlearo.backend.dto.TeacherUpdateRequest;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface TeacherService {

    ApiMessageResponse initiateRegistration(TeacherRegisterInitiateRequest request);

    ApiMessageResponse verifyRegistrationOtp(TeacherOtpRequest request);

    TeacherProfileResponse completeRegistration(TeacherCompleteRegistrationRequest request);

    TeacherAuthResponse login(TeacherLoginRequest request);

    TeacherProfileResponse getProfile(String id);

    TeacherProfileResponse updateProfile(String id, TeacherUpdateRequest request);

    TeacherProfileResponse uploadAvatar(String id, MultipartFile file);

    ApiMessageResponse sendForgotPasswordCode(TeacherForgotPasswordRequest request);

    ApiMessageResponse resetPassword(TeacherResetPasswordRequest request);

    List<TeacherProfileResponse> getTeachersByStatus(String status);

    TeacherProfileResponse approveTeacher(String id);

    TeacherProfileResponse rejectTeacher(String id);
}
