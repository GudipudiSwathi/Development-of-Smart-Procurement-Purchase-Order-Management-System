package com.eps.enterpriseprocurementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryDTO {

    private Long categoryId;

    @NotBlank(message = "Category name cannot be blank")
    @Size(min = 2, max = 50,
            message = "Category name must be between 2 and 50 characters")
    private String categoryName;

    private Long departmentId;
}