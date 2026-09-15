
package com.eps.enterpriseprocurementsystem.service;


import com.eps.enterpriseprocurementsystem.dto.SupplierDashboardSummaryDTO;
import com.eps.enterpriseprocurementsystem.dto.SupplierPurchaseRequestDTO;
import com.eps.enterpriseprocurementsystem.dto.SupplierPurchaseRequestItemDTO;

import com.eps.enterpriseprocurementsystem.entity.PaymentTransaction;
import com.eps.enterpriseprocurementsystem.entity.Product;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequest;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequestItem;
import com.eps.enterpriseprocurementsystem.entity.Supplier;
import com.eps.enterpriseprocurementsystem.entity.User;

import com.eps.enterpriseprocurementsystem.enums.PaymentTransactionStatus;
import com.eps.enterpriseprocurementsystem.enums.DeliveryStatus;
import com.eps.enterpriseprocurementsystem.enums.PurchaseRequestStatus;

import com.eps.enterpriseprocurementsystem.repository.PaymentTransactionRepository;
import com.eps.enterpriseprocurementsystem.repository.PurchaseRequestRepository;
import com.eps.enterpriseprocurementsystem.repository.SupplierRepository;
import com.eps.enterpriseprocurementsystem.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;


@Service
public class SupplierDashboardService {


    // =====================================================
    // REPOSITORIES
    // =====================================================

    @Autowired
    private SupplierRepository supplierRepository;


    @Autowired
    private PurchaseRequestRepository purchaseRequestRepository;


    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;


    @Autowired
    private UserRepository userRepository;


    // =====================================================
    // GET SUPPLIER FOR LOGGED-IN BUSINESS USER
    // =====================================================

