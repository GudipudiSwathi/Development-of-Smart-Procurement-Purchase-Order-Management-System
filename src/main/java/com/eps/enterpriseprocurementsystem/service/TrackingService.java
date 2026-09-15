package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.TrackingDTO;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequest;
import com.eps.enterpriseprocurementsystem.entity.Tracking;
import com.eps.enterpriseprocurementsystem.enums.PurchaseRequestStatus;
import com.eps.enterpriseprocurementsystem.enums.TrackingStatus;
import com.eps.enterpriseprocurementsystem.repository.PurchaseRequestRepository;
import com.eps.enterpriseprocurementsystem.repository.TrackingRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class TrackingService {

    @Autowired
    private TrackingRepository trackingRepository;

    @Autowired
    private PurchaseRequestRepository purchaseRequestRepository;


    // =====================================================
    // CREATE TRACKING
    // =====================================================
    //
    // Only ADMIN can currently create tracking.
    // Tracking can be created only after the purchase
    // request has been finally approved.
    // =====================================================

    public TrackingDTO createTracking(Long purchaseRequestId) {

        // Check whether tracking already exists
        if (trackingRepository
                .findByPurchaseRequestPurchaseRequestId(purchaseRequestId)
                .isPresent()) {

            throw new RuntimeException(
                    "Tracking already exists for this purchase request."
            );
        }

        // Find purchase request
        PurchaseRequest purchaseRequest =
                purchaseRequestRepository
                        .findById(purchaseRequestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Request not found"
                                )
                        );

        // Tracking starts only after final approval
        if (purchaseRequest.getStatus()
                != PurchaseRequestStatus.APPROVED) {

            throw new RuntimeException(
                    "Tracking cannot be created. " +
                            "Purchase Request is not approved."
            );
        }

        Tracking tracking = new Tracking();

        tracking.setPurchaseRequest(purchaseRequest);

        // Initial tracking status
        tracking.setStatus(
                TrackingStatus.REQUEST_RECEIVED
        );

        tracking.setUpdatedDate(
                LocalDateTime.now()
        );

        tracking.setRemarks(
                "Purchase request received by supplier."
        );

        Tracking savedTracking =
                trackingRepository.save(tracking);

        return convertToDTO(savedTracking);
    }


    // =====================================================
    // GET TRACKING BY PURCHASE REQUEST
    // =====================================================
    //
    // ADMIN:
    //   Can view any tracking record.
    //
    // EMPLOYEE:
    //   Can view tracking only for their own
    //   purchase request.
    // =====================================================

    public TrackingDTO getTrackingByPurchaseRequest(
            Long purchaseRequestId) {

        Tracking tracking =
                trackingRepository
                        .findByPurchaseRequestPurchaseRequestId(
                                purchaseRequestId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Tracking not found for this purchase request."
                                )
                        );

        // Security ownership check
        validateEmployeeOwnership(tracking);

        return convertToDTO(tracking);
    }


    // =====================================================
    // UPDATE TRACKING STATUS
    // =====================================================
    //
    // ADMIN currently updates tracking.
    //
    // Supplier update functionality can be enabled later
    // when Supplier authentication/role is implemented.
    //
    // Tracking status cannot move backwards.
    // =====================================================

    public TrackingDTO updateTrackingStatus(
            Long purchaseRequestId,
            TrackingStatus newStatus,
            String remarks) {

        if (newStatus == null) {
            throw new RuntimeException(
                    "Tracking status is required."
            );
        }

        Tracking tracking =
                trackingRepository
                        .findByPurchaseRequestPurchaseRequestId(
                                purchaseRequestId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Tracking not found for this purchase request."
                                )
                        );

        // -------------------------------------------------
        // Prevent moving backwards
        // -------------------------------------------------

        if (newStatus.ordinal()
                < tracking.getStatus().ordinal()) {

            throw new RuntimeException(
                    "Tracking status cannot move backwards."
            );
        }

        tracking.setStatus(newStatus);

        tracking.setUpdatedDate(
                LocalDateTime.now()
        );

        // Keep the previous remarks if no new remarks
        // were supplied.
        if (remarks != null && !remarks.trim().isEmpty()) {
            tracking.setRemarks(remarks.trim());
        }

        Tracking updatedTracking =
                trackingRepository.save(tracking);

        return convertToDTO(updatedTracking);
    }


    // =====================================================
    // EMPLOYEE OWNERSHIP VALIDATION
    // =====================================================
    //
    // Employees must never be able to access tracking
    // information belonging to another employee.
    //
    // ADMIN is allowed to access every purchase request.
    // =====================================================

    private void validateEmployeeOwnership(
            Tracking tracking) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated."
            );
        }

        // ADMIN can view all tracking records
        boolean isAdmin =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                "ADMIN".equals(
                                        authority.getAuthority()
                                )
                        );

        if (isAdmin) {
            return;
        }

        // Get logged-in username
        String loggedInUsername =
                authentication.getName();

        if (loggedInUsername == null ||
                loggedInUsername.trim().isEmpty()) {

            throw new RuntimeException(
                    "Unable to identify logged-in user."
            );
        }

        PurchaseRequest purchaseRequest =
                tracking.getPurchaseRequest();

        if (purchaseRequest == null ||
                purchaseRequest.getUser() == null) {

            throw new RuntimeException(
                    "Purchase request owner could not be identified."
            );
        }

        String requestOwnerUsername =
                purchaseRequest
                        .getUser()
                        .getUsername();

        // Employee can access only their own tracking
        if (!loggedInUsername.equals(requestOwnerUsername)) {

            throw new RuntimeException(
                    "You are not authorized to view this tracking information."
            );
        }
    }


    // =====================================================
    // ENTITY -> DTO
    // =====================================================

    private TrackingDTO convertToDTO(
            Tracking tracking) {

        TrackingDTO dto = new TrackingDTO();

        dto.setTrackingId(
                tracking.getTrackingId()
        );

        dto.setPurchaseRequestId(
                tracking.getPurchaseRequest()
                        .getPurchaseRequestId()
        );

        dto.setStatus(
                tracking.getStatus().name()
        );

        if (tracking.getUpdatedDate() != null) {

            dto.setUpdatedDate(
                    tracking.getUpdatedDate()
                            .toString()
            );
        }

        dto.setRemarks(
                tracking.getRemarks()
        );

        return dto;
    }
}