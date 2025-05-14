package com.rainbowforest.cartservice.cartservice.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import com.rainbowforest.cartservice.dto.UserDto;

@FeignClient(name = "user-service", configuration = com.rainbowforest.cartservice.cartservice.config.FeignConfig.class)
public interface UserServiceClient {
    @GetMapping("/api/users/by-username")
    UserDto getUserByUsername(@RequestParam("username") String username);
}