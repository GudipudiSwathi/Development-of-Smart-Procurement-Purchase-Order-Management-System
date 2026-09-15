package com.eps.enterpriseprocurementsystem.repository;

import com.eps.enterpriseprocurementsystem.entity.PurchaseRequestItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchaseRequestItemRepository
        extends JpaRepository<PurchaseRequestItem, Long> {
}