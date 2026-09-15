package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.SupplierDTO;
import com.eps.enterpriseprocurementsystem.service.SupplierService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/suppliers")
public class SupplierController {


    @Autowired
    private SupplierService supplierService;


    // =====================================================
    // SAVE SUPPLIER
    // ADMIN ONLY
    // =====================================================

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public SupplierDTO saveSupplier(
            @Valid @RequestBody SupplierDTO dto) {

        return supplierService.saveSupplier(dto);
    }


    // =====================================================
    // GET ALL SUPPLIERS
    // ADMIN + EMPLOYEE
    // =====================================================

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public List<SupplierDTO> getAllSuppliers() {

        return supplierService.getAllSuppliers();
    }


    // =====================================================
    // GET SUPPLIERS BY CATEGORY
    // ADMIN + EMPLOYEE
    // =====================================================

    @GetMapping("/category/{categoryId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public List<SupplierDTO> getSuppliersByCategory(
            @PathVariable Long categoryId) {

        return supplierService
                .getSuppliersByCategory(categoryId);
    }


    // =====================================================
    // GET MY SUPPLIER PROFILE
    // SUPPLIER / BUSINESS ONLY
    // =====================================================

    /*
     * The logged-in Business user can see only
     * their own Supplier profile.
     *
     * JWT username
     *       ↓
     * User
     *       ↓
     * Supplier
     */

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('SUPPLIER')")
    public SupplierDTO getMySupplierProfile(
            Authentication authentication) {

        return supplierService
                .getSupplierByUsername(
                        authentication.getName()
                );
    }


    // =====================================================
    // GET SUPPLIER BY ID
    // ADMIN + EMPLOYEE
    // =====================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public SupplierDTO getSupplierById(
            @PathVariable Long id) {

        return supplierService.getSupplierById(id);
    }


    // =====================================================
    // UPDATE SUPPLIER
    // ADMIN ONLY
    // =====================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public SupplierDTO updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierDTO dto) {

        return supplierService.updateSupplier(
                id,
                dto
        );
    }


    // =====================================================
    // DELETE SUPPLIER
    // ADMIN ONLY
    // =====================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public String deleteSupplier(
            @PathVariable Long id) {

        return supplierService.deleteSupplier(id);
    }

}