package com.eps.enterpriseprocurementsystem.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewRequestDTO {
    @NotNull(message = "Purchase request is required")
    private Long purchaseRequestId;

    @NotNull(message = "Product is required")
    private Long productId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    @Size(max = 2000, message = "Feedback cannot exceed 2000 characters")
    private String feedback;
}
