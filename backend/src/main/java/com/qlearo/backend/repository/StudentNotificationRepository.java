package com.qlearo.backend.repository;

import com.qlearo.backend.entity.StudentNotification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentNotificationRepository extends JpaRepository<StudentNotification, String> {

    List<StudentNotification> findByRecipientRoleAndRecipientIdIsNullOrderByCreatedAtDesc(String recipientRole);

    List<StudentNotification> findByRecipientRoleAndRecipientIdOrderByCreatedAtDesc(
        String recipientRole,
        String recipientId
    );

    long countByRecipientRoleAndRecipientIdIsNullAndReadFalse(String recipientRole);

    long countByRecipientRoleAndRecipientIdAndReadFalse(String recipientRole, String recipientId);
}
