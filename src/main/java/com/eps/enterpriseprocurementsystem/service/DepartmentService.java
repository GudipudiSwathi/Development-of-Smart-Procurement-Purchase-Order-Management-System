package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.DepartmentDTO;
import com.eps.enterpriseprocurementsystem.entity.Department;
import com.eps.enterpriseprocurementsystem.exception.DepartmentAlreadyExistsException;
import com.eps.enterpriseprocurementsystem.exception.DepartmentNotFoundException;
import com.eps.enterpriseprocurementsystem.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;


    // =====================================================
    // SAVE DEPARTMENT
    // =====================================================

    public DepartmentDTO saveDepartment(DepartmentDTO dto) {

        String departmentName =
                dto.getDepartmentName().trim();

        // Check duplicate department name
        if (departmentRepository
                .findByDepartmentName(departmentName)
                .isPresent()) {

            throw new DepartmentAlreadyExistsException(
                    "Department already exists."
            );
        }

        Department department = new Department();

        department.setDepartmentName(
                departmentName
        );

        /*
         * Manager is optional.
         * Approval managers are configured separately
         * through ApprovalHierarchy.
         */
        if (dto.getManagerDepartment() != null
                && !dto.getManagerDepartment().trim().isEmpty()) {

            department.setManagerDepartment(
                    dto.getManagerDepartment().trim()
            );

        } else {

            department.setManagerDepartment(null);
        }

        Department savedDepartment =
                departmentRepository.save(department);

        return convertToDTO(savedDepartment);
    }


    // =====================================================
    // GET ALL DEPARTMENTS
    // =====================================================

    public List<DepartmentDTO> getAllDepartments() {

        return departmentRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =====================================================
    // GET DEPARTMENT BY ID
    // =====================================================

    public DepartmentDTO getDepartmentById(Long id) {

        Department department =
                departmentRepository.findById(id)
                        .orElseThrow(() ->
                                new DepartmentNotFoundException(
                                        "Department not found with ID : "
                                                + id
                                )
                        );

        return convertToDTO(department);
    }


    // =====================================================
    // GET DEPARTMENT ENTITY BY ID
    // Used by other services
    // =====================================================

    public Department getDepartmentEntityById(Long id) {

        return departmentRepository.findById(id)
                .orElseThrow(() ->
                        new DepartmentNotFoundException(
                                "Department not found with ID : "
                                        + id
                        )
                );
    }


    // =====================================================
    // UPDATE DEPARTMENT
    // =====================================================

    public DepartmentDTO updateDepartment(
            Long id,
            DepartmentDTO dto) {

        Department existingDepartment =
                departmentRepository.findById(id)
                        .orElseThrow(() ->
                                new DepartmentNotFoundException(
                                        "Department not found with ID : "
                                                + id
                                )
                        );

        String departmentName =
                dto.getDepartmentName().trim();

        /*
         * Prevent duplicate names when updating.
         */
        departmentRepository
                .findByDepartmentName(departmentName)
                .ifPresent(existing -> {

                    if (!existing.getDepartmentId()
                            .equals(id)) {

                        throw new DepartmentAlreadyExistsException(
                                "Department already exists."
                        );
                    }
                });

        existingDepartment.setDepartmentName(
                departmentName
        );

        /*
         * Manager is optional.
         */
        if (dto.getManagerDepartment() != null
                && !dto.getManagerDepartment().trim().isEmpty()) {

            existingDepartment.setManagerDepartment(
                    dto.getManagerDepartment().trim()
            );

        } else {

            existingDepartment.setManagerDepartment(null);
        }

        Department updatedDepartment =
                departmentRepository.save(
                        existingDepartment
                );

        return convertToDTO(updatedDepartment);
    }


    // =====================================================
    // DELETE DEPARTMENT
    // =====================================================

    public String deleteDepartment(Long id) {

        Department department =
                departmentRepository.findById(id)
                        .orElseThrow(() ->
                                new DepartmentNotFoundException(
                                        "Department not found with ID : "
                                                + id
                                )
                        );

        departmentRepository.delete(department);

        return "Department deleted successfully.";
    }


    // =====================================================
    // ENTITY -> DTO
    // =====================================================

    private DepartmentDTO convertToDTO(
            Department department) {

        DepartmentDTO dto = new DepartmentDTO();

        dto.setDepartmentId(
                department.getDepartmentId()
        );

        dto.setDepartmentName(
                department.getDepartmentName()
        );

        dto.setManagerDepartment(
                department.getManagerDepartment()
        );

        return dto;
    }
}