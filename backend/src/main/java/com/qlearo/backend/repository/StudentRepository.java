package com.qlearo.backend.repository;

import com.qlearo.backend.entity.Student;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentRepository extends JpaRepository<Student, String> {

    Optional<Student> findByEmail(String email);

    Optional<Student> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    @Query("select s from Student s where lower(s.email) = lower(:value) or s.phone = :value")
    Optional<Student> findByEmailOrPhone(@Param("value") String value);
}
