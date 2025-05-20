package com.rainbowforest.orderservice.entity.order_service.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.rainbowforest.orderservice.entity.order_service.entity.Order;

import feign.Param;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = { "items" })
    List<Order> findByUserName(String userName);

    @EntityGraph(attributePaths = { "items" })
    List<Order> findAll();

    @EntityGraph(attributePaths = { "items" })
    Optional<Order> findById(Long id);

    @Query(value = "SELECT COUNT(*) FROM orders WHERE order_date >= :start AND order_date < :end", nativeQuery = true)
    long countOrdersInDay(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

  
    List<Order> findByInvoiceCode(String invoiceCode);
}