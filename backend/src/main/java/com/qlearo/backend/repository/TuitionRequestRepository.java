package com.qlearo.backend.repository;

import com.qlearo.backend.entity.TuitionRequest;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TuitionRequestRepository extends JpaRepository<TuitionRequest, String> {

    List<TuitionRequest> findAllByOrderByCreatedAtDesc();

    List<TuitionRequest> findByTeacherIdOrderByCreatedAtDesc(String teacherId);

    List<TuitionRequest> findByStudentIdOrderByCreatedAtDesc(String studentId);
}
