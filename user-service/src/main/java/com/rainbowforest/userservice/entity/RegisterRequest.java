package com.rainbowforest.userservice.entity;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3-50 ký tự")
    private String userName;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 50, message = "Mật khẩu phải từ 6-50 ký tự")
    private String userPassword;

    private com.rainbowforest.userservice.entity.UserDetails userDetails;

    // Getters and setters
    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPassword() {
        return userPassword;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
    }

    public com.rainbowforest.userservice.entity.UserDetails getUserDetails() {
        return userDetails;
    }

    public void setUserDetails(com.rainbowforest.userservice.entity.UserDetails userDetails) {
        this.userDetails = userDetails;
    }
}