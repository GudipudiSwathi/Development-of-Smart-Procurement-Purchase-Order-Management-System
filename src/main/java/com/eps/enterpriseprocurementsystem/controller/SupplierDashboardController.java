package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.SupplierDashboardSummaryDTO;
import com.eps.enterpriseprocurementsystem.dto.SupplierPurchaseRequestDTO;
import com.eps.enterpriseprocurementsystem.service.SupplierDashboardService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/supplier-dashboard")
@PreAuthorize("hasAuthority('SUPPLIER')")
public class SupplierDashboardController {


    @Autowired
    private SupplierDashboardService supplierDashboardService;


    // =====================================================
    // DASHBOARD SUMMARY
    // =====================================================

    @GetMapping("/summary")
    public com.eps.enterpriseprocurementsystem.dto.SupplierDashboardSummaryDTO
    getSummary(Authentication authentication) {

        return supplierDashboardService.getDashboardSummary(
                authentication.getName()
        );
    }


    // =====================================================
    // PENDING REQUESTS
    // =====================================================

    @GetMapping("/pending")
    public List<SupplierPurchaseRequestDTO>
    getPendingRequests(Authentication authentication) {

        return supplierDashboardService.getPendingRequests(
                authentication.getName()
        );
    }


    // =====================================================
    // COMPLETED REQUESTS
    // =====================================================

    @GetMapping("/completed")
    public List<SupplierPurchaseRequestDTO>
    getCompletedRequests(Authentication authentication) {

        return supplierDashboardService.getCompletedRequests(
                authentication.getName()
        );
    }


    // =====================================================
    // PAYMENT HISTORY
    // =====================================================

    @GetMapping("/payments")
    public List<SupplierPurchaseRequestDTO>
    getPaymentHistory(Authentication authentication) {

        return supplierDashboardService.getPaymentHistory(
                authentication.getName()
        );
    }

}