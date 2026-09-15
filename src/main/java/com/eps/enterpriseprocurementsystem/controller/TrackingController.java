package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.TrackingDTO;
import com.eps.enterpriseprocurementsystem.enums.TrackingStatus;
import com.eps.enterpriseprocurementsystem.service.TrackingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tracking")
public class TrackingController {

    @Autowired
    private TrackingService trackingService;


    // =====================================================
    // CREATE TRACKING
    // =====================================================
    //
    // Tracking can be created only for an APPROVED
    // Purchase Request.
    //
    // For now ADMIN creates the initial tracking record.
    // =====================================================

    @PostMapping("/{purchaseRequestId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public TrackingDTO createTracking(
            @PathVariable Long purchaseRequestId) {

        return trackingService.createTracking(
                purchaseRequestId
        );
    }


    // =====================================================
    // GET TRACKING STATUS
    // =====================================================

    @GetMapping("/{purchaseRequestId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public TrackingDTO getTracking(
            @PathVariable Long purchaseRequestId) {

        return trackingService.getTrackingByPurchaseRequest(
                purchaseRequestId
        );
    }


    // =====================================================
    // UPDATE TRACKING STATUS
    // =====================================================
    //
    // Supplier/authorized user will update the status.
    //
    // For now ADMIN is used so that we can test the
    // complete tracking workflow safely.
    // =====================================================

    @PutMapping("/{purchaseRequestId}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public TrackingDTO updateTrackingStatus(
            @PathVariable Long purchaseRequestId,
            @RequestParam TrackingStatus status,
            @RequestParam(required = false) String remarks) {

        return trackingService.updateTrackingStatus(
                purchaseRequestId,
                status,
                remarks
        );
    }
}