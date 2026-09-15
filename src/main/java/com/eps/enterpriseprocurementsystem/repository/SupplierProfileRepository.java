package com.eps.enterpriseprocurementsystem.repository;

import com.eps.enterpriseprocurementsystem.entity.SupplierProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupplierProfileRepository extends JpaRepository<SupplierProfile, Long> {

    Optional<SupplierProfile> findByUserUserId(Long userId);

    boolean existsByUserUserId(Long userId);
}