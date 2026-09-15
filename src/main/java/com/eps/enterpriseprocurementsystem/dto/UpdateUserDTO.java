package com.eps.enterpriseprocurementsystem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserDTO {

    @NotBlank(message = "Username is required")
    private String username;

    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank(message = "Phone Number is required")
    private String phoneNumber;

    @NotBlank(message = "Designation is required")
    private String designation;

    @NotBlank(message = "Role is required")
    private String role;

    @NotNull(message = "Department is required")
    private Long departmentId;

    /*
     * Password is optional during edit.
     * If empty, the existing password is preserved.
     */
    private String password;
}