package com.rainbowforest.statisticsservice.controller;

import com.rainbowforest.statisticsservice.dto.*;
import com.rainbowforest.statisticsservice.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
public class StatisticsController {
    private final StatisticsService statisticsService;

    @GetMapping("/revenue")
    public ResponseEntity<List<RevenueStatsDto>> getRevenueStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(statisticsService.getRevenueStats(startDate, endDate));
    }

    @GetMapping("/revenue/total")
    public ResponseEntity<Double> getTotalRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(statisticsService.getTotalRevenue(startDate, endDate));
    }

    @GetMapping("/products/top-selling")
    public ResponseEntity<List<ProductStatsDto>> getTopSellingProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getTopSellingProducts(limit));
    }

    @GetMapping("/products/top-revenue")
    public ResponseEntity<List<ProductStatsDto>> getTopRevenueProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getTopRevenueProducts(limit));
    }

    @GetMapping("/customers/top-spending")
    public ResponseEntity<List<CustomerStatsDto>> getTopSpendingCustomers(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getTopSpendingCustomers(limit));
    }

    @GetMapping("/customers/top-frequent")
    public ResponseEntity<List<CustomerStatsDto>> getTopFrequentCustomers(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getTopFrequentCustomers(limit));
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<List<PaymentMethodStatsDto>> getPaymentMethodStats() {
        return ResponseEntity.ok(statisticsService.getPaymentMethodStats());
    }
}
