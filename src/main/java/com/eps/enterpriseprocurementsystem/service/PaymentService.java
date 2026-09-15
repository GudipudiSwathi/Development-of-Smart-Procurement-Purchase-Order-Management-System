package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.PaymentProcessDTO;
import com.eps.enterpriseprocurementsystem.dto.PaymentTransactionDTO;
import com.eps.enterpriseprocurementsystem.entity.Account;
import com.eps.enterpriseprocurementsystem.entity.PaymentTransaction;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequest;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequestItem;
import com.eps.enterpriseprocurementsystem.entity.Supplier;
import com.eps.enterpriseprocurementsystem.enums.PaymentMethod;
import com.eps.enterpriseprocurementsystem.enums.PaymentTransactionStatus;
import com.eps.enterpriseprocurementsystem.enums.PurchaseRequestStatus;
import com.eps.enterpriseprocurementsystem.repository.AccountRepository;
import com.eps.enterpriseprocurementsystem.repository.PaymentTransactionRepository;
import com.eps.enterpriseprocurementsystem.repository.PurchaseRequestRepository;
import com.eps.enterpriseprocurementsystem.repository.SupplierRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.HashSet;
import java.util.Set;

@Service
public class PaymentService {

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private PurchaseRequestRepository purchaseRequestRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    // =========================================================
    // INITIATE PAYMENT
    // =========================================================

    public PaymentTransactionDTO initiatePayment(
            Long purchaseRequestId,
            Long supplierId,
            PaymentMethod paymentMethod) {

        PurchaseRequest purchaseRequest =
                purchaseRequestRepository
                        .findById(purchaseRequestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Request not found."
                                )
                        );


        // -----------------------------------------------------
        // PAYMENT IS ALLOWED ONLY AFTER ADMIN APPROVAL
        // -----------------------------------------------------

        if (purchaseRequest.getStatus()
                != PurchaseRequestStatus.APPROVED) {

            throw new RuntimeException(
                    "Payment is allowed only for an approved Purchase Request."
            );
        }


        // -----------------------------------------------------
        // FIND PAYMENT ACCOUNT
        // -----------------------------------------------------

