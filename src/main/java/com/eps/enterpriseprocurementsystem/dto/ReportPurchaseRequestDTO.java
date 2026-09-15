package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReportPurchaseRequestDTO {

    private Long purchaseRequestId;

    private Long userId;

    private String username;

    private Long departmentId;

    private String departmentName;

    private Double totalPrice;

    private String remarks;

    private String adminRemarks;

    private String status;

    private Integer currentApprovalLevel;

    private LocalDateTime requestDate;

    private LocalDateTime approvedDate;

    private Integer itemCount;

    private Integer totalQuantity;

    private String approvalStatus;
}