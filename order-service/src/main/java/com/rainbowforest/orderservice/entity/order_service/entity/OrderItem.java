package com.rainbowforest.orderservice.entity.order_service.entity;

import javax.persistence.Column;
import javax.persistence.Embeddable;

@Embeddable
public class OrderItem {
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_name", columnDefinition = "NVARCHAR(255)")
    private String productName;

    @Column(name = "price")
    private double price;

    @Column(name = "quantity")
    private int quantity;

    @Column(name = "image_url", columnDefinition = "NVARCHAR(500)")
    private String imageUrl;

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}