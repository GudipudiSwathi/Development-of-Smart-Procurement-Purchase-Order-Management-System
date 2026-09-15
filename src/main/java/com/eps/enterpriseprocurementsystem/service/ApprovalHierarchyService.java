package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.ApprovalHierarchyDTO;
import com.eps.enterpriseprocurementsystem.entity.ApprovalHierarchy;
import com.eps.enterpriseprocurementsystem.entity.Department;
import com.eps.enterpriseprocurementsystem.entity.User;
import com.eps.enterpriseprocurementsystem.enums.ApprovalStatus;
import com.eps.enterpriseprocurementsystem.repository.ApprovalHierarchyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApprovalHierarchyService {

    @Autowired
    private ApprovalHierarchyRepository approvalHierarchyRepository;

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private UserService userService;


    // =====================================================
    // Save Approval Hierarchy
    // =====================================================

    public ApprovalHierarchyDTO saveApprovalHierarchy(
            ApprovalHierarchyDTO dto) {

        validateHierarchyLevel(dto);

        ApprovalHierarchy approvalHierarchy =
                convertToEntity(dto);

        ApprovalHierarchy savedApproval =
                approvalHierarchyRepository.save(
                        approvalHierarchy
                );

        return convertToDTO(savedApproval);
    }


    // =====================================================
    // Get All
    // =====================================================

    public List<ApprovalHierarchyDTO>
    getAllApprovalHierarchies() {

        return approvalHierarchyRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =====================================================
    // Get By ID
    // =====================================================

    public ApprovalHierarchyDTO getApprovalHierarchyById(
            Long id) {

        ApprovalHierarchy approvalHierarchy =
                approvalHierarchyRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Approval Hierarchy not found"
                                )
                        );

        return convertToDTO(
                approvalHierarchy
        );
    }


    // =====================================================
    // Update
    // =====================================================

    public ApprovalHierarchyDTO updateApprovalHierarchy(
            Long id,
            ApprovalHierarchyDTO dto) {

        validateHierarchyLevel(dto);

        ApprovalHierarchy approvalHierarchy =
                approvalHierarchyRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Approval Hierarchy not found"
                                )
                        );


        // -------------------------------------------------
        // Department
        // -------------------------------------------------

        if (dto.getDepartmentId() != null) {

            Department department =
                    departmentService
                            .getDepartmentEntityById(
                                    dto.getDepartmentId()
                            );

            approvalHierarchy.setDepartment(
                    department
            );

        } else {

            // Centralized approval
            approvalHierarchy.setDepartment(
                    null
            );
        }


        // -------------------------------------------------
        // Approver
        // -------------------------------------------------

        User approver =
                userService.getUserEntityById(
                        dto.getApproverUserId()
                );

        approvalHierarchy.setApprover(
                approver
        );


        // -------------------------------------------------
        // Other fields
        // -------------------------------------------------

        approvalHierarchy.setLevel(
                dto.getLevel()
        );

        approvalHierarchy.setApproverRole(
                dto.getApproverRole()
        );

        approvalHierarchy.setStatus(
                ApprovalStatus.ACTIVE
        );


        ApprovalHierarchy updated =
                approvalHierarchyRepository.save(
                        approvalHierarchy
                );

        return convertToDTO(
                updated
        );
    }


    // =====================================================
    // Delete
    // =====================================================

    public String deleteApprovalHierarchy(
            Long id) {

        ApprovalHierarchy approvalHierarchy =
                approvalHierarchyRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Approval Hierarchy not found"
                                )
                        );

        approvalHierarchyRepository.delete(
                approvalHierarchy
        );

        return "Approval Hierarchy deleted successfully.";
    }


    // =====================================================
    // DTO -> Entity
    // =====================================================

    private ApprovalHierarchy convertToEntity(
            ApprovalHierarchyDTO dto) {

        ApprovalHierarchy approvalHierarchy =
                new ApprovalHierarchy();


        // -------------------------------------------------
        // Department
        // -------------------------------------------------

        if (dto.getDepartmentId() != null) {

            Department department =
                    departmentService
                            .getDepartmentEntityById(
                                    dto.getDepartmentId()
                            );

            approvalHierarchy.setDepartment(
                    department
            );

        } else {

            // Level 2 and Level 3 are centralized
            approvalHierarchy.setDepartment(
                    null
            );
        }


        // -------------------------------------------------
        // Approver
        // -------------------------------------------------

        User approver =
                userService.getUserEntityById(
                        dto.getApproverUserId()
                );

        approvalHierarchy.setApprover(
                approver
        );


        // -------------------------------------------------
        // Other fields
        // -------------------------------------------------

        approvalHierarchy.setLevel(
                dto.getLevel()
        );

        approvalHierarchy.setApproverRole(
                dto.getApproverRole()
        );

        approvalHierarchy.setStatus(
                ApprovalStatus.ACTIVE
        );


        return approvalHierarchy;
    }


    // =====================================================
    // Entity -> DTO
    // =====================================================

    private ApprovalHierarchyDTO convertToDTO(
            ApprovalHierarchy approvalHierarchy) {

        ApprovalHierarchyDTO dto =
                new ApprovalHierarchyDTO();


        dto.setApprovalHierarchyId(
                approvalHierarchy
                        .getApprovalHierarchyId()
        );


        // Department can be NULL for centralized levels
        if (approvalHierarchy.getDepartment() != null) {

            dto.setDepartmentId(
                    approvalHierarchy
                            .getDepartment()
                            .getDepartmentId()
            );

        } else {

            dto.setDepartmentId(
                    null
            );
        }


        if (approvalHierarchy.getApprover() != null) {

            dto.setApproverUserId(
                    approvalHierarchy
                            .getApprover()
                            .getUserId()
            );
        }


        dto.setLevel(
                approvalHierarchy.getLevel()
        );

        dto.setApproverRole(
                approvalHierarchy.getApproverRole()
        );

        dto.setStatus(
                approvalHierarchy.getStatus().name()
        );


        return dto;
    }


    // =====================================================
    // Validate Hierarchy Level
    // =====================================================

    private void validateHierarchyLevel(
            ApprovalHierarchyDTO dto) {

        if (dto.getLevel() == null) {

            throw new RuntimeException(
                    "Approval level is required."
            );
        }


        if (dto.getApproverUserId() == null) {

            throw new RuntimeException(
                    "Approver user is required."
            );
        }


        // -------------------------------------------------
        // Level 1 = Department-specific Manager
        // -------------------------------------------------

        if (dto.getLevel() == 1
                && dto.getDepartmentId() == null) {

            throw new RuntimeException(
                    "Department is required for Level 1 Manager."
            );
        }


        // -------------------------------------------------
        // Level 2 and Level 3 = Centralized
        // -------------------------------------------------

        if (dto.getLevel() == 2
                || dto.getLevel() == 3) {

            // departmentId must be NULL
            // for centralized approval.
            //
            // If a department is supplied, we ignore it
            // by setting department = null in convertToEntity().
        }
    }
}