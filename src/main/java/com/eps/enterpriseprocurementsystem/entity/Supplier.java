package com.eps.enterpriseprocurementsystem.entity;

import com.eps.enterpriseprocurementsystem.enums.SupplierStatus;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "suppliers")
@Data
public class Supplier {

    // =====================================================
    // SUPPLIER ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long supplierId;


    // =====================================================
    // SUPPLIER NAME
    // =====================================================

    private String supplierName;


    // =====================================================
    // PHONE
    // =====================================================

    private String phoneNumber;


    // =====================================================
    // EMAIL
    // =====================================================

    private String email;


    // =====================================================
    // ADDRESS
    // =====================================================

    private String address;


    // =====================================================
    // GST NUMBER
    // =====================================================

    @Column(unique = true)
    private String gstNumber;


    // =====================================================
    // RATING
    // =====================================================

    private Double rating;


    // =====================================================
    // FEEDBACK
    // =====================================================

    private String feedback;


    // =====================================================
    // STATUS
    // =====================================================

    @Enumerated(EnumType.STRING)
    private SupplierStatus status;


    // =====================================================
    // CATEGORY
    // =====================================================

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;


    // =====================================================
    // SUPPLIER LOGIN USER
    // =====================================================

    /*
     * A Supplier Business Account is connected to
     * exactly one User account.
     *
     * Example:
     *
     * User:
     *   userId = 18
     *   username = SAP Technologies
     *   role = SUPPLIER
     *
     * Supplier:
     *   supplierId = 6
     *   supplierName = SAP Technologies
     *   user_id = 18
     */

    @OneToOne
    @JoinColumn(
            name = "user_id",
            unique = true
    )
    private User user;


    // =====================================================
    // UPI ID
    // =====================================================

    /*
     * Used later for Admin → Supplier UPI payments.
     */

    private String upiId;

}