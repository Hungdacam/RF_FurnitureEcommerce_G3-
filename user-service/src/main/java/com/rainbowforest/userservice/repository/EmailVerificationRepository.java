package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findByOtpCode(String otpCode);
    Optional<EmailVerification> findByUserId(Long userId);
}