package com.rainbowforest.cartservice.cartservice.service;

import com.rainbowforest.cartservice.cartservice.entity.Cart;

public interface CartService {
    Cart addToCart(String userName, Long productId, String productName, double price, int quantity);

    Cart getCartByUserName(String userName);
}