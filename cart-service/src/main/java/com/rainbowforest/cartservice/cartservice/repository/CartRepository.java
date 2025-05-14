package com.rainbowforest.cartservice.cartservice.repository;



import org.springframework.data.jpa.repository.JpaRepository;

import com.rainbowforest.cartservice.cartservice.entity.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Cart findByUserName(String userName);
}
