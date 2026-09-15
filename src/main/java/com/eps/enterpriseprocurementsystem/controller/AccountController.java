package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.AccountDTO;
import com.eps.enterpriseprocurementsystem.dto.PaymentDTO;
import com.eps.enterpriseprocurementsystem.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;


    // =====================================================
    // CREATE PAYMENT ACCOUNT
    // =====================================================
    //
    // Employee/Admin can create an account.
    //
    // The service validates that the supplied user actually
    // owns the Purchase Request.
    // =====================================================

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public AccountDTO createAccount(
            @Valid @RequestBody AccountDTO dto) {

        return accountService.createAccount(dto);
    }


    // =====================================================
    // GET MY PAYMENT ACCOUNTS
    // =====================================================
    //
    // EMPLOYEE ONLY
    //
    // Returns ONLY payment accounts belonging to the
    // currently authenticated employee.
    //
    // The user ID is obtained from the authenticated
    // username instead of being supplied by the frontend.
    // =====================================================

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('EMPLOYEE')")
    public List<AccountDTO> getMyAccounts(
            Authentication authentication) {

        String username = authentication.getName();

        return accountService.getMyAccountsByUsername(username);
    }


    // =====================================================
    // GET ACCOUNT BY ID
    // =====================================================
    //
    // ADMIN ONLY
    //
    // Employees should use /accounts/my instead.
    // =====================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public AccountDTO getAccountById(
            @PathVariable Long id) {

        return accountService.getAccountById(id);
    }


    // =====================================================
    // GET ACCOUNT BY PURCHASE REQUEST
    // =====================================================
    //
    // ADMIN ONLY
    //
    // Employee payment information is retrieved through
    // /accounts/my.
    // =====================================================

    @GetMapping("/purchase-request/{purchaseRequestId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public AccountDTO getAccountByPurchaseRequest(
            @PathVariable Long purchaseRequestId) {

        return accountService.getAccountByPurchaseRequest(
                purchaseRequestId
        );
    }


    // =====================================================
    // MAKE PAYMENT
    // =====================================================
    //
    // PAYMENT IS ADMIN ONLY.
    //
    // Purchase Request must be fully APPROVED.
    // =====================================================

    @PostMapping("/payment")
    @PreAuthorize("hasAuthority('ADMIN')")
    public AccountDTO makePayment(
            @Valid @RequestBody PaymentDTO dto) {

        return accountService.markPaymentSuccessful(
                dto.getAccountId(),
                dto.getPaymentReference()
        );
    }


    // =====================================================
    // PAYMENT FAILED
    // =====================================================
    //
    // Only ADMIN can mark a payment as failed.
    // =====================================================

    @PutMapping("/{accountId}/payment-failed")
    @PreAuthorize("hasAuthority('ADMIN')")
    public AccountDTO markPaymentFailed(
            @PathVariable Long accountId,
            @RequestParam String paymentReference) {

        return accountService.markPaymentFailed(
                accountId,
                paymentReference
        );
    }


    // =====================================================
    // GET ALL PAYMENT ACCOUNTS
    // =====================================================
    //
    // ADMIN ONLY
    //
    // Used by the Admin Accounts page.
    // =====================================================

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<AccountDTO> getAllAccounts() {

        return accountService.getAllAccounts();
    }
}