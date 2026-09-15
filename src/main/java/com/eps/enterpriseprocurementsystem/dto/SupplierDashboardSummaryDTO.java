package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;

@Data
public class SupplierDashboardSummaryDTO {

    private long pendingRequests;

    private long completedRequests;

    private long successfulPayments;

    private double totalAmountPaid;

}