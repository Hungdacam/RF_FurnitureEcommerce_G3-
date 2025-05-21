package com.rainbowforest.statisticsservice.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDto {
    private Long id;
    private String userName;
    private String fullName;
    private String phoneNumber;
    private String address;
    private String note;
    private String paymentMethod;
    private LocalDateTime orderDate;
    private double totalAmount;
    private OrderStatusDto status;
    private List<OrderItemDto> items;
}
