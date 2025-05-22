package com.rainbowforest.statisticsservice.dto;

import lombok.Data;

@Data
public class PaymentMethodStatsDto {
    private String paymentMethod;
    private int orderCount;
    private double totalRevenue;
    private double percentage;
}
