package com.eps.enterpriseprocurementsystem.repository;

import com.eps.enterpriseprocurementsystem.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // =====================================================
    // ADMIN / GENERAL
    // =====================================================

    Optional<Product> findByName(String name);


    // =====================================================
    // SUPPLIER PRODUCTS
    // =====================================================

    List<Product> findByUserUserId(Long userId);

    Optional<Product> findByProductIdAndUserUserId(
            Long productId,
            Long userId
    );


    // =====================================================
    // CHECK PRODUCT NAME FOR SAME SUPPLIER
    // =====================================================

    Optional<Product> findByNameIgnoreCaseAndUserUserId(
            String name,
            Long userId
    );
}