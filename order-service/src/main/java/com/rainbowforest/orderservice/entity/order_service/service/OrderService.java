package com.rainbowforest.orderservice.entity.order_service.service;

import java.util.List;

import com.rainbowforest.orderservice.entity.order_service.entity.Order;
import com.rainbowforest.orderservice.entity.order_service.entity.OrderItem;

public interface OrderService {
    Order createOrder(String userName, String fullName, String phoneNumber, String address, String note, String paymentMethod, double totalAmount, List<OrderItem> items);
    List<Order> getOrdersByUserName(String userName);
    Order updateOrderStatus(Long orderId, String status);
    Order cancelOrder(Long orderId, String jwtToken);
    List<Order> getAllOrders();
    List<Order> findOrdersByInvoiceCode(String invoiceCode); 
}