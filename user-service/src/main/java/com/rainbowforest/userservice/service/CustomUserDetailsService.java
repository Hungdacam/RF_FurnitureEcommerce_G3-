package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUserName(username);
        if (user == null) {
            throw new UsernameNotFoundException("Không tìm thấy người dùng: " + username);
        }

        return new org.springframework.security.core.userdetails.User(
                user.getUserName(),
                user.getUserPassword(),
                user.getActive() == 1,
                true, true, true,
                Collections.singleton(new SimpleGrantedAuthority(user.getRole().getRoleName()))
        );
    }
}
