package com.eps.enterpriseprocurementsystem.dto;

import lombok.Data;

@Data
public class ApprovalHierarchyDTO {

    private Long approvalHierarchyId;

    /*
     * Department is required only for Level 1.
     *
     * Level 1  → Department-specific Manager
     * Level 2  → Centralized Finance
     * Level 3  → Centralized Procurement Head
     */
    private Long departmentId;

    private Long approverUserId;

    private Integer level;

    private String approverRole;

    private String status;
}