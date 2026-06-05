package com.qlearo.backend.repository;

import com.qlearo.backend.entity.MockTestAttempt;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MockTestAttemptRepository extends JpaRepository<MockTestAttempt, String> {

    List<MockTestAttempt> findByStudentIdOrderByCreatedAtDesc(String studentId);

    long countByStudentIdAndTestId(String studentId, String testId);
}
