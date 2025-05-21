package com.rainbowforest.statisticsservice.repository;

import com.rainbowforest.statisticsservice.entity.CustomerStats;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerStatsRepository extends JpaRepository<CustomerStats, Long> {
    CustomerStats findByUserName(String userName);

    List<CustomerStats> findTop10ByOrderByTotalSpentDesc(Pageable pageable);

    List<CustomerStats> findTop10ByOrderByOrderCountDesc(Pageable pageable);
}
