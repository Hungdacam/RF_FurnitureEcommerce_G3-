package com.rainbowforest.orderservice.entity.order_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rainbowforest.orderservice.entity.order_service.entity.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = { "items" })
    List<Order> findByUserName(String userName);

    @EntityGraph(attributePaths = { "items" })
    List<Order> findAll();

    @EntityGraph(attributePaths = {"items"})
    Optional<Order> findById(Long id);
}