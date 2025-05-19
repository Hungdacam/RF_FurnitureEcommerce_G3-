package com.rainbowforest.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {

        @Bean
        public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
                return builder.routes()
                                .route("user-service", r -> r
                                                .path("/api/accounts/**", "/api/users/**")
                                                .filters(f -> f
                                                                .rewritePath("/api/accounts/(?<segment>.*)",
                                                                                "/${segment}")
                                                                .rewritePath("/api/users/(?<segment>.*)",
                                                                                "/api/users/${segment}") // Thêm dòng
                                                                                                         // này
                                                                .circuitBreaker(config -> config
                                                                                .setName("userServiceCircuitBreaker")
                                                                                .setFallbackUri("forward:/fallback/user")))
                                                .uri("lb://user-service"))
                                .route("user-service-login", r -> r
                                                .path("/api/login")
                                                .filters(f -> f
                                                                .rewritePath("/api/login", "/api/login")
                                                                .circuitBreaker(config -> config
                                                                                .setName("userServiceCircuitBreaker")
                                                                                .setFallbackUri("forward:/fallback/user")))
                                                .uri("lb://user-service"))
                                .route("user-service-logout", r -> r
                                                .path("/api/logout")
                                                .filters(f -> f
                                                                .rewritePath("/api/logout", "/api/logout")
                                                                .circuitBreaker(config -> config
                                                                                .setName("userServiceCircuitBreaker")
                                                                                .setFallbackUri("forward:/fallback/user")))
                                                .uri("lb://user-service"))
                                .route("user-service-registration", r -> r
                                                .path("/api/registration")
                                                .filters(f -> f
                                                        .rewritePath("/api/registration", "/api/registration")
                                                        .circuitBreaker(config -> config
                                                                .setName("userServiceCircuitBreaker")
                                                                .setFallbackUri("forward:/fallback/user")))
                                                .uri("lb://user-service"))
                                .route("product-catalog-service", r -> r
                                                .path("/api/catalog/**")
                                                .filters(f -> f
//                                                                .rewritePath("/api/catalog/(?<segment>.*)",
//                                                                                "/api/catalog/${segment}")
                                                                .circuitBreaker(config -> config
                                                                                .setName("catalogServiceCircuitBreaker")
                                                                                .setFallbackUri("forward:/fallback/catalog")))
                                                .uri("lb://product-catalog-service"))
                                .route("order-service", r -> r
                                                .path("/api/shop/**")
                                                .filters(f -> f
                                                                .rewritePath("/api/shop/(?<segment>.*)", "/${segment}")
                                                                .circuitBreaker(config -> config
                                                                                .setName("orderServiceCircuitBreaker")
                                                                                .setFallbackUri("forward:/fallback/order")))
                                                .uri("lb://order-service"))
                                .route("product-recommendation-service", r -> r
                                                .path("/api/review/**")
                                                .filters(f -> f
                                                                .rewritePath("/api/review/(?<segment>.*)",
                                                                                "/${segment}")
                                                                .circuitBreaker(config -> config
                                                                                .setName("recommendationServiceCircuitBreaker")
                                                                                .setFallbackUri("forward:/fallback/recommendation")))
                                                .uri("lb://product-recommendation-service"))
                                .build();
        }
}