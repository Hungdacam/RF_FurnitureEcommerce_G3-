package com.rainbowforest.apigateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/user")
    public Mono<ResponseEntity<Map<String, String>>> userServiceFallback() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "User Service is currently unavailable. Please try again later.");
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response));
    }

    @RequestMapping(value = "/catalog", method = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT })
    public ResponseEntity<String> catalogFallback() {
        System.out.println(">>> Gateway: Fallback for catalog service triggered");
        return new ResponseEntity<>("Catalog service is temporarily unavailable", HttpStatus.SERVICE_UNAVAILABLE);
    }

    @GetMapping("/order")
    public Mono<ResponseEntity<Map<String, String>>> orderServiceFallback() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Order Service is currently unavailable. Please try again later.");
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response));
    }

    @GetMapping("/recommendation")
    public Mono<ResponseEntity<Map<String, String>>> recommendationServiceFallback() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Product Recommendation Service is currently unavailable. Please try again later.");
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response));
    }
}