package com.eps.enterpriseprocurementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentDTO {

    @NotNull(message = "Account ID is required")
    private Long accountId;

    @NotBlank(message = "Payment reference is required")
    private String paymentReference;
}