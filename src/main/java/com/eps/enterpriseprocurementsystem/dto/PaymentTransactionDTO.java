package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PaymentTransactionDTO {

    private Long paymentId;

    private Long purchaseRequestId;

    private Long accountId;

    private Long userId;

    private Long supplierId;

    private String supplierName;

    private String supplierUpiId;

    private Double amount;

    private String paymentMethod;

    private String paymentStatus;

    private String transactionReference;

    private String qrReference;

    private String cardLast4;

    private LocalDateTime paymentDate;
}