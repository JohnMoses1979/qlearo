package com.qlearo.backend.controller;

import com.qlearo.backend.dto.AuthResponse;
import com.qlearo.backend.dto.StudentLoginRequest;
import com.qlearo.backend.dto.StudentProfileResponse;
import com.qlearo.backend.dto.StudentRegisterRequest;
import com.qlearo.backend.dto.StudentUpdateRequest;
import com.qlearo.backend.service.StudentService;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
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
@RequestMapping("/api/students")
public class StudentController {

    private static final Path AVATAR_UPLOAD_DIR = Paths.get("backend", "uploads", "avatars");

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@RequestBody StudentRegisterRequest request) {
        return withAbsoluteAvatar(studentService.register(request));
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody StudentLoginRequest request) {
        return withAbsoluteAvatar(studentService.login(request));
    }

    @GetMapping("/{id}")
    public StudentProfileResponse getProfile(@PathVariable String id) {
        return withAbsoluteAvatar(studentService.getProfile(id));
    }

    @PutMapping("/{id}")
    public StudentProfileResponse updateProfile(
        @PathVariable String id,
        @RequestBody StudentUpdateRequest request
    ) {
        return withAbsoluteAvatar(studentService.updateProfile(id, request));
    }

    @PostMapping(path = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StudentProfileResponse uploadAvatar(
        @PathVariable String id,
        @RequestParam("file") MultipartFile file
    ) {
        return withAbsoluteAvatar(studentService.uploadAvatar(id, file));
    }

    @GetMapping("/avatar/{fileName:.+}")
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

    private AuthResponse withAbsoluteAvatar(AuthResponse response) {
        if (response == null) {
            return null;
        }

        response.setStudent(withAbsoluteAvatar(response.getStudent()));
        return response;
    }

    private StudentProfileResponse withAbsoluteAvatar(StudentProfileResponse profile) {
        if (profile == null || profile.getAvatar() == null || profile.getAvatar().isBlank()) {
            return profile;
        }

        if (profile.getAvatar().startsWith("http://") || profile.getAvatar().startsWith("https://")) {
            return profile;
        }

        profile.setAvatar(
            ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(profile.getAvatar())
                .toUriString()
        );

        return profile;
    }
}
