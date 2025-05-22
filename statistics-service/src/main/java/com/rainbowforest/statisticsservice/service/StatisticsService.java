package com.rainbowforest.statisticsservice.service;

import com.rainbowforest.statisticsservice.dto.*;
import com.rainbowforest.statisticsservice.entity.*;
import com.rainbowforest.statisticsservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
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
    public List<ProductStatsDto> getTopSellingProducts(int limit, LocalDate startDate, LocalDate endDate) {
        log.info("Lấy top {} sản phẩm bán chạy nhất từ {} đến {}", limit, startDate, endDate);

        // Lấy tất cả đơn hàng đã giao thành công trong khoảng thời gian
        List<OrderDto> orders = getOrdersInDateRange(startDate, endDate);

        // Tạo map để lưu trữ thống kê sản phẩm
        Map<Long, ProductStatsDto> productStatsMap = new HashMap<>();

        // Tính toán thống kê từ đơn hàng
        for (OrderDto order : orders) {
            for (OrderItemDto item : order.getItems()) {
                Long productId = item.getProductId();
                ProductStatsDto stats = productStatsMap.computeIfAbsent(productId, k -> {
                    ProductStatsDto dto = new ProductStatsDto();
                    dto.setProductId(productId);
                    dto.setProductName(item.getProductName());
                    dto.setImageUrl(item.getImageUrl());
                    dto.setTotalQuantitySold(0);
                    dto.setTotalRevenue(0.0);
                    return dto;
                });

                stats.setTotalQuantitySold(stats.getTotalQuantitySold() + item.getQuantity());
                stats.setTotalRevenue(stats.getTotalRevenue() + (item.getPrice() * item.getQuantity()));
            }
        }

        // Chuyển map thành list và sắp xếp theo số lượng bán giảm dần
        return productStatsMap.values().stream()
                .sorted(Comparator.comparing(ProductStatsDto::getTotalQuantitySold).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<ProductStatsDto> getTopRevenueProducts(int limit, LocalDate startDate, LocalDate endDate) {
        log.info("Lấy top {} sản phẩm có doanh thu cao nhất từ {} đến {}", limit, startDate, endDate);

        // Lấy tất cả đơn hàng đã giao thành công trong khoảng thời gian
        List<OrderDto> orders = getOrdersInDateRange(startDate, endDate);

        // Tạo map để lưu trữ thống kê sản phẩm
        Map<Long, ProductStatsDto> productStatsMap = new HashMap<>();

        // Tính toán thống kê từ đơn hàng
        for (OrderDto order : orders) {
            for (OrderItemDto item : order.getItems()) {
                Long productId = item.getProductId();
                ProductStatsDto stats = productStatsMap.computeIfAbsent(productId, k -> {
                    ProductStatsDto dto = new ProductStatsDto();
                    dto.setProductId(productId);
                    dto.setProductName(item.getProductName());
                    dto.setImageUrl(item.getImageUrl());
                    dto.setTotalQuantitySold(0);
                    dto.setTotalRevenue(0.0);
                    return dto;
                });

                stats.setTotalQuantitySold(stats.getTotalQuantitySold() + item.getQuantity());
                stats.setTotalRevenue(stats.getTotalRevenue() + (item.getPrice() * item.getQuantity()));
            }
        }

        // Chuyển map thành list và sắp xếp theo doanh thu giảm dần
        return productStatsMap.values().stream()
                .sorted(Comparator.comparing(ProductStatsDto::getTotalRevenue).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    // Thống kê khách hàng
    public List<CustomerStatsDto> getTopSpendingCustomers(int limit, LocalDate startDate, LocalDate endDate) {
        log.info("Lấy top {} khách hàng chi tiêu nhiều nhất từ {} đến {}", limit, startDate, endDate);

        // Lấy tất cả đơn hàng đã giao thành công trong khoảng thời gian
        List<OrderDto> orders = getOrdersInDateRange(startDate, endDate);

        // Tạo map để lưu trữ thống kê khách hàng
        Map<String, CustomerStatsDto> customerStatsMap = new HashMap<>();

        // Nhóm đơn hàng theo người dùng
        Map<String, List<OrderDto>> ordersByUser = orders.stream()
                .collect(Collectors.groupingBy(OrderDto::getUserName));

        ordersByUser.forEach((userName, userOrders) -> {
            int orderCount = userOrders.size();
            double totalSpent = userOrders.stream().mapToDouble(OrderDto::getTotalAmount).sum();
            double averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
            String fullName = userOrders.get(0).getFullName();

            CustomerStatsDto stats = new CustomerStatsDto();
            stats.setUserName(userName);
            stats.setFullName(fullName);
            stats.setOrderCount(orderCount);
            stats.setTotalSpent(totalSpent);
            stats.setAverageOrderValue(averageOrderValue);

            customerStatsMap.put(userName, stats);
        });

        // Chuyển map thành list và sắp xếp theo tổng chi tiêu giảm dần
        return customerStatsMap.values().stream()
                .sorted(Comparator.comparing(CustomerStatsDto::getTotalSpent).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<CustomerStatsDto> getTopFrequentCustomers(int limit, LocalDate startDate, LocalDate endDate) {
        log.info("Lấy top {} khách hàng mua hàng thường xuyên nhất từ {} đến {}", limit, startDate, endDate);

        // Lấy tất cả đơn hàng đã giao thành công trong khoảng thời gian
        List<OrderDto> orders = getOrdersInDateRange(startDate, endDate);

        // Tạo map để lưu trữ thống kê khách hàng
        Map<String, CustomerStatsDto> customerStatsMap = new HashMap<>();

        // Nhóm đơn hàng theo người dùng
        Map<String, List<OrderDto>> ordersByUser = orders.stream()
                .collect(Collectors.groupingBy(OrderDto::getUserName));

        ordersByUser.forEach((userName, userOrders) -> {
            int orderCount = userOrders.size();
            double totalSpent = userOrders.stream().mapToDouble(OrderDto::getTotalAmount).sum();
            double averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
            String fullName = userOrders.get(0).getFullName();

            CustomerStatsDto stats = new CustomerStatsDto();
            stats.setUserName(userName);
            stats.setFullName(fullName);
            stats.setOrderCount(orderCount);
            stats.setTotalSpent(totalSpent);
            stats.setAverageOrderValue(averageOrderValue);

            customerStatsMap.put(userName, stats);
        });

        // Chuyển map thành list và sắp xếp theo số đơn hàng giảm dần
        return customerStatsMap.values().stream()
                .sorted(Comparator.comparing(CustomerStatsDto::getOrderCount).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    // Thống kê phương thức thanh toán
    public List<PaymentMethodStatsDto> getPaymentMethodStats(LocalDate startDate, LocalDate endDate) {
        log.info("Lấy thống kê phương thức thanh toán từ {} đến {}", startDate, endDate);

        // Lấy tất cả đơn hàng đã giao thành công trong khoảng thời gian
        List<OrderDto> orders = getOrdersInDateRange(startDate, endDate);

        int totalOrders = orders.size();
        if (totalOrders == 0) {
            log.info("Không có đơn hàng trong khoảng thời gian này");
            return Collections.emptyList();
        }

        // Nhóm đơn hàng theo phương thức thanh toán
        Map<String, List<OrderDto>> ordersByPaymentMethod = orders.stream()
                .collect(Collectors.groupingBy(OrderDto::getPaymentMethod));

        // Tạo map để lưu trữ thống kê phương thức thanh toán
        List<PaymentMethodStatsDto> paymentStats = new ArrayList<>();

        ordersByPaymentMethod.forEach((paymentMethod, methodOrders) -> {
            int orderCount = methodOrders.size();
            double totalRevenue = methodOrders.stream().mapToDouble(OrderDto::getTotalAmount).sum();
            double percentage = (double) orderCount / totalOrders * 100;

            PaymentMethodStatsDto stats = new PaymentMethodStatsDto();
            stats.setPaymentMethod(paymentMethod);
            stats.setOrderCount(orderCount);
            stats.setTotalRevenue(totalRevenue);
            stats.setPercentage(percentage);

            paymentStats.add(stats);
        });

        return paymentStats;
    }

    // Phương thức hỗ trợ để lấy đơn hàng trong khoảng thời gian
    private List<OrderDto> getOrdersInDateRange(LocalDate startDate, LocalDate endDate) {
        // Lấy tất cả đơn hàng đã giao thành công
        List<OrderDto> allOrders = orderSyncService.getOrderServiceClient().getDeliveredOrders();

        // Lọc theo khoảng thời gian
        return allOrders.stream()
                .filter(order -> {
                    LocalDate orderDate = order.getOrderDate().toLocalDate();
                    return !orderDate.isBefore(startDate) && !orderDate.isAfter(endDate);
                })
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