        Account account =
                accountRepository
                        .findByPurchaseRequestPurchaseRequestId(
                                purchaseRequestId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment account not found for this Purchase Request."
                                )
                        );


        // -----------------------------------------------------
        // FIND SUPPLIER
        // -----------------------------------------------------

        Supplier supplier =
                supplierRepository
                        .findById(supplierId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Supplier not found."
                                )
                        );


        // -----------------------------------------------------
        // VERIFY SUPPLIER BELONGS TO THIS PURCHASE REQUEST
        // -----------------------------------------------------

        boolean supplierBelongsToRequest =
                purchaseRequest.getItems()
                        .stream()
                        .anyMatch(item ->
                                item.getSupplier() != null
                                        && item.getSupplier()
                                        .getSupplierId()
                                        .equals(supplierId)
                        );


        if (!supplierBelongsToRequest) {

            throw new RuntimeException(
                    "Supplier is not associated with this Purchase Request."
            );
        }


        // -----------------------------------------------------
        // CHECK EXISTING SUCCESSFUL PAYMENT
        // -----------------------------------------------------

        List<PaymentTransaction> existingPayments =
                paymentTransactionRepository
                        .findByPurchaseRequestPurchaseRequestId(
                                purchaseRequestId
                        );


        boolean alreadyPaid =
                existingPayments.stream()
                        .anyMatch(payment ->
                                payment.getSupplier() != null
                                        && payment.getSupplier()
                                        .getSupplierId()
                                        .equals(supplierId)
                                        &&
                                        payment.getPaymentStatus()
                                                == PaymentTransactionStatus.SUCCESS
                        );


        if (alreadyPaid) {

            throw new RuntimeException(
                    "This supplier has already been paid for this Purchase Request."
            );
        }


        // -----------------------------------------------------
        // CALCULATE SUPPLIER-SPECIFIC AMOUNT
        // -----------------------------------------------------

        double supplierAmount = 0.0;


        for (PurchaseRequestItem item :
                purchaseRequest.getItems()) {

            if (item.getSupplier() != null
                    && item.getSupplier()
                    .getSupplierId()
                    .equals(supplierId)) {

                Double itemTotal =
                        item.getItemTotalPrice();

                if (itemTotal == null || itemTotal <= 0) {

                    if (item.getProduct() == null
                            || item.getProduct().getPrice() == null) {

                        throw new RuntimeException(
                                "Unable to calculate payment amount."
                        );
                    }

                    itemTotal =
                            item.getProduct().getPrice()
                                    * item.getQuantity();
                }

                supplierAmount += itemTotal;
            }
        }


        if (supplierAmount <= 0) {

            throw new RuntimeException(
                    "No payable amount found for this supplier."
            );
        }


        // -----------------------------------------------------
        // CREATE PAYMENT TRANSACTION
        // -----------------------------------------------------

        PaymentTransaction transaction =
                new PaymentTransaction();


        transaction.setPurchaseRequest(
                purchaseRequest
        );


        transaction.setAccount(
                account
        );


        transaction.setUser(
                purchaseRequest.getUser()
        );


        transaction.setSupplier(
                supplier
        );


        transaction.setAmount(
                supplierAmount
        );


        transaction.setPaymentMethod(
                paymentMethod
        );


        transaction.setPaymentStatus(
                PaymentTransactionStatus.INITIATED
        );


        // -----------------------------------------------------
        // GENERATE QR REFERENCE
        // -----------------------------------------------------

        String qrReference =
                "EPS-QR-" +
                        UUID.randomUUID()
                                .toString()
                                .replace("-", "")
                                .substring(0, 16)
                                .toUpperCase();


        transaction.setQrReference(
                qrReference
        );


        transaction.setPaymentDate(null);

        transaction.setTransactionReference(null);


        PaymentTransaction saved =
                paymentTransactionRepository.save(
                        transaction
                );


        return convertToDTO(saved);
    }


    // =========================================================
    // PROCESS PAYMENT
    // =========================================================

    public PaymentTransactionDTO processPayment(
            Long paymentId,
            PaymentProcessDTO dto) {

        PaymentTransaction transaction =
                paymentTransactionRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment transaction not found."
                                )
                        );


        // -----------------------------------------------------
        // PREVENT DUPLICATE SUCCESS
        // -----------------------------------------------------

        if (transaction.getPaymentStatus()
                == PaymentTransactionStatus.SUCCESS) {

            throw new RuntimeException(
                    "Payment has already been completed."
            );
        }


        // -----------------------------------------------------
        // PREVENT PROCESSING FAILED TRANSACTION
        // -----------------------------------------------------

        if (transaction.getPaymentStatus()
                == PaymentTransactionStatus.FAILED) {

            throw new RuntimeException(
                    "This payment transaction has already failed."
            );
        }


        // =====================================================
        // QR / UPI PAYMENT
        // =====================================================

        if (transaction.getPaymentMethod()
                == PaymentMethod.QR_CODE
                ||
                transaction.getPaymentMethod()
                        == PaymentMethod.UPI) {

            if (dto.getMpin() == null
                    || dto.getMpin().trim().isEmpty()) {

                throw new RuntimeException(
                        "MPIN is required for UPI payment."
                );
            }


            String mpin =
                    dto.getMpin().trim();


            // Admin MPIN must be exactly 4 digits.
            if (!mpin.matches("\\d{4}")) {

                throw new RuntimeException(
                        "MPIN must contain exactly 4 digits."
                );
            }

            // Verify the configured Admin MPIN.
            // The configured value will be added in application.properties.
            String configuredMpin = "4829";

            if (!mpin.equals(configuredMpin)) {

                throw new RuntimeException(
                        "Invalid MPIN."
                );
            }

            // Do not store the entered MPIN.
        }


        // =====================================================
        // CREDIT CARD PAYMENT
        // =====================================================

        if (transaction.getPaymentMethod()
                == PaymentMethod.CREDIT_CARD) {

            if (dto.getCardNumber() == null
                    || dto.getCardNumber()
                    .trim()
                    .isEmpty()) {

                throw new RuntimeException(
                        "Card number is required."
                );
            }


            String cardNumber =
                    dto.getCardNumber()
                            .replaceAll("\\s+", "");


            if (!cardNumber.matches("\\d{12,19}")) {

                throw new RuntimeException(
                        "Invalid card number."
                );
            }


            if (dto.getCardHolderName() == null
                    || dto.getCardHolderName()
                    .trim()
                    .isEmpty()) {

                throw new RuntimeException(
                        "Card holder name is required."
                );
            }


            if (dto.getCardExpiry() == null
                    || dto.getCardExpiry()
                    .trim()
                    .isEmpty()) {

                throw new RuntimeException(
                        "Card expiry is required."
                );
            }


            if (dto.getCardCvv() == null
                    || !dto.getCardCvv()
                    .matches("\\d{3,4}")) {

                throw new RuntimeException(
                        "Invalid card CVV."
                );
            }


            transaction.setCardHolderName(
                    dto.getCardHolderName().trim()
            );


            transaction.setCardLast4(
                    cardNumber.substring(
                            cardNumber.length() - 4
                    )
            );


            transaction.setCardExpiry(
                    dto.getCardExpiry().trim()
            );

            /*
             * CVV is deliberately NOT stored.
             */
        }


        // =====================================================
        // TRANSACTION REFERENCE
        // =====================================================

        String reference =
                dto.getTransactionReference();


        if (reference == null
                || reference.trim().isEmpty()) {

            reference =
                    "EPS-TXN-" +
                            UUID.randomUUID()
                                    .toString()
                                    .replace("-", "")
                                    .substring(0, 18)
                                    .toUpperCase();
        }


        transaction.setTransactionReference(
                reference.trim()
        );


        // =====================================================
        // MARK TRANSACTION SUCCESS
        // =====================================================

        transaction.setPaymentStatus(
                PaymentTransactionStatus.SUCCESS
        );


        transaction.setPaymentDate(
                LocalDateTime.now()
        );


        PaymentTransaction saved =
                paymentTransactionRepository.save(
                        transaction
                );


        // =====================================================
        // UPDATE ACCOUNT
        // =====================================================

        updateAccountAfterPayment(
                transaction
        );


        return convertToDTO(saved);
    }


    // =========================================================
    // MARK PAYMENT FAILED
    // =========================================================

    public PaymentTransactionDTO markPaymentFailed(
            Long paymentId) {

        PaymentTransaction transaction =
                paymentTransactionRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment transaction not found."
                                )
                        );


        if (transaction.getPaymentStatus()
                == PaymentTransactionStatus.SUCCESS) {

            throw new RuntimeException(
                    "A successful payment cannot be marked as failed."
            );
        }


        transaction.setPaymentStatus(
                PaymentTransactionStatus.FAILED
        );


        transaction.setPaymentDate(
                LocalDateTime.now()
        );


        if (transaction.getTransactionReference()
                == null) {

            transaction.setTransactionReference(
                    "EPS-FAILED-" +
                            UUID.randomUUID()
                                    .toString()
                                    .replace("-", "")
                                    .substring(0, 16)
                                    .toUpperCase()
            );
        }


        PaymentTransaction saved =
                paymentTransactionRepository.save(
                        transaction
                );

        // -----------------------------------------------------
        // UPDATE PAYMENT ACCOUNT STATUS
        // -----------------------------------------------------
        // A failed transaction must also be reflected on the
        // payment account shown in Admin > Accounts.
        Account account = transaction.getAccount();

        if (account != null) {
            account.setPaymentStatus("FAILED");
            account.setPaymentDate(LocalDateTime.now());
            account.setPaymentReference(
                    transaction.getTransactionReference()
            );

            accountRepository.save(account);
        }


        return convertToDTO(saved);
    }


    // =========================================================
    // GET PAYMENT BY ID
    // =========================================================

    public PaymentTransactionDTO getPaymentById(
            Long paymentId) {

        PaymentTransaction transaction =
                paymentTransactionRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment transaction not found."
                                )
                        );


        return convertToDTO(transaction);
    }


    // =========================================================
    // GET PAYMENTS BY PURCHASE REQUEST
    // =========================================================

    public List<PaymentTransactionDTO>
    getPaymentsByPurchaseRequest(
            Long purchaseRequestId) {

        return paymentTransactionRepository
                .findByPurchaseRequestPurchaseRequestId(
                        purchaseRequestId
                )
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =========================================================
    // GET PAYMENTS BY SUPPLIER
    // =========================================================

    public List<PaymentTransactionDTO>
    getPaymentsBySupplier(
            Long supplierId) {

        return paymentTransactionRepository
                .findBySupplierSupplierId(
                        supplierId
                )
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =========================================================
    // GET ALL PAYMENTS
    // =========================================================

    public List<PaymentTransactionDTO>
    getAllPayments() {

        return paymentTransactionRepository
                .findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =========================================================
    // UPDATE ACCOUNT AFTER SUCCESSFUL PAYMENT
    // =========================================================
    //
    // IMPORTANT:
    //
    // We do NOT check whether every transaction is SUCCESS.
    //
    // Instead:
    //
    // 1. Find every DISTINCT supplier assigned to the request.
    // 2. Find successful payments for those suppliers.
    // 3. Account becomes SUCCESS only when every supplier
    //    has at least one SUCCESS payment.
    //
    // Old INITIATED / FAILED transactions are ignored.
    //
    // =========================================================

    private void updateAccountAfterPayment(
            PaymentTransaction transaction) {

        Account account =
                transaction.getAccount();


        if (account == null) {
            return;
        }


        PurchaseRequest purchaseRequest =
                transaction.getPurchaseRequest();


        if (purchaseRequest == null) {
            return;
        }


        Long purchaseRequestId =
                purchaseRequest.getPurchaseRequestId();


        // -----------------------------------------------------
        // GET ALL SUPPLIERS ASSIGNED TO THIS REQUEST
        // -----------------------------------------------------

        Set<Long> requiredSupplierIds =
                new HashSet<>();


        for (PurchaseRequestItem item :
                purchaseRequest.getItems()) {

            if (item.getSupplier() != null
                    && item.getSupplier().getSupplierId() != null) {

                requiredSupplierIds.add(
                        item.getSupplier().getSupplierId()
                );
            }
        }


        // -----------------------------------------------------
        // SAFETY CHECK
        // -----------------------------------------------------

        if (requiredSupplierIds.isEmpty()) {

            return;
        }


        // -----------------------------------------------------
        // GET ALL PAYMENT TRANSACTIONS
        // -----------------------------------------------------

        List<PaymentTransaction> payments =
                paymentTransactionRepository
                        .findByPurchaseRequestPurchaseRequestId(
                                purchaseRequestId
                        );


        // -----------------------------------------------------
        // COLLECT SUPPLIERS WITH SUCCESSFUL PAYMENTS
        // -----------------------------------------------------

        Set<Long> successfullyPaidSupplierIds =
                new HashSet<>();


        for (PaymentTransaction payment :
                payments) {

            if (payment.getSupplier() == null
                    || payment.getSupplier().getSupplierId() == null) {

                continue;
            }


            if (payment.getPaymentStatus()
                    == PaymentTransactionStatus.SUCCESS) {

                successfullyPaidSupplierIds.add(
                        payment.getSupplier().getSupplierId()
                );
            }
        }


        // -----------------------------------------------------
        // CHECK WHETHER EVERY REQUIRED SUPPLIER IS PAID
        // -----------------------------------------------------

        boolean allSupplierPaymentsSuccessful =
                successfullyPaidSupplierIds
                        .containsAll(
                                requiredSupplierIds
                        );


        // -----------------------------------------------------
        // UPDATE ACCOUNT
        // -----------------------------------------------------

        if (allSupplierPaymentsSuccessful) {

            account.setPaymentStatus(
                    "SUCCESS"
            );


            account.setPaymentDate(
                    LocalDateTime.now()
            );


            account.setPaymentReference(
                    transaction.getTransactionReference()
            );


            accountRepository.save(
                    account
            );
        }
    }


    // =========================================================
    // CONVERT ENTITY → DTO
    // =========================================================

    private PaymentTransactionDTO convertToDTO(
            PaymentTransaction transaction) {

        PaymentTransactionDTO dto =
                new PaymentTransactionDTO();


        dto.setPaymentId(
                transaction.getPaymentId()
        );


        if (transaction.getPurchaseRequest() != null) {

            dto.setPurchaseRequestId(
                    transaction
                            .getPurchaseRequest()
                            .getPurchaseRequestId()
            );
        }


        if (transaction.getAccount() != null) {

            dto.setAccountId(
                    transaction
                            .getAccount()
                            .getAccountId()
            );
        }


        if (transaction.getUser() != null) {

            dto.setUserId(
                    transaction
                            .getUser()
                            .getUserId()
            );
        }


        if (transaction.getSupplier() != null) {

            dto.setSupplierId(
                    transaction
                            .getSupplier()
                            .getSupplierId()
            );


            dto.setSupplierName(
                    transaction
                            .getSupplier()
                            .getSupplierName()
            );


            dto.setSupplierUpiId(
                    transaction
                            .getSupplier()
                            .getUpiId()
            );
        }


        dto.setAmount(
                transaction.getAmount()
        );


        if (transaction.getPaymentMethod() != null) {

            dto.setPaymentMethod(
                    transaction
                            .getPaymentMethod()
                            .name()
            );
        }


        if (transaction.getPaymentStatus() != null) {

            dto.setPaymentStatus(
                    transaction
                            .getPaymentStatus()
                            .name()
            );
        }


        dto.setTransactionReference(
                transaction.getTransactionReference()
        );


        dto.setQrReference(
                transaction.getQrReference()
        );


        dto.setCardLast4(
                transaction.getCardLast4()
        );


        dto.setPaymentDate(
                transaction.getPaymentDate()
        );


        return dto;
    }
}