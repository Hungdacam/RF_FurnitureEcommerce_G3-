package com.rainbowforest.orderservice.entity.order_service.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.rainbowforest.orderservice.entity.order_service.dto.OrderDto;
import com.rainbowforest.orderservice.entity.order_service.dto.OrderItemDto;
import com.rainbowforest.orderservice.entity.order_service.dto.ProductDTO;
import com.rainbowforest.orderservice.entity.order_service.entity.Order;
import com.rainbowforest.orderservice.entity.order_service.entity.OrderItem;
import com.rainbowforest.orderservice.entity.order_service.service.OrderService;
import com.rainbowforest.orderservice.entity.order_service.service.EmailService;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private EmailService emailService;

    @Autowired
    private HttpServletRequest request;

    private static final String API_GATEWAY_URL = "http://localhost:8900/api/catalog";
    private static final String CART_API_URL = "http://localhost:8900/api/cart";

    @PostMapping("/create")
    @Transactional
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderData) {
        try {
            String userName = (String) orderData.get("userName");
            String fullName = (String) orderData.get("fullName");
            String phoneNumber = (String) orderData.get("phoneNumber");
            String buyerPhoneNumber = (String) orderData.get("buyerPhoneNumber");
            String address = (String) orderData.get("address");
            String note = (String) orderData.get("note");
            String paymentMethod = (String) orderData.get("paymentMethod");
            double totalAmount = Double.parseDouble(orderData.get("totalAmount").toString());
            List<Map<String, Object>> itemsData = (List<Map<String, Object>>) orderData.get("items");

          
            for (Map<String, Object> item : itemsData) {
                Long productId = Long.valueOf(item.get("productId").toString());
                int requestedQuantity = Integer.parseInt(item.get("quantity").toString());

                try {
                    ProductDTO product = restTemplate.getForObject(
                            API_GATEWAY_URL + "/products/" + productId,
                            ProductDTO.class);
                    if (product == null) {
                        return new ResponseEntity<>(
                                Map.of("error", "Sản phẩm " + productId + " không tồn tại!"),
                                HttpStatus.BAD_REQUEST);
                    }
                    if (product.getQuantity() < requestedQuantity) {
                        return new ResponseEntity<>(
                                Map.of("error",
                                        "Số lượng sản phẩm " + product.getProductName() + " không đủ! Chỉ còn "
                                                + product.getQuantity() + " sản phẩm."),
                                HttpStatus.BAD_REQUEST);
                    }
                } catch (HttpClientErrorException e) {
                    return new ResponseEntity<>(
                            Map.of("error",
                                    "Không thể kiểm tra tồn kho cho sản phẩm " + productId + ": " + e.getMessage()),
                            HttpStatus.SERVICE_UNAVAILABLE);
                }
            }

           
            List<OrderItem> items = itemsData.stream().map(item -> {
                OrderItem orderItem = new OrderItem();
                orderItem.setProductId(Long.valueOf(item.get("productId").toString()));
                orderItem.setProductName((String) item.get("productName"));
                orderItem.setPrice(Double.parseDouble(item.get("price").toString()));
                orderItem.setQuantity(Integer.parseInt(item.get("quantity").toString()));
                orderItem.setImageUrl((String) item.get("imageUrl"));
                return orderItem;
            }).toList();

       
            Order order = orderService.createOrder(userName, fullName, phoneNumber, buyerPhoneNumber, address, note,
                    paymentMethod, totalAmount, items);

           
            String jwtToken = getJwtToken();
            for (Map<String, Object> item : itemsData) {
                Long productId = Long.valueOf(item.get("productId").toString());
                int requestedQuantity = Integer.parseInt(item.get("quantity").toString());

                ProductDTO product = restTemplate.getForObject(
                        API_GATEWAY_URL + "/products/" + productId,
                        ProductDTO.class);

                MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
                map.add("product_name", product.getProductName());
                map.add("category", product.getCategory());
                map.add("description", product.getDescription() != null ? product.getDescription() : "");
                map.add("price", product.getPrice().toString());
                map.add("quantity", String.valueOf(product.getQuantity() - requestedQuantity));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);
                if (jwtToken != null) {
                    headers.set("Authorization", "Bearer " + jwtToken);
                }

                HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(map, headers);

                try {
                    restTemplate.put(API_GATEWAY_URL + "/admin/products/" + productId, requestEntity);
                } catch (HttpClientErrorException e) {
                    System.err.println("Lỗi khi cập nhật tồn kho sản phẩm " + productId + ": " + e.getMessage());
                    throw e;
                }
            }

            for (Map<String, Object> item : itemsData) {
                Long productId = Long.valueOf(item.get("productId").toString());
                String url = CART_API_URL + "/update-quantity?userName=" + userName + "&productId=" + productId
                        + "&quantity=0";

                HttpHeaders headers = new HttpHeaders();
                if (jwtToken != null) {
                    headers.set("Authorization", "Bearer " + jwtToken);
                }

                HttpEntity<?> cartRequestEntity = new HttpEntity<>(headers);

                try {
                    System.out.println("Gửi yêu cầu xóa giỏ hàng: " + url);
                    restTemplate.exchange(url, org.springframework.http.HttpMethod.PUT, cartRequestEntity, Void.class);
                } catch (HttpClientErrorException e) {
                    System.err.println("Lỗi khi xóa sản phẩm " + productId + " khỏi giỏ hàng: " + e.getMessage());
                    if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                        return new ResponseEntity<>(
                                Map.of("error", "Không có quyền xóa sản phẩm khỏi giỏ hàng: " + e.getMessage()),
                                HttpStatus.FORBIDDEN);
                    }
                    throw e;
                }
            }

            String recipientEmail = (String) orderData.get("email");
            if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
                System.err.println("Không tìm thấy email trong orderData cho user: " + userName);
            }

            OrderDto orderDto = convertToDto(order);

            // Gửi email xác nhận
            if (recipientEmail != null && !recipientEmail.trim().isEmpty()) {
                try {
                    emailService.sendOrderConfirmationEmail(recipientEmail, orderDto);
                    System.out.println("Email xác nhận đã gửi thành công tới: " + recipientEmail);
                } catch (Exception e) {
                    System.err.println("Lỗi gửi email xác nhận tới " + recipientEmail + ": " + e.getMessage());
                }
            } else {
                System.err.println("Không gửi được email xác nhận do thiếu email cho user: " + userName);
            }

            return new ResponseEntity<>(orderDto, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Lỗi tạo đơn hàng: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(
                    Map.of("error", "Lỗi khi tạo đơn hàng: " + e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String getJwtToken() {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    @GetMapping("/user")
    public ResponseEntity<List<OrderDto>> getOrdersByUserName(@RequestParam String userName) {
        List<Order> orders = orderService.getOrdersByUserName(userName);
        List<OrderDto> orderDtos = orders.stream().map(this::convertToDto).collect(Collectors.toList());
        return new ResponseEntity<>(orderDtos, HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        List<OrderDto> orderDtos = orders.stream().map(this::convertToDto).collect(Collectors.toList());
        return new ResponseEntity<>(orderDtos, HttpStatus.OK);
    }

    @PutMapping("/update-status/{orderId}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId,
            @RequestBody Map<String, String> statusData) {
        try {
            String status = statusData.get("status");
            Order order = orderService.updateOrderStatus(orderId, status);
            OrderDto orderDto = convertToDto(order);
            return new ResponseEntity<>(orderDto, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(
                    Map.of("error", "Lỗi khi cập nhật trạng thái: " + e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        try {
            String jwtToken = getJwtToken();
            Order order = orderService.cancelOrder(orderId, jwtToken);
            OrderDto orderDto = convertToDto(order);

            
            String recipientEmail = null; 
            if (recipientEmail != null && !recipientEmail.trim().isEmpty()) {
                try {
                    emailService.sendOrderCancellationEmail(recipientEmail, orderDto);
                    System.out.println("Email hủy đơn hàng đã gửi thành công tới: " + recipientEmail);
                } catch (Exception e) {
                    System.err.println("Lỗi gửi email hủy đơn hàng tới " + recipientEmail + ": " + e.getMessage());
                }
            } else {
                System.err.println("Không gửi được email hủy đơn do thiếu email cho user: " + order.getUserName());
            }

            return new ResponseEntity<>(orderDto, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(
                    Map.of("error", "Lỗi khi hủy đơn hàng: " + e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private OrderDto convertToDto(Order order) {
        OrderDto orderDto = new OrderDto();
        orderDto.setId(order.getId());
        orderDto.setUserName(order.getUserName());
        orderDto.setFullName(order.getFullName());
        orderDto.setPhoneNumber(order.getPhoneNumber());
        orderDto.setBuyerPhoneNumber(order.getBuyerPhoneNumber());
        orderDto.setAddress(order.getAddress());
        orderDto.setNote(order.getNote());
        orderDto.setPaymentMethod(order.getPaymentMethod());
        orderDto.setOrderDate(order.getOrderDate());
        orderDto.setTotalAmount(order.getTotalAmount());
        orderDto.setStatus(order.getStatus());
        orderDto.setInvoiceCode(order.getInvoiceCode());
        orderDto.setItems(order.getItems().stream().map(item -> {
            OrderItemDto itemDto = new OrderItemDto();
            itemDto.setProductId(item.getProductId());
            itemDto.setProductName(item.getProductName());
            itemDto.setPrice(item.getPrice());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setImageUrl(item.getImageUrl());
            return itemDto;
        }).collect(Collectors.toList()));
        return orderDto;
    }
}