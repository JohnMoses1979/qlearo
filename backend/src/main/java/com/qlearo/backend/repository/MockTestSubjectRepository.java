package com.qlearo.backend.repository;

import com.qlearo.backend.entity.MockTestSubject;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MockTestSubjectRepository extends JpaRepository<MockTestSubject, String> {

    List<MockTestSubject> findByCategoryTitleIgnoreCaseOrderByCreatedAtAsc(String categoryTitle);

    List<MockTestSubject> findByTeacherIdAndCategoryTitleIgnoreCaseOrderByCreatedAtAsc(
        String teacherId,
        String categoryTitle
    );

    Optional<MockTestSubject> findByCategoryTitleIgnoreCaseAndNameIgnoreCase(
        String categoryTitle,
        String name
    );

    Optional<MockTestSubject> findByTeacherIdAndCategoryTitleIgnoreCaseAndNameIgnoreCase(
        String teacherId,
        String categoryTitle,
        String name
    );

    boolean existsByCategoryTitleIgnoreCaseAndNameIgnoreCase(String categoryTitle, String name);

    boolean existsByTeacherIdAndCategoryTitleIgnoreCaseAndNameIgnoreCase(
        String teacherId,
        String categoryTitle,
        String name
    );
}
