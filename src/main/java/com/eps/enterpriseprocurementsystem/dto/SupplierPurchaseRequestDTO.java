package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class SupplierPurchaseRequestDTO {
    private Long purchaseRequestId;
    private Long requesterUserId;
    private String requesterUsername;
    private String status;
    private String deliveryStatus;
    private String remarks;
    private String adminRemarks;
    private LocalDateTime requestDate;
    private LocalDateTime approvedDate;
    private Double supplierAmount;
    private String paymentStatus;
    private String paymentReference;
    private List<SupplierPurchaseRequestItemDTO> items;
}
