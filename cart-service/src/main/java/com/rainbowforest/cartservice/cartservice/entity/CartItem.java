package com.rainbowforest.cartservice.cartservice.entity;

import javax.persistence.Column;
import javax.persistence.Embeddable;

@Embeddable
public class CartItem {
    private Long productId;
    private String productName;
    private int quantity;
    private double price;
    private String imageUrl;

  
    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    @Column(name = "is_available")
    private boolean isAvailable = true;

    @Column(name = "is_out_of_stock")
    private boolean isOutOfStock = false;

    public CartItem() {
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public boolean isOutOfStock() {
        return isOutOfStock;
    }

    public void setOutOfStock(boolean isOutOfStock) {
        this.isOutOfStock = isOutOfStock;
    }

    // Các getter/setter còn lại giữ nguyên
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

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}