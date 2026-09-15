package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.FeedbackDTO;
import com.eps.enterpriseprocurementsystem.entity.Feedback;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequest;
import com.eps.enterpriseprocurementsystem.entity.User;
import com.eps.enterpriseprocurementsystem.enums.PurchaseRequestStatus;
import com.eps.enterpriseprocurementsystem.repository.FeedbackRepository;
import com.eps.enterpriseprocurementsystem.repository.PurchaseRequestRepository;
import com.eps.enterpriseprocurementsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private PurchaseRequestRepository purchaseRequestRepository;

    @Autowired
    private UserRepository userRepository;


    // =====================================================
    // SUBMIT FEEDBACK
    // =====================================================

    public FeedbackDTO submitFeedback(FeedbackDTO dto) {

        // -------------------------------------------------
        // Check rating
        // -------------------------------------------------

        if (dto.getRating() == null
                || dto.getRating() < 1
                || dto.getRating() > 5) {

            throw new RuntimeException(
                    "Rating must be between 1 and 5."
            );
        }


        // -------------------------------------------------
        // Prevent duplicate feedback
        // -------------------------------------------------

        if (feedbackRepository
                .existsByPurchaseRequestPurchaseRequestId(
                        dto.getPurchaseRequestId()
                )) {

            throw new RuntimeException(
                    "Feedback has already been submitted for this purchase request."
            );
        }


        // -------------------------------------------------
        // Find Purchase Request
        // -------------------------------------------------

        PurchaseRequest purchaseRequest =
                purchaseRequestRepository
                        .findById(dto.getPurchaseRequestId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Request not found."
                                )
                        );


        // -------------------------------------------------
        // Feedback only after successful completion
        // -------------------------------------------------

        if (purchaseRequest.getStatus()
                != PurchaseRequestStatus.APPROVED) {

            throw new RuntimeException(
                    "Feedback can be submitted only for an approved purchase request."
            );
        }


        // -------------------------------------------------
        // Find User
        // -------------------------------------------------

        User user =
                userRepository
                        .findById(dto.getUserId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found."
                                )
                        );


        // -------------------------------------------------
        // Make sure user belongs to purchase request
        // -------------------------------------------------

        if (purchaseRequest.getUser() == null
                || !purchaseRequest.getUser()
                .getUserId()
                .equals(user.getUserId())) {

            throw new RuntimeException(
                    "User does not belong to this purchase request."
            );
        }


        // -------------------------------------------------
        // Create Feedback
        // -------------------------------------------------

        Feedback feedback = new Feedback();

        feedback.setPurchaseRequest(
                purchaseRequest
        );

        feedback.setUser(
                user
        );

        feedback.setRating(
                dto.getRating()
        );

        feedback.setComment(
                dto.getComment()
        );

        feedback.setFeedbackDate(
                LocalDateTime.now()
        );


        Feedback savedFeedback =
                feedbackRepository.save(feedback);


        return convertToDTO(savedFeedback);
    }


    // =====================================================
    // GET FEEDBACK BY PURCHASE REQUEST
    // =====================================================

    public FeedbackDTO getFeedbackByPurchaseRequest(
            Long purchaseRequestId) {

        Feedback feedback =
                feedbackRepository
                        .findByPurchaseRequestPurchaseRequestId(
                                purchaseRequestId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Feedback not found for this purchase request."
                                )
                        );

        return convertToDTO(feedback);
    }


    // =====================================================
    // ENTITY -> DTO
    // =====================================================

    private FeedbackDTO convertToDTO(
            Feedback feedback) {

        FeedbackDTO dto = new FeedbackDTO();

        dto.setFeedbackId(
                feedback.getFeedbackId()
        );

        dto.setPurchaseRequestId(
                feedback.getPurchaseRequest()
                        .getPurchaseRequestId()
        );

        dto.setUserId(
                feedback.getUser()
                        .getUserId()
        );

        dto.setRating(
                feedback.getRating()
        );

        dto.setComment(
                feedback.getComment()
        );

        if (feedback.getFeedbackDate() != null) {

            dto.setFeedbackDate(
                    feedback.getFeedbackDate()
                            .toString()
            );
        }

        return dto;
    }
}