package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.CategoryDTO;
import com.eps.enterpriseprocurementsystem.dto.DepartmentDTO;
import com.eps.enterpriseprocurementsystem.service.CategoryService;
import com.eps.enterpriseprocurementsystem.service.DepartmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private CategoryService categoryService;


    // =====================================================
    // SAVE DEPARTMENT - ADMIN ONLY
    // =====================================================

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public DepartmentDTO saveDepartment(
            @Valid @RequestBody DepartmentDTO dto) {

        return departmentService.saveDepartment(dto);
    }


    // =====================================================
    // GET ALL DEPARTMENTS
    // PUBLIC
    // Used by Registration Page
    // =====================================================

    @GetMapping
    public List<DepartmentDTO> getAllDepartments() {

        return departmentService.getAllDepartments();
    }


    // =====================================================
    // GET DEPARTMENT BY ID
    // ADMIN & EMPLOYEE
    // =====================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public DepartmentDTO getDepartmentById(
            @PathVariable Long id) {

        return departmentService.getDepartmentById(id);
    }


    // =====================================================
    // UPDATE DEPARTMENT - ADMIN ONLY
    // =====================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public DepartmentDTO updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentDTO dto) {

        return departmentService.updateDepartment(id, dto);
    }


    // =====================================================
    // DELETE DEPARTMENT - ADMIN ONLY
    // =====================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public String deleteDepartment(
            @PathVariable Long id) {

        return departmentService.deleteDepartment(id);
    }


    // =====================================================
    // GET CATEGORIES BY DEPARTMENT
    // ADMIN & EMPLOYEE
    // =====================================================

    @GetMapping("/{id}/categories")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public List<CategoryDTO> getCategoriesByDepartment(
            @PathVariable Long id) {

        return categoryService.getCategoriesByDepartmentId(id);
    }
}