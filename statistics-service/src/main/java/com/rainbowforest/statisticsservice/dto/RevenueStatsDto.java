package com.rainbowforest.statisticsservice.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RevenueStatsDto {
    private LocalDate date;
    private double dailyRevenue;
    private int orderCount;
    private double averageOrderValue;
}
