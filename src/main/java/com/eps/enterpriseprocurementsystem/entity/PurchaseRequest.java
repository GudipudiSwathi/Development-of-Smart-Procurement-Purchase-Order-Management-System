package com.eps.enterpriseprocurementsystem.entity;

import com.eps.enterpriseprocurementsystem.enums.PurchaseRequestStatus;
import com.eps.enterpriseprocurementsystem.enums.DeliveryStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_requests")
@Data
public class PurchaseRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long purchaseRequestId;


    // =====================================================
    // REQUESTER
    // =====================================================

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;


    // =====================================================
    // PRICE
    // =====================================================

    private Double totalPrice;


    // =====================================================
    // REMARKS
    // =====================================================

    private String remarks;

    private String adminRemarks;


    // =====================================================
    // APPROVAL STATUS
    // =====================================================

    @Enumerated(EnumType.STRING)
    private PurchaseRequestStatus status;


    // =====================================================
    // DELIVERY STATUS
    //
    // REQUEST_RECEIVED
    // APPROVED
    // PACKED
    // SHIPPED
    // DELIVERED
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status")
    private DeliveryStatus deliveryStatus;


    // =====================================================
    // APPROVAL LEVEL
    // =====================================================

    private Integer currentApprovalLevel;


    // =====================================================
    // DATES
    // =====================================================

    private LocalDateTime requestDate;

    private LocalDateTime approvedDate;


    // =====================================================
    // REQUEST ITEMS
    // =====================================================

    @OneToMany(
            mappedBy = "purchaseRequest",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<PurchaseRequestItem> items =
            new ArrayList<>();
}