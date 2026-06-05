package com.qlearo.backend.repository;

import com.qlearo.backend.entity.MockTest;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MockTestRepository extends JpaRepository<MockTest, String> {

    Optional<MockTest> findByTestId(String testId);

    List<MockTest> findByCategoryTitleIgnoreCaseOrderByCreatedAtDesc(String categoryTitle);

    List<MockTest> findBySubjectIdOrderByCreatedAtDesc(String subjectId);

    boolean existsByTestId(String testId);
}
