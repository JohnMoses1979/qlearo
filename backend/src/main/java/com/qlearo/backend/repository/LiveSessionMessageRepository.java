package com.qlearo.backend.repository;

import com.qlearo.backend.entity.LiveSessionMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LiveSessionMessageRepository extends JpaRepository<LiveSessionMessage, String> {
    List<LiveSessionMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);
}
