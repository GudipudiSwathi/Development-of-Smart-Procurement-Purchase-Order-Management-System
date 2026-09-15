package com.eps.enterpriseprocurementsystem.repository;

import com.eps.enterpriseprocurementsystem.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByPurchaseRequestPurchaseRequestIdAndProductProductIdAndUserUserId(
            Long purchaseRequestId,
            Long productId,
            Long userId
    );

    List<Review> findByUserUserIdOrderByCreatedAtDesc(
            Long userId
    );

    /*
     * IMPORTANT:
     * Supplier ownership is determined through:
     *
     * Review -> Product -> User
     *
     * This avoids depending on old/incorrect supplier_id
     * values stored in existing review records.
     */
    List<Review> findByProductUserUserIdOrderByCreatedAtDesc(
            Long userId
    );

    List<Review> findAllByOrderByCreatedAtDesc();
}