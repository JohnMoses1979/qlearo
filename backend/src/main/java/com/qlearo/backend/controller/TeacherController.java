package com.qlearo.backend.controller;

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
import com.qlearo.backend.service.TeacherService;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api")
public class TeacherController {

    private static final Path AVATAR_UPLOAD_DIR = Paths.get("backend", "uploads", "teacher-avatars");

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @PostMapping("/teachers/register/initiate")
    public ApiMessageResponse initiateRegistration(@RequestBody TeacherRegisterInitiateRequest request) {
        return teacherService.initiateRegistration(request);
    }

    @PostMapping("/teachers/register/verify-otp")
    public ApiMessageResponse verifyRegistrationOtp(@RequestBody TeacherOtpRequest request) {
        return teacherService.verifyRegistrationOtp(request);
    }

    @PostMapping("/teachers/register/complete")
    @ResponseStatus(HttpStatus.CREATED)
    public TeacherProfileResponse completeRegistration(@RequestBody TeacherCompleteRegistrationRequest request) {
        return withAbsoluteAvatar(teacherService.completeRegistration(request));
    }

    @PostMapping("/teachers/login")
    public TeacherAuthResponse login(@RequestBody TeacherLoginRequest request) {
        return withAbsoluteAvatar(teacherService.login(request));
    }

    @GetMapping("/teachers/{id}")
    public TeacherProfileResponse getProfile(@PathVariable String id) {
        return withAbsoluteAvatar(teacherService.getProfile(id));
    }

    @PutMapping("/teachers/{id}")
    public TeacherProfileResponse updateProfile(@PathVariable String id, @RequestBody TeacherUpdateRequest request) {
        return withAbsoluteAvatar(teacherService.updateProfile(id, request));
    }

    @PostMapping(path = "/teachers/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TeacherProfileResponse uploadAvatar(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        return withAbsoluteAvatar(teacherService.uploadAvatar(id, file));
    }

    @GetMapping("/teachers/avatar/{fileName:.+}")
    public ResponseEntity<Resource> getAvatar(@PathVariable String fileName) throws MalformedURLException {
        Path filePath = AVATAR_UPLOAD_DIR.resolve(fileName).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
            .body(resource);
    }

    @PostMapping("/teachers/password/forgot")
    public ApiMessageResponse forgotPassword(@RequestBody TeacherForgotPasswordRequest request) {
        return teacherService.sendForgotPasswordCode(request);
    }

    @PostMapping("/teachers/password/reset")
    public ApiMessageResponse resetPassword(@RequestBody TeacherResetPasswordRequest request) {
        return teacherService.resetPassword(request);
    }

    @GetMapping("/admin/teachers")
    public List<TeacherProfileResponse> getTeachersByStatus(@RequestParam(defaultValue = "PENDING_APPROVAL") String status) {
        return teacherService.getTeachersByStatus(status)
            .stream()
            .map(this::withAbsoluteAvatar)
            .toList();
    }

    @PostMapping("/admin/teachers/{id}/approve")
    public TeacherProfileResponse approveTeacher(@PathVariable String id) {
        return withAbsoluteAvatar(teacherService.approveTeacher(id));
    }

    @PostMapping("/admin/teachers/{id}/reject")
    public TeacherProfileResponse rejectTeacher(@PathVariable String id) {
        return withAbsoluteAvatar(teacherService.rejectTeacher(id));
    }

    private TeacherAuthResponse withAbsoluteAvatar(TeacherAuthResponse response) {
        if (response == null) {
            return null;
        }
        response.setTeacher(withAbsoluteAvatar(response.getTeacher()));
        return response;
    }

    private TeacherProfileResponse withAbsoluteAvatar(TeacherProfileResponse profile) {
        if (profile == null || profile.getAvatar() == null || profile.getAvatar().isBlank()) {
            return profile;
        }

        String avatarPath = profile.getAvatar();
        int apiIndex = avatarPath.indexOf("/api/teachers/avatar/");
        if (apiIndex >= 0) {
            avatarPath = avatarPath.substring(apiIndex);
        }

        if (avatarPath.startsWith("/api/teachers/avatar/")) {
            profile.setAvatar(
                ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path(avatarPath)
                    .toUriString()
            );
            return profile;
        }

        if (profile.getAvatar().startsWith("http://") || profile.getAvatar().startsWith("https://")) {
            return profile;
        }

        profile.setAvatar(
            ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(avatarPath)
                .toUriString()
        );
        return profile;
    }
}
