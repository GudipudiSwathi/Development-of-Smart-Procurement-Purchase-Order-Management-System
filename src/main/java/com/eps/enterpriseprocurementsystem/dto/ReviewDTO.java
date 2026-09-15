package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewDTO {
    private Long reviewId;
    private Long purchaseRequestId;
    private Long productId;
    private String productName;
    private Long employeeId;
    private String employeeName;
    private Long supplierId;
    private String supplierName;
    private Integer rating;
    private String feedback;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
