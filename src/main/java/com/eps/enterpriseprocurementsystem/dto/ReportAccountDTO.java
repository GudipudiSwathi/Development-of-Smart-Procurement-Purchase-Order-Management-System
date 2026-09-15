package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReportAccountDTO {

    private Long accountId;

    private Long purchaseRequestId;

    private Long userId;

    private String username;

    private String departmentName;

    private Double amount;

    private String paymentStatus;

    private LocalDateTime paymentDate;

    private String paymentReference;
}