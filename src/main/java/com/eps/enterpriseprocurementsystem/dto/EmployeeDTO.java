package com.eps.enterpriseprocurementsystem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class EmployeeDTO {

    private Long employeeId;

    @NotBlank(message = "Employee name cannot be blank")
    private String employeeName;

    @Email(message = "Invalid email")
    private String email;

    @Positive(message = "Salary must be positive")
    private Double salary;

    @NotBlank(message = "Designation cannot be blank")
    private String designation;

    private Long departmentId;
}