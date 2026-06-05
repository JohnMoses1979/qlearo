package com.qlearo.backend.repository;

import com.qlearo.backend.entity.ExplanationVideoCategory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExplanationVideoCategoryRepository extends JpaRepository<ExplanationVideoCategory, String> {

    Optional<ExplanationVideoCategory> findByTitleIgnoreCase(String title);

    boolean existsByTitleIgnoreCase(String title);

    List<ExplanationVideoCategory> findAllByOrderBySortOrderAscTitleAsc();
}
