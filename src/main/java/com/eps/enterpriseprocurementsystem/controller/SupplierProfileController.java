package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.SupplierProfileDTO;
import com.eps.enterpriseprocurementsystem.service.SupplierProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/supplier/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class SupplierProfileController {

    private final SupplierProfileService supplierProfileService;

    /**
     * Get currently logged-in supplier profile.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('SUPPLIER')")
    public SupplierProfileDTO getMyProfile(
            Authentication authentication
    ) {

        return supplierProfileService.getMyProfile(
                authentication.getName()
        );
    }

    /**
     * Create / update currently logged-in supplier profile.
     */
    @PutMapping
    @PreAuthorize("hasAuthority('SUPPLIER')")
    public SupplierProfileDTO saveMyProfile(
            @Valid @RequestBody SupplierProfileDTO dto,
            Authentication authentication
    ) {

        return supplierProfileService.saveMyProfile(
                dto,
                authentication.getName()
        );
    }
}