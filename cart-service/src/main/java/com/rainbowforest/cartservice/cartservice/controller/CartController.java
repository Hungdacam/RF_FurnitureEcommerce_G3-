package com.rainbowforest.cartservice.cartservice.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rainbowforest.cartservice.cartservice.entity.Cart;
import com.rainbowforest.cartservice.cartservice.header.HeaderGenerator;
import com.rainbowforest.cartservice.cartservice.service.CartService;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @PostMapping("/add")
    private ResponseEntity<Cart> addToCart(
            @RequestParam String userName,
            @RequestParam Long productId,
            @RequestParam String productName,
            @RequestParam double price,
            @RequestParam int quantity,
            HttpServletRequest request) {
        try {
            System.out.println("Received add to cart request for user: " + userName);
            Cart cart = cartService.addToCart(userName, productId, productName, price, quantity);
            return new ResponseEntity<>(
                    cart,
                    headerGenerator.getHeadersForSuccessPostMethod(request, cart.getId()),
                    HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error in addToCart: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get")
    public ResponseEntity<Cart> getCart(@RequestParam String userName) {
        Cart cart = cartService.getCartByUserName(userName);
        if (cart != null) {
            return new ResponseEntity<>(
                    cart,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @PutMapping("/update-quantity")
    public ResponseEntity<?> updateCartItemQuantity(
            @RequestParam String userName,
            @RequestParam Long productId,
            @RequestParam int quantity) {
        try {
            System.out.println("Received PUT request to update quantity for user: " + userName + ", productId: " + productId + ", quantity: " + quantity);
            Cart cart = cartService.updateCartItemQuantity(userName, productId, quantity);
            return new ResponseEntity<>(
                    cart,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error in updateCartItemQuantity: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(
                    "Lỗi khi cập nhật số lượng: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}