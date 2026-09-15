package com.eps.enterpriseprocurementsystem.entity;

import com.eps.enterpriseprocurementsystem.enums.TrackingStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "tracking")
@Data
public class Tracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long trackingId;

    @OneToOne
    @JoinColumn(name = "purchase_request_id", nullable = false, unique = true)
    private PurchaseRequest purchaseRequest;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrackingStatus status;

    private LocalDateTime updatedDate;

    private String remarks;
}