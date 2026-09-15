package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.ReviewDTO;
import com.eps.enterpriseprocurementsystem.dto.ReviewRequestDTO;
import com.eps.enterpriseprocurementsystem.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "http://localhost:4200")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('EMPLOYEE')")
    public ReviewDTO createReview(
            @Valid @RequestBody ReviewRequestDTO dto,
            Authentication authentication) {
        return reviewService.createReview(dto, authentication.getName());
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('EMPLOYEE')")
    public List<ReviewDTO> getMyReviews(Authentication authentication) {
        return reviewService.getMyReviews(authentication.getName());
    }

    @GetMapping("/supplier")
    @PreAuthorize("hasAuthority('SUPPLIER')")
    public List<ReviewDTO> getSupplierReviews(Authentication authentication) {
        return reviewService.getSupplierReviews(authentication.getName());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<ReviewDTO> getAllReviews() {
        return reviewService.getAllReviews();
    }
}
