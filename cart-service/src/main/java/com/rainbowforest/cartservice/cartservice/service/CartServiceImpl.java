package com.rainbowforest.cartservice.cartservice.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import com.rainbowforest.cartservice.cartservice.entity.Cart;
import com.rainbowforest.cartservice.cartservice.entity.CartItem;
import com.rainbowforest.cartservice.cartservice.repository.CartRepository;
import com.rainbowforest.cartservice.dto.ProductDTO;
import com.rainbowforest.cartservice.dto.UserDto;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private RestTemplate restTemplate;

    private static final String API_GATEWAY_URL = "http://localhost:8900/api/catalog";

   @Override
    public Cart addToCart(String userName, Long productId, String productName, double price, int quantity,
            String jwtToken) {
        // Kiểm tra sản phẩm tồn tại
        ProductDTO product = restTemplate.getForObject(
                API_GATEWAY_URL + "/products/" + productId,
                ProductDTO.class);
        if (product == null) {
            throw new RuntimeException("Sản phẩm không tồn tại!");
        }

        // Kiểm tra số lượng tồn kho
        if (product.getQuantity() < quantity) {
            throw new RuntimeException("Số lượng sản phẩm không đủ! Chỉ còn " + product.getQuantity() + " sản phẩm.");
        }

        // Kiểm tra số lượng yêu cầu
        if (quantity <= 0) {
            throw new RuntimeException("Số lượng phải lớn hơn 0!");
        }

        // Kiểm tra user
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwtToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<UserDto> userResponse = restTemplate.exchange(
                    "http://localhost:8900/api/users/by-username?username=" + userName,
                    HttpMethod.GET,
                    entity,
                    UserDto.class);
            if (!userResponse.getStatusCode().is2xxSuccessful() || userResponse.getBody() == null) {
                throw new RuntimeException("Không xác thực được user!");
            }
        } catch (HttpClientErrorException | HttpServerErrorException ex) {
            throw new RuntimeException("Lỗi xác thực user: " + ex.getStatusCode());
        }

        // Tạo hoặc cập nhật giỏ hàng
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
            int newQuantity = existingItem.getQuantity() + quantity;
            if (product.getQuantity() < newQuantity) {
                throw new RuntimeException("Số lượng sản phẩm không đủ! Chỉ còn " + product.getQuantity() + " sản phẩm.");
            }
            existingItem.setQuantity(newQuantity);
            existingItem.setAvailable(true);
            existingItem.setImageUrl(product.getImageUrl());
        } else {
            CartItem item = new CartItem();
            item.setProductId(productId);
            item.setProductName(productName);
            item.setPrice(price);
            item.setQuantity(quantity);
            item.setAvailable(true);
            item.setImageUrl(product.getImageUrl());
            cart.getItems().add(item);
        }

        // Không giảm tồn kho tại đây
        return cartRepository.save(cart);
    }

    @Override
    public Cart getCartByUserName(String userName) {
        Cart cart = cartRepository.findByUserName(userName);
        if (cart == null) {
            return null;
        }

        for (CartItem item : cart.getItems()) {
            try {
                System.out.println("Checking product with ID: " + item.getProductId());
                ResponseEntity<ProductDTO> response = restTemplate.exchange(
                        API_GATEWAY_URL + "/products/" + item.getProductId(),
                        HttpMethod.GET,
                        null,
                        ProductDTO.class);
                System.out.println("Response Status: " + response.getStatusCode());
                System.out.println("Response Body: " + response.getBody());
                ProductDTO product = response.getBody();
                if (response.getStatusCode().is2xxSuccessful() && product != null) {
                    item.setAvailable(true);
                    item.setOutOfStock(product.getQuantity() == 0);
                    item.setImageUrl(product.getImageUrl());
                    item.setPrice(product.getPrice().doubleValue());
                    item.setProductName(product.getProductName());
                } else {
                    item.setAvailable(false);
                    item.setOutOfStock(false);
                }
            } catch (HttpClientErrorException ex) {
                System.out.println("Error for Product ID: " + item.getProductId() + ", Status: " + ex.getStatusCode());
                item.setAvailable(false);
                item.setOutOfStock(false);
            } catch (Exception e) {
                System.out.println("Exception for Product ID: " + item.getProductId() + ", Message: " + e.getMessage());
                item.setAvailable(false);
                item.setOutOfStock(false);
            }
        }

        return cartRepository.save(cart);
    }

    @Override
    public void removeProductFromAllCarts(Long productId) {
        List<Cart> allCarts = cartRepository.findAll();
        for (Cart cart : allCarts) {
            boolean modified = cart.getItems().removeIf(item -> item.getProductId().equals(productId));
            if (modified) {
                cartRepository.save(cart);
            }
        }
    }

    @Override
    public Cart updateCartItemQuantity(String userName, Long productId, int newQuantity) {
        Cart cart = cartRepository.findByUserName(userName);
        if (cart == null) {
            throw new RuntimeException("Không tìm thấy giỏ hàng!");
        }

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong giỏ hàng!"));

        // Kiểm tra sản phẩm tồn tại
        ProductDTO product = restTemplate.getForObject(
                API_GATEWAY_URL + "/products/" + productId,
                ProductDTO.class);
        if (product == null) {
            throw new RuntimeException("Sản phẩm không tồn tại!");
        }

        if (newQuantity < 0) {
            throw new RuntimeException("Số lượng không thể nhỏ hơn 0!");
        }

        if (newQuantity == 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(newQuantity);
            item.setAvailable(true);
            item.setImageUrl(product.getImageUrl());
            item.setPrice(product.getPrice().doubleValue());
            item.setProductName(product.getProductName());
        }

        // Không giảm tồn kho tại đây
        return cartRepository.save(cart);
    }
}