package com.eps.enterpriseprocurementsystem.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TrackingDTO {

    private Long trackingId;

    @NotNull(message = "Purchase Request ID is required")
    private Long purchaseRequestId;

    private String status;

    private String updatedDate;

    private String remarks;
}