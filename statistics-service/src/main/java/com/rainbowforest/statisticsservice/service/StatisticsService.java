package com.rainbowforest.statisticsservice.service;

import com.rainbowforest.statisticsservice.dto.*;
import com.rainbowforest.statisticsservice.entity.*;
import com.rainbowforest.statisticsservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticsService {
    private final RevenueStatsRepository revenueStatsRepository;
    private final ProductStatsRepository productStatsRepository;
    private final CustomerStatsRepository customerStatsRepository;
    private final PaymentMethodStatsRepository paymentMethodStatsRepository;
    private final OrderSyncService orderSyncService;

    // Phương thức để đồng bộ dữ liệu theo yêu cầu
    public void syncData() {
        orderSyncService.syncOrderDataManually();
    }

    // Thống kê doanh thu
    public List<RevenueStatsDto> getRevenueStats(LocalDate startDate, LocalDate endDate) {
        log.info("Lấy thống kê doanh thu từ {} đến {}", startDate, endDate);
        return revenueStatsRepository.findByDateBetween(startDate, endDate)
                .stream()
                .map(this::convertToRevenueDto)
                .collect(Collectors.toList());
    }

    public Double getTotalRevenue(LocalDate startDate, LocalDate endDate) {
        log.info("Tính tổng doanh thu từ {} đến {}", startDate, endDate);
        Double totalRevenue = revenueStatsRepository.calculateTotalRevenueBetween(startDate, endDate);
        return totalRevenue != null ? totalRevenue : 0.0;
    }

    // Thống kê sản phẩm
    public List<ProductStatsDto> getTopSellingProducts(int limit) {
        log.info("Lấy top {} sản phẩm bán chạy nhất", limit);
        return productStatsRepository.findTop10ByOrderByTotalQuantitySoldDesc(PageRequest.of(0, limit))
                .stream()
                .map(this::convertToProductDto)
                .collect(Collectors.toList());
    }

    public List<ProductStatsDto> getTopRevenueProducts(int limit) {
        log.info("Lấy top {} sản phẩm có doanh thu cao nhất", limit);
        return productStatsRepository.findTop10ByOrderByTotalRevenueDesc(PageRequest.of(0, limit))
                .stream()
                .map(this::convertToProductDto)
                .collect(Collectors.toList());
    }

    // Thống kê khách hàng
    public List<CustomerStatsDto> getTopSpendingCustomers(int limit) {
        log.info("Lấy top {} khách hàng chi tiêu nhiều nhất", limit);
        return customerStatsRepository.findTop10ByOrderByTotalSpentDesc(PageRequest.of(0, limit))
                .stream()
                .map(this::convertToCustomerDto)
                .collect(Collectors.toList());
    }

    public List<CustomerStatsDto> getTopFrequentCustomers(int limit) {
        log.info("Lấy top {} khách hàng mua hàng thường xuyên nhất", limit);
        return customerStatsRepository.findTop10ByOrderByOrderCountDesc(PageRequest.of(0, limit))
                .stream()
                .map(this::convertToCustomerDto)
                .collect(Collectors.toList());
    }

    // Thống kê phương thức thanh toán
    public List<PaymentMethodStatsDto> getPaymentMethodStats() {
        log.info("Lấy thống kê phương thức thanh toán");
        return paymentMethodStatsRepository.findAll()
                .stream()
                .map(this::convertToPaymentMethodDto)
                .collect(Collectors.toList());
    }

    // Các phương thức chuyển đổi
    private RevenueStatsDto convertToRevenueDto(RevenueStats entity) {
        RevenueStatsDto dto = new RevenueStatsDto();
        dto.setDate(entity.getDate());
        dto.setDailyRevenue(entity.getDailyRevenue());
        dto.setOrderCount(entity.getOrderCount());
        dto.setAverageOrderValue(entity.getAverageOrderValue());
        return dto;
    }

    private ProductStatsDto convertToProductDto(ProductStats entity) {
        ProductStatsDto dto = new ProductStatsDto();
        dto.setProductId(entity.getProductId());
        dto.setProductName(entity.getProductName());
        dto.setTotalQuantitySold(entity.getTotalQuantitySold());
        dto.setTotalRevenue(entity.getTotalRevenue());
        dto.setImageUrl(entity.getImageUrl());
        return dto;
    }

    private CustomerStatsDto convertToCustomerDto(CustomerStats entity) {
        CustomerStatsDto dto = new CustomerStatsDto();
        dto.setUserName(entity.getUserName());
        dto.setFullName(entity.getFullName());
        dto.setOrderCount(entity.getOrderCount());
        dto.setTotalSpent(entity.getTotalSpent());
        dto.setAverageOrderValue(entity.getAverageOrderValue());
        return dto;
    }

    private PaymentMethodStatsDto convertToPaymentMethodDto(PaymentMethodStats entity) {
        PaymentMethodStatsDto dto = new PaymentMethodStatsDto();
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setOrderCount(entity.getOrderCount());
        dto.setTotalRevenue(entity.getTotalRevenue());
        dto.setPercentage(entity.getPercentage());
        return dto;
    }
}
