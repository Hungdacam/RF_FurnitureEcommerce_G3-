package com.rainbowforest.statisticsservice.repository;

import com.rainbowforest.statisticsservice.entity.PaymentMethodStats;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentMethodStatsRepository extends JpaRepository<PaymentMethodStats, Long> {
    PaymentMethodStats findByPaymentMethod(String paymentMethod);
}
