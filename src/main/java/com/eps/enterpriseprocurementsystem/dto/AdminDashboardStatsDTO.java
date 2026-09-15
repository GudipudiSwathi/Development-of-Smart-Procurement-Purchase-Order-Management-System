package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;

@Data
public class AdminDashboardStatsDTO {

    // ==========================================
    // USER STATISTICS
    // ==========================================

    private long totalUsers;

    private long totalEmployees;

    private long totalAdmins;


    // ==========================================
    // ORGANIZATION STATISTICS
    // ==========================================

    private long totalDepartments;

    private long totalCategories;


    // ==========================================
    // INVENTORY STATISTICS
    // ==========================================

    private long totalProducts;

    private long totalSuppliers;


    // ==========================================
    // PURCHASE REQUEST STATISTICS
    // ==========================================

    private long totalPurchaseRequests;

    private long pendingRequests;

    private long approvedRequests;

    private long rejectedRequests;


    // ==========================================
    // PROCUREMENT VALUE
    // ==========================================

    private double totalProcurementAmount;

}