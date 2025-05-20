package com.rainbowforest.orderservice.entity.order_service.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rainbowforest.orderservice.entity.order_service.dto.OrderDto;
import com.rainbowforest.orderservice.entity.order_service.dto.OrderItemDto;
import com.rainbowforest.orderservice.entity.order_service.entity.Order;
import com.rainbowforest.orderservice.entity.order_service.entity.OrderItem;
import com.rainbowforest.orderservice.entity.order_service.service.OrderService;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderData) {
        try {
            String userName = (String) orderData.get("userName");
            String fullName = (String) orderData.get("fullName");
            String phoneNumber = (String) orderData.get("phoneNumber");
            String address = (String) orderData.get("address");
            String note = (String) orderData.get("note");
            String paymentMethod = (String) orderData.get("paymentMethod");
            double totalAmount = Double.parseDouble(orderData.get("totalAmount").toString());
            List<Map<String, Object>> itemsData = (List<Map<String, Object>>) orderData.get("items");

            List<OrderItem> items = itemsData.stream().map(item -> {
                OrderItem orderItem = new OrderItem();
                orderItem.setProductId(Long.valueOf(item.get("productId").toString()));
                orderItem.setProductName((String) item.get("productName"));
                orderItem.setPrice(Double.parseDouble(item.get("price").toString()));
                orderItem.setQuantity(Integer.parseInt(item.get("quantity").toString()));
                orderItem.setImageUrl((String) item.get("imageUrl"));
                return orderItem;
            }).toList();

            Order order = orderService.createOrder(userName, fullName, phoneNumber, address, note, paymentMethod,
                    totalAmount, items);
            OrderDto orderDto = convertToDto(order);
            return new ResponseEntity<>(orderDto, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Lỗi khi tạo đơn hàng: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
            return new ResponseEntity<>("Lỗi khi cập nhật trạng thái: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        try {
            Order order = orderService.cancelOrder(orderId);
            OrderDto orderDto = convertToDto(order);
            return new ResponseEntity<>(orderDto, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Lỗi khi hủy đơn hàng: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private OrderDto convertToDto(Order order) {
        OrderDto orderDto = new OrderDto();
        orderDto.setId(order.getId());
        orderDto.setUserName(order.getUserName());
        orderDto.setFullName(order.getFullName());
        orderDto.setPhoneNumber(order.getPhoneNumber());
        orderDto.setAddress(order.getAddress());
        orderDto.setNote(order.getNote());
        orderDto.setPaymentMethod(order.getPaymentMethod());
        orderDto.setOrderDate(order.getOrderDate());
        orderDto.setTotalAmount(order.getTotalAmount());
        orderDto.setStatus(order.getStatus());
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