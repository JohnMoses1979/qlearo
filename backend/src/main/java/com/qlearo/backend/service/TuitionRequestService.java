package com.qlearo.backend.service;

import com.qlearo.backend.dto.tuition.TuitionRequestActionRequest;
import com.qlearo.backend.dto.tuition.TuitionRequestResponse;
import com.qlearo.backend.dto.tuition.TuitionRequestSaveRequest;
import java.util.List;
import java.util.Map;

public interface TuitionRequestService {

    List<TuitionRequestResponse> getRequests(String teacherId, String studentId);

    TuitionRequestResponse createRequest(TuitionRequestSaveRequest request);

    TuitionRequestResponse acceptRequest(String requestId, String teacherId, TuitionRequestActionRequest request);

    TuitionRequestResponse declineRequest(String requestId, String teacherId, TuitionRequestActionRequest request);

    TuitionRequestResponse markViewed(String requestId, String role);

    List<TuitionRequestResponse> getSessions(String teacherId, String studentId);

    TuitionRequestResponse createSession(Map<String, Object> request);

    TuitionRequestResponse updateSession(String sessionId, Map<String, Object> request);
}
