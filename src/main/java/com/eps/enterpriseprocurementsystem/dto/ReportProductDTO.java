package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;

@Data
public class ReportProductDTO {

    private Long productId;

    private String productName;

    private String description;

    private Double price;

    private Integer stockQuantity;

    private String status;

    private Long categoryId;

    private String categoryName;

    private Integer purchaseRequestCount;

    private Integer totalQuantityRequested;

    private Double totalProcurementAmount;
}