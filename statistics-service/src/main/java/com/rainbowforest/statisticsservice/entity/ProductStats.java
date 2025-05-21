package com.rainbowforest.statisticsservice.entity;

import lombok.Data;
import javax.persistence.*;

@Entity
@Table(name = "product_stats")
@Data
public class ProductStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private int totalQuantitySold;

    @Column(nullable = false)
    private double totalRevenue;

    private String imageUrl;
}
