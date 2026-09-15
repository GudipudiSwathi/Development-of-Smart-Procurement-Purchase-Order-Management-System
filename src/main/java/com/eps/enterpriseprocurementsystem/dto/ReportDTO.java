package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;

import java.util.List;

@Data
public class ReportDTO {

    private Integer totalUsers;

    private Integer totalEmployees;

    private Integer totalAdmins;

    private Integer totalDepartments;

    private Integer totalCategories;

    private Integer totalProducts;

    private Integer totalSuppliers;

    private Integer totalPurchaseRequests;

    private Integer pendingRequests;

    private Integer approvedRequests;

    private Integer rejectedRequests;

    private Integer cancelledRequests;

    private Double totalProcurementAmount;

    private Double totalPendingAmount;

    private Double totalApprovedAmount;

    private Double totalPaidAmount;

    private Integer successfulPayments;

    private Integer failedPayments;

    private List<ReportUserDTO> users;

    private List<ReportDepartmentDTO> departments;

    private List<ReportCategoryDTO> categories;

    private List<ReportProductDTO> products;

    private List<ReportSupplierDTO> suppliers;

    private List<ReportPurchaseRequestDTO> purchaseRequests;

    private List<ReportAccountDTO> accounts;
}