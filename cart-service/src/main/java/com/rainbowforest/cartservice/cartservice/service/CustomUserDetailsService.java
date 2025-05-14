package com.rainbowforest.cartservice.cartservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.rainbowforest.cartservice.dto.UserDto;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserServiceClient userServiceClient;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserDto user = userServiceClient.getUserByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }
        // Vì UserDto chỉ có 1 roleName, nên tạo list quyền với 1 phần tử
        return new User(
                user.getUserName(),
                "", // Không cần password ở đây
                Collections.singletonList(new SimpleGrantedAuthority(user.getRoleName()))
        );
    }
}