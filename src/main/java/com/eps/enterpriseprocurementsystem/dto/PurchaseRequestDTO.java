package com.eps.enterpriseprocurementsystem.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PurchaseRequestDTO {

    private Long purchaseRequestId;

    @NotNull(message = "User is required")
    private Long userId;

    private Double totalPrice;

    private String remarks;

    private String adminRemarks;

    // =====================================================
    // APPROVAL STATUS
    // =====================================================

    private String status;


    // =====================================================
    // DELIVERY STATUS
    //
    // REQUEST_RECEIVED
    // APPROVED
    // PACKED
    // SHIPPED
    // DELIVERED
    // =====================================================

    private String deliveryStatus;


    // =====================================================
    // APPROVAL INFORMATION
    // =====================================================

    private Integer currentApprovalLevel;

    private LocalDateTime requestDate;

    private LocalDateTime approvedDate;


    // =====================================================
    // REQUEST ITEMS
    // =====================================================

    @NotEmpty(message = "At least one product is required")
    @Valid
    private List<PurchaseRequestItemDTO> items;
}