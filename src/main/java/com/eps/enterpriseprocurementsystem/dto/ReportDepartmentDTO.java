package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;

@Data
public class ReportDepartmentDTO {

    private Long departmentId;

    private String departmentName;

    private String description;

    private Integer employeeCount;

    private Integer purchaseRequestCount;

    private Integer pendingRequestCount;

    private Integer approvedRequestCount;

    private Integer rejectedRequestCount;

    private Double totalProcurementAmount;
}