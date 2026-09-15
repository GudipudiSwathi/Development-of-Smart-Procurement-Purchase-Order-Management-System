package com.eps.enterpriseprocurementsystem.dto;

import jakarta.validation.constraints.NotBlank;

public class PurchaseRequestStatusDTO {

    @NotBlank(message = "Status is required")
    private String status;

    private String adminRemarks;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminRemarks() {
        return adminRemarks;
    }

    public void setAdminRemarks(String adminRemarks) {
        this.adminRemarks = adminRemarks;
    }
}