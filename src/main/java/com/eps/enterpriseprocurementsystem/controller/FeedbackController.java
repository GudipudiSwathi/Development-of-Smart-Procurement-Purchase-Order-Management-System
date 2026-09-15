package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.FeedbackDTO;
import com.eps.enterpriseprocurementsystem.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;


    // =====================================================
    // SUBMIT FEEDBACK
    // =====================================================
    //
    // Employee can submit feedback for their own
    // completed purchase request.
    // =====================================================

    @PostMapping
    @PreAuthorize("hasAuthority('EMPLOYEE')")
    public FeedbackDTO submitFeedback(
            @Valid @RequestBody FeedbackDTO dto) {

        return feedbackService.submitFeedback(dto);
    }


    // =====================================================
    // GET FEEDBACK BY PURCHASE REQUEST
    // =====================================================

    @GetMapping("/purchase-request/{purchaseRequestId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public FeedbackDTO getFeedbackByPurchaseRequest(
            @PathVariable Long purchaseRequestId) {

        return feedbackService.getFeedbackByPurchaseRequest(
                purchaseRequestId
        );
    }
}