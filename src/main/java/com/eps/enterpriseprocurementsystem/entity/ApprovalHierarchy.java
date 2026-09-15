package com.eps.enterpriseprocurementsystem.entity;

import com.eps.enterpriseprocurementsystem.enums.ApprovalStatus;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "approval_hierarchy")
@Data
public class ApprovalHierarchy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long approvalHierarchyId;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "approver_user_id")
    private User approver;

    private Integer level;

    private String approverRole;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus status;
}