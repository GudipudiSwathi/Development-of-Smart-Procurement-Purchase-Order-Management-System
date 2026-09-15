package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;

@Data
public class ReportCategoryDTO {

    private Long categoryId;

    private String categoryName;

    private String description;

    private Integer productCount;

    private Integer supplierCount;

    private Integer purchaseRequestCount;

    private Double totalProcurementAmount;
}