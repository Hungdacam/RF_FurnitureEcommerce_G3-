package com.rainbowforest.statisticsservice.dto;

import lombok.Data;

@Data
public class OrderItemDto {
    private Long productId;
    private String productName;
    private double price;
    private int quantity;
    private String imageUrl;
}
