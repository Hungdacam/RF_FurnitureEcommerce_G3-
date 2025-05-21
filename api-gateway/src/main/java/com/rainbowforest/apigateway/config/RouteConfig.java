package com.rainbowforest.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpCookie;
import org.springframework.http.server.reactive.ServerHttpRequest;

import java.util.List;

@Configuration
public class RouteConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service-users", r -> r
                        .path("/api/users")
                        .filters(f -> f
                                .filter((exchange, chain) -> {
                                    System.out.println(">>> Gateway: Request Path: " + exchange.getRequest().getPath());
                                    System.out.println(">>> Gateway: Request Method: " + exchange.getRequest().getMethod());
                                    System.out.println(">>> Gateway: Headers: " + exchange.getRequest().getHeaders());
                                    System.out.println(">>> Gateway: Cookies: " + exchange.getRequest().getCookies());
                                    List<HttpCookie> tokenCookies = exchange.getRequest().getCookies().get("token");
                                    if (tokenCookies != null && !tokenCookies.isEmpty()) {
                                        System.out.println(">>> Gateway: Token cookie received: " + tokenCookies.get(0).getValue());
                                    } else {
                                        System.out.println(">>> Gateway: No token cookie received");
                                    }
                                    return chain.filter(exchange);
                                })
                                .filter((exchange, chain) -> {
                                    ServerHttpRequest.Builder requestBuilder = exchange.getRequest().mutate();
                                    List<HttpCookie> tokenCookies = exchange.getRequest().getCookies().get("token");
                                    if (tokenCookies != null && !tokenCookies.isEmpty()) {
                                        String tokenValue = tokenCookies.get(0).getValue();
                                        System.out.println(">>> Gateway: Forwarding cookie token: " + tokenValue);
                                        requestBuilder.header("Cookie", "token=" + tokenValue);
                                    } else {
                                        System.out.println(">>> Gateway: No token cookie to forward");
                                    }
                                    ServerHttpRequest modifiedRequest = requestBuilder.build();
                                    System.out.println(">>> Gateway: Modified request headers: " + modifiedRequest.getHeaders());
                                    return chain.filter(exchange.mutate().request(modifiedRequest).build());
                                })
                                .circuitBreaker(config -> config
                                        .setName("userServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/user")))
                        .uri("lb://user-service"))
                .route("user-service-other", r -> r
                        .path("/api/users/**")
                        .filters(f -> f
                                .filter((exchange, chain) -> {
                                    System.out.println(">>> Gateway: Request Path: " + exchange.getRequest().getPath());
                                    System.out.println(">>> Gateway: Request Method: " + exchange.getRequest().getMethod());
                                    System.out.println(">>> Gateway: Headers: " + exchange.getRequest().getHeaders());
                                    System.out.println(">>> Gateway: Cookies: " + exchange.getRequest().getCookies());
                                    return chain.filter(exchange);
                                })
                                .rewritePath("/api/users/(?<segment>.*)", "/api/users/${segment}")
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
                                .filter((exchange, chain) -> {
                                    String originalPath = exchange.getRequest().getPath().toString();
                                    System.out.println(">>> Gateway: Original request path: " + originalPath);
                                    String rewrittenPath = originalPath.replaceFirst("/api/catalog/(.*)", "/$1");
                                    System.out.println(">>> Gateway: Rewritten path: " + rewrittenPath);
                                    return chain.filter(exchange)
                                            .doOnSuccess(aVoid -> {
                                                System.out.println(">>> Gateway: Response status: "
                                                        + exchange.getResponse().getStatusCode());
                                            })
                                            .doOnError(error -> {
                                                System.err.println(">>> Gateway: Error: " + error.getMessage());
                                            });
                                })
                                .rewritePath("/api/catalog/(?<segment>.*)", "/${segment}")
                                .preserveHostHeader())
                        .uri("lb://product-catalog-service"))
                .route("order-service", r -> r
                        .path("/api/orders/**")
                        .filters(f -> f
                                .rewritePath("/api/orders/(?<segment>.*)", "/api/orders/${segment}")
                                .preserveHostHeader())
                        .uri("lb://order-service"))
                .route("product-recommendation-service", r -> r
                        .path("/api/review/**")
                        .filters(f -> f
                                .rewritePath("/api/review/(?<segment>.*)", "/${segment}")
                                .circuitBreaker(config -> config
                                        .setName("recommendationServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/recommendation")))
                        .uri("lb://product-recommendation-service"))
                .route("cart-service", r -> r
                        .path("/api/cart/**")
                        .filters(f -> f
                                .addRequestHeader("X-Debug", "true")
                                .rewritePath("/api/cart/(?<segment>.*)", "/api/cart/${segment}")
                                .circuitBreaker(config -> config
                                        .setName("cartServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/cart")))
                        .uri("lb://cart-service"))
                .route("statistics-service", r -> r
                        .path("/api/statistics/**")
                        .filters(f -> f
                                .rewritePath("/api/statistics/(?<segment>.*)", "/api/statistics/${segment}")
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
                                .addResponseHeader("Access-Control-Allow-Origin", "http://localhost:5173")
                                .addResponseHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                                .addResponseHeader("Access-Control-Allow-Headers", "*")
                                .addResponseHeader("Access-Control-Allow-Credentials", "true"))
                        .uri("no://op"))
                .build();
    }
}