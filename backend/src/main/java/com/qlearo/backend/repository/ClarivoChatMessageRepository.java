package com.qlearo.backend.repository;

import com.qlearo.backend.entity.ClarivoChatMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClarivoChatMessageRepository extends JpaRepository<ClarivoChatMessage, String> {

    List<ClarivoChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);
}
