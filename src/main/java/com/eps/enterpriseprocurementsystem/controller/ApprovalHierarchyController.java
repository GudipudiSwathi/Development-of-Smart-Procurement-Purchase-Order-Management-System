package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.ApprovalHierarchyDTO;
import com.eps.enterpriseprocurementsystem.service.ApprovalHierarchyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/approval-hierarchy")
public class ApprovalHierarchyController {

    @Autowired
    private ApprovalHierarchyService approvalHierarchyService;

    // Save
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApprovalHierarchyDTO saveApprovalHierarchy(
            @Valid @RequestBody ApprovalHierarchyDTO dto) {

        return approvalHierarchyService.saveApprovalHierarchy(dto);
    }

    // Get All
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public List<ApprovalHierarchyDTO> getAllApprovalHierarchies() {

        return approvalHierarchyService.getAllApprovalHierarchies();
    }

    // Get By ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ApprovalHierarchyDTO getApprovalHierarchyById(
            @PathVariable Long id) {

        return approvalHierarchyService.getApprovalHierarchyById(id);
    }

    // Update
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApprovalHierarchyDTO updateApprovalHierarchy(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalHierarchyDTO dto) {

        return approvalHierarchyService.updateApprovalHierarchy(id, dto);
    }

    // Delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public String deleteApprovalHierarchy(
            @PathVariable Long id) {

        return approvalHierarchyService.deleteApprovalHierarchy(id);
    }
}