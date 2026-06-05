package com.qlearo.backend.repository;

import com.qlearo.backend.entity.MockTestCategory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MockTestCategoryRepository extends JpaRepository<MockTestCategory, String> {

    Optional<MockTestCategory> findByTitleIgnoreCase(String title);

    boolean existsByTitleIgnoreCase(String title);

    List<MockTestCategory> findByTeacherIdOrderByCreatedAtAsc(String teacherId);

    Optional<MockTestCategory> findByTeacherIdAndTitleIgnoreCase(String teacherId, String title);

    boolean existsByTeacherIdAndTitleIgnoreCase(String teacherId, String title);
}
