package com.rainbowforest.cartservice.cartservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.rainbowforest.cartservice.dto.UserDto;

import org.springframework.web.client.RestTemplate;

import java.util.Collections;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Chỉ trả về UserDetails với username và role mặc định (hoặc lấy từ JWT)
        // Nếu muốn lấy role từ JWT, hãy truyền role qua claim và lấy ở JwtFilter
        return new org.springframework.security.core.userdetails.User(
            username,
            "",
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")) // hoặc lấy role từ JWT
        );
    }
}