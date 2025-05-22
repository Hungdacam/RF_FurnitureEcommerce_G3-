package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.PendingUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface PendingUserRepository extends JpaRepository<PendingUser, Long> {
    Optional<PendingUser> findByOtpCode(String otpCode);
    Optional<PendingUser> findByUserName(String userName);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    void deleteByUserName(String userName);
}
