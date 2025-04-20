package com.rainbowforest.userservice.entity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterResponse {
    private Long userId;
    private String userName;
    private String token;
}