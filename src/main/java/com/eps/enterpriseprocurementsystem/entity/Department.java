package com.eps.enterpriseprocurementsystem.entity;

import jakarta.persistence.*;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "department")
@Data
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long departmentId;

    @NotBlank(message = "Department name cannot be blank")
    @Size(min = 2, max = 50, message = "Department name must be between 2 and 50 characters")
    @Column(name = "department_name")
    private String departmentName;

    @NotBlank(message = "Manager name cannot be blank")
    @Size(min = 2, max = 50, message = "Manager name must be between 2 and 50 characters")
    @Column(name = "manager_department")
    private String managerDepartment;

}