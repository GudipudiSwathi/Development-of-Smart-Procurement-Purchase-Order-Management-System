package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;

@Data
public class ReportSupplierDTO {

    private Long supplierId;

    private String supplierName;

    private String phoneNumber;

    private String email;

    private String address;

    private String gstNumber;

    private Double rating;

    private String feedback;

    private String status;

    private Long categoryId;

    private String categoryName;

    private Integer purchaseRequestCount;

    private Double totalProcurementAmount;
}