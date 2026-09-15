package com.eps.enterpriseprocurementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DepartmentDTO {

    private Long departmentId;

    @NotBlank(message = "Department name cannot be blank")
    @Size(
            min = 2,
            max = 50,
            message = "Department name must be between 2 and 50 characters"
    )
    private String departmentName;

    /*
     * Optional.
     * Department managers are configured through ApprovalHierarchy.
     */
    @Size(
            min = 2,
            max = 50,
            message = "Manager name must be between 2 and 50 characters"
    )
    private String managerDepartment;
}