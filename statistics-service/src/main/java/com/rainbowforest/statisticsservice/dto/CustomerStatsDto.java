package com.rainbowforest.statisticsservice.dto;

import lombok.Data;

@Data
public class CustomerStatsDto {
    private String userName;
    private String fullName;
    private int orderCount;
    private double totalSpent;
    private double averageOrderValue;
}