    private Supplier getSupplierByUsername(
            String username) {

        if (username == null
                || username.trim().isEmpty()) {

            throw new RuntimeException(
                    "Username is required."
            );
        }


        username = username.trim();


        // -------------------------------------------------
        // FIRST: FIND THROUGH USER RELATIONSHIP
        // -------------------------------------------------

        var linkedSupplier =
                supplierRepository
                        .findByUserUsername(username);


        if (linkedSupplier.isPresent()) {

            Supplier supplier =
                    linkedSupplier.get();


            repairSupplierStatus(
                    supplier
            );


            return supplier;
        }


        // =================================================
        // FALLBACK / LEGACY DATA REPAIR
        // =================================================

        /*
         * Existing supplier records may have been created
         * before Business login was introduced.
         *
         * In that case:
         *
         * User exists
         * Supplier exists
         * but suppliers.user_id is NULL.
         *
         * We connect the existing Supplier to the logged-in
         * Business User when the supplier name matches the
         * username.
         */

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Logged-in user not found."
                                        )
                        );


        // -------------------------------------------------
        // ONLY SUPPLIER USERS CAN USE THIS FALLBACK
        // -------------------------------------------------

        if (!"SUPPLIER".equalsIgnoreCase(
                user.getRole())) {

            throw new RuntimeException(
                    "User is not a Business/Supplier account."
            );
        }


        // -------------------------------------------------
        // FIND EXISTING SUPPLIER BY NAME
        // -------------------------------------------------

        List<Supplier> suppliers =
                supplierRepository.findAll();


        Supplier matchingSupplier =
                null;


        for (Supplier supplier :
                suppliers) {

            if (supplier.getSupplierName() == null) {

                continue;
            }


            if (supplier.getSupplierName()
                    .trim()
                    .equalsIgnoreCase(username)) {

                // -----------------------------------------
                // Don't take a supplier already linked
                // to another user.
                // -----------------------------------------

                if (supplier.getUser() != null) {

                    continue;
                }


                matchingSupplier =
                        supplier;

                break;
            }
        }


        // -------------------------------------------------
        // NO MATCHING SUPPLIER
        // -------------------------------------------------

        if (matchingSupplier == null) {

            throw new RuntimeException(
                    "No Supplier record is linked to Business account: "
                            + username
            );
        }


        // -------------------------------------------------
        // LINK SUPPLIER -> USER
        // -------------------------------------------------

        matchingSupplier.setUser(
                user
        );


        repairSupplierStatus(
                matchingSupplier
        );


        Supplier savedSupplier =
                supplierRepository.save(
                        matchingSupplier
                );


        return savedSupplier;
    }


    // =====================================================
    // REPAIR SUPPLIER STATUS
    // =====================================================

    private void repairSupplierStatus(
            Supplier supplier) {

        if (supplier == null) {

            return;
        }


        if (supplier.getStatus() == null) {

            supplier.setStatus(
                    com.eps.enterpriseprocurementsystem.enums.SupplierStatus.ACTIVE
            );


            supplierRepository.save(
                    supplier
            );
        }
    }


    // =====================================================
    // GET ALL REQUESTS FOR SUPPLIER
    // =====================================================

    private List<SupplierPurchaseRequestDTO>
    getSupplierRequests(
            String username) {

        Supplier supplier =
                getSupplierByUsername(
                        username
                );


        Long supplierId =
                supplier.getSupplierId();


        List<PurchaseRequest> requests =
                purchaseRequestRepository
                        .findDistinctByItemsSupplierSupplierId(
                                supplierId
                        );


        List<SupplierPurchaseRequestDTO> result =
                new ArrayList<>();


        for (PurchaseRequest request :
                requests) {

            // -------------------------------------------------
            // ONLY APPROVED REQUESTS
            // -------------------------------------------------

            if (request.getStatus()
                    != PurchaseRequestStatus.APPROVED) {

                continue;
            }


            SupplierPurchaseRequestDTO dto =
                    convertToDTO(
                            request,
                            supplierId
                    );


            result.add(
                    dto
            );
        }


        // -------------------------------------------------
        // NEWEST FIRST
        // -------------------------------------------------

        result.sort(
                Comparator.comparing(
                        SupplierPurchaseRequestDTO
                                ::getRequestDate,

                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                )
        );


        return result;
    }


    // =====================================================
    // PENDING REQUESTS
    // =====================================================

    public List<SupplierPurchaseRequestDTO>
    getPendingRequests(
            String username) {

        return getSupplierRequests(
                username
        )
                .stream()
                // Supplier sees the request ONLY after payment succeeds.
                // Approved-but-unpaid requests remain hidden.
                .filter(
                        dto ->
                                "SUCCESS".equals(
                                        dto.getPaymentStatus()
                                )
                )
                // Paid request stays pending until delivery is completed.
                .filter(
                        dto ->
                                !DeliveryStatus.DELIVERED.name()
                                        .equals(dto.getDeliveryStatus())
                )
                .toList();
    }


    // =====================================================
    // COMPLETED REQUESTS
    // =====================================================

    public List<SupplierPurchaseRequestDTO>
    getCompletedRequests(
            String username) {

        return getSupplierRequests(
                username
        )
                .stream()
                // Completed means paid AND delivered.
                .filter(
                        dto ->
                                "SUCCESS".equals(
                                        dto.getPaymentStatus()
                                )
                )
                .filter(
                        dto ->
                                DeliveryStatus.DELIVERED.name()
                                        .equals(dto.getDeliveryStatus())
                )
                .toList();
    }


    // =====================================================
    // PAYMENT HISTORY
    // =====================================================

    public List<SupplierPurchaseRequestDTO>
    getPaymentHistory(
            String username) {

        return getSupplierRequests(
                username
        )
                .stream()
                .filter(
                        dto ->
                                "SUCCESS".equals(
                                        dto.getPaymentStatus()
                                )
                                        ||
                                        "FAILED".equals(
                                                dto.getPaymentStatus()
                                        )
                )
                .toList();
    }


    // =====================================================
    // DASHBOARD SUMMARY
    // =====================================================

    public SupplierDashboardSummaryDTO
    getDashboardSummary(
            String username) {

        List<SupplierPurchaseRequestDTO>
                requests =
                getSupplierRequests(
                        username
                );


        long pending =
                requests
                        .stream()
                        // Paid requests that are not delivered yet.
                        .filter(
                                dto ->
                                        "SUCCESS".equals(
                                                dto.getPaymentStatus()
                                        )
                        )
                        .filter(
                                dto ->
                                        !DeliveryStatus.DELIVERED.name()
                                                .equals(dto.getDeliveryStatus())
                        )
                        .count();


        long completed =
                requests
                        .stream()
                        // Completed means paid + delivered.
                        .filter(
                                dto ->
                                        "SUCCESS".equals(
                                                dto.getPaymentStatus()
                                        )
                        )
                        .filter(
                                dto ->
                                        DeliveryStatus.DELIVERED.name()
                                                .equals(dto.getDeliveryStatus())
                        )
                        .count();


        double totalPaid =
                requests
                        .stream()
                        .filter(
                                dto ->
                                        "SUCCESS".equals(
                                                dto.getPaymentStatus()
                                        )
                        )
                        .map(
                                dto ->
                                        dto.getSupplierAmount()
                                                == null
                                                ? 0.0
                                                : dto.getSupplierAmount()
                        )
                        .mapToDouble(
                                Double::doubleValue
                        )
                        .sum();


        SupplierDashboardSummaryDTO summary =
                new SupplierDashboardSummaryDTO();


        summary.setPendingRequests(
                pending
        );


        summary.setCompletedRequests(
                completed
        );


        summary.setSuccessfulPayments(
                completed
        );


        summary.setTotalAmountPaid(
                totalPaid
        );


        return summary;
    }


    // =====================================================
    // CONVERT REQUEST -> DTO
    // =====================================================

    private SupplierPurchaseRequestDTO
    convertToDTO(
            PurchaseRequest request,
            Long supplierId) {


        SupplierPurchaseRequestDTO dto =
                new SupplierPurchaseRequestDTO();


        // -------------------------------------------------
        // REQUEST ID
        // -------------------------------------------------

        dto.setPurchaseRequestId(
                request.getPurchaseRequestId()
        );


        // -------------------------------------------------
        // REQUESTER
        // -------------------------------------------------

        if (request.getUser() != null) {

            dto.setRequesterUserId(
                    request.getUser()
                            .getUserId()
            );


            dto.setRequesterUsername(
                    request.getUser()
                            .getUsername()
            );
        }


        // -------------------------------------------------
        // REQUEST STATUS
        // -------------------------------------------------

        dto.setStatus(
                request.getStatus() != null
                        ? request.getStatus().name()
                        : null
        );


        // -------------------------------------------------
        // REMARKS
        // -------------------------------------------------

        dto.setRemarks(
                request.getRemarks()
        );


        dto.setAdminRemarks(
                request.getAdminRemarks()
        );


        // -------------------------------------------------
        // DATES
        // -------------------------------------------------

        dto.setRequestDate(
                request.getRequestDate()
        );


        dto.setApprovedDate(
                request.getApprovedDate()
        );


        // -------------------------------------------------
        // SUPPLIER ITEMS
        // -------------------------------------------------

        double supplierAmount =
                0.0;


        List<SupplierPurchaseRequestItemDTO>
                itemDTOs =
                new ArrayList<>();


        if (request.getItems() != null) {

            for (PurchaseRequestItem item :
                    request.getItems()) {


                // -----------------------------------------
                // IGNORE OTHER SUPPLIERS
                // -----------------------------------------

                if (item.getSupplier() == null
                        || item.getSupplier()
                        .getSupplierId() == null
                        || !item.getSupplier()
                        .getSupplierId()
                        .equals(supplierId)) {

                    continue;
                }


                SupplierPurchaseRequestItemDTO
                        itemDTO =
                        new SupplierPurchaseRequestItemDTO();


                // -----------------------------------------
                // PRODUCT
                // -----------------------------------------

                Product product =
                        item.getProduct();


                if (product != null) {

                    itemDTO.setProductId(
                            product.getProductId()
                    );


                    itemDTO.setProductName(
                            product.getName()
                    );
                }


                // -----------------------------------------
                // QUANTITY
                // -----------------------------------------

                itemDTO.setQuantity(
                        item.getQuantity()
                );


                // -----------------------------------------
                // ITEM TOTAL
                // -----------------------------------------

                Double itemTotal =
                        item.getItemTotalPrice();


                if (itemTotal == null
                        && product != null
                        && product.getPrice() != null
                        && item.getQuantity() != null) {

                    itemTotal =
                            product.getPrice()
                                    * item.getQuantity();
                }


                itemDTO.setItemTotalPrice(
                        itemTotal
                );


                if (itemTotal != null) {

                    supplierAmount +=
                            itemTotal;
                }


                itemDTOs.add(
                        itemDTO
                );
            }
        }


        dto.setItems(
                itemDTOs
        );


        dto.setSupplierAmount(
                supplierAmount
        );


        // =================================================
        // DELIVERY STATUS
        // =================================================

        if (request.getDeliveryStatus() != null) {
            dto.setDeliveryStatus(
                    request.getDeliveryStatus().name()
            );
        } else if (request.getStatus() == PurchaseRequestStatus.APPROVED) {
            // Repair compatibility for older approved requests.
            dto.setDeliveryStatus(DeliveryStatus.APPROVED.name());
        } else {
            dto.setDeliveryStatus(DeliveryStatus.REQUEST_RECEIVED.name());
        }


        // =================================================
        // PAYMENT INFORMATION
        // =================================================

        List<PaymentTransaction>
                payments =
                paymentTransactionRepository
                        .findByPurchaseRequestPurchaseRequestId(
                                request.getPurchaseRequestId()
                        );


        PaymentTransaction latestPayment =
                null;


        for (PaymentTransaction payment :
                payments) {


            // ---------------------------------------------
            // ONLY THIS SUPPLIER
            // ---------------------------------------------

            if (payment.getSupplier() == null
                    || payment.getSupplier()
                    .getSupplierId() == null
                    || !payment.getSupplier()
                    .getSupplierId()
                    .equals(supplierId)) {

                continue;
            }


            // ---------------------------------------------
            // SUCCESS HAS PRIORITY
            // ---------------------------------------------

            if (payment.getPaymentStatus()
                    == PaymentTransactionStatus.SUCCESS) {

                latestPayment =
                        payment;

                break;
            }


            // ---------------------------------------------
            // KEEP LATEST NON-SUCCESS PAYMENT
            // ---------------------------------------------

            if (latestPayment == null) {

                latestPayment =
                        payment;

                continue;
            }


            if (payment.getPaymentDate() != null
                    && latestPayment.getPaymentDate() != null
                    && payment.getPaymentDate()
                    .isAfter(
                            latestPayment
                                    .getPaymentDate()
                    )) {

                latestPayment =
                        payment;
            }
        }


        // -------------------------------------------------
        // PAYMENT STATUS
        // -------------------------------------------------

        if (latestPayment == null) {

            dto.setPaymentStatus(
                    "NOT_PAID"
            );


            dto.setPaymentReference(
                    null
            );

        } else {

            dto.setPaymentStatus(
                    latestPayment
                            .getPaymentStatus()
                            .name()
            );


            dto.setPaymentReference(
                    latestPayment
                            .getTransactionReference()
            );
        }


        return dto;
    }

}
