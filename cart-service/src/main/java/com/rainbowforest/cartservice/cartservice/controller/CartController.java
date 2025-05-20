package com.rainbowforest.cartservice.cartservice.controller;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

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

    @Autowired
    private RestTemplate restTemplate;

    @PostMapping("/add")
    private ResponseEntity<Cart> addToCart(
            @RequestParam String userName,
            @RequestParam Long productId,
            @RequestParam String productName,
            @RequestParam double price,
            @RequestParam int quantity,
            HttpServletRequest request) {
        try {
            String jwt = request.getHeader("Authorization");
            if (jwt == null || !jwt.startsWith("Bearer ")) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            jwt = jwt.substring(7);
            System.out.println("Received add to cart request for user: " + userName);
            Cart cart = cartService.addToCart(userName, productId, productName, price, quantity, jwt);
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
    @PostMapping("/remove-product")
    public ResponseEntity<Void> removeProductFromAllCarts(@RequestParam Long productId) {
        try {
            cartService.removeProductFromAllCarts(productId);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error in removeProductFromAllCarts: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, Object> checkoutData) {
        try {
            String userName = (String) checkoutData.get("userName");
            String fullName = (String) checkoutData.get("fullName");
            String phoneNumber = (String) checkoutData.get("phoneNumber");
            String address = (String) checkoutData.get("address");
            String note = (String) checkoutData.get("note");
            String paymentMethod = (String) checkoutData.get("paymentMethod");
            double totalAmount = Double.parseDouble(checkoutData.get("totalAmount").toString());
            List<Map<String, Object>> selectedItems = (List<Map<String, Object>>) checkoutData.get("selectedItems");

            // Gọi API order-service
            ResponseEntity<?> response = restTemplate.postForEntity(
                    "http://localhost:8081/api/orders/create",
                    checkoutData,
                    Object.class
            );

            if (response.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Lỗi khi tạo đơn hàng!");
            }

            // Xóa sản phẩm khỏi giỏ hàng
            Cart cart = cartService.getCartByUserName(userName);
            if (cart != null) {
                for (Map<String, Object> item : selectedItems) {
                    Long productId = Long.valueOf(item.get("productId").toString());
                    cartService.updateCartItemQuantity(userName, productId, 0);
                }
            }

            return new ResponseEntity<>(response.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error in checkout: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>("Lỗi khi thanh toán: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}