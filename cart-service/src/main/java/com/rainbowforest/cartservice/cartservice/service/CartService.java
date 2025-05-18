package com.rainbowforest.cartservice.cartservice.service;

import com.rainbowforest.cartservice.cartservice.entity.Cart;

public interface CartService {
    Cart addToCart(String userName, Long productId, String productName, double price, int quantity, String jwtToken);

    Cart updateCartItemQuantity(String userName, Long productId, int newQuantity);

    Cart getCartByUserName(String userName);
}