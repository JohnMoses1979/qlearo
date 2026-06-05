package com.qlearo.backend.repository;

import com.qlearo.backend.entity.ClarivoChatSession;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClarivoChatSessionRepository extends JpaRepository<ClarivoChatSession, String> {

    List<ClarivoChatSession> findByUserIdAndUserRoleOrderByUpdatedAtDesc(String userId, String userRole);

    Optional<ClarivoChatSession> findById(String id);
}
