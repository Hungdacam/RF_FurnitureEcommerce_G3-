package com.rainbowforest.cartservice.cartservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.rainbowforest.cartservice.cartservice.entity.Cart;
import com.rainbowforest.cartservice.cartservice.entity.CartItem;
import com.rainbowforest.cartservice.cartservice.repository.CartRepository;
import com.rainbowforest.cartservice.dto.ProductDTO;

import org.springframework.http.HttpMethod;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import com.rainbowforest.cartservice.dto.UserDto;


@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private RestTemplate restTemplate;

    private static final String API_GATEWAY_URL = "http://localhost:8900/api/catalog";

    @Override
    public Cart addToCart(String userName, Long productId, String productName, double price, int quantity, String jwtToken) {
        // Lấy thông tin sản phẩm từ product-catalog-service
        ProductDTO product = restTemplate.getForObject(
            API_GATEWAY_URL + "/products/" + productId,
            ProductDTO.class
        );
        if (product == null || product.getQuantity() < quantity) {
            throw new RuntimeException("Số lượng sản phẩm không đủ!");
        }

        // Gọi user-service qua API Gateway để xác thực user, gửi kèm JWT
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwtToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<UserDto> userResponse = restTemplate.exchange(
                "http://localhost:8900/api/users/by-username?username=" + userName,
                HttpMethod.GET,
                entity,
                UserDto.class
            );
            if (!userResponse.getStatusCode().is2xxSuccessful() || userResponse.getBody() == null) {
                throw new RuntimeException("Không xác thực được user!");
            }
        } catch (HttpClientErrorException | HttpServerErrorException ex) {
            throw new RuntimeException("Lỗi xác thực user: " + ex.getStatusCode());
        }

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
                throw new RuntimeException("Số lượng sản phẩm không đủ!");
            }
            existingItem.setQuantity(newQuantity);
        } else {
            CartItem item = new CartItem();
            item.setProductId(productId);
            item.setProductName(productName);
            item.setPrice(price);
            item.setQuantity(quantity);
            cart.getItems().add(item);
        }

        // Cập nhật số lượng tồn kho
        updateProductQuantity(productId, product);

        return cartRepository.save(cart);
    
    }

    @Override
    public Cart getCartByUserName(String userName) {
        return cartRepository.findByUserName(userName);
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

        ProductDTO product = restTemplate.getForObject(
            API_GATEWAY_URL + "/products/" + productId,
            ProductDTO.class
        );
        if (product == null) {
            throw new RuntimeException("Không tìm thấy sản phẩm!");
        }

        // Nếu số lượng mới là 0, xóa sản phẩm khỏi giỏ hàng
        if (newQuantity == 0) {
            cart.getItems().remove(item);
            // Hoàn lại số lượng tồn kho
            product.setQuantity(product.getQuantity() + item.getQuantity());
            updateProductQuantity(productId, product);
        } else {
            int quantityDifference = newQuantity - item.getQuantity();
            if (quantityDifference > 0 && product.getQuantity() < quantityDifference) {
                throw new RuntimeException("Số lượng sản phẩm không đủ!");
            }
            item.setQuantity(newQuantity);
            product.setQuantity(product.getQuantity() - quantityDifference);
            updateProductQuantity(productId, product);
        }

        return cartRepository.save(cart);
    }

    private void updateProductQuantity(Long productId, ProductDTO product) {
        try {
            // Tạo dữ liệu dạng multipart/form-data
            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("product_name", product.getProductName());
            map.add("category", product.getCategory());
            map.add("description", product.getDescription() != null ? product.getDescription() : "");
            map.add("price", product.getPrice().toString());
            map.add("quantity", String.valueOf(product.getQuantity()));
            // Không cần gửi image vì đây là cập nhật số lượng

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(map, headers);

            restTemplate.put(API_GATEWAY_URL + "/admin/products/" + productId, requestEntity);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi cập nhật số lượng sản phẩm: " + e.getMessage(), e);
        }
    }
}