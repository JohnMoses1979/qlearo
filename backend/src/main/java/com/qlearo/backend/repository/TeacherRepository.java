package com.qlearo.backend.repository;

import com.qlearo.backend.entity.Teacher;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository extends JpaRepository<Teacher, String> {

    Optional<Teacher> findByEmail(String email);

    Optional<Teacher> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    List<Teacher> findByApprovalStatusOrderByCreatedAtDesc(String approvalStatus);
}
