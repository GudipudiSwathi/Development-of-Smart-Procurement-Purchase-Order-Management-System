package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.AccountDTO;
import com.eps.enterpriseprocurementsystem.entity.Account;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequest;
import com.eps.enterpriseprocurementsystem.entity.User;
import com.eps.enterpriseprocurementsystem.entity.PaymentTransaction;
import com.eps.enterpriseprocurementsystem.enums.PaymentTransactionStatus;
import com.eps.enterpriseprocurementsystem.enums.PurchaseRequestStatus;
import com.eps.enterpriseprocurementsystem.repository.AccountRepository;
import com.eps.enterpriseprocurementsystem.repository.PurchaseRequestRepository;
import com.eps.enterpriseprocurementsystem.repository.UserRepository;
import com.eps.enterpriseprocurementsystem.repository.PaymentTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private PurchaseRequestRepository purchaseRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    // =====================================================
    // CREATE PAYMENT ACCOUNT
    // =====================================================

    public AccountDTO createAccount(AccountDTO dto) {

        if (accountRepository
                .findByPurchaseRequestPurchaseRequestId(
                        dto.getPurchaseRequestId()
                )
                .isPresent()) {

            throw new RuntimeException(
                    "Payment account already exists for this purchase request."
            );
        }

        PurchaseRequest purchaseRequest =
                purchaseRequestRepository
                        .findById(dto.getPurchaseRequestId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Request not found"
                                )
                        );

        User user =
                userRepository
                        .findById(dto.getUserId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        if (!purchaseRequest.getUser()
                .getUserId()
                .equals(user.getUserId())) {

            throw new RuntimeException(
                    "User does not belong to this purchase request."
            );
        }

        Account account = new Account();

        account.setPurchaseRequest(purchaseRequest);
        account.setUser(user);

        // Always use the trusted Purchase Request total.
        account.setAmount(
                purchaseRequest.getTotalPrice()
        );

        // Payment initially pending.
        account.setPaymentStatus("PENDING");
        account.setPaymentDate(null);
        account.setPaymentReference(null);

        Account savedAccount =
                accountRepository.save(account);

        return convertToDTO(savedAccount);
    }

    // =====================================================
    // GET ALL PAYMENT ACCOUNTS
    // ADMIN ONLY
    // =====================================================

    public List<AccountDTO> getAllAccounts() {
        // Automatically create missing payment accounts for every
        // Purchase Request that has been approved by Admin.
        purchaseRequestRepository.findAll()
                .stream()
                .filter(pr -> pr.getStatus() == PurchaseRequestStatus.APPROVED)
                .forEach(this::ensurePaymentAccount);

        // IMPORTANT:
        // Reconcile the account status from the actual supplier payment
        // transactions. This ignores old INITIATED transactions.
        accountRepository.findAll()
                .stream()
                .filter(account ->
                        account.getPurchaseRequest() != null
                                && account.getPurchaseRequest().getStatus()
                                == PurchaseRequestStatus.APPROVED)
                .forEach(this::reconcilePaymentStatus);

        // Only APPROVED purchase requests are payment-eligible.
        return accountRepository.findAll()
                .stream()
                .filter(account ->
                        account.getPurchaseRequest() != null
                                && account.getPurchaseRequest().getStatus()
                                == PurchaseRequestStatus.APPROVED)
                .map(this::convertToDTO)
                .toList();
    }

    // =====================================================
    // RECONCILE ACCOUNT FROM SUPPLIER PAYMENTS
    // =====================================================
    private void reconcilePaymentStatus(Account account) {
        PurchaseRequest purchaseRequest = account.getPurchaseRequest();

        if (purchaseRequest == null ||
                purchaseRequest.getItems() == null) {
            return;
        }

        java.util.Set<Long> requiredSupplierIds =
                purchaseRequest.getItems()
                        .stream()
                        .filter(item -> item.getSupplier() != null)
                        .map(item -> item.getSupplier().getSupplierId())
                        .filter(java.util.Objects::nonNull)
                        .collect(java.util.stream.Collectors.toSet());

        if (requiredSupplierIds.isEmpty()) {
            return;
        }

        java.util.Set<Long> successfulSupplierIds =
                paymentTransactionRepository
                        .findByPurchaseRequestPurchaseRequestId(
                                purchaseRequest.getPurchaseRequestId())
                        .stream()
                        .filter(payment ->
                                payment.getPaymentStatus()
                                        == PaymentTransactionStatus.SUCCESS)
                        .filter(payment ->
                                payment.getSupplier() != null)
                        .map(payment ->
                                payment.getSupplier().getSupplierId())
                        .filter(java.util.Objects::nonNull)
                        .collect(java.util.stream.Collectors.toSet());

        // If every supplier assigned to the request has a successful
        // payment, the overall payment account is SUCCESS.
        if (successfulSupplierIds.containsAll(requiredSupplierIds)) {
            boolean changed =
                    !"SUCCESS".equalsIgnoreCase(account.getPaymentStatus());

            account.setPaymentStatus("SUCCESS");
            account.setAmount(purchaseRequest.getTotalPrice());

            if (account.getPaymentDate() == null) {
                account.setPaymentDate(LocalDateTime.now());
                changed = true;
            }

            // Use the latest successful transaction reference.
            PaymentTransaction latestSuccessful =
                    paymentTransactionRepository
                            .findByPurchaseRequestPurchaseRequestId(
                                    purchaseRequest.getPurchaseRequestId())
                            .stream()
                            .filter(payment ->
                                    payment.getPaymentStatus()
                                            == PaymentTransactionStatus.SUCCESS)
                            .filter(payment ->
                                    payment.getPaymentDate() != null)
                            .max(java.util.Comparator.comparing(
                                    PaymentTransaction::getPaymentDate))
                            .orElse(null);

            if (latestSuccessful != null &&
                    latestSuccessful.getTransactionReference() != null) {
                if (!latestSuccessful.getTransactionReference()
                        .equals(account.getPaymentReference())) {
                    account.setPaymentReference(
                            latestSuccessful.getTransactionReference());
                    changed = true;
                }
            }

            if (changed) {
                accountRepository.save(account);
            }
        }
    }

    // =====================================================
    // ENSURE PAYMENT ACCOUNT FOR APPROVED REQUEST
    // =====================================================

    private void ensurePaymentAccount(PurchaseRequest purchaseRequest) {
        if (purchaseRequest == null ||
                purchaseRequest.getStatus() != PurchaseRequestStatus.APPROVED) {
            return;
        }

        boolean exists = accountRepository
                .findByPurchaseRequestPurchaseRequestId(
                        purchaseRequest.getPurchaseRequestId()
                )
                .isPresent();

        if (exists) {
            return;
        }

        User user = purchaseRequest.getUser();

        if (user == null) {
            return;
        }

        Account account = new Account();
        account.setPurchaseRequest(purchaseRequest);
        account.setUser(user);
        account.setAmount(purchaseRequest.getTotalPrice());
        account.setPaymentStatus("PENDING");
        account.setPaymentDate(null);
        account.setPaymentReference(null);

        accountRepository.save(account);
    }

    // =====================================================
    // GET MY PAYMENT ACCOUNTS BY USERNAME
    // EMPLOYEE ONLY
    // =====================================================

    public List<AccountDTO> getMyAccountsByUsername(
            String username) {

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        return accountRepository
                .findAllByUserUserId(user.getUserId())
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // =====================================================
    // GET MY PAYMENT ACCOUNTS BY USER ID
    // =====================================================

    public List<AccountDTO> getMyAccounts(Long userId) {

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        return accountRepository
                .findAllByUserUserId(user.getUserId())
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // =====================================================
    // GET ACCOUNT BY ID
    // =====================================================

    public AccountDTO getAccountById(Long id) {

        Account account =
                accountRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Account not found"
                                )
                        );

        return convertToDTO(account);
    }

    // =====================================================
    // GET ACCOUNT BY PURCHASE REQUEST
    // =====================================================

    public AccountDTO getAccountByPurchaseRequest(
            Long purchaseRequestId) {

        Account account =
                accountRepository
                        .findByPurchaseRequestPurchaseRequestId(
                                purchaseRequestId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment account not found"
                                )
                        );

        return convertToDTO(account);
    }

    // =====================================================
    // MARK PAYMENT SUCCESSFUL
    // ADMIN ONLY THROUGH CONTROLLER
    // PURCHASE REQUEST MUST BE APPROVED
    // =====================================================

    public AccountDTO markPaymentSuccessful(
            Long accountId,
            String paymentReference) {

        Account account =
                accountRepository
                        .findById(accountId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Account not found"
                                )
                        );

        PurchaseRequest purchaseRequest =
                account.getPurchaseRequest();

        if (purchaseRequest == null) {
            throw new RuntimeException(
                    "Purchase Request not found for this account."
            );
        }

        // Payment is allowed only after Admin approval.
        if (purchaseRequest.getStatus()
                != PurchaseRequestStatus.APPROVED) {

            throw new RuntimeException(
                    "Payment cannot be made. Purchase Request must be approved by Admin first."
            );
        }

        // Prevent duplicate payment.
        if ("SUCCESS".equalsIgnoreCase(
                account.getPaymentStatus())) {

            throw new RuntimeException(
                    "Payment has already been completed."
            );
        }

        if (paymentReference == null ||
                paymentReference.trim().isEmpty()) {

            throw new RuntimeException(
                    "Payment reference is required."
            );
        }

        // Always use the trusted Purchase Request total.
        account.setAmount(
                purchaseRequest.getTotalPrice()
        );

        account.setPaymentStatus("SUCCESS");
        account.setPaymentDate(LocalDateTime.now());
        account.setPaymentReference(
                paymentReference.trim()
        );

        Account updatedAccount =
                accountRepository.save(account);

        return convertToDTO(updatedAccount);
    }

    // =====================================================
    // MARK PAYMENT FAILED
    // ADMIN ONLY THROUGH CONTROLLER
    // PURCHASE REQUEST MUST BE APPROVED
    // =====================================================

    public AccountDTO markPaymentFailed(
            Long accountId,
            String paymentReference) {

        Account account =
                accountRepository
                        .findById(accountId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Account not found"
                                )
                        );

        PurchaseRequest purchaseRequest =
                account.getPurchaseRequest();

        if (purchaseRequest == null) {
            throw new RuntimeException(
                    "Purchase Request not found for this account."
            );
        }

        // A payment transaction can only be recorded after
        // the Admin has approved the Purchase Request.
        if (purchaseRequest.getStatus()
                != PurchaseRequestStatus.APPROVED) {

            throw new RuntimeException(
                    "Payment cannot be recorded. Purchase Request must be approved by Admin first."
            );
        }

        // Payment cannot be marked failed if it is already successful.
        if ("SUCCESS".equalsIgnoreCase(
                account.getPaymentStatus())) {

            throw new RuntimeException(
                    "Payment has already been completed."
            );
        }

        if (paymentReference == null ||
                paymentReference.trim().isEmpty()) {

            throw new RuntimeException(
                    "Payment reference is required."
            );
        }

        account.setAmount(
                purchaseRequest.getTotalPrice()
        );
        account.setPaymentStatus("FAILED");
        account.setPaymentDate(LocalDateTime.now());
        account.setPaymentReference(
                paymentReference.trim()
        );

        Account updatedAccount =
                accountRepository.save(account);

        return convertToDTO(updatedAccount);
    }

    // =====================================================
    // ENTITY -> DTO
    // =====================================================

    private AccountDTO convertToDTO(
            Account account) {

        AccountDTO dto = new AccountDTO();

        dto.setAccountId(
                account.getAccountId()
        );

        if (account.getPurchaseRequest() != null) {
            dto.setPurchaseRequestId(
                    account.getPurchaseRequest()
                            .getPurchaseRequestId()
            );
        }

        if (account.getUser() != null) {
            dto.setUserId(
                    account.getUser().getUserId()
            );
        }

        dto.setAmount(
                account.getAmount()
        );

        dto.setPaymentStatus(
                account.getPaymentStatus()
        );

        if (account.getPaymentDate() != null) {
            dto.setPaymentDate(
                    account.getPaymentDate().toString()
            );
        }

        dto.setPaymentReference(
                account.getPaymentReference()
        );

        return dto;
    }
}
