package com.eps.enterpriseprocurementsystem.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "accounts")
@Data
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long accountId;

    // Purchase request associated with this payment
    @OneToOne
    @JoinColumn(
            name = "purchase_request_id",
            nullable = false,
            unique = true
    )
    private PurchaseRequest purchaseRequest;

    // User who made the payment
    @ManyToOne
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    // Amount paid
    @Column(nullable = false)
    private Double amount;

    // PENDING / SUCCESS / FAILED
    private String paymentStatus;

    // Payment date and time
    private LocalDateTime paymentDate;

    // Transaction/reference number
    private String paymentReference;
}