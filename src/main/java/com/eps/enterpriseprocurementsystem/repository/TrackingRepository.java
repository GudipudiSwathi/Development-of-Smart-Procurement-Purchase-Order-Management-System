package com.eps.enterpriseprocurementsystem.repository;

import com.eps.enterpriseprocurementsystem.entity.Tracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrackingRepository extends JpaRepository<Tracking, Long> {

    Optional<Tracking> findByPurchaseRequestPurchaseRequestId(
            Long purchaseRequestId
    );
}