package com.qlearo.backend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qlearo.backend.dto.tuition.TuitionRequestActionRequest;
import com.qlearo.backend.dto.tuition.TuitionRequestResponse;
import com.qlearo.backend.dto.tuition.TuitionRequestSaveRequest;
import com.qlearo.backend.entity.TuitionRequest;
import com.qlearo.backend.repository.StudentRepository;
import com.qlearo.backend.repository.TeacherRepository;
import com.qlearo.backend.repository.TuitionRequestRepository;
import com.qlearo.backend.service.TuitionRequestService;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TuitionRequestServiceImpl implements TuitionRequestService {

    private final TuitionRequestRepository requestRepository;
    @SuppressWarnings("unused")
    private final TeacherRepository teacherRepository;
    @SuppressWarnings("unused")
    private final StudentRepository studentRepository;
    private final ObjectMapper objectMapper;

    public TuitionRequestServiceImpl(
            TuitionRequestRepository requestRepository,
            TeacherRepository teacherRepository,
            StudentRepository studentRepository,
            ObjectMapper objectMapper) {
        this.requestRepository = requestRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public List<TuitionRequestResponse> getRequests(String teacherId, String studentId) {
        if (!isBlank(teacherId)) {
            return requestRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId.trim())
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        if (!isBlank(studentId)) {
            return requestRepository.findByStudentIdOrderByCreatedAtDesc(studentId.trim())
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        return requestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TuitionRequestResponse> getSessions(String teacherId, String studentId) {
        return requestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(request -> !isBlank(request.getSessionId()))
                .filter(request -> isBlank(teacherId) || teacherId.trim().equals(request.getTeacherId()))
                .filter(request -> isBlank(studentId) || studentId.trim().equals(request.getStudentId()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TuitionRequestResponse createRequest(TuitionRequestSaveRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        String teacherId = requireText(request.getTeacherId(), "Teacher id is required");
        String studentId = requireText(request.getStudentId(), "Student id is required");

        TuitionRequest tuitionRequest = new TuitionRequest();
        tuitionRequest.setId(generateId("TRQ"));
        tuitionRequest.setConversationId(generateId("CHAT"));
        tuitionRequest.setTeacherId(teacherId);
        tuitionRequest.setTeacherName(blankToDefault(request.getTeacherName(), ""));
        tuitionRequest.setTeacherAvatar(blankToDefault(request.getTeacherAvatar(), ""));
        tuitionRequest.setStudentId(studentId);
        tuitionRequest.setStudentName(blankToDefault(request.getStudentName(), ""));
        tuitionRequest.setStudentAvatar(blankToDefault(request.getStudentAvatar(), ""));
        tuitionRequest.setClassName(blankToDefault(request.getClassName(), ""));
        tuitionRequest.setSubject(requireText(request.getSubject(), "Subject is required"));
        tuitionRequest.setTopic(requireText(request.getTopic(), "Topic is required"));
        tuitionRequest.setFocus(blankToDefault(request.getFocus(), ""));
        tuitionRequest.setNote(blankToDefault(request.getNote(), ""));
        tuitionRequest.setMessage(blankToDefault(request.getMessage(), ""));
        tuitionRequest.setDuration(blankToDefault(request.getDuration(), "1 Hour"));
        tuitionRequest.setRequestedTime(blankToDefault(request.getRequestedTime(), "Flexible"));
        tuitionRequest.setPreferredDate(blankToDefault(request.getPreferredDate(), Instant.now().toString()));
        tuitionRequest.setSessionType(blankToDefault(request.getSessionType(), "Video Class"));
        tuitionRequest.setMode(blankToDefault(request.getMode(), "Live Class"));
        tuitionRequest.setLanguage(blankToDefault(request.getLanguage(), "English"));
        tuitionRequest.setLevel(blankToDefault(request.getLevel(), "Intermediate"));
        tuitionRequest.setStatus("pending");
        tuitionRequest.setStudentViewed(true);
        tuitionRequest.setTeacherViewed(false);
        tuitionRequest.setProposalJson(null);
        tuitionRequest.setSessionId(null);
        tuitionRequest.setDeclineReason(null);
        tuitionRequest.setCancelReason(null);

        return toResponse(requestRepository.save(tuitionRequest));
    }

    @Override
    public TuitionRequestResponse acceptRequest(String requestId, String teacherId, TuitionRequestActionRequest actionRequest) {
        TuitionRequest tuitionRequest = getRequestOrThrow(requestId);
        ensureTeacherOwnsRequest(tuitionRequest, teacherId);

        tuitionRequest.setStatus("accepted");
        tuitionRequest.setTeacherViewed(true);
        tuitionRequest.setStudentViewed(false);
        tuitionRequest.setProposalJson(writeProposalJson(actionRequest, tuitionRequest));
        tuitionRequest.setSessionId(blankToDefault(tuitionRequest.getSessionId(), generateId("SES")));
        tuitionRequest.setDeclineReason(null);
        tuitionRequest.setCancelReason(null);

        return toResponse(requestRepository.save(tuitionRequest));
    }

    @Override
    public TuitionRequestResponse declineRequest(String requestId, String teacherId, TuitionRequestActionRequest actionRequest) {
        TuitionRequest tuitionRequest = getRequestOrThrow(requestId);
        ensureTeacherOwnsRequest(tuitionRequest, teacherId);

        tuitionRequest.setStatus("declined");
        tuitionRequest.setTeacherViewed(true);
        tuitionRequest.setStudentViewed(false);
        tuitionRequest.setDeclineReason(blankToDefault(actionRequest == null ? null : actionRequest.getReason(), ""));
        tuitionRequest.setProposalJson(null);
        tuitionRequest.setSessionId(null);
        tuitionRequest.setCancelReason(null);

        return toResponse(requestRepository.save(tuitionRequest));
    }

    @Override
    public TuitionRequestResponse markViewed(String requestId, String role) {
        TuitionRequest tuitionRequest = getRequestOrThrow(requestId);
        String normalizedRole = blankToDefault(role, "student").toLowerCase(Locale.ROOT);

        if ("teacher".equals(normalizedRole)) {
            tuitionRequest.setTeacherViewed(true);
        } else {
            tuitionRequest.setStudentViewed(true);
        }

        return toResponse(requestRepository.save(tuitionRequest));
    }

    @Override
    public TuitionRequestResponse createSession(Map<String, Object> request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        String requestId = requireText(stringValue(request.get("requestId")), "requestId is required");
        TuitionRequest tuitionRequest = getRequestOrThrow(requestId);
        applySessionPayload(tuitionRequest, request, true);
        return toResponse(requestRepository.save(tuitionRequest));
    }

    @Override
    public TuitionRequestResponse updateSession(String sessionId, Map<String, Object> request) {
        String normalizedSessionId = requireText(sessionId, "sessionId is required");
        TuitionRequest tuitionRequest = requestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(item -> normalizedSessionId.equals(item.getSessionId()) || normalizedSessionId.equals(item.getId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        applySessionPayload(tuitionRequest, request, false);
        return toResponse(requestRepository.save(tuitionRequest));
    }

    private TuitionRequest getRequestOrThrow(String requestId) {
        String normalizedId = requireText(requestId, "Request id is required");
        return requestRepository.findById(normalizedId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tuition request not found"));
    }

    private void ensureTeacherOwnsRequest(TuitionRequest request, String teacherId) {
        String normalizedTeacherId = requireText(teacherId, "Teacher id is required");
        if (!normalizedTeacherId.equals(request.getTeacherId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This request does not belong to this teacher");
        }
    }

    private TuitionRequestResponse toResponse(TuitionRequest request) {
        TuitionRequestResponse response = new TuitionRequestResponse();
        response.setId(request.getId());
        response.setConversationId(request.getConversationId());
        response.setTeacherId(request.getTeacherId());
        response.setTeacherName(request.getTeacherName());
        response.setTeacherAvatar(request.getTeacherAvatar());
        response.setStudentId(request.getStudentId());
        response.setStudentName(request.getStudentName());
        response.setStudentAvatar(request.getStudentAvatar());
        response.setClassName(request.getClassName());
        response.setSubject(request.getSubject());
        response.setTopic(request.getTopic());
        response.setFocus(request.getFocus());
        response.setNote(request.getNote());
        response.setMessage(request.getMessage());
        response.setDuration(request.getDuration());
        response.setRequestedTime(request.getRequestedTime());
        response.setPreferredDate(request.getPreferredDate());
        response.setSessionType(request.getSessionType());
        response.setMode(request.getMode());
        response.setLanguage(request.getLanguage());
        response.setLevel(request.getLevel());
        response.setStatus(request.getStatus());
        response.setStudentViewed(request.isStudentViewed());
        response.setTeacherViewed(request.isTeacherViewed());
        response.setProposal(readProposal(request.getProposalJson()));
        response.setSessionId(request.getSessionId());
        response.setDeclineReason(request.getDeclineReason());
        response.setCancelReason(request.getCancelReason());
        response.setCreatedAt(request.getCreatedAt());
        response.setUpdatedAt(request.getUpdatedAt());
        return response;
    }

    private TuitionRequestResponse.Proposal readProposal(String proposalJson) {
        if (isBlank(proposalJson)) {
            return null;
        }

        try {
            return objectMapper.readValue(proposalJson, TuitionRequestResponse.Proposal.class);
        } catch (Exception ignored) {
            return null;
        }
    }

    private String writeProposalJson(TuitionRequestActionRequest actionRequest, TuitionRequest request) {
        TuitionRequestResponse.Proposal proposal = new TuitionRequestResponse.Proposal();
        proposal.setTimeSlot(blankToDefault(actionRequest == null ? null : actionRequest.getTimeSlot(), request.getRequestedTime()));
        proposal.setDate(blankToDefault(null, request.getPreferredDate()));
        proposal.setDuration(blankToDefault(actionRequest == null ? null : actionRequest.getDuration(), request.getDuration()));
        proposal.setMessage(blankToDefault(actionRequest == null ? null : actionRequest.getMessage(), ""));
        proposal.setCreatedAt(Instant.now());

        try {
            return objectMapper.writeValueAsString(proposal);
        } catch (JsonProcessingException ignored) {
            return null;
        }
    }

    private void applySessionPayload(TuitionRequest tuitionRequest, Map<String, Object> request, boolean ensureSessionId) {
        if (ensureSessionId && isBlank(tuitionRequest.getSessionId())) {
            tuitionRequest.setSessionId(generateId("SES"));
        }

        String status = firstText(stringValue(request.get("status")), tuitionRequest.getStatus());
        tuitionRequest.setStatus(blankToDefault(status, tuitionRequest.getStatus()));

        tuitionRequest.setPreferredDate(firstText(stringValue(request.get("date")), firstText(stringValue(request.get("preferredDate")), tuitionRequest.getPreferredDate())));
        tuitionRequest.setRequestedTime(firstText(stringValue(request.get("time")), firstText(stringValue(request.get("timeSlot")), tuitionRequest.getRequestedTime())));
        tuitionRequest.setDuration(firstText(stringValue(request.get("duration")), tuitionRequest.getDuration()));
        tuitionRequest.setSessionType(firstText(stringValue(request.get("sessionType")), tuitionRequest.getSessionType()));
        tuitionRequest.setMode(firstText(stringValue(request.get("mode")), tuitionRequest.getMode()));
        tuitionRequest.setLanguage(firstText(stringValue(request.get("language")), tuitionRequest.getLanguage()));
        tuitionRequest.setLevel(firstText(stringValue(request.get("level")), tuitionRequest.getLevel()));

        String message = firstText(stringValue(request.get("message")), tuitionRequest.getMessage());
        tuitionRequest.setMessage(message);

        if (request.containsKey("teacherViewed")) {
            tuitionRequest.setTeacherViewed(Boolean.parseBoolean(String.valueOf(request.get("teacherViewed"))));
        }
        if (request.containsKey("studentViewed")) {
            tuitionRequest.setStudentViewed(Boolean.parseBoolean(String.valueOf(request.get("studentViewed"))));
        }

        if (request.containsKey("proposal") && request.get("proposal") instanceof Map<?, ?> proposalMap) {
            Object proposalDate = proposalMap.get("date");
            Object proposalTime = proposalMap.get("timeSlot");
            Object proposalDuration = proposalMap.get("duration");
            Object proposalMessage = proposalMap.get("message");
            tuitionRequest.setProposalJson(writeSessionProposalJson(
                    stringValue(proposalDate),
                    stringValue(proposalTime),
                    stringValue(proposalDuration),
                    stringValue(proposalMessage)));
        } else {
            tuitionRequest.setProposalJson(writeSessionProposalJson(
                    tuitionRequest.getPreferredDate(),
                    tuitionRequest.getRequestedTime(),
                    tuitionRequest.getDuration(),
                    message));
        }
    }

    private String writeSessionProposalJson(String date, String timeSlot, String duration, String message) {
        TuitionRequestResponse.Proposal proposal = new TuitionRequestResponse.Proposal();
        proposal.setDate(blankToDefault(date, null));
        proposal.setTimeSlot(blankToDefault(timeSlot, null));
        proposal.setDuration(blankToDefault(duration, null));
        proposal.setMessage(blankToDefault(message, null));
        proposal.setCreatedAt(Instant.now());

        try {
            return objectMapper.writeValueAsString(proposal);
        } catch (JsonProcessingException ignored) {
            return null;
        }
    }

    private String generateId(String prefix) {
        return prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase(Locale.ROOT);
    }

    private String requireText(String value, String message) {
        if (isBlank(value)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private String blankToDefault(String value, String defaultValue) {
        return isBlank(value) ? defaultValue : value.trim();
    }

    private String firstText(String value, String fallback) {
        return isBlank(value) ? fallback : value.trim();
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
