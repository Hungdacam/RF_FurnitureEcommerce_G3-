package com.rainbowforest.statisticsservice.controller;

import com.rainbowforest.statisticsservice.dto.*;
import com.rainbowforest.statisticsservice.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
public class StatisticsController {
    private final StatisticsService statisticsService;

    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> syncData() {
        statisticsService.syncData();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đồng bộ dữ liệu thành công");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<RevenueStatsDto>> getRevenueStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(statisticsService.getRevenueStats(startDate, endDate));
    }

    @GetMapping("/revenue/total")
    public ResponseEntity<Map<String, Object>> getTotalRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Double totalRevenue = statisticsService.getTotalRevenue(startDate, endDate);
        Map<String, Object> response = new HashMap<>();
        response.put("startDate", startDate);
        response.put("endDate", endDate);
        response.put("totalRevenue", totalRevenue);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/products/top-selling")
    public ResponseEntity<List<ProductStatsDto>> getTopSellingProducts(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // Nếu không có startDate và endDate, sử dụng 30 ngày gần đây
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        return ResponseEntity.ok(statisticsService.getTopSellingProducts(limit, startDate, endDate));
    }

    @GetMapping("/products/top-revenue")
    public ResponseEntity<List<ProductStatsDto>> getTopRevenueProducts(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // Nếu không có startDate và endDate, sử dụng 30 ngày gần đây
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        return ResponseEntity.ok(statisticsService.getTopRevenueProducts(limit, startDate, endDate));
    }

    @GetMapping("/customers/top-spending")
    public ResponseEntity<List<CustomerStatsDto>> getTopSpendingCustomers(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // Nếu không có startDate và endDate, sử dụng 30 ngày gần đây
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        return ResponseEntity.ok(statisticsService.getTopSpendingCustomers(limit, startDate, endDate));
    }

    @GetMapping("/customers/top-frequent")
    public ResponseEntity<List<CustomerStatsDto>> getTopFrequentCustomers(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // Nếu không có startDate và endDate, sử dụng 30 ngày gần đây
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        return ResponseEntity.ok(statisticsService.getTopFrequentCustomers(limit, startDate, endDate));
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<List<PaymentMethodStatsDto>> getPaymentMethodStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // Nếu không có startDate và endDate, sử dụng 30 ngày gần đây
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        return ResponseEntity.ok(statisticsService.getPaymentMethodStats(startDate, endDate));
    }


    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // Nếu không có startDate và endDate, sử dụng 30 ngày gần đây
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        Map<String, Object> dashboardStats = new HashMap<>();
        // Doanh thu trong khoảng thời gian
        dashboardStats.put("revenueStats", statisticsService.getRevenueStats(startDate, endDate));
        dashboardStats.put("totalRevenue", statisticsService.getTotalRevenue(startDate, endDate));
        // Top 5 sản phẩm bán chạy
        dashboardStats.put("topSellingProducts", statisticsService.getTopSellingProducts(5, startDate, endDate));
        // Top 5 sản phẩm doanh thu cao
        dashboardStats.put("topRevenueProducts", statisticsService.getTopRevenueProducts(5, startDate, endDate));
        // Top 5 khách hàng chi tiêu nhiều
        dashboardStats.put("topSpendingCustomers", statisticsService.getTopSpendingCustomers(5, startDate, endDate));
        // Thống kê phương thức thanh toán
        dashboardStats.put("paymentMethodStats", statisticsService.getPaymentMethodStats(startDate, endDate));

        return ResponseEntity.ok(dashboardStats);
    }


}
