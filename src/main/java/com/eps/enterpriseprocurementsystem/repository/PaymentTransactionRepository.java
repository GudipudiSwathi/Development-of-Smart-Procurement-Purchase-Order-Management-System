package com.eps.enterpriseprocurementsystem.repository;

import com.eps.enterpriseprocurementsystem.entity.PaymentTransaction;
import com.eps.enterpriseprocurementsystem.enums.PaymentTransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository
        extends JpaRepository<PaymentTransaction, Long> {


    // =====================================================
    // FIND BY TRANSACTION REFERENCE
    // =====================================================

    Optional<PaymentTransaction> findByTransactionReference(
            String transactionReference
    );


    // =====================================================
    // FIND ALL TRANSACTIONS FOR PURCHASE REQUEST
    // =====================================================

    List<PaymentTransaction>
    findByPurchaseRequestPurchaseRequestId(
            Long purchaseRequestId
    );


    // =====================================================
    // FIND ALL TRANSACTIONS FOR SUPPLIER
    // =====================================================

    List<PaymentTransaction>
    findBySupplierSupplierId(
            Long supplierId
    );


    // =====================================================
    // FIND ALL TRANSACTIONS FOR USER
    // =====================================================

    List<PaymentTransaction>
    findByUserUserId(
            Long userId
    );


    // =====================================================
    // FIND BY PURCHASE REQUEST + SUPPLIER
    // =====================================================

    Optional<PaymentTransaction>
    findByPurchaseRequestPurchaseRequestIdAndSupplierSupplierId(
            Long purchaseRequestId,
            Long supplierId
    );


    // =====================================================
    // FIND BY STATUS
    // =====================================================

    List<PaymentTransaction>
    findByPaymentStatus(
            PaymentTransactionStatus paymentStatus
    );
}