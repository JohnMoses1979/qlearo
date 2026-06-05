package com.qlearo.backend.repository;

import com.qlearo.backend.entity.SubscriptionPayment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, String> {

    List<SubscriptionPayment> findAllByOrderByPaidAtDesc();

    List<SubscriptionPayment> findByStudentIdOrderByPaidAtDesc(String studentId);
}
