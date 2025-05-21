package com.rainbowforest.statisticsservice.service;

import com.rainbowforest.statisticsservice.client.OrderServiceClient;
import com.rainbowforest.statisticsservice.dto.OrderDto;
import com.rainbowforest.statisticsservice.entity.*;
import com.rainbowforest.statisticsservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderSyncService {
    private final OrderServiceClient orderServiceClient;
    private final RevenueStatsRepository revenueStatsRepository;
    private final ProductStatsRepository productStatsRepository;
    private final CustomerStatsRepository customerStatsRepository;
    private final PaymentMethodStatsRepository paymentMethodStatsRepository;

    @Scheduled(cron = "0 0 1 * * ?") // Chạy lúc 1 giờ sáng mỗi ngày
    public void syncOrderData() {
        List<OrderDto> allOrders = orderServiceClient.getAllOrders();
        updateRevenueStats(allOrders);
        updateProductStats(allOrders);
        updateCustomerStats(allOrders);
        updatePaymentMethodStats(allOrders);
    }

    private void updateRevenueStats(List<OrderDto> orders) {
        // Nhóm đơn hàng theo ngày và tính toán doanh thu
        Map<LocalDate, List<OrderDto>> ordersByDate = orders.stream()
                .filter(order -> "DELIVERED".equals(order.getStatus().name()))
                .collect(Collectors.groupingBy(order -> order.getOrderDate().toLocalDate()));

        ordersByDate.forEach((date, dailyOrders) -> {
            double dailyRevenue = dailyOrders.stream().mapToDouble(OrderDto::getTotalAmount).sum();
            int orderCount = dailyOrders.size();
            double averageOrderValue = dailyRevenue / orderCount;

            RevenueStats stats = revenueStatsRepository.findByDate(date);
            if (stats == null) {
                stats = new RevenueStats();
                stats.setDate(date);
            }

            stats.setDailyRevenue(dailyRevenue);
            stats.setOrderCount(orderCount);
            stats.setAverageOrderValue(averageOrderValue);

            revenueStatsRepository.save(stats);
        });
    }

    private void updateProductStats(List<OrderDto> orders) {
        // Tính toán số lượng bán và doanh thu cho từng sản phẩm
        Map<Long, List<OrderItemDto>> itemsByProductId = orders.stream()
                .filter(order -> "DELIVERED".equals(order.getStatus().name()))
                .flatMap(order -> order.getItems().stream())
                .collect(Collectors.groupingBy(OrderItemDto::getProductId));

        itemsByProductId.forEach((productId, items) -> {
            int totalQuantity = items.stream().mapToInt(OrderItemDto::getQuantity).sum();
            double totalRevenue = items.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
            String productName = items.get(0).getProductName();
            String imageUrl = items.get(0).getImageUrl();

            ProductStats stats = productStatsRepository.findByProductId(productId);
            if (stats == null) {
                stats = new ProductStats();
                stats.setProductId(productId);
                stats.setProductName(productName);
                stats.setImageUrl(imageUrl);
            }

            stats.setTotalQuantitySold(totalQuantity);
            stats.setTotalRevenue(totalRevenue);

            productStatsRepository.save(stats);
        });
    }

    private void updateCustomerStats(List<OrderDto> orders) {
        // Tính toán thống kê cho từng khách hàng
        Map<String, List<OrderDto>> ordersByUser = orders.stream()
                .filter(order -> "DELIVERED".equals(order.getStatus().name()))
                .collect(Collectors.groupingBy(OrderDto::getUserName));

        ordersByUser.forEach((userName, userOrders) -> {
            int orderCount = userOrders.size();
            double totalSpent = userOrders.stream().mapToDouble(OrderDto::getTotalAmount).sum();
            double averageOrderValue = totalSpent / orderCount;
            String fullName = userOrders.get(0).getFullName();

            CustomerStats stats = customerStatsRepository.findByUserName(userName);
            if (stats == null) {
                stats = new CustomerStats();
                stats.setUserName(userName);
                stats.setFullName(fullName);
            }

            stats.setOrderCount(orderCount);
            stats.setTotalSpent(totalSpent);
            stats.setAverageOrderValue(averageOrderValue);

            customerStatsRepository.save(stats);
        });
    }

    private void updatePaymentMethodStats(List<OrderDto> orders) {
        // Tính toán thống kê theo phương thức thanh toán
        Map<String, List<OrderDto>> ordersByPaymentMethod = orders.stream()
                .filter(order -> "DELIVERED".equals(order.getStatus().name()))
                .collect(Collectors.groupingBy(OrderDto::getPaymentMethod));

        int totalOrders = orders.size();

        ordersByPaymentMethod.forEach((paymentMethod, methodOrders) -> {
            int orderCount = methodOrders.size();
            double totalRevenue = methodOrders.stream().mapToDouble(OrderDto::getTotalAmount).sum();
            double percentage = (double) orderCount / totalOrders * 100;

            PaymentMethodStats stats = paymentMethodStatsRepository.findByPaymentMethod(paymentMethod);
            if (stats == null) {
                stats = new PaymentMethodStats();
                stats.setPaymentMethod(paymentMethod);
            }

            stats.setOrderCount(orderCount);
            stats.setTotalRevenue(totalRevenue);
            stats.setPercentage(percentage);

            paymentMethodStatsRepository.save(stats);
        });
    }
}
