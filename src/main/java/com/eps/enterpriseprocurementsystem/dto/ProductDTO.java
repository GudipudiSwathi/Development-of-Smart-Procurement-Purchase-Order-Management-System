package com.eps.enterpriseprocurementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ProductDTO {

    private Long productId;

    @NotBlank(message = "Product name is required")
    private String name;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than zero")
    private Double price;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private Integer numberOfQuantities;

    private Double totalPrice;

    @NotBlank(message = "Description is required")
    private String description;

    private String status;

    @NotNull(message = "Department is required")
    private Long departmentId;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "User is required")
    private Long userId;
}