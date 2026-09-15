package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;

@Data
public class ReportUserDTO {

    private Long userId;

    private String username;

    private String email;

    private String phoneNumber;

    private String designation;

    private String role;

    private Long departmentId;

    private String departmentName;

    private Integer purchaseRequestCount;

    private Double totalProcurementAmount;
}