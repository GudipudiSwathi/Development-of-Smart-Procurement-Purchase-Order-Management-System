package com.eps.enterpriseprocurementsystem.repository;

import com.eps.enterpriseprocurementsystem.entity.PurchaseRequest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface PurchaseRequestRepository
        extends JpaRepository<PurchaseRequest, Long> {


    // =====================================================
    // EMPLOYEE REQUESTS
    // =====================================================

    List<PurchaseRequest> findByUserUserId(
            Long userId
    );


    // =====================================================
    // SUPPLIER REQUESTS
    // =====================================================
    //
    // Finds purchase requests containing at least one
    // item assigned to the specified supplier.
    //
    // DISTINCT prevents duplicate purchase requests when
    // multiple items belong to the same supplier.
    //
    // =====================================================

    List<PurchaseRequest>
    findDistinctByItemsSupplierSupplierId(
            Long supplierId
    );

}