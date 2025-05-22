package com.rainbowforest.statisticsservice.client;

import com.rainbowforest.statisticsservice.dto.OrderDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "order-service", path = "/api/orders")
public interface OrderServiceClient {
    @GetMapping("/all")
    List<OrderDto> getAllOrders();

    @GetMapping("/delivered")
    List<OrderDto> getDeliveredOrders();


}
