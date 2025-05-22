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
                                .route("options_route", r -> r
                                                .path("/**")
                                                .and()
                                                .method("OPTIONS")
                                                .filters(f -> f
                                                                .setStatus(200)
                                                                .addResponseHeader("Access-Control-Allow-Origin",
                                                                                "http://localhost:5173")
                                                                .addResponseHeader("Access-Control-Allow-Methods",
                                                                                "GET, POST, PUT, DELETE, OPTIONS")
                                                                .addResponseHeader("Access-Control-Allow-Headers", "*")
                                                                .addResponseHeader("Access-Control-Allow-Credentials",
                                                                                "true"))
                                                .uri("no://op"))
                                .route("user-service", r -> r
                                                .path("/api/accounts/**", "/api/users/**")
                                                .filters(f -> f
                                                                .rewritePath("/api/accounts/(?<segment>.*)",
                                                                                "/${segment}")
                                                                .rewritePath("/api/users/(?<segment>.*)",
                                                                                "/api/users/${segment}")
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
                                                                .filter((exchange, chain) -> {
                                                                        System.out.println(
                                                                                        ">>> Gateway: Sending request to user-service: "
                                                                                                        + exchange.getRequest()
                                                                                                                        .getURI());
                                                                        return chain.filter(exchange)
                                                                                        .doOnSuccess(aVoid -> {
                                                                                                System.out.println(
                                                                                                                ">>> Gateway: Response status: "
                                                                                                                                + exchange.getResponse()
                                                                                                                                                .getStatusCode());
                                                                                        })
                                                                                        .doOnError(error -> {
                                                                                                System.err.println(
                                                                                                                ">>> Gateway: Error: "
                                                                                                                                + error.getMessage());
                                                                                        });
                                                                }))
                                                .uri("lb://user-service"))
                                .route("user-service-verify-otp", r -> r
                                                .path("/api/verify-otp")
                                                .filters(f -> f
                                                                .rewritePath("/api/verify-otp", "/api/verify-otp")
                                                                .circuitBreaker(config -> config
                                                                                .setName("userServiceCircuitBreaker")
                                                                                .setFallbackUri("forward:/fallback/user")))
                                                .uri("lb://user-service"))
                                .route("user-service-resend-otp", r -> r
                                                .path("/api/resend-otp")
                                                .filters(f -> f
                                                                .rewritePath("/api/resend-otp", "/api/resend-otp")
                                                                .circuitBreaker(config -> config
                                                                                .setName("userServiceCircuitBreaker")
                                                                                .setFallbackUri("forward:/fallback/user")))
                                                .uri("lb://user-service"))
                                .route("product-catalog-service", r -> r
                                                .path("/api/catalog/**")
                                                .filters(f -> f
                                                                .filter((exchange, chain) -> {
                                                                        String originalPath = exchange.getRequest()
                                                                                        .getPath().toString();
                                                                        System.out.println(
                                                                                        ">>> Gateway: Original request path: "
                                                                                                        + originalPath);
                                                                        String rewrittenPath = originalPath
                                                                                        .replaceFirst("/api/catalog/(.*)",
                                                                                                        "/$1");
                                                                        System.out.println(
                                                                                        ">>> Gateway: Rewritten path: "
                                                                                                        + rewrittenPath);

                                                                        return chain.filter(exchange)
                                                                                        .doOnSuccess(aVoid -> {
                                                                                                System.out.println(
                                                                                                                ">>> Gateway: Response status: "
                                                                                                                                + exchange.getResponse()
                                                                                                                                                .getStatusCode());
                                                                                        })
                                                                                        .doOnError(error -> {
                                                                                                System.err.println(
                                                                                                                ">>> Gateway: Error: "
                                                                                                                                + error.getMessage());
                                                                                        });
                                                                })
                                                                .rewritePath("/api/catalog/(?<segment>.*)",
                                                                                "/${segment}")
                                                                .preserveHostHeader())
                                                .uri("lb://product-catalog-service"))
                                .route("order-service", r -> r
                                                .path("/api/orders/**")
                                                .filters(f -> f
                                                                .rewritePath("/api/orders/(?<segment>.*)",
                                                                                "/api/orders/${segment}")
                                                                .preserveHostHeader())
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
                                .route("cart-service", r -> r
                                                .path("/api/cart/**")
                                                .filters(f -> f
                                                                .addRequestHeader("X-Debug", "true") // Thêm header để
                                                                                                     // debug
                                                                .rewritePath("/api/cart/(?<segment>.*)",
                                                                                "/api/cart/${segment}")
                                                                .circuitBreaker(config -> config
                                                                                .setName("cartServiceCircuitBreaker")
                                                                                .setFallbackUri("forward:/fallback/cart")))
                                                .uri("lb://cart-service"))
                                .route("statistics-service", r -> r
                                                .path("/api/statistics/**")
                                                .filters(f -> f
                                                                .rewritePath("/api/statistics/(?<segment>.*)",
                                                                                "/api/statistics/${segment}")
                                                                .circuitBreaker(config -> config
                                                                                .setName("statisticsServiceCircuitBreaker")
                                                                                .setFallbackUri("forward:/fallback/statistics")))
                                                .uri("lb://statistics-service"))
                                .route("options_route", r -> r
                                                .path("/**")
                                                .and()
                                                .method("OPTIONS")
                                                .filters(f -> f
                                                                .setStatus(200)
                                                                .addResponseHeader("Access-Control-Allow-Origin",
                                                                                "http://localhost:5173")
                                                                .addResponseHeader("Access-Control-Allow-Methods",
                                                                                "GET, POST, PUT, DELETE, OPTIONS")
                                                                .addResponseHeader("Access-Control-Allow-Headers", "*")
                                                                .addResponseHeader("Access-Control-Allow-Credentials",
                                                                                "true"))
                                                .uri("no://op"))

                                .build();

        }
}