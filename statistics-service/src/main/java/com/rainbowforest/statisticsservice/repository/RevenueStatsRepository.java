package com.rainbowforest.statisticsservice.repository;

import com.rainbowforest.statisticsservice.entity.RevenueStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface RevenueStatsRepository extends JpaRepository<RevenueStats, Long> {
    RevenueStats findByDate(LocalDate date);

    List<RevenueStats> findByDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(r.dailyRevenue) FROM RevenueStats r WHERE r.date BETWEEN ?1 AND ?2")
    Double calculateTotalRevenueBetween(LocalDate startDate, LocalDate endDate);
}
