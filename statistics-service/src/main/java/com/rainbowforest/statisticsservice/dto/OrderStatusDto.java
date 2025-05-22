package com.rainbowforest.statisticsservice.dto;

public enum OrderStatusDto {
    PENDING("Chờ xác nhận"),
    SHIPPING("Đang giao hàng"),
    DELIVERED("Giao thành công"),
    CANCELLED("Đã hủy");

    private final String displayName;

    OrderStatusDto(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
