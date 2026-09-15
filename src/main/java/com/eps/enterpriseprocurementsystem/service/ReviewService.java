package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.ReviewDTO;
import com.eps.enterpriseprocurementsystem.dto.ReviewRequestDTO;
import com.eps.enterpriseprocurementsystem.entity.Product;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequest;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequestItem;
import com.eps.enterpriseprocurementsystem.entity.Review;
import com.eps.enterpriseprocurementsystem.entity.Supplier;
import com.eps.enterpriseprocurementsystem.entity.User;
import com.eps.enterpriseprocurementsystem.enums.DeliveryStatus;
import com.eps.enterpriseprocurementsystem.enums.PurchaseRequestStatus;
import com.eps.enterpriseprocurementsystem.repository.PurchaseRequestRepository;
import com.eps.enterpriseprocurementsystem.repository.ReviewRepository;
import com.eps.enterpriseprocurementsystem.repository.SupplierRepository;
import com.eps.enterpriseprocurementsystem.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            PurchaseRequestRepository purchaseRequestRepository,
            UserRepository userRepository,
            SupplierRepository supplierRepository) {

        this.reviewRepository = reviewRepository;
        this.purchaseRequestRepository = purchaseRequestRepository;
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
    }


    // =========================================================
    // CREATE REVIEW
    // =========================================================

    @Transactional
    public ReviewDTO createReview(
            ReviewRequestDTO dto,
            String username) {

        User employee =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee account not found."
                                )
                        );


        PurchaseRequest request =
                purchaseRequestRepository
                        .findById(dto.getPurchaseRequestId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Request not found."
                                )
                        );


        // -----------------------------------------------------
        // Verify employee owns request
        // -----------------------------------------------------

        if (request.getUser() == null ||
                !request.getUser()
                        .getUserId()
                        .equals(employee.getUserId())) {

            throw new RuntimeException(
                    "You are not authorized to review this purchase request."
            );
        }


        // -----------------------------------------------------
        // Request must be approved
        // -----------------------------------------------------

        if (request.getStatus() !=
                PurchaseRequestStatus.APPROVED) {

            throw new RuntimeException(
                    "Reviews are available only for approved purchase requests."
            );
        }


        // -----------------------------------------------------
        // Request must be delivered
        // -----------------------------------------------------

        if (request.getDeliveryStatus() !=
                DeliveryStatus.DELIVERED) {

            throw new RuntimeException(
                    "Reviews are available only after the order is delivered."
            );
        }


        // -----------------------------------------------------
        // Find product inside this request
        // -----------------------------------------------------

        PurchaseRequestItem matchedItem = null;

        if (request.getItems() != null) {

            for (PurchaseRequestItem item :
                    request.getItems()) {

                if (item.getProduct() != null &&
                        item.getProduct()
                                .getProductId()
                                .equals(dto.getProductId())) {

                    matchedItem = item;
                    break;
                }
            }
        }


        if (matchedItem == null) {

            throw new RuntimeException(
                    "This product does not belong to the purchase request."
            );
        }


        Product product =
                matchedItem.getProduct();


        // =====================================================
        // FIND SUPPLIER FROM PRODUCT OWNER
        // =====================================================
        //
        // Product
        //    ↓
        // Product.user
        //    ↓
        // Supplier
        //
        // This is the reliable supplier relationship.
        // =====================================================

        User productOwner =
                product.getUser();


        if (productOwner == null) {

            throw new RuntimeException(
                    "This product does not have a supplier owner."
            );
        }


        Supplier supplier =
                supplierRepository
                        .findByUserUserId(
                                productOwner.getUserId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No supplier is linked to this product owner."
                                )
                        );


        if (supplier.getSupplierId() == null ||
                supplier.getSupplierId() <= 0) {

            throw new RuntimeException(
                    "Invalid supplier assigned to this product."
            );
        }


        // -----------------------------------------------------
        // Prevent duplicate review
        // -----------------------------------------------------

        boolean alreadyReviewed =
                reviewRepository
                        .existsByPurchaseRequestPurchaseRequestIdAndProductProductIdAndUserUserId(
                                request.getPurchaseRequestId(),
                                product.getProductId(),
                                employee.getUserId()
                        );


        if (alreadyReviewed) {

            throw new RuntimeException(
                    "You have already reviewed this product."
            );
        }


        // =====================================================
        // CREATE REVIEW
        // =====================================================

        Review review =
                new Review();


        review.setPurchaseRequest(
                request
        );


        review.setProduct(
                product
        );


        review.setUser(
                employee
        );


        // IMPORTANT:
        // Always save the correct supplier.

        review.setSupplier(
                supplier
        );


        review.setRating(
                dto.getRating()
        );


        review.setFeedback(
                dto.getFeedback() == null
                        ? null
                        : dto.getFeedback().trim()
        );


        Review savedReview =
                reviewRepository.save(
                        review
                );


        // -----------------------------------------------------
        // Update supplier rating
        // -----------------------------------------------------

        refreshSupplierRating(
                supplier
        );


        return convertToDTO(
                savedReview
        );
    }


    // =========================================================
    // EMPLOYEE - MY REVIEWS
    // =========================================================

    public List<ReviewDTO> getMyReviews(
            String username) {

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User account not found."
                                )
                        );


        return reviewRepository
                .findByUserUserIdOrderByCreatedAtDesc(
                        user.getUserId()
                )
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =========================================================
    // SUPPLIER - THEIR REVIEWS
    // =========================================================

    public List<ReviewDTO> getSupplierReviews(
            String username) {

        Supplier supplier =
                supplierRepository
                        .findByUserUsername(username)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Supplier record not found."
                                )
                        );


        if (supplier.getUser() == null ||
                supplier.getUser().getUserId() == null) {

            throw new RuntimeException(
                    "Supplier is not linked to a Business account."
            );
        }


        Long supplierUserId =
                supplier.getUser().getUserId();


        /*
         * IMPORTANT:
         *
         * We find reviews using:
         *
         * Review -> Product -> User
         *
         * instead of:
         *
         * Review -> Supplier
         *
         * This allows reviews to still be displayed even
         * if older review rows contain an incorrect supplier_id.
         */

        return reviewRepository
                .findByProductUserUserIdOrderByCreatedAtDesc(
                        supplierUserId
                )
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =========================================================
    // ADMIN - ALL REVIEWS
    // =========================================================

    public List<ReviewDTO> getAllReviews() {

        return reviewRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =========================================================
    // UPDATE SUPPLIER RATING
    // =========================================================

    private void refreshSupplierRating(
            Supplier supplier) {

        if (supplier == null ||
                supplier.getSupplierId() == null) {

            return;
        }


        if (supplier.getUser() == null ||
                supplier.getUser().getUserId() == null) {

            return;
        }


        Long supplierUserId =
                supplier.getUser().getUserId();


        List<Review> reviews =
                reviewRepository
                        .findByProductUserUserIdOrderByCreatedAtDesc(
                                supplierUserId
                        );


        double average =
                reviews
                        .stream()
                        .mapToInt(
                                Review::getRating
                        )
                        .average()
                        .orElse(0.0);


        supplier.setRating(
                Math.round(
                        average * 100.0
                ) / 100.0
        );


        /*
         * Store the latest feedback as supplier feedback.
         */

        if (!reviews.isEmpty()) {

            supplier.setFeedback(
                    reviews.get(0).getFeedback()
            );
        }


        supplierRepository.save(
                supplier
        );
    }


    // =========================================================
    // CONVERT REVIEW -> DTO
    // =========================================================

    private ReviewDTO convertToDTO(
            Review review) {

        ReviewDTO dto =
                new ReviewDTO();


        // -----------------------------------------------------
        // Review ID
        // -----------------------------------------------------

        dto.setReviewId(
                review.getReviewId()
        );


        // -----------------------------------------------------
        // Purchase Request
        // -----------------------------------------------------

        if (review.getPurchaseRequest() != null) {

            dto.setPurchaseRequestId(
                    review.getPurchaseRequest()
                            .getPurchaseRequestId()
            );
        }


        // -----------------------------------------------------
        // Product
        // -----------------------------------------------------

        Product product =
                review.getProduct();


        if (product != null) {

            dto.setProductId(
                    product.getProductId()
            );


            dto.setProductName(
                    product.getName()
            );
        }


        // -----------------------------------------------------
        // Employee
        // -----------------------------------------------------

        if (review.getUser() != null) {

            dto.setEmployeeId(
                    review.getUser()
                            .getUserId()
            );


            dto.setEmployeeName(
                    review.getUser()
                            .getUsername()
            );
        }


        // =====================================================
        // SUPPLIER
        // =====================================================
        //
        // IMPORTANT:
        //
        // Do NOT blindly use:
        //
        // review.getSupplier()
        //
        // because old records may contain supplier_id = 0.
        //
        // Resolve supplier using:
        //
        // Product -> User -> Supplier
        //
        // =====================================================

        Supplier supplier = null;


        if (product != null &&
                product.getUser() != null &&
                product.getUser().getUserId() != null) {

            supplier =
                    supplierRepository
                            .findByUserUserId(
                                    product.getUser()
                                            .getUserId()
                            )
                            .orElse(null);
        }


        if (supplier != null) {

            dto.setSupplierId(
                    supplier.getSupplierId()
            );


            dto.setSupplierName(
                    supplier.getSupplierName()
            );
        }


        // -----------------------------------------------------
        // Rating
        // -----------------------------------------------------

        dto.setRating(
                review.getRating()
        );


        // -----------------------------------------------------
        // Feedback
        // -----------------------------------------------------

        dto.setFeedback(
                review.getFeedback()
        );


        // -----------------------------------------------------
        // Created / Updated
        // -----------------------------------------------------

        dto.setCreatedAt(
                review.getCreatedAt()
        );


        dto.setUpdatedAt(
                review.getUpdatedAt()
        );


        return dto;
    }
}