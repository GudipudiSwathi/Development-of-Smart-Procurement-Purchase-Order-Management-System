package com.eps.enterpriseprocurementsystem.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "supplier_profiles",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "user_id")
        }
)
@Data
public class SupplierProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long profileId;

    /*
     * Each supplier has exactly one profile.
     * The profile is connected to the authenticated User.
     */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Business Information
    @Column(nullable = false)
    private String businessName;

    private String businessType;

    @Column(length = 2000)
    private String description;

    private String website;

    // Contact Information
    private String contactPerson;

    private String contactEmail;

    private String contactPhone;

    // Address
    @Column(length = 1000)
    private String address;

    private String city;

    private String state;

    private String pincode;

    private String country;

    // Business / Tax Information
    private String gstNumber;

    private String panNumber;

    private String businessRegistrationNumber;

    private LocalDateTime createdDate;

    private LocalDateTime updatedDate;
}