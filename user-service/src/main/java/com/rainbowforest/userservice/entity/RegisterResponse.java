package com.rainbowforest.userservice.entity;

public class RegisterResponse {
    private Long userId;
    private String userName;
    private String token;
    private String message;

    // Constructors
    public RegisterResponse() {}

    public RegisterResponse(Long userId, String userName, String token, String message) {
        this.userId = userId;
        this.userName = userName;
        this.token = token;
        this.message = message;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}