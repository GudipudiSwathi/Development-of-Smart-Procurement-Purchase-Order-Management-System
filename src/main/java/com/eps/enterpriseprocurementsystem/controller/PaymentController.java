package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.PaymentProcessDTO;
import com.eps.enterpriseprocurementsystem.dto.PaymentTransactionDTO;
import com.eps.enterpriseprocurementsystem.enums.PaymentMethod;
import com.eps.enterpriseprocurementsystem.service.PaymentService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;


    // =========================================================
    // INITIATE PAYMENT
    // ADMIN ONLY
    // =========================================================

    @PostMapping("/initiate")
    @PreAuthorize("hasAuthority('ADMIN')")
    public PaymentTransactionDTO initiatePayment(

            @RequestParam Long purchaseRequestId,

            @RequestParam Long supplierId,

            @RequestParam PaymentMethod paymentMethod) {

        return paymentService.initiatePayment(
                purchaseRequestId,
                supplierId,
                paymentMethod
        );
    }


    // =========================================================
    // PROCESS PAYMENT
    // ADMIN ONLY
    // =========================================================

    @PostMapping("/process/{paymentId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public PaymentTransactionDTO processPayment(

            @PathVariable Long paymentId,

            @Valid @RequestBody PaymentProcessDTO dto) {

        return paymentService.processPayment(
                paymentId,
                dto
        );
    }


    // =========================================================
    // MARK PAYMENT FAILED
    // ADMIN ONLY
    // =========================================================

    @PutMapping("/{paymentId}/failed")
    @PreAuthorize("hasAuthority('ADMIN')")
    public PaymentTransactionDTO markPaymentFailed(

            @PathVariable Long paymentId) {

        return paymentService.markPaymentFailed(
                paymentId
        );
    }


    // =========================================================
    // GET PAYMENT
    // ADMIN ONLY
    // =========================================================

    @GetMapping("/{paymentId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public PaymentTransactionDTO getPaymentById(

            @PathVariable Long paymentId) {

        return paymentService.getPaymentById(
                paymentId
        );
    }


    // =========================================================
    // GET PAYMENTS FOR PURCHASE REQUEST
    // ADMIN ONLY
    // =========================================================

    @GetMapping("/purchase-request/{purchaseRequestId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<PaymentTransactionDTO>
    getPaymentsByPurchaseRequest(

            @PathVariable Long purchaseRequestId) {

        return paymentService
                .getPaymentsByPurchaseRequest(
                        purchaseRequestId
                );
    }


    // =========================================================
    // GET PAYMENTS FOR SUPPLIER
    // ADMIN ONLY FOR NOW
    // =========================================================

    @GetMapping("/supplier/{supplierId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<PaymentTransactionDTO>
    getPaymentsBySupplier(

            @PathVariable Long supplierId) {

        return paymentService
                .getPaymentsBySupplier(
                        supplierId
                );
    }


    // =========================================================
    // GET ALL PAYMENTS
    // ADMIN ONLY
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<PaymentTransactionDTO>
    getAllPayments() {

        return paymentService.getAllPayments();
    }
}