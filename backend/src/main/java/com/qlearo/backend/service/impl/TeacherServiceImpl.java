package com.qlearo.backend.service.impl;

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
import com.qlearo.backend.entity.Doubt;
import com.qlearo.backend.entity.MockTest;
import com.qlearo.backend.entity.StudentNotification;
import com.qlearo.backend.entity.Teacher;
import com.qlearo.backend.repository.TeacherRepository;
import com.qlearo.backend.repository.DoubtRepository;
import com.qlearo.backend.repository.MockTestRepository;
import com.qlearo.backend.repository.StudentNotificationRepository;
import com.qlearo.backend.repository.TuitionRequestRepository;
import com.qlearo.backend.service.NotificationService;
import com.qlearo.backend.service.TeacherService;
import org.springframework.dao.DataIntegrityViolationException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TeacherServiceImpl implements TeacherService {

    private static final long EARNING_PER_SOLVED_DOUBT = 40L;
    private static final long EARNING_PER_COMPLETED_SESSION = 250L;
    private static final long EARNING_PER_PUBLISHED_TEST = 120L;

    private static final Path AVATAR_UPLOAD_DIR = Paths.get("backend", "uploads", "teacher-avatars");

    private final TeacherRepository teacherRepository;
    private final DoubtRepository doubtRepository;
    private final MockTestRepository mockTestRepository;
    private final StudentNotificationRepository studentNotificationRepository;
    private final TuitionRequestRepository tuitionRequestRepository;
    private final NotificationService notificationService;

    @Value("${app.teacher.reset-code-expiry-minutes:15}")
    private long resetCodeExpiryMinutes;

    public TeacherServiceImpl(
        TeacherRepository teacherRepository,
        DoubtRepository doubtRepository,
        MockTestRepository mockTestRepository,
        StudentNotificationRepository studentNotificationRepository,
        TuitionRequestRepository tuitionRequestRepository,
        NotificationService notificationService
    ) {
        this.teacherRepository = teacherRepository;
        this.doubtRepository = doubtRepository;
        this.mockTestRepository = mockTestRepository;
        this.studentNotificationRepository = studentNotificationRepository;
        this.tuitionRequestRepository = tuitionRequestRepository;
        this.notificationService = notificationService;
    }

    @Override
    public ApiMessageResponse initiateRegistration(TeacherRegisterInitiateRequest request) {
        validateRegistrationRequest(request);

        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedPhone = normalizePhone(request.getPhone());

        if (teacherRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        if (teacherRepository.existsByPhone(normalizedPhone)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number already registered");
        }

        notificationService.sendTeacherRegistrationOtp(normalizedPhone);
        return new ApiMessageResponse("OTP sent to your phone number");
    }

    @Override
    public ApiMessageResponse verifyRegistrationOtp(TeacherOtpRequest request) {
        if (request == null || isBlank(request.getPhone()) || isBlank(request.getOtp())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number and OTP are required");
        }

        boolean verified = notificationService.verifyTeacherRegistrationOtp(
            normalizePhone(request.getPhone()),
            request.getOtp().trim()
        );

        if (!verified) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP");
        }

        return new ApiMessageResponse("Phone number verified successfully");
    }

    @Override
    public TeacherProfileResponse completeRegistration(TeacherCompleteRegistrationRequest request) {
        validateCompleteRegistrationRequest(request);

        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedPhone = normalizePhone(request.getPhone());

        if (teacherRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        if (teacherRepository.existsByPhone(normalizedPhone)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number already registered");
        }

        Teacher teacher = new Teacher();
        teacher.setId(generateTeacherId());
        teacher.setFullName(request.getFullName().trim());
        teacher.setEmail(normalizedEmail);
        teacher.setPhone(normalizedPhone);
        teacher.setPassword(request.getPassword().trim());
        teacher.setQualification(blankToDefault(request.getQualification(), ""));
        teacher.setSubjectExpertise(blankToDefault(request.getSubjectExpertise(), ""));
        teacher.setExperience(blankToDefault(request.getExperience(), ""));
        teacher.setBio(blankToDefault(request.getBio(), ""));
        teacher.setWithdrawalMethod(blankToDefault(request.getWithdrawalMethod(), "upi"));
        teacher.setBankAccountHolderName(blankToDefault(request.getBankAccountHolderName(), ""));
        teacher.setBankName(blankToDefault(request.getBankName(), ""));
        teacher.setBankAccountNumber(blankToDefault(request.getBankAccountNumber(), ""));
        teacher.setBankIfscCode(blankToDefault(request.getBankIfscCode(), ""));
        teacher.setBankBranchName(blankToDefault(request.getBankBranchName(), ""));
        teacher.setUpiId(blankToDefault(request.getUpiId(), ""));
        teacher.setLastPayoutStatus(null);
        teacher.setLastPayoutAmount(null);
        teacher.setPaidAmount(0L);
        teacher.setWithdrawnAmount(0L);
        teacher.setLastWithdrawalAmount(null);
        teacher.setLastWithdrawalMethod(null);
        teacher.setLastWithdrawalAt(null);
        teacher.setLastPayoutMethod(null);
        teacher.setLastPayoutTransactionId(null);
        teacher.setLastPayoutNote(null);
        teacher.setLastPayoutAt(null);
        teacher.setAvatar(null);
        teacher.setApprovalStatus("PENDING_APPROVAL");
        teacher.setOtpVerified(true);
        teacher.setCreatedAt(Instant.now());
        teacher.setUpdatedAt(Instant.now());

        try {
            Teacher savedTeacher = teacherRepository.save(teacher);
            createAdminTeacherRegistrationNotification(savedTeacher);
            return toProfileResponse(savedTeacher);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Teacher registration could not be saved. Please verify the entered details and try again."
            );
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unable to complete teacher registration"
            );
        }
    }

    @Override
    public TeacherAuthResponse login(TeacherLoginRequest request) {
        if (request == null || isBlank(request.getEmailOrPhone()) || isBlank(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email/phone and password are required");
        }

        Teacher teacher = findTeacherByEmailOrPhone(request.getEmailOrPhone());

        if (!teacher.getPassword().equals(request.getPassword().trim())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid login credentials");
        }

        if ("PENDING_APPROVAL".equalsIgnoreCase(teacher.getApprovalStatus())) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Your registration is waiting for admin approval"
            );
        }

        if ("REJECTED".equalsIgnoreCase(teacher.getApprovalStatus())) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Your teacher profile was rejected. Please contact admin."
            );
        }

        teacher.setUpdatedAt(Instant.now());
        teacherRepository.save(teacher);

        return new TeacherAuthResponse(
            "teacher-session-" + teacher.getId(),
            "Login successful",
            toProfileResponse(teacher)
        );
    }

    @Override
    public TeacherProfileResponse getProfile(String id) {
        return toProfileResponse(getTeacherOrThrow(id));
    }

    @Override
    public TeacherProfileResponse updateProfile(String id, TeacherUpdateRequest request) {
        Teacher teacher = getTeacherOrThrow(id);

        if (!isBlank(request.getEmail())) {
            String normalizedEmail = normalizeEmail(request.getEmail());
            teacherRepository.findByEmail(normalizedEmail)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
                });
            teacher.setEmail(normalizedEmail);
        }

        if (!isBlank(request.getPhone())) {
            String normalizedPhone = normalizePhone(request.getPhone());
            teacherRepository.findByPhone(normalizedPhone)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number already registered");
                });
            teacher.setPhone(normalizedPhone);
        }

        teacher.setFullName(blankToDefault(request.getFullName(), teacher.getFullName()));
        teacher.setQualification(blankToDefault(request.getQualification(), teacher.getQualification()));
        teacher.setSubjectExpertise(blankToDefault(request.getSubjectExpertise(), teacher.getSubjectExpertise()));
        teacher.setExperience(blankToDefault(request.getExperience(), teacher.getExperience()));
        teacher.setBio(blankToDefault(request.getBio(), teacher.getBio()));
        teacher.setWithdrawalMethod(blankToDefault(request.getWithdrawalMethod(), teacher.getWithdrawalMethod()));
        teacher.setBankAccountHolderName(blankToDefault(request.getBankAccountHolderName(), teacher.getBankAccountHolderName()));
        teacher.setBankName(blankToDefault(request.getBankName(), teacher.getBankName()));
        teacher.setBankAccountNumber(blankToDefault(request.getBankAccountNumber(), teacher.getBankAccountNumber()));
        teacher.setBankIfscCode(blankToDefault(request.getBankIfscCode(), teacher.getBankIfscCode()));
        teacher.setBankBranchName(blankToDefault(request.getBankBranchName(), teacher.getBankBranchName()));
        teacher.setUpiId(blankToDefault(request.getUpiId(), teacher.getUpiId()));
        teacher.setLastPayoutStatus(blankToDefault(request.getLastPayoutStatus(), teacher.getLastPayoutStatus()));
        teacher.setLastPayoutAmount(request.getLastPayoutAmount() == null ? teacher.getLastPayoutAmount() : request.getLastPayoutAmount());
        teacher.setPaidAmount(request.getPaidAmount() == null ? teacher.getPaidAmount() : request.getPaidAmount());
        teacher.setWithdrawnAmount(request.getWithdrawnAmount() == null ? teacher.getWithdrawnAmount() : request.getWithdrawnAmount());
        teacher.setLastWithdrawalAmount(request.getLastWithdrawalAmount() == null ? teacher.getLastWithdrawalAmount() : request.getLastWithdrawalAmount());
        teacher.setLastWithdrawalMethod(blankToDefault(request.getLastWithdrawalMethod(), teacher.getLastWithdrawalMethod()));
        teacher.setLastWithdrawalAt(request.getLastWithdrawalAt() == null ? teacher.getLastWithdrawalAt() : parseInstant(request.getLastWithdrawalAt()));
        teacher.setLastPayoutMethod(blankToDefault(request.getLastPayoutMethod(), teacher.getLastPayoutMethod()));
        teacher.setLastPayoutTransactionId(blankToDefault(request.getLastPayoutTransactionId(), teacher.getLastPayoutTransactionId()));
        teacher.setLastPayoutNote(blankToDefault(request.getLastPayoutNote(), teacher.getLastPayoutNote()));
        teacher.setLastPayoutAt(request.getLastPayoutAt() == null ? teacher.getLastPayoutAt() : parseInstant(request.getLastPayoutAt()));
        teacher.setAvatar(blankToDefault(request.getAvatar(), teacher.getAvatar()));
        teacher.setUpdatedAt(Instant.now());

       try {
        return toProfileResponse(teacherRepository.save(teacher));
    } catch (DataIntegrityViolationException e) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Duplicate email or phone");
    } catch (ResponseStatusException e) {
        throw e;
    } catch (Exception e) {
        throw new ResponseStatusException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Update failed: " + e.getMessage()
        );
    }
    }

    @Override
    public TeacherProfileResponse uploadAvatar(String id, MultipartFile file) {
        Teacher teacher = getTeacherOrThrow(id);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select an image");
        }

        try {
            Files.createDirectories(AVATAR_UPLOAD_DIR);
            String originalName = file.getOriginalFilename() == null ? "avatar.jpg" : file.getOriginalFilename();
            String extension = getExtension(originalName);
            String fileName = id + "_" + UUID.randomUUID().toString().replace("-", "") + extension;
            Path targetPath = AVATAR_UPLOAD_DIR.resolve(fileName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            teacher.setAvatar("/api/teachers/avatar/" + fileName);
            teacher.setUpdatedAt(Instant.now());
            return toProfileResponse(teacherRepository.save(teacher));
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to upload avatar");
        }
    }

    @Override
    public ApiMessageResponse sendForgotPasswordCode(TeacherForgotPasswordRequest request) {
        if (request == null || isBlank(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        Teacher teacher = teacherRepository.findByEmail(normalizeEmail(request.getEmail()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher account not found"));

        String code = String.valueOf((int) Math.floor(100000 + Math.random() * 900000));
        teacher.setResetCode(code);
        teacher.setResetCodeExpiresAt(Instant.now().plus(resetCodeExpiryMinutes, ChronoUnit.MINUTES));
        teacher.setUpdatedAt(Instant.now());
        teacherRepository.save(teacher);

        notificationService.sendTeacherPasswordResetCode(teacher.getEmail(), teacher.getFullName(), code);
        return new ApiMessageResponse("Reset code sent to your email");
    }

    @Override
    public ApiMessageResponse resetPassword(TeacherResetPasswordRequest request) {
        if (request == null
            || isBlank(request.getEmail())
            || isBlank(request.getCode())
            || isBlank(request.getNewPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email, code and new password are required");
        }

        Teacher teacher = teacherRepository.findByEmail(normalizeEmail(request.getEmail()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher account not found"));

        if (isBlank(teacher.getResetCode())
            || !teacher.getResetCode().equals(request.getCode().trim())
            || teacher.getResetCodeExpiresAt() == null
            || teacher.getResetCodeExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset code");
        }

        teacher.setPassword(request.getNewPassword().trim());
        teacher.setResetCode(null);
        teacher.setResetCodeExpiresAt(null);
        teacher.setUpdatedAt(Instant.now());
        teacherRepository.save(teacher);

        return new ApiMessageResponse("Password updated successfully");
    }

    @Override
    public List<TeacherProfileResponse> getTeachersByStatus(String status) {
        String normalizedStatus = isBlank(status) ? "PENDING_APPROVAL" : status.trim().toUpperCase(Locale.ROOT);
        return teacherRepository.findByApprovalStatusOrderByCreatedAtDesc(normalizedStatus)
            .stream()
            .map(this::toProfileResponse)
            .collect(Collectors.toList());
    }

    @Override
    public TeacherProfileResponse approveTeacher(String id) {
        Teacher teacher = getTeacherOrThrow(id);
        teacher.setApprovalStatus("APPROVED");
        teacher.setUpdatedAt(Instant.now());
        return toProfileResponse(teacherRepository.save(teacher));
    }

    @Override
    public TeacherProfileResponse rejectTeacher(String id) {
        Teacher teacher = getTeacherOrThrow(id);
        teacher.setApprovalStatus("REJECTED");
        teacher.setUpdatedAt(Instant.now());
        return toProfileResponse(teacherRepository.save(teacher));
    }

    private Teacher findTeacherByEmailOrPhone(String value) {
        String rawValue = value.trim();
        String normalizedEmail = normalizeEmail(rawValue);
        String normalizedPhone = normalizePhone(rawValue);

        return teacherRepository.findByEmail(normalizedEmail)
            .or(() -> teacherRepository.findByPhone(normalizedPhone))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid login credentials"));
    }

    private Teacher getTeacherOrThrow(String id) {
        return teacherRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found"));
    }

    private TeacherProfileResponse toProfileResponse(Teacher teacher) {
        TeacherProfileResponse response = new TeacherProfileResponse();
        TeacherStats stats = buildTeacherStats(teacher.getId());
        response.setId(teacher.getId());
        response.setFullName(teacher.getFullName());
        response.setEmail(teacher.getEmail());
        response.setPhone(teacher.getPhone());
        response.setQualification(teacher.getQualification());
        response.setSubjectExpertise(teacher.getSubjectExpertise());
        response.setExperience(teacher.getExperience());
        response.setBio(teacher.getBio());
        response.setWithdrawalMethod(teacher.getWithdrawalMethod());
        response.setBankAccountHolderName(teacher.getBankAccountHolderName());
        response.setBankName(teacher.getBankName());
        response.setBankAccountNumber(teacher.getBankAccountNumber());
        response.setBankIfscCode(teacher.getBankIfscCode());
        response.setBankBranchName(teacher.getBankBranchName());
        response.setUpiId(teacher.getUpiId());
        response.setLastPayoutStatus(teacher.getLastPayoutStatus());
        response.setLastPayoutAmount(teacher.getLastPayoutAmount());
        response.setPaidAmount(teacher.getPaidAmount());
        response.setWithdrawnAmount(teacher.getWithdrawnAmount());
        response.setLastWithdrawalAmount(teacher.getLastWithdrawalAmount());
        response.setLastWithdrawalMethod(teacher.getLastWithdrawalMethod());
        response.setLastWithdrawalAt(teacher.getLastWithdrawalAt());
        response.setLastPayoutMethod(teacher.getLastPayoutMethod());
        response.setLastPayoutTransactionId(teacher.getLastPayoutTransactionId());
        response.setLastPayoutNote(teacher.getLastPayoutNote());
        response.setLastPayoutAt(teacher.getLastPayoutAt());
        response.setAvatar(teacher.getAvatar());
        response.setApprovalStatus(teacher.getApprovalStatus());
        response.setTotalEarnings(stats.totalEarnings());
        response.setDoubtsSolved(stats.doubtsSolved());
        response.setSessionCount(stats.sessionCount());
        response.setReviewCount(stats.reviewCount());
        response.setAverageRating(stats.averageRating());
        response.setCreatedAt(teacher.getCreatedAt());
        response.setUpdatedAt(teacher.getUpdatedAt());
        return response;
    }

    // private TeacherStats buildTeacherStats(String teacherId) {
    //     if (isBlank(teacherId)) {
    //         return new TeacherStats(0L, 0L, 0L, 0L, 0.0d);
    //     }

    //     List<Doubt> teacherDoubts = doubtRepository.findByTeacherIdOrderByUpdatedAtDesc(teacherId.trim());
    //     long solvedDoubts = teacherDoubts.stream()
    //         .filter(doubt -> doubt.isAnswered() || "answered".equalsIgnoreCase(doubt.getStatus()))
    //         .count();

    //     long reviewCount = teacherDoubts.stream()
    //         .filter(doubt -> doubt.isReviewAdded() || doubt.getRating() > 0)
    //         .count();

    //     double averageRating = teacherDoubts.stream()
    //         .filter(doubt -> doubt.isReviewAdded() || doubt.getRating() > 0)
    //         .mapToInt(Doubt::getRating)
    //         .average()
    //         .orElse(0.0d);

    //     long sessionCount = tuitionRequestRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId.trim())
    //         .stream()
    //         .filter(request -> !isBlank(request.getSessionId()))
    //         .count();

    //     long totalEarnings = solvedDoubts * EARNING_PER_SOLVED_DOUBT;

    //     return new TeacherStats(totalEarnings, solvedDoubts, sessionCount, reviewCount, averageRating);
    // }
private TeacherStats buildTeacherStats(String teacherId) {
    if (isBlank(teacherId)) {
        return new TeacherStats(0L, 0L, 0L, 0L, 0.0d);
    }

    try {
        List<Doubt> teacherDoubts = doubtRepository
            .findByTeacherIdOrderByUpdatedAtDesc(teacherId.trim());

        long solvedDoubts = teacherDoubts.stream()
            .filter(doubt -> doubt.isAnswered() ||
                    "answered".equalsIgnoreCase(doubt.getStatus()))
            .count();

        long reviewCount = teacherDoubts.stream()
            .filter(doubt -> doubt.isReviewAdded() || doubt.getRating() > 0)
            .count();

        double averageRating = teacherDoubts.stream()
            .filter(doubt -> doubt.isReviewAdded() || doubt.getRating() > 0)
            .mapToInt(Doubt::getRating)
            .average()
            .orElse(0.0d);

        long sessionCount = tuitionRequestRepository
            .findByTeacherIdOrderByCreatedAtDesc(teacherId.trim())
            .stream()
            .filter(r -> !isBlank(r.getSessionId()))
            .filter(r -> "completed".equalsIgnoreCase(r.getStatus()))
            .count();

        long publishedTestCount = mockTestRepository.findAll().stream()
            .filter(test -> teacherId.trim().equalsIgnoreCase(blankToDefault(test.getTeacherId(), "")))
            .filter(MockTest::isPublished)
            .count();

        long totalEarnings =
            solvedDoubts * EARNING_PER_SOLVED_DOUBT +
            sessionCount * EARNING_PER_COMPLETED_SESSION +
            publishedTestCount * EARNING_PER_PUBLISHED_TEST;

        return new TeacherStats(
            totalEarnings,
            solvedDoubts,
            sessionCount,
            reviewCount,
            averageRating
        );

    } catch (Exception e) {
        return new TeacherStats(0L, 0L, 0L, 0L, 0.0d);
    }
}
    private void validateRegistrationRequest(TeacherRegisterInitiateRequest request) {
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

    private void validateCompleteRegistrationRequest(TeacherCompleteRegistrationRequest request) {
        if (request == null
            || isBlank(request.getFullName())
            || isBlank(request.getEmail())
            || isBlank(request.getPhone())
            || isBlank(request.getPassword())
            || isBlank(request.getQualification())
            || isBlank(request.getSubjectExpertise())
            || isBlank(request.getExperience())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Complete teacher profile details are required"
            );
        }
    }

    private void createAdminTeacherRegistrationNotification(Teacher teacher) {
        try {
            StudentNotification notification = new StudentNotification();
            notification.setId("NOTIF_TEACHER_" + UUID.randomUUID().toString().replace("-", ""));
            notification.setRecipientRole("admin");
            notification.setRecipientId(null);
            notification.setTitle("New Teacher Registration");
            notification.setMessage(
                teacher.getFullName() + " has completed registration and is waiting for approval."
            );
            notification.setType("teacher_registration");
            notification.setRelatedTestId(null);
            notification.setRelatedVideoId(null);
            notification.setCategoryTitle(blankToDefault(teacher.getSubjectExpertise(), ""));
            notification.setSubjectId(null);
            notification.setRead(false);
            studentNotificationRepository.save(notification);
        } catch (Exception exception) {
            System.err.println("Failed to create admin teacher registration notification: " + exception.getMessage());
        }
    }

    private String generateTeacherId() {
        return "TEACHER_" + UUID.randomUUID()
            .toString()
            .replace("-", "")
            .substring(0, 8)
            .toUpperCase(Locale.ROOT);
    }

    private String getExtension(String fileName) {
        int index = fileName.lastIndexOf('.');
        return index < 0 ? ".jpg" : fileName.substring(index);
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

    private Instant parseInstant(String value) {
        if (isBlank(value)) {
            return null;
        }

        try {
            return Instant.parse(value.trim());
        } catch (Exception ignored) {
            return null;
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private record TeacherStats(
        long totalEarnings,
        long doubtsSolved,
        long sessionCount,
        long reviewCount,
        double averageRating
    ) {}
}
