package com.eps.enterpriseprocurementsystem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SupplierProfileDTO {

    private Long profileId;

    // Business Information

    @NotBlank(message = "Business name is required")
    private String businessName;

    private String businessType;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    private String website;

    // Contact Information

    private String contactPerson;

    @Email(message = "Please enter a valid contact email")
    private String contactEmail;

    private String contactPhone;

    // Address

    private String address;

    private String city;

    private String state;

    private String pincode;

    private String country;

    // Business / Tax Information

    private String gstNumber;

    private String panNumber;

    private String businessRegistrationNumber;
}