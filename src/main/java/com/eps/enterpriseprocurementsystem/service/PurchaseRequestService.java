package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.PurchaseRequestDTO;
import com.eps.enterpriseprocurementsystem.dto.PurchaseRequestItemDTO;
import com.eps.enterpriseprocurementsystem.entity.Account;
import com.eps.enterpriseprocurementsystem.entity.Product;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequest;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequestItem;
import com.eps.enterpriseprocurementsystem.entity.Supplier;
import com.eps.enterpriseprocurementsystem.entity.User;
import com.eps.enterpriseprocurementsystem.enums.DeliveryStatus;
import com.eps.enterpriseprocurementsystem.enums.PurchaseRequestStatus;
import com.eps.enterpriseprocurementsystem.enums.SupplierStatus;
import com.eps.enterpriseprocurementsystem.jwt.JwtService;
import com.eps.enterpriseprocurementsystem.repository.AccountRepository;
import com.eps.enterpriseprocurementsystem.repository.PurchaseRequestRepository;
import com.eps.enterpriseprocurementsystem.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PurchaseRequestService {

    @Autowired
    private PurchaseRequestRepository purchaseRequestRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtService jwtService;

    @Value("${app.base-url}")
    private String baseUrl;


    // =========================================================
    // CREATE PURCHASE REQUEST - MULTIPLE PRODUCTS
    // =========================================================

    @Transactional
    public PurchaseRequestDTO savePurchaseRequest(
            PurchaseRequestDTO dto) {

        User user =
                userService.getUserEntityById(
                        dto.getUserId()
                );

        if (dto.getItems() == null ||
                dto.getItems().isEmpty()) {

            throw new RuntimeException(
                    "At least one product is required."
            );
        }

        PurchaseRequest purchaseRequest =
                new PurchaseRequest();

        purchaseRequest.setUser(user);

        purchaseRequest.setRemarks(
                dto.getRemarks()
        );

        purchaseRequest.setAdminRemarks(null);

        purchaseRequest.setStatus(
                PurchaseRequestStatus.PENDING
        );

        // -----------------------------------------------------
        // New requests always start at REQUEST_RECEIVED.
        // -----------------------------------------------------

        purchaseRequest.setDeliveryStatus(
                DeliveryStatus.REQUEST_RECEIVED
        );

        purchaseRequest.setRequestDate(
                LocalDateTime.now()
        );


        // -----------------------------------------------------
        // CREATE PURCHASE REQUEST ITEMS
        // -----------------------------------------------------

        double totalPrice = 0.0;

        List<PurchaseRequestItem> items =
                new ArrayList<>();

        for (PurchaseRequestItemDTO itemDTO :
                dto.getItems()) {

            if (itemDTO.getProductId() == null) {

                throw new RuntimeException(
                        "Product ID is required."
                );
            }

            if (itemDTO.getQuantity() == null ||
                    itemDTO.getQuantity() <= 0) {

                throw new RuntimeException(
                        "Product quantity must be greater than 0."
                );
            }

            Product product =
                    productService.getProductEntityById(
                            itemDTO.getProductId()
                    );

            double itemTotalPrice =
                    product.getPrice()
                            * itemDTO.getQuantity();

            PurchaseRequestItem item =
                    new PurchaseRequestItem();

            item.setPurchaseRequest(
                    purchaseRequest
            );

            item.setProduct(product);


            // -------------------------------------------------
            // PRODUCT OWNER = SUPPLIER
            // -------------------------------------------------

            User productOwner =
                    product.getUser();

            if (productOwner == null) {

                throw new RuntimeException(
                        "Product does not have a supplier owner."
                );
            }

            if (!"SUPPLIER".equalsIgnoreCase(
                    productOwner.getRole()
            )) {

                throw new RuntimeException(
                        "The selected product does not belong to a supplier."
                );
            }


            Supplier supplier =
                    supplierRepository
                            .findByUserUserId(
                                    productOwner.getUserId()
                            )
                            .orElseGet(() -> {

                                Supplier newSupplier =
                                        new Supplier();

                                newSupplier.setUser(
                                        productOwner
                                );

                                newSupplier.setSupplierName(
                                        productOwner.getUsername()
                                );

                                newSupplier.setPhoneNumber(
                                        productOwner.getPhoneNumber()
                                );

                                newSupplier.setEmail(
                                        productOwner.getEmail()
                                );

                                newSupplier.setStatus(
                                        SupplierStatus.ACTIVE
                                );

                                if (product.getCategory() != null) {

                                    newSupplier.setCategory(
                                            product.getCategory()
                                    );
                                }

                                return supplierRepository.save(
                                        newSupplier
                                );
                            });


            // -------------------------------------------------
            // REPAIR NULL SUPPLIER STATUS
            // -------------------------------------------------

            if (supplier.getStatus() == null) {

                supplier.setStatus(
                        SupplierStatus.ACTIVE
                );

                supplier =
                        supplierRepository.save(
                                supplier
                        );
            }


            if (supplier.getStatus() !=
                    SupplierStatus.ACTIVE) {

                throw new RuntimeException(
                        "The supplier for product '"
                                + product.getName()
                                + "' is not active."
                );
            }


            item.setSupplier(
                    supplier
            );

            item.setQuantity(
                    itemDTO.getQuantity()
            );

            item.setItemTotalPrice(
                    itemTotalPrice
            );

            items.add(item);

            totalPrice += itemTotalPrice;
        }


        purchaseRequest.setItems(
                items
        );

        purchaseRequest.setTotalPrice(
                totalPrice
        );


        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        PurchaseRequest savedRequest =
                purchaseRequestRepository.save(
                        purchaseRequest
                );


        // -----------------------------------------------------
        // EMAILS
        // -----------------------------------------------------

        sendRequesterSubmittedEmail(
                savedRequest
        );

        sendAdminNewRequestEmails(
                savedRequest
        );


        return convertToDTO(
                savedRequest
        );
    }


    // =========================================================
    // EMAIL REQUESTER AFTER SUBMISSION
    // =========================================================

    private void sendRequesterSubmittedEmail(
            PurchaseRequest purchaseRequest) {

        try {

            String downloadToken =
                    jwtService.generateDownloadToken(
                            purchaseRequest
                                    .getUser()
                                    .getUserId()
                    );

            String downloadLink =
                    baseUrl
                            + "/purchase-requests/download-by-token?token="
                            + downloadToken;

            StringBuilder emailBody =
                    new StringBuilder();

            emailBody.append(
                    "Hello "
                            + purchaseRequest
                            .getUser()
                            .getUsername()
                            + ",\n\n"
            );

            emailBody.append(
                    "Your Purchase Request has been submitted successfully."
            );

            emailBody.append(
                    "\n\nPurchase Request ID : "
            ).append(
                    purchaseRequest
                            .getPurchaseRequestId()
            );

            if (purchaseRequest.getUser()
                    .getDepartment() != null) {

                emailBody.append(
                        "\nDepartment : "
                ).append(
                        purchaseRequest
                                .getUser()
                                .getDepartment()
                                .getDepartmentName()
                );
            }

            emailBody.append(
                    "\n\nItems:"
            );

            for (PurchaseRequestItem item :
                    purchaseRequest.getItems()) {

                emailBody.append(
                        "\n- "
                ).append(
                        item.getProduct().getName()
                ).append(
                        " × "
                ).append(
                        item.getQuantity()
                ).append(
                        " = ₹"
                ).append(
                        item.getItemTotalPrice()
                );
            }

            emailBody.append(
                    "\n\nTotal Price : ₹"
            ).append(
                    purchaseRequest.getTotalPrice()
            );

            emailBody.append(
                    "\nStatus : PENDING"
            );

            emailBody.append(
                    "\n\nYour request has been sent to the Administrator for review."
            );

            emailBody.append(
                    "\n\nThe Administrator will approve or reject your request."
            );

            emailBody.append(
                    "\n\nThank you."
            );


            emailService.sendEmail(
                    purchaseRequest
                            .getUser()
                            .getEmail(),

                    "Purchase Request Submitted",

                    emailBody.toString()
            );


            String htmlBody =
                    "<html>"
                            + "<body>"

                            + "<h3>Hello "
                            + purchaseRequest
                            .getUser()
                            .getUsername()
                            + ",</h3>"

                            + "<p>"
                            + "Your Purchase Request has been submitted successfully."
                            + "</p>"

                            + "<p>"
                            + "<b>Purchase Request ID:</b> "
                            + purchaseRequest
                            .getPurchaseRequestId()
                            + "<br>"
                            + "<b>Total Price:</b> ₹"
                            + purchaseRequest
                            .getTotalPrice()
                            + "<br>"
                            + "<b>Status:</b> PENDING"
                            + "</p>"

                            + "<p>"
                            + "Your request has been sent to the Administrator for review."
                            + "</p>"

                            + "<br>"

                            + "<a href=\""
                            + downloadLink
                            + "\" "
                            + "style=\"background-color:#4CAF50;"
                            + "color:white;"
                            + "padding:12px 20px;"
                            + "text-decoration:none;"
                            + "border-radius:5px;"
                            + "display:inline-block;\">"
                            + "📥 Download My Purchase Requests"
                            + "</a>"

                            + "<p>"
                            + "<small>"
                            + "This download link is valid for 15 minutes."
                            + "</small>"
                            + "</p>"

                            + "</body>"
                            + "</html>";


            emailService.sendHtmlEmail(
                    purchaseRequest
                            .getUser()
                            .getEmail(),

                    "Purchase Request Submitted",

                    htmlBody
            );

        } catch (Exception e) {

            System.err.println(
                    "Failed to send purchase request submission email: "
                            + e.getMessage()
            );
        }
    }


    // =========================================================
    // EMAIL ALL ADMINS
    // =========================================================

    private void sendAdminNewRequestEmails(
            PurchaseRequest purchaseRequest) {

        try {

            List<User> admins =
                    userService.getAllAdmins();

            for (User admin : admins) {

                StringBuilder emailBody =
                        new StringBuilder();

                emailBody.append(
                        "Hello "
                                + admin.getUsername()
                                + ",\n\n"
                );

                emailBody.append(
                        "A new Purchase Request has been submitted."
                );

                emailBody.append(
                        "\n\nPurchase Request ID : "
                ).append(
                        purchaseRequest
                                .getPurchaseRequestId()
                );

                emailBody.append(
                        "\nEmployee : "
                ).append(
                        purchaseRequest
                                .getUser()
                                .getUsername()
                );

                if (purchaseRequest.getUser()
                        .getDepartment() != null) {

                    emailBody.append(
                            "\nDepartment : "
                    ).append(
                            purchaseRequest
                                    .getUser()
                                    .getDepartment()
                                    .getDepartmentName()
                    );
                }

                emailBody.append(
                        "\n\nItems:"
                );

                for (PurchaseRequestItem item :
                        purchaseRequest.getItems()) {

                    emailBody.append(
                            "\n- "
                    ).append(
                            item.getProduct().getName()
                    ).append(
                            " × "
                    ).append(
                            item.getQuantity()
                    ).append(
                            " = ₹"
                    ).append(
                            item.getItemTotalPrice()
                    );
                }

                emailBody.append(
                        "\n\nTotal Price : ₹"
                ).append(
                        purchaseRequest.getTotalPrice()
                );

                emailBody.append(
                        "\nStatus : PENDING"
                );

                emailBody.append(
                        "\n\nPlease login to the Enterprise Procurement System and review the request."
                );

                emailService.sendEmail(
                        admin.getEmail(),

                        "New Purchase Request",

                        emailBody.toString()
                );
            }

        } catch (Exception e) {

            System.err.println(
                    "Failed to send admin purchase request email: "
                            + e.getMessage()
            );
        }
    }


    // =========================================================
    // GET ALL PURCHASE REQUESTS
    // =========================================================

    public List<PurchaseRequestDTO>
    getAllPurchaseRequests() {

        List<PurchaseRequest> requests =
                purchaseRequestRepository.findAll();

        requests.forEach(
                this::repairDeliveryStatus
        );

        requests.forEach(
                this::ensureSuppliersAssigned
        );

        return requests
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =========================================================
    // GET PURCHASE REQUEST BY ID
    // =========================================================

    public PurchaseRequestDTO getPurchaseRequestById(
            Long id) {

        PurchaseRequest purchaseRequest =
                purchaseRequestRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Request not found"
                                )
                        );

        repairDeliveryStatus(
                purchaseRequest
        );

        ensureSuppliersAssigned(
                purchaseRequest
        );

        return convertToDTO(
                purchaseRequest
        );
    }


    // =========================================================
    // DELETE PURCHASE REQUEST
    // =========================================================

    public String deletePurchaseRequest(
            Long id) {

        PurchaseRequest purchaseRequest =
                purchaseRequestRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Request not found"
                                )
                        );

        purchaseRequestRepository.delete(
                purchaseRequest
        );

        return "Purchase Request deleted successfully.";
    }


    // =========================================================
    // ADMIN APPROVE / REJECT
    // =========================================================

    public PurchaseRequestDTO updatePurchaseRequestStatus(
            Long id,
            String status,
            String adminRemarks) {

        PurchaseRequest purchaseRequest =
                purchaseRequestRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Request not found"
                                )
                        );


        if (purchaseRequest.getStatus() !=
                PurchaseRequestStatus.PENDING) {

            throw new RuntimeException(
                    "This Purchase Request has already been processed."
            );
        }


        if (status == null ||
                status.trim().isEmpty()) {

            throw new RuntimeException(
                    "Status is required."
            );
        }


        PurchaseRequestStatus requestStatus;

        try {

            requestStatus =
                    PurchaseRequestStatus.valueOf(
                            status.trim().toUpperCase()
                    );

        } catch (IllegalArgumentException e) {

            throw new RuntimeException(
                    "Invalid status. Use APPROVED or REJECTED."
            );
        }


        if (requestStatus !=
                PurchaseRequestStatus.APPROVED
                &&
                requestStatus !=
                        PurchaseRequestStatus.REJECTED) {

            throw new RuntimeException(
                    "Status can only be APPROVED or REJECTED."
            );
        }


        // -----------------------------------------------------
        // ADMIN DECISION
        // -----------------------------------------------------

        purchaseRequest.setStatus(
                requestStatus
        );


        // -----------------------------------------------------
        // DELIVERY STATUS
        //
        // IMPORTANT:
        // Only Admin approval changes REQUEST_RECEIVED
        // into APPROVED.
        // -----------------------------------------------------

        if (requestStatus ==
                PurchaseRequestStatus.APPROVED) {

            purchaseRequest.setDeliveryStatus(
                    DeliveryStatus.APPROVED
            );
        }


        purchaseRequest.setAdminRemarks(
                adminRemarks
        );


        if (requestStatus ==
                PurchaseRequestStatus.APPROVED
                ||
                requestStatus ==
                        PurchaseRequestStatus.REJECTED) {

            purchaseRequest.setApprovedDate(
                    LocalDateTime.now()
            );
        }


        PurchaseRequest updatedRequest =
                purchaseRequestRepository.save(
                        purchaseRequest
                );


        // -----------------------------------------------------
        // ASSIGN SUPPLIERS
        // -----------------------------------------------------

        if (requestStatus ==
                PurchaseRequestStatus.APPROVED) {

            ensureSuppliersAssigned(
                    updatedRequest
            );
        }


        // -----------------------------------------------------
        // CREATE PAYMENT ACCOUNT
        // -----------------------------------------------------

        if (requestStatus ==
                PurchaseRequestStatus.APPROVED) {

            boolean accountExists =
                    accountRepository
                            .findByPurchaseRequestPurchaseRequestId(
                                    updatedRequest
                                            .getPurchaseRequestId()
                            )
                            .isPresent();

            if (!accountExists &&
                    updatedRequest.getUser() != null) {

                Account account =
                        new Account();

                account.setPurchaseRequest(
                        updatedRequest
                );

                account.setUser(
                        updatedRequest.getUser()
                );

                account.setAmount(
                        updatedRequest.getTotalPrice()
                );

                account.setPaymentStatus(
                        "PENDING"
                );

                account.setPaymentDate(
                        null
                );

                account.setPaymentReference(
                        null
                );

                accountRepository.save(
                        account
                );
            }
        }


        // -----------------------------------------------------
        // NOTIFY EMPLOYEE
        // -----------------------------------------------------

        sendRequesterDecisionEmail(
                updatedRequest,
                requestStatus,
                adminRemarks
        );


        return convertToDTO(
                updatedRequest
        );
    }


    // =========================================================
    // EMAIL EMPLOYEE AFTER ADMIN DECISION
    // =========================================================

    private void sendRequesterDecisionEmail(
            PurchaseRequest purchaseRequest,
            PurchaseRequestStatus decision,
            String remarks) {

        try {

            String downloadToken =
                    jwtService.generateDownloadToken(
                            purchaseRequest
                                    .getUser()
                                    .getUserId()
                    );

            String downloadLink =
                    baseUrl
                            + "/purchase-requests/download-by-token?token="
                            + downloadToken;


            StringBuilder emailBody =
                    new StringBuilder();

            emailBody.append(
                    "Hello "
                            + purchaseRequest
                            .getUser()
                            .getUsername()
                            + ",\n\n"
            );

            emailBody.append(
                    "Your Purchase Request #"
                            + purchaseRequest
                            .getPurchaseRequestId()
                            + " has been "
                            + decision.name()
                            + "."
            );

            emailBody.append(
                    "\n\nTotal Price : ₹"
            ).append(
                    purchaseRequest
                            .getTotalPrice()
            );

            emailBody.append(
                    "\nStatus : "
            ).append(
                    decision.name()
            );

            emailBody.append(
                    "\nAdmin Remarks : "
            ).append(
                    remarks != null &&
                            !remarks.trim().isEmpty()
                            ? remarks
                            : "No remarks"
            );


            if (decision ==
                    PurchaseRequestStatus.APPROVED) {

                emailBody.append(
                        "\n\nYour purchase request has been approved by the Administrator."
                );

                emailBody.append(
                        "\nPayment can now be processed."
                );

            } else {

                emailBody.append(
                        "\n\nYour purchase request has been rejected by the Administrator."
                );
            }


            emailBody.append(
                    "\n\nThank you."
            );


            emailService.sendEmail(
                    purchaseRequest
                            .getUser()
                            .getEmail(),

                    "Purchase Request "
                            + decision.name(),

                    emailBody.toString()
            );


            String htmlBody =
                    "<html>"
                            + "<body>"

                            + "<h3>Hello "
                            + purchaseRequest
                            .getUser()
                            .getUsername()
                            + ",</h3>"

                            + "<p>"
                            + "Your Purchase Request #"
                            + purchaseRequest
                            .getPurchaseRequestId()
                            + " has been "
                            + "<b>"
                            + decision.name()
                            + "</b>."
                            + "</p>"

                            + "<p>"
                            + "<b>Total Price:</b> ₹"
                            + purchaseRequest
                            .getTotalPrice()
                            + "<br>"
                            + "<b>Status:</b> "
                            + decision.name()
                            + "<br>"
                            + "<b>Admin Remarks:</b> "
                            + (
                            remarks != null &&
                                    !remarks.trim().isEmpty()
                                    ? remarks
                                    : "No remarks"
                    )
                            + "</p>";


            if (decision ==
                    PurchaseRequestStatus.APPROVED) {

                htmlBody +=
                        "<p>"
                                + "Your purchase request has been approved by the Administrator."
                                + "<br>"
                                + "Payment can now be processed."
                                + "</p>";

            } else {

                htmlBody +=
                        "<p>"
                                + "Your purchase request has been rejected by the Administrator."
                                + "</p>";
            }


            htmlBody +=
                    "<br>"

                            + "<a href=\""
                            + downloadLink
                            + "\" "
                            + "style=\"background-color:#4CAF50;"
                            + "color:white;"
                            + "padding:12px 20px;"
                            + "text-decoration:none;"
                            + "border-radius:5px;"
                            + "display:inline-block;\">"
                            + "📥 Download My Purchase Requests"
                            + "</a>"

                            + "<p>"
                            + "<small>"
                            + "This download link is valid for 15 minutes."
                            + "</small>"
                            + "</p>"

                            + "</body>"
                            + "</html>";


            emailService.sendHtmlEmail(
                    purchaseRequest
                            .getUser()
                            .getEmail(),

                    "Purchase Request "
                            + decision.name(),

                    htmlBody
            );

        } catch (Exception e) {

            System.err.println(
                    "Failed to send purchase request decision email: "
                            + e.getMessage()
            );
        }
    }


    // =========================================================
    // ASSIGN SUPPLIERS TO APPROVED REQUESTS
    // =========================================================

    private void ensureSuppliersAssigned(
            PurchaseRequest purchaseRequest) {

        if (purchaseRequest == null ||
                purchaseRequest.getStatus() !=
                        PurchaseRequestStatus.APPROVED ||
                purchaseRequest.getItems() == null) {

            return;
        }


        boolean changed = false;


        for (PurchaseRequestItem item :
                purchaseRequest.getItems()) {

            if (item.getSupplier() != null) {
                continue;
            }


            if (item.getProduct() == null ||
                    item.getProduct().getUser() == null) {

                continue;
            }


            User productOwner =
                    item.getProduct().getUser();


            if (!"SUPPLIER".equalsIgnoreCase(
                    productOwner.getRole()
            )) {

                continue;
            }


            Supplier supplier =
                    supplierRepository
                            .findByUserUserId(
                                    productOwner.getUserId()
                            )
                            .orElseGet(() -> {

                                Supplier newSupplier =
                                        new Supplier();

                                newSupplier.setUser(
                                        productOwner
                                );

                                newSupplier.setSupplierName(
                                        productOwner.getUsername()
                                );

                                newSupplier.setPhoneNumber(
                                        productOwner.getPhoneNumber()
                                );

                                newSupplier.setEmail(
                                        productOwner.getEmail()
                                );

                                newSupplier.setStatus(
                                        SupplierStatus.ACTIVE
                                );

                                if (item.getProduct()
                                        .getCategory() != null) {

                                    newSupplier.setCategory(
                                            item.getProduct()
                                                    .getCategory()
                                    );
                                }

                                return supplierRepository.save(
                                        newSupplier
                                );
                            });


            if (supplier.getStatus() == null) {

                supplier.setStatus(
                        SupplierStatus.ACTIVE
                );

                supplierRepository.save(
                        supplier
                );
            }


            if (supplier.getStatus() ==
                    SupplierStatus.ACTIVE) {

                item.setSupplier(
                        supplier
                );

                changed = true;
            }
        }


        if (changed) {

            purchaseRequestRepository.save(
                    purchaseRequest
            );
        }
    }


    // =========================================================
    // REPAIR OLD DELIVERY STATUS
    // =========================================================
    //
    // IMPORTANT FIX
    //
    // Older approved purchase requests may have:
    //
    // status         = APPROVED
    // deliveryStatus = REQUEST_RECEIVED
    //
    // This happened because delivery tracking was added after
    // those requests had already been approved.
    //
    // An APPROVED request must always begin delivery tracking
    // at APPROVED.
    //
    // This method repairs those old records automatically.
    // =========================================================

    @Transactional
    private void repairDeliveryStatus(
            PurchaseRequest purchaseRequest) {

        if (purchaseRequest == null) {
            return;
        }


        if (purchaseRequest.getStatus() !=
                PurchaseRequestStatus.APPROVED) {

            return;
        }


        DeliveryStatus currentStatus =
                purchaseRequest.getDeliveryStatus();


        // -----------------------------------------------------
        // Old approved request:
        //
        // APPROVED + REQUEST_RECEIVED
        //
        // must become:
        //
        // APPROVED + APPROVED
        // -----------------------------------------------------

        if (currentStatus == null ||
                currentStatus ==
                        DeliveryStatus.REQUEST_RECEIVED) {

            purchaseRequest.setDeliveryStatus(
                    DeliveryStatus.APPROVED
            );

            purchaseRequestRepository.save(
                    purchaseRequest
            );
        }
    }


    // =========================================================
    // SUPPLIER DELIVERY STATUS UPDATE
    // =========================================================

    @Transactional
    public PurchaseRequestDTO updateDeliveryStatus(
            Long purchaseRequestId,
            String deliveryStatus,
            String username) {


        User supplierUser =
                userService.getUserEntityByUsername(
                        username
                );


        if (supplierUser == null) {

            throw new RuntimeException(
                    "Supplier account not found."
            );
        }


        if (supplierUser.getRole() == null ||
                !"SUPPLIER".equalsIgnoreCase(
                        supplierUser.getRole().toString()
                )) {

            throw new RuntimeException(
                    "Only suppliers can update delivery status."
            );
        }


        PurchaseRequest purchaseRequest =
                purchaseRequestRepository
                        .findById(purchaseRequestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Request not found."
                                )
                        );


        if (purchaseRequest.getStatus() !=
                PurchaseRequestStatus.APPROVED) {

            throw new RuntimeException(
                    "Delivery status can only be updated for approved purchase requests."
            );
        }


        // -----------------------------------------------------
        // Repair old approved orders BEFORE checking transition
        // -----------------------------------------------------

        repairDeliveryStatus(
                purchaseRequest
        );


        boolean supplierOwnsRequest =
                purchaseRequest.getItems() != null &&
                        purchaseRequest.getItems()
                                .stream()
                                .anyMatch(item ->
                                        item.getSupplier() != null
                                                && item.getSupplier()
                                                .getUser() != null
                                                && item.getSupplier()
                                                .getUser()
                                                .getUserId()
                                                .equals(
                                                        supplierUser.getUserId()
                                                )
                                );


        if (!supplierOwnsRequest) {

            throw new RuntimeException(
                    "You are not authorized to update this purchase request."
            );
        }


        if (deliveryStatus == null ||
                deliveryStatus.trim().isEmpty()) {

            throw new RuntimeException(
                    "Delivery status is required."
            );
        }


        DeliveryStatus newStatus;

        try {

            newStatus =
                    DeliveryStatus.valueOf(
                            deliveryStatus
                                    .trim()
                                    .toUpperCase()
                    );

        } catch (IllegalArgumentException e) {

            throw new RuntimeException(
                    "Invalid delivery status. Use PACKED, SHIPPED or DELIVERED."
            );
        }


        // Supplier cannot control the first two stages.

        if (newStatus ==
                DeliveryStatus.REQUEST_RECEIVED ||
                newStatus ==
                        DeliveryStatus.APPROVED) {

            throw new RuntimeException(
                    "This delivery status is controlled by the purchase request workflow."
            );
        }


        DeliveryStatus currentStatus =
                purchaseRequest.getDeliveryStatus();


        if (!isValidDeliveryTransition(
                currentStatus,
                newStatus
        )) {

            throw new RuntimeException(
                    "Invalid delivery status transition. Current status: "
                            + currentStatus
                            + ". Next status must be "
                            + getNextDeliveryStatus(
                            currentStatus
                    )
            );
        }


        purchaseRequest.setDeliveryStatus(
                newStatus
        );


        PurchaseRequest updatedRequest =
                purchaseRequestRepository.save(
                        purchaseRequest
                );


        return convertToDTO(
                updatedRequest
        );
    }


    // =========================================================
    // GET SUPPLIER PURCHASE REQUESTS
    // =========================================================

    public List<PurchaseRequestDTO>
    getSupplierPurchaseRequestDTOs(
            String username) {


        User supplierUser =
                userService.getUserEntityByUsername(
                        username
                );


        if (supplierUser == null) {

            throw new RuntimeException(
                    "Supplier account not found."
            );
        }


        if (supplierUser.getRole() == null ||
                !"SUPPLIER".equalsIgnoreCase(
                        supplierUser.getRole().toString()
                )) {

            throw new RuntimeException(
                    "Only suppliers can access supplier purchase requests."
            );
        }


        Supplier supplier =
                supplierRepository
                        .findByUserUserId(
                                supplierUser.getUserId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Supplier record not found."
                                )
                        );


        List<PurchaseRequest> requests =
                purchaseRequestRepository
                        .findDistinctByItemsSupplierSupplierId(
                                supplier.getSupplierId()
                        );


        return requests
                .stream()
                .map(request -> {

                    // -------------------------------------------------
                    // IMPORTANT:
                    // Repair old delivery status before converting DTO.
                    // This guarantees supplier sees the same stage as
                    // employee.
                    // -------------------------------------------------

                    repairDeliveryStatus(
                            request
                    );

                    ensureSuppliersAssigned(
                            request
                    );

                    return convertToDTO(
                            request
                    );
                })
                .toList();
    }


    // =========================================================
    // DELIVERY STATUS TRANSITION VALIDATION
    // =========================================================

    private boolean isValidDeliveryTransition(
            DeliveryStatus currentStatus,
            DeliveryStatus newStatus) {

        if (currentStatus == null ||
                newStatus == null) {

            return false;
        }


        return switch (currentStatus) {

            case REQUEST_RECEIVED ->
                    newStatus ==
                            DeliveryStatus.APPROVED;

            case APPROVED ->
                    newStatus ==
                            DeliveryStatus.PACKED;

            case PACKED ->
                    newStatus ==
                            DeliveryStatus.SHIPPED;

            case SHIPPED ->
                    newStatus ==
                            DeliveryStatus.DELIVERED;

            case DELIVERED ->
                    false;
        };
    }


    // =========================================================
    // GET NEXT DELIVERY STATUS
    // =========================================================

    private String getNextDeliveryStatus(
            DeliveryStatus currentStatus) {

        if (currentStatus == null) {
            return "APPROVED";
        }


        return switch (currentStatus) {

            case REQUEST_RECEIVED ->
                    "APPROVED";

            case APPROVED ->
                    "PACKED";

            case PACKED ->
                    "SHIPPED";

            case SHIPPED ->
                    "DELIVERED";

            case DELIVERED ->
                    "No further status";
        };
    }


    // =========================================================
    // ENTITY -> DTO
    // =========================================================

    private PurchaseRequestDTO convertToDTO(
            PurchaseRequest purchaseRequest) {

        PurchaseRequestDTO dto =
                new PurchaseRequestDTO();


        dto.setPurchaseRequestId(
                purchaseRequest
                        .getPurchaseRequestId()
        );


        dto.setUserId(
                purchaseRequest
                        .getUser()
                        .getUserId()
        );


        dto.setTotalPrice(
                purchaseRequest
                        .getTotalPrice()
        );


        dto.setRemarks(
                purchaseRequest
                        .getRemarks()
        );


        dto.setAdminRemarks(
                purchaseRequest
                        .getAdminRemarks()
        );


        dto.setStatus(
                purchaseRequest
                        .getStatus()
                        .name()
        );


        // -----------------------------------------------------
        // DELIVERY STATUS
        // -----------------------------------------------------

        if (purchaseRequest.getDeliveryStatus() != null) {

            dto.setDeliveryStatus(
                    purchaseRequest
                            .getDeliveryStatus()
                            .name()
            );
        }


        dto.setRequestDate(
                purchaseRequest
                        .getRequestDate()
        );


        dto.setApprovedDate(
                purchaseRequest
                        .getApprovedDate()
        );


        // -----------------------------------------------------
        // ITEMS
        // -----------------------------------------------------

        List<PurchaseRequestItemDTO> itemDTOs =
                purchaseRequest
                        .getItems()
                        .stream()
                        .map(item -> {

                            PurchaseRequestItemDTO itemDTO =
                                    new PurchaseRequestItemDTO();


                            itemDTO.setProductId(
                                    item.getProduct()
                                            .getProductId()
                            );


                            itemDTO.setQuantity(
                                    item.getQuantity()
                            );


                            itemDTO.setItemTotalPrice(
                                    item.getItemTotalPrice()
                            );


                            if (item.getSupplier() != null) {

                                itemDTO.setSupplierId(
                                        item.getSupplier()
                                                .getSupplierId()
                                );
                            }


                            return itemDTO;
                        })
                        .toList();


        dto.setItems(
                itemDTOs
        );


        return dto;
    }


    // =========================================================
    // GET PURCHASE REQUESTS BY USER
    // =========================================================

    public List<PurchaseRequest>
    getPurchaseRequestsByUser(
            Long userId) {

        return purchaseRequestRepository
                .findByUserUserId(userId);
    }


    // =========================================================
    // GET MY PURCHASE REQUESTS AS DTOs
    // =========================================================

    public List<PurchaseRequestDTO>
    getMyPurchaseRequestDTOs(
            Long userId) {

        List<PurchaseRequest> requests =
                purchaseRequestRepository
                        .findByUserUserId(userId);


        // -----------------------------------------------------
        // SORT NEWEST REQUESTS FIRST
        // -----------------------------------------------------
        // The employee should always see the most recently
        // raised purchase request at the top of the list.
        // requestDate is the actual creation date/time.
        // -----------------------------------------------------

        requests.sort(
                (first, second) -> {
                    LocalDateTime firstDate =
                            first.getRequestDate();

                    LocalDateTime secondDate =
                            second.getRequestDate();

                    if (firstDate == null &&
                            secondDate == null) {
                        return 0;
                    }

                    if (firstDate == null) {
                        return 1;
                    }

                    if (secondDate == null) {
                        return -1;
                    }

                    return secondDate.compareTo(firstDate);
                }
        );


        // -----------------------------------------------------
        // IMPORTANT:
        // Repair old approved orders before sending them
        // to the employee dashboard.
        // -----------------------------------------------------

        requests.forEach(
                this::repairDeliveryStatus
        );


        return requests
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

}