package com.rainbowforest.cartservice.cartservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rainbowforest.cartservice.cartservice.entity.Cart;
import com.rainbowforest.cartservice.cartservice.entity.CartItem;
import com.rainbowforest.cartservice.cartservice.repository.CartRepository;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Override
    public Cart addToCart(String userName, Long productId, String productName, double price, int quantity) {
        Cart cart = cartRepository.findByUserName(userName);
        if (cart == null) {
            cart = new Cart();
            cart.setUserName(userName);
        }

        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {

            existingItem.setQuantity(existingItem.getQuantity() + quantity);
        } else {

            CartItem item = new CartItem();
            item.setProductId(productId);
            item.setProductName(productName);
            item.setPrice(price);
            item.setQuantity(quantity);
            cart.getItems().add(item);
        }

        return cartRepository.save(cart);
    }

    @Override
    public Cart getCartByUserName(String userName) {
        return cartRepository.findByUserName(userName);
    }
}
