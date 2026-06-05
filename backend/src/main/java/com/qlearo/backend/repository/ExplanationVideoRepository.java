package com.qlearo.backend.repository;

import com.qlearo.backend.entity.ExplanationVideo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExplanationVideoRepository extends JpaRepository<ExplanationVideo, String> {

    Optional<ExplanationVideo> findByVideoId(String videoId);

    boolean existsByVideoId(String videoId);

    List<ExplanationVideo> findAllByOrderByCreatedAtDesc();
}
