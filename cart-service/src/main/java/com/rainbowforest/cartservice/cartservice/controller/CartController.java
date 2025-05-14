package com.rainbowforest.cartservice.cartservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rainbowforest.cartservice.cartservice.entity.Cart;
import com.rainbowforest.cartservice.cartservice.service.CartService;
import com.rainbowforest.userservice.http.header.HeaderGenerator;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private CartService cartService;

    private HeaderGenerator headerGenerator;

    private ResponseEntity<Cart> addToCart(@RequestParam String userName,
            @RequestParam Long productId,
            @RequestParam String productName,
            @RequestParam double price,
            @RequestParam int quantity) {
        System.out.println("Received add to cart request for user: " + userName);
        Cart cart = cartService.addToCart(userName, productId, productName, price, quantity);
        return new ResponseEntity<>(
                cart,
                headerGenerator.getHeadersForSuccessPostMethod(null, cart.getId()),
                HttpStatus.OK);
    }
}
