package com.rainbowforest.statisticsservice.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "revenue_stats")
@Data
public class RevenueStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private double dailyRevenue;

    @Column(nullable = false)
    private int orderCount;

    @Column(nullable = false)
    private double averageOrderValue;
}
