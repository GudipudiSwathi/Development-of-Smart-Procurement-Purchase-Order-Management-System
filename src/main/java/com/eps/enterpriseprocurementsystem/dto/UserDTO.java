package com.eps.enterpriseprocurementsystem.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.Data;


@Data
public class UserDTO {


    // =====================================================
    // USER ID
    // =====================================================

    private Long userId;


    // =====================================================
    // USERNAME
    // =====================================================

    @NotBlank(
            message = "Username is required"
    )
    private String username;


    // =====================================================
    // EMAIL
    // =====================================================

    @Email(
            message = "Enter a valid email"
    )
    private String email;


    // =====================================================
    // PASSWORD
    // =====================================================
    //
    // WRITE_ONLY:
    // Password can be received from frontend,
    // but will never be returned in JSON response.
    //
    // Password is optional because:
    //
    // 1. Registration provides a password.
    // 2. Profile update may omit password.
    // 3. Existing password remains unchanged when
    //    no new password is supplied.
    //
    // =====================================================

    @JsonProperty(
            access = JsonProperty.Access.WRITE_ONLY
    )
    private String password;


    // =====================================================
    // PHONE NUMBER
    // =====================================================

    @NotBlank(
            message = "Phone Number is required"
    )
    private String phoneNumber;


    // =====================================================
    // DESIGNATION
    // =====================================================

    @NotBlank(
            message = "Designation is required"
    )
    private String designation;


    // =====================================================
    // ROLE
    // =====================================================
    //
    // No @NotBlank here.
    //
    // Employee self-profile updates do NOT need to send
    // their role.
    //
    // The backend keeps the existing role unchanged.
    //
    // Registration and ADMIN user management validate
    // role through the service layer.
    //
    // =====================================================

    private String role;


    // =====================================================
    // DEPARTMENT ID
    // =====================================================
    //
    // No @NotNull here.
    //
    // Employee self-profile updates do NOT need to send
    // departmentId.
    //
    // The backend keeps the existing department unchanged.
    //
    // Department assignment remains an ADMIN responsibility.
    //
    // =====================================================

    private Long departmentId;


    // =====================================================
    // DEPARTMENT NAME
    // =====================================================
    //
    // Read-only information returned to the frontend.
    //
    // This allows the employee profile to display:
    //
    // Finance
    // Human Resources
    // Procurement
    //
    // instead of:
    //
    // Department #3
    //
    // The frontend does not need to send this value when
    // creating or updating a user.
    //
    // =====================================================

    private String departmentName;

}