package com.rainbowforest.orderservice.entity.order_service.entity;

public enum OrderStatus {
    PENDING("Chờ xác nhận"),
    SHIPPING("Đang giao hàng"),
    DELIVERED("Giao thành công"),
    CANCELLED("Đã hủy");

    private final String displayName;

    OrderStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
