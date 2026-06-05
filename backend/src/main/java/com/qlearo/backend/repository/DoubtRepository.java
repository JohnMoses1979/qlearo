package com.qlearo.backend.repository;

import com.qlearo.backend.entity.Doubt;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoubtRepository extends JpaRepository<Doubt, String> {

    List<Doubt> findAllByOrderByUpdatedAtDesc();

    List<Doubt> findByStudentIdOrderByUpdatedAtDesc(String studentId);

    List<Doubt> findByTeacherIdOrderByUpdatedAtDesc(String teacherId);

    Optional<Doubt> findById(String id);
}
