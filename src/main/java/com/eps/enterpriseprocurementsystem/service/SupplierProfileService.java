package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.SupplierProfileDTO;
import com.eps.enterpriseprocurementsystem.entity.SupplierProfile;
import com.eps.enterpriseprocurementsystem.entity.User;
import com.eps.enterpriseprocurementsystem.repository.SupplierProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SupplierProfileService {

    private final SupplierProfileRepository supplierProfileRepository;
    private final UserService userService;


    // =========================================================
    // GET MY PROFILE
    // =========================================================

    @Transactional
    public SupplierProfileDTO getMyProfile(String username) {

        User supplier = getSupplier(username);

        SupplierProfile profile =
                supplierProfileRepository
                        .findByUserUserId(supplier.getUserId())
                        .orElseGet(() ->
                                createProfileFromUser(supplier)
                        );

        return convertToDTO(profile);
    }


    // =========================================================
    // UPDATE MY PROFILE
    // =========================================================

    @Transactional
    public SupplierProfileDTO saveMyProfile(
            SupplierProfileDTO dto,
            String username
    ) {

        if (dto == null) {
            throw new IllegalArgumentException(
                    "Supplier profile data is required."
            );
        }

        User supplier = getSupplier(username);

        SupplierProfile profile =
                supplierProfileRepository
                        .findByUserUserId(supplier.getUserId())
                        .orElseGet(() ->
                                createProfileFromUser(supplier)
                        );


        // =====================================================
        // BUSINESS INFORMATION
        // =====================================================

        String businessName =
                clean(dto.getBusinessName());

        if (businessName != null) {
            profile.setBusinessName(businessName);
        }

        profile.setBusinessType(
                clean(dto.getBusinessType())
        );

        profile.setDescription(
                clean(dto.getDescription())
        );

        profile.setWebsite(
                clean(dto.getWebsite())
        );


        // =====================================================
        // CONTACT INFORMATION
        // =====================================================

        profile.setContactPerson(
                clean(dto.getContactPerson())
        );

        profile.setContactEmail(
                clean(dto.getContactEmail())
        );

        profile.setContactPhone(
                clean(dto.getContactPhone())
        );


        // =====================================================
        // BUSINESS ADDRESS
        // =====================================================

        profile.setAddress(
                clean(dto.getAddress())
        );

        profile.setCity(
                clean(dto.getCity())
        );

        profile.setState(
                clean(dto.getState())
        );

        profile.setPincode(
                clean(dto.getPincode())
        );

        String country =
                clean(dto.getCountry());

        profile.setCountry(
                country != null
                        ? country
                        : "India"
        );


        // =====================================================
        // TAX & REGISTRATION
        // =====================================================

        profile.setGstNumber(
                clean(dto.getGstNumber())
        );

        profile.setPanNumber(
                clean(dto.getPanNumber())
        );

        profile.setBusinessRegistrationNumber(
                clean(dto.getBusinessRegistrationNumber())
        );


        // =====================================================
        // UPDATED DATE
        // =====================================================

        profile.setUpdatedDate(
                LocalDateTime.now()
        );


        // =====================================================
        // SAVE
        // =====================================================

        SupplierProfile savedProfile =
                supplierProfileRepository.saveAndFlush(
                        profile
                );


        // =====================================================
        // RETURN UPDATED PROFILE
        // =====================================================

        return convertToDTO(savedProfile);
    }


    // =========================================================
    // GET AUTHENTICATED SUPPLIER
    // =========================================================

    private User getSupplier(String username) {

        if (username == null ||
                username.trim().isEmpty()) {

            throw new RuntimeException(
                    "Authenticated username is missing."
            );
        }

        User supplier =
                userService.getUserEntityByUsername(
                        username
                );

        if (supplier == null) {

            throw new RuntimeException(
                    "Supplier account not found."
            );
        }

        if (supplier.getRole() == null ||
                !"SUPPLIER".equalsIgnoreCase(
                        supplier.getRole().toString()
                )) {

            throw new RuntimeException(
                    "Only suppliers can access supplier profile."
            );
        }

        return supplier;
    }


    // =========================================================
    // CREATE PROFILE FOR EXISTING SUPPLIER
    // =========================================================

    private SupplierProfile createProfileFromUser(
            User supplier
    ) {

        SupplierProfile profile =
                new SupplierProfile();

        profile.setUser(supplier);


        // -----------------------------------------------------
        // Business name
        // -----------------------------------------------------

        String username =
                clean(supplier.getUsername());

        profile.setBusinessName(
                username != null
                        ? username
                        : "Your Business"
        );


        // -----------------------------------------------------
        // Default business type
        // -----------------------------------------------------

        profile.setBusinessType(
                "IT Supplier"
        );


        // -----------------------------------------------------
        // Existing user information
        // -----------------------------------------------------

        profile.setContactPerson(
                username
        );

        profile.setContactEmail(
                clean(supplier.getEmail())
        );

        profile.setContactPhone(
                clean(supplier.getPhoneNumber())
        );


        // -----------------------------------------------------
        // Default country
        // -----------------------------------------------------

        profile.setCountry(
                "India"
        );


        // -----------------------------------------------------
        // Dates
        // -----------------------------------------------------

        LocalDateTime now =
                LocalDateTime.now();

        profile.setCreatedDate(now);
        profile.setUpdatedDate(now);


        return supplierProfileRepository.saveAndFlush(
                profile
        );
    }


    // =========================================================
    // CLEAN STRING
    // =========================================================

    private String clean(String value) {

        if (value == null) {
            return null;
        }

        String result =
                value.trim();

        if (result.isEmpty()) {
            return null;
        }

        return result;
    }


    // =========================================================
    // ENTITY -> DTO
    // =========================================================

    private SupplierProfileDTO convertToDTO(
            SupplierProfile profile
    ) {

        SupplierProfileDTO dto =
                new SupplierProfileDTO();


        // -----------------------------------------------------
        // Profile ID
        // -----------------------------------------------------

        dto.setProfileId(
                profile.getProfileId()
        );


        // -----------------------------------------------------
        // Business Information
        // -----------------------------------------------------

        dto.setBusinessName(
                profile.getBusinessName()
        );

        dto.setBusinessType(
                profile.getBusinessType()
        );

        dto.setDescription(
                profile.getDescription()
        );

        dto.setWebsite(
                profile.getWebsite()
        );


        // -----------------------------------------------------
        // Contact Information
        // -----------------------------------------------------

        dto.setContactPerson(
                profile.getContactPerson()
        );

        dto.setContactEmail(
                profile.getContactEmail()
        );

        dto.setContactPhone(
                profile.getContactPhone()
        );


        // -----------------------------------------------------
        // Address
        // -----------------------------------------------------

        dto.setAddress(
                profile.getAddress()
        );

        dto.setCity(
                profile.getCity()
        );

        dto.setState(
                profile.getState()
        );

        dto.setPincode(
                profile.getPincode()
        );

        dto.setCountry(
                profile.getCountry()
        );


        // -----------------------------------------------------
        // Tax & Registration
        // -----------------------------------------------------

        dto.setGstNumber(
                profile.getGstNumber()
        );

        dto.setPanNumber(
                profile.getPanNumber()
        );

        dto.setBusinessRegistrationNumber(
                profile.getBusinessRegistrationNumber()
        );


        return dto;
    }
}