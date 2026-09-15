package com.eps.enterpriseprocurementsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @NotBlank(message = "Username is required")
    @Column(unique = true)
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    @Email(message = "Enter a valid email")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Designation is required")
    private String designation;

    @NotBlank(message = "Role is required")
    private String role;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    // =====================================================
    // SUPPLIER RELATIONSHIP
    // =====================================================
    //
    // A supplier login is represented by a User.
    // The actual supplier information remains in suppliers.
    //
    // We are NOT adding a Supplier field here because
    // suppliers already contains user_id.
    //
}