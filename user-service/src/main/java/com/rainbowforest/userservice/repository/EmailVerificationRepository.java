package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.EmailVerification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findByOtpCode(String otpCode);

    Optional<EmailVerification> findByUserId(Long userId);

    @Transactional
    @Modifying
    @Query("DELETE FROM EmailVerification e WHERE e.userId = :userId")
    void deleteByUserId(Long userId);
}