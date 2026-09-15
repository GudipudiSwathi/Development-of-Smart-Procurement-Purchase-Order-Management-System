package com.eps.enterpriseprocurementsystem.repository;

import com.eps.enterpriseprocurementsystem.entity.Supplier;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface SupplierRepository
        extends JpaRepository<Supplier, Long> {


    // =====================================================
    // GST
    // =====================================================

    Optional<Supplier> findByGstNumber(
            String gstNumber
    );


    // =====================================================
    // CATEGORY
    // =====================================================

    List<Supplier> findByCategoryCategoryId(
            Long categoryId
    );


    // =====================================================
    // USER
    // =====================================================

    Optional<Supplier> findByUserUserId(
            Long userId
    );


    // =====================================================
    // USERNAME
    // =====================================================

    Optional<Supplier> findByUserUsername(
            String username
    );

}