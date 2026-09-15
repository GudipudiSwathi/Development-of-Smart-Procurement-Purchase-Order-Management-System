package com.eps.enterpriseprocurementsystem.repository;

import com.eps.enterpriseprocurementsystem.entity.ApprovalHierarchy;
import com.eps.enterpriseprocurementsystem.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApprovalHierarchyRepository
        extends JpaRepository<ApprovalHierarchy, Long> {

    // =====================================================
    // Level 1 - Department-specific Manager
    // =====================================================

    Optional<ApprovalHierarchy>
    findByDepartmentDepartmentIdAndLevelAndStatus(
            Long departmentId,
            Integer level,
            ApprovalStatus status
    );


    // =====================================================
    // Level 2 & Level 3 - Centralized Approvers
    // =====================================================

    Optional<ApprovalHierarchy>
    findByLevelAndStatus(
            Integer level,
            ApprovalStatus status
    );
}