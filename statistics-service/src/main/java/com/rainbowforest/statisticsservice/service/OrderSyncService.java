package com.rainbowforest.statisticsservice.service;

import com.rainbowforest.statisticsservice.client.OrderServiceClient;
import com.rainbowforest.statisticsservice.dto.OrderDto;
import com.rainbowforest.statisticsservice.dto.OrderStatusDto;
import com.rainbowforest.statisticsservice.entity.CustomerStats;
import com.rainbowforest.statisticsservice.entity.PaymentMethodStats;
import com.rainbowforest.statisticsservice.entity.ProductStats;
import com.rainbowforest.statisticsservice.entity.RevenueStats;
import com.rainbowforest.statisticsservice.repository.CustomerStatsRepository;
import com.rainbowforest.statisticsservice.repository.PaymentMethodStatsRepository;
import com.rainbowforest.statisticsservice.repository.ProductStatsRepository;
import com.rainbowforest.statisticsservice.repository.RevenueStatsRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderSyncService {
    // Thêm getter cho OrderServiceClient
    @Getter
    private final OrderServiceClient orderServiceClient;
    private final RevenueStatsRepository revenueStatsRepository;
    private final ProductStatsRepository productStatsRepository;
    private final CustomerStatsRepository customerStatsRepository;
    private final PaymentMethodStatsRepository paymentMethodStatsRepository;

    @Scheduled(cron = "0 0 1 * * ?") // Chạy lúc 1 giờ sáng mỗi ngày
    public void syncOrderData() {
        log.info("Bắt đầu đồng bộ dữ liệu từ Order Service");
        try {
            // Xóa dữ liệu cũ
            revenueStatsRepository.deleteAll();
            productStatsRepository.deleteAll();
            customerStatsRepository.deleteAll();
            paymentMethodStatsRepository.deleteAll();

            // Lấy đơn hàng đã giao thành công
            List<OrderDto> deliveredOrders = orderServiceClient.getDeliveredOrders();
            log.info("Đã lấy {} đơn hàng đã giao thành công từ Order Service", deliveredOrders.size());

            updateRevenueStats(deliveredOrders);
            updateProductStats(deliveredOrders);
            updateCustomerStats(deliveredOrders);
            updatePaymentMethodStats(deliveredOrders);

            log.info("Đồng bộ dữ liệu thành công");
        } catch (Exception e) {
            log.error("Lỗi khi đồng bộ dữ liệu: {}", e.getMessage(), e);
        }
    }



    // Có thể gọi thủ công để đồng bộ dữ liệu
    public void syncOrderDataManually() {
        syncOrderData();
    }

    private void updateRevenueStats(List<OrderDto> orders) {
        // Tạo map để lưu trữ dữ liệu thống kê theo ngày
        Map<LocalDate, RevenueStats> statsMap = new HashMap<>();

        // Lấy tất cả thống kê hiện có
        revenueStatsRepository.findAll().forEach(stat ->
                statsMap.put(stat.getDate(), stat)
        );

        // Nhóm đơn hàng theo ngày và tính toán doanh thu
        Map<LocalDate, List<OrderDto>> ordersByDate = orders.stream()
                .collect(Collectors.groupingBy(order -> order.getOrderDate().toLocalDate()));

        ordersByDate.forEach((date, dailyOrders) -> {
            double dailyRevenue = dailyOrders.stream().mapToDouble(OrderDto::getTotalAmount).sum();
            int orderCount = dailyOrders.size();
            double averageOrderValue = orderCount > 0 ? dailyRevenue / orderCount : 0;

            RevenueStats stats = statsMap.computeIfAbsent(date, k -> {
                RevenueStats newStats = new RevenueStats();
                newStats.setDate(date);
                return newStats;
            });

            stats.setDailyRevenue(dailyRevenue);
            stats.setOrderCount(orderCount);
            stats.setAverageOrderValue(averageOrderValue);
        });

        // Lưu tất cả thống kê
        revenueStatsRepository.saveAll(statsMap.values());
    }



    private void updateProductStats(List<OrderDto> orders) {
        // Tạo map để lưu trữ thống kê sản phẩm
        Map<Long, ProductStats> productStatsMap = new HashMap<>();

        // Lấy tất cả sản phẩm hiện có từ repository để cập nhật
        productStatsRepository.findAll().forEach(stats ->
                productStatsMap.put(stats.getProductId(), stats)
        );

        // Chỉ xử lý đơn hàng đã giao thành công
        orders.stream()
                .filter(order -> OrderStatusDto.DELIVERED.equals(order.getStatus()))
                .forEach(order -> {
                    order.getItems().forEach(item -> {
                        Long productId = item.getProductId();

                        // Lấy hoặc tạo mới thống kê sản phẩm
                        ProductStats stats = productStatsMap.computeIfAbsent(productId, k -> {
                            ProductStats newStats = new ProductStats();
                            newStats.setProductId(productId);
                            newStats.setProductName(item.getProductName());
                            newStats.setImageUrl(item.getImageUrl());
                            newStats.setTotalQuantitySold(0);
                            newStats.setTotalRevenue(0);
                            return newStats;
                        });

                        // Cập nhật thống kê
                        stats.setTotalQuantitySold(stats.getTotalQuantitySold() + item.getQuantity());
                        stats.setTotalRevenue(stats.getTotalRevenue() + (item.getPrice() * item.getQuantity()));
                    });
                });

        // Lưu tất cả thống kê sản phẩm
        productStatsRepository.saveAll(productStatsMap.values());
        log.debug("Đã cập nhật thống kê cho {} sản phẩm", productStatsMap.size());
    }

    private void updateCustomerStats(List<OrderDto> orders) {
        // Tạo map để lưu trữ thống kê khách hàng
        Map<String, CustomerStats> customerStatsMap = new HashMap<>();

        // Lấy tất cả khách hàng hiện có từ repository để cập nhật
        customerStatsRepository.findAll().forEach(stats ->
                customerStatsMap.put(stats.getUserName(), stats)
        );

        // Nhóm đơn hàng theo người dùng
        Map<String, List<OrderDto>> ordersByUser = orders.stream()
                .filter(order -> OrderStatusDto.DELIVERED.equals(order.getStatus()))
                .collect(Collectors.groupingBy(OrderDto::getUserName));

        ordersByUser.forEach((userName, userOrders) -> {
            int orderCount = userOrders.size();
            double totalSpent = userOrders.stream().mapToDouble(OrderDto::getTotalAmount).sum();
            double averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
            String fullName = userOrders.get(0).getFullName();

            CustomerStats stats = customerStatsMap.computeIfAbsent(userName, k -> {
                CustomerStats newStats = new CustomerStats();
                newStats.setUserName(userName);
                return newStats;
            });

            stats.setFullName(fullName);
            stats.setOrderCount(orderCount);
            stats.setTotalSpent(totalSpent);
            stats.setAverageOrderValue(averageOrderValue);
        });

        // Lưu tất cả thống kê khách hàng
        customerStatsRepository.saveAll(customerStatsMap.values());
        log.debug("Đã cập nhật thống kê cho {} khách hàng", customerStatsMap.size());
    }

    private void updatePaymentMethodStats(List<OrderDto> orders) {
        // Lọc các đơn hàng đã giao thành công
        List<OrderDto> deliveredOrders = orders.stream()
                .filter(order -> OrderStatusDto.DELIVERED.equals(order.getStatus()))
                .collect(Collectors.toList());

        int totalOrders = deliveredOrders.size();

        if (totalOrders == 0) {
            log.info("Không có đơn hàng đã giao thành công để cập nhật thống kê phương thức thanh toán");
            return;
        }

        // Nhóm đơn hàng theo phương thức thanh toán
        Map<String, List<OrderDto>> ordersByPaymentMethod = deliveredOrders.stream()
                .collect(Collectors.groupingBy(OrderDto::getPaymentMethod));

        // Tạo map để lưu trữ thống kê phương thức thanh toán
        Map<String, PaymentMethodStats> paymentStatsMap = new HashMap<>();

        // Lấy tất cả phương thức thanh toán hiện có từ repository để cập nhật
        paymentMethodStatsRepository.findAll().forEach(stats ->
                paymentStatsMap.put(stats.getPaymentMethod(), stats)
        );

        ordersByPaymentMethod.forEach((paymentMethod, methodOrders) -> {
            int orderCount = methodOrders.size();
            double totalRevenue = methodOrders.stream().mapToDouble(OrderDto::getTotalAmount).sum();
            double percentage = (double) orderCount / totalOrders * 100;

            PaymentMethodStats stats = paymentStatsMap.computeIfAbsent(paymentMethod, k -> {
                PaymentMethodStats newStats = new PaymentMethodStats();
                newStats.setPaymentMethod(paymentMethod);
                return newStats;
            });

            stats.setOrderCount(orderCount);
            stats.setTotalRevenue(totalRevenue);
            stats.setPercentage(percentage);
        });

        // Lưu tất cả thống kê phương thức thanh toán
        paymentMethodStatsRepository.saveAll(paymentStatsMap.values());
        log.debug("Đã cập nhật thống kê cho {} phương thức thanh toán", paymentStatsMap.size());
    }

}
