package com.qlearo.backend.service.impl;

import com.qlearo.backend.dto.AuthResponse;
import com.qlearo.backend.dto.StudentLoginRequest;
import com.qlearo.backend.dto.StudentProfileResponse;
import com.qlearo.backend.dto.StudentRegisterRequest;
import com.qlearo.backend.dto.StudentUpdateRequest;
import com.qlearo.backend.entity.Student;
import com.qlearo.backend.repository.StudentRepository;
import com.qlearo.backend.service.StudentService;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Locale;
import java.util.UUID;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StudentServiceImpl implements StudentService {
    private static final Path AVATAR_UPLOAD_DIR = Paths.get("backend", "uploads", "avatars");

    private final StudentRepository studentRepository;

    public StudentServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public AuthResponse register(StudentRegisterRequest request) {
        validateRegisterRequest(request);

        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedPhone = normalizePhone(request.getPhone());

        if (studentRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        if (studentRepository.existsByPhone(normalizedPhone)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number already registered");
        }

        Instant now = Instant.now();

        Student student = new Student();
        student.setId(generateStudentId());
        student.setFullName(request.getFullName().trim());
        student.setEmail(normalizedEmail);
        student.setPhone(normalizedPhone);
        student.setPassword(request.getPassword());
        student.setClassName(blankToDefault(request.getClassName(), "10th"));
        student.setSchool("");
        student.setFavoriteSubjects(new ArrayList<>());
        student.setAvatar(null);
        student.setCreatedAt(now);
        student.setUpdatedAt(now);

        return toAuthResponse(studentRepository.save(student));
    }

    @Override
    public AuthResponse login(StudentLoginRequest request) {
        if (request == null || isBlank(request.getEmailOrPhone()) || isBlank(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email/phone and password are required");
        }

        String rawValue = request.getEmailOrPhone().trim();
        String lookupValue = rawValue.contains("@")
            ? normalizeEmail(rawValue)
            : normalizePhone(rawValue);

        Student student = studentRepository.findByEmailOrPhone(lookupValue)
            .orElseGet(() ->
                studentRepository.findByEmail(rawValue.trim().toLowerCase(Locale.ROOT))
                    .orElseGet(() ->
                        studentRepository.findByPhone(normalizePhone(rawValue))
                            .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Invalid login credentials"
                            ))
                    )
            );

        if (!student.getPassword().equals(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid login credentials");
        }

        student.setUpdatedAt(Instant.now());
        studentRepository.save(student);
        return toAuthResponse(student);
    }

    @Override
    public StudentProfileResponse getProfile(String id) {
        return toProfileResponse(getStudentOrThrow(id));
    }

    @Override
    public StudentProfileResponse updateProfile(String id, StudentUpdateRequest request) {
        Student student = getStudentOrThrow(id);

        if (!isBlank(request.getEmail())) {
            String normalizedEmail = normalizeEmail(request.getEmail());
            studentRepository.findByEmail(normalizedEmail)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
                });
            student.setEmail(normalizedEmail);
        }

        if (!isBlank(request.getPhone())) {
            String normalizedPhone = normalizePhone(request.getPhone());
            studentRepository.findByPhone(normalizedPhone)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number already registered");
                });
            student.setPhone(normalizedPhone);
        }

        student.setFullName(blankToDefault(request.getFullName(), student.getFullName()));
        student.setClassName(blankToDefault(request.getClassName(), student.getClassName()));
        student.setSchool(blankToDefault(request.getSchool(), student.getSchool()));
        student.setAvatar(blankToDefault(request.getAvatar(), student.getAvatar()));
        student.setFavoriteSubjects(request.getFavoriteSubjects() == null
            ? new ArrayList<>()
            : new ArrayList<>(request.getFavoriteSubjects()));
        student.setUpdatedAt(Instant.now());

        return toProfileResponse(studentRepository.save(student));
    }

    @Override
    public StudentProfileResponse uploadAvatar(String id, MultipartFile file) {
        Student student = getStudentOrThrow(id);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select an image");
        }

        try {
            Files.createDirectories(AVATAR_UPLOAD_DIR);

            String originalName = file.getOriginalFilename() == null
                ? "avatar.jpg"
                : file.getOriginalFilename();
            String extension = getExtension(originalName);
            String fileName = id + "_" + UUID.randomUUID().toString().replace("-", "") + extension;
            Path targetPath = AVATAR_UPLOAD_DIR.resolve(fileName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            student.setAvatar("/api/students/avatar/" + fileName);
            student.setUpdatedAt(Instant.now());

            return toProfileResponse(studentRepository.save(student));
        } catch (Exception exception) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unable to upload avatar"
            );
        }
    }

    private Student getStudentOrThrow(String id) {
        return studentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
    }

    private AuthResponse toAuthResponse(Student student) {
        return new AuthResponse("student-session-" + student.getId(), toProfileResponse(student));
    }

    private StudentProfileResponse toProfileResponse(Student student) {
        StudentProfileResponse response = new StudentProfileResponse();
        response.setId(student.getId());
        response.setFullName(student.getFullName());
        response.setEmail(student.getEmail());
        response.setPhone(student.getPhone());
        response.setClassName(student.getClassName());
        response.setSchool(student.getSchool());
        response.setFavoriteSubjects(student.getFavoriteSubjects() == null
            ? new ArrayList<>()
            : new ArrayList<>(student.getFavoriteSubjects()));
        response.setAvatar(student.getAvatar());
        response.setCreatedAt(student.getCreatedAt());
        response.setUpdatedAt(student.getUpdatedAt());
        return response;
    }

    private void validateRegisterRequest(StudentRegisterRequest request) {
        if (request == null
            || isBlank(request.getFullName())
            || isBlank(request.getEmail())
            || isBlank(request.getPhone())
            || isBlank(request.getPassword())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Full name, email, phone and password are required"
            );
        }
    }

    private String generateStudentId() {
        return "STUDENT_" + UUID.randomUUID()
            .toString()
            .replace("-", "")
            .substring(0, 8)
            .toUpperCase(Locale.ROOT);
    }

    private String getExtension(String fileName) {
        int index = fileName.lastIndexOf('.');
        if (index < 0) {
            return ".jpg";
        }
        return fileName.substring(index);
    }

    private String normalizeEmail(String value) {
        return isBlank(value) ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String value) {
        if (isBlank(value)) {
            return "";
        }
        return value.replaceAll("[^0-9]", "");
    }

    private String blankToDefault(String value, String fallback) {
        return isBlank(value) ? fallback : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
