package com.eps.enterpriseprocurementsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "employee")
@Data
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long employeeId;

    @NotBlank(message = "Employee name cannot be blank")
    private String employeeName;

    @Email(message = "Invalid email")
    private String email;

    @Positive(message = "Salary must be positive")
    private Double salary;

    @NotBlank(message = "Designation cannot be blank")
    private String designation;

    @ManyToOne
    @JoinColumn(name = "department_id")
    @JsonBackReference
    private Department department;
}