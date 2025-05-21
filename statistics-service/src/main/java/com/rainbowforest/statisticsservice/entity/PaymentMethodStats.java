package com.rainbowforest.statisticsservice.entity;

import lombok.Data;
import javax.persistence.*;

@Entity
@Table(name = "payment_method_stats")
@Data
public class PaymentMethodStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String paymentMethod;

    @Column(nullable = false)
    private int orderCount;

    @Column(nullable = false)
    private double totalRevenue;

    @Column(nullable = false)
    private double percentage;
}
