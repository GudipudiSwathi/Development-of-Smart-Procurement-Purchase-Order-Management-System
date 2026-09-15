package com.eps.enterpriseprocurementsystem.repository;

import com.eps.enterpriseprocurementsystem.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedbackRepository
        extends JpaRepository<Feedback, Long> {

    Optional<Feedback> findByPurchaseRequestPurchaseRequestId(
            Long purchaseRequestId
    );

    boolean existsByPurchaseRequestPurchaseRequestId(
            Long purchaseRequestId
    );
}