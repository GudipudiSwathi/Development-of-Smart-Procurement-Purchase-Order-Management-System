package com.eps.enterpriseprocurementsystem.entity;

import com.eps.enterpriseprocurementsystem.enums.PaymentMethod;
import com.eps.enterpriseprocurementsystem.enums.PaymentTransactionStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Data
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;


    @ManyToOne
    @JoinColumn(
            name = "purchase_request_id",
            nullable = false
    )
    private PurchaseRequest purchaseRequest;


    @ManyToOne
    @JoinColumn(
            name = "account_id",
            nullable = false
    )
    private Account account;


    @ManyToOne
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;


    @ManyToOne
    @JoinColumn(
            name = "supplier_id",
            nullable = false
    )
    private Supplier supplier;


    @Column(nullable = false)
    private Double amount;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentTransactionStatus paymentStatus;


    @Column(unique = true)
    private String transactionReference;


    private String qrReference;


    /*
     * Store ONLY a hash of the MPIN.
     * Never store the actual MPIN.
     */
    private String mpinHash;


    /*
     * Credit-card information.
     * Never store full card number or CVV.
     */
    private String cardHolderName;

    private String cardLast4;

    private String cardExpiry;


    private LocalDateTime paymentDate;
}