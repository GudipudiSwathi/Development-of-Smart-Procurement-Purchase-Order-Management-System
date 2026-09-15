package com.eps.enterpriseprocurementsystem.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AccountDTO {

    private Long accountId;

    @NotNull(message = "Purchase Request is required")
    private Long purchaseRequestId;

    @NotNull(message = "User is required")
    private Long userId;

    @NotNull(message = "Amount is required")
    private Double amount;

    private String paymentStatus;

    private String paymentDate;

    private String paymentReference;
}