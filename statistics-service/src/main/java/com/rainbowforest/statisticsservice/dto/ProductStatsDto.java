package com.rainbowforest.statisticsservice.dto;

import lombok.Data;

@Data
public class ProductStatsDto {
    private Long productId;
    private String productName;
    private int totalQuantitySold;
    private double totalRevenue;
    private String imageUrl;
}
