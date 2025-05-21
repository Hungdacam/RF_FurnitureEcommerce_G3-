package com.rainbowforest.statisticsservice.entity;

import lombok.Data;
import jakarta.persistence.*;

@Entity
@Table(name = "customer_stats")
@Data
public class CustomerStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String userName;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private int orderCount;

    @Column(nullable = false)
    private double totalSpent;

    @Column(nullable = false)
    private double averageOrderValue;
}
