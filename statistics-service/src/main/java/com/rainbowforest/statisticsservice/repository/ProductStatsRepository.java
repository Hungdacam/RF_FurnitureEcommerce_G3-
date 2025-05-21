package com.rainbowforest.statisticsservice.repository;

import com.rainbowforest.statisticsservice.entity.ProductStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductStatsRepository extends JpaRepository<ProductStats, Long> {
    ProductStats findByProductId(Long productId);

    List<ProductStats> findTop10ByOrderByTotalQuantitySoldDesc(Pageable pageable);

    List<ProductStats> findTop10ByOrderByTotalRevenueDesc(Pageable pageable);
}
