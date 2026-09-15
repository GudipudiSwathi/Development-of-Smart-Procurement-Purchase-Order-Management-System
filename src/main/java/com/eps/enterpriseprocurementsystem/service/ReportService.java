package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.ReportAccountDTO;
import com.eps.enterpriseprocurementsystem.dto.ReportCategoryDTO;
import com.eps.enterpriseprocurementsystem.dto.ReportDepartmentDTO;
import com.eps.enterpriseprocurementsystem.dto.ReportDTO;
import com.eps.enterpriseprocurementsystem.dto.ReportProductDTO;
import com.eps.enterpriseprocurementsystem.dto.ReportPurchaseRequestDTO;
import com.eps.enterpriseprocurementsystem.dto.ReportSupplierDTO;
import com.eps.enterpriseprocurementsystem.dto.ReportUserDTO;
import com.eps.enterpriseprocurementsystem.entity.Account;
import com.eps.enterpriseprocurementsystem.entity.Category;
import com.eps.enterpriseprocurementsystem.entity.Department;
import com.eps.enterpriseprocurementsystem.entity.Product;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequest;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequestItem;
import com.eps.enterpriseprocurementsystem.entity.Supplier;
import com.eps.enterpriseprocurementsystem.entity.User;
import com.eps.enterpriseprocurementsystem.repository.AccountRepository;
import com.eps.enterpriseprocurementsystem.repository.CategoryRepository;
import com.eps.enterpriseprocurementsystem.repository.DepartmentRepository;
import com.eps.enterpriseprocurementsystem.repository.ProductRepository;
import com.eps.enterpriseprocurementsystem.repository.PurchaseRequestRepository;
import com.eps.enterpriseprocurementsystem.repository.SupplierRepository;
import com.eps.enterpriseprocurementsystem.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final AccountRepository accountRepository;

    public ReportService(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            SupplierRepository supplierRepository,
            PurchaseRequestRepository purchaseRequestRepository,
            AccountRepository accountRepository
    ) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.purchaseRequestRepository = purchaseRequestRepository;
        this.accountRepository = accountRepository;
    }

    // ============================================================
    // COMPLETE REPORT
    // ============================================================

    public ReportDTO getReport() {

        List<User> users = userRepository.findAll();
        List<Department> departments = departmentRepository.findAll();
        List<Category> categories = categoryRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<Supplier> suppliers = supplierRepository.findAll();
        List<PurchaseRequest> purchaseRequests =
                purchaseRequestRepository.findAll();
        List<Account> accounts = accountRepository.findAll();

        ReportDTO report = new ReportDTO();

        // --------------------------------------------------------
        // BASIC COUNTS
        // --------------------------------------------------------

        report.setTotalUsers(users.size());

        report.setTotalEmployees(
                (int) users.stream()
                        .filter(user -> "EMPLOYEE".equalsIgnoreCase(
                                safeString(user.getRole())
                        ))
                        .count()
        );

        report.setTotalAdmins(
                (int) users.stream()
                        .filter(user -> "ADMIN".equalsIgnoreCase(
                                safeString(user.getRole())
                        ))
                        .count()
        );

        report.setTotalDepartments(departments.size());
        report.setTotalCategories(categories.size());
        report.setTotalProducts(products.size());
        report.setTotalSuppliers(suppliers.size());
        report.setTotalPurchaseRequests(purchaseRequests.size());

        // --------------------------------------------------------
        // PURCHASE REQUEST STATUS
        // --------------------------------------------------------

        report.setPendingRequests(
                countPurchaseRequests(purchaseRequests, "PENDING")
        );

        report.setApprovedRequests(
                countPurchaseRequests(purchaseRequests, "APPROVED")
        );

        report.setRejectedRequests(
                countPurchaseRequests(purchaseRequests, "REJECTED")
        );

        report.setCancelledRequests(
                countPurchaseRequests(purchaseRequests, "CANCELLED")
        );

        report.setTotalProcurementAmount(
                sumPurchaseRequestAmount(purchaseRequests)
        );

        report.setTotalPendingAmount(
                sumPurchaseRequestAmountByStatus(
                        purchaseRequests,
                        "PENDING"
                )
        );

        report.setTotalApprovedAmount(
                sumPurchaseRequestAmountByStatus(
                        purchaseRequests,
                        "APPROVED"
                )
        );

        // --------------------------------------------------------
        // PAYMENT INFORMATION
        // --------------------------------------------------------

        report.setTotalPaidAmount(
                accounts.stream()
                        .filter(account ->
                                "SUCCESS".equalsIgnoreCase(
                                        safeString(account.getPaymentStatus())
                                )
                        )
                        .mapToDouble(account ->
                                safeDouble(account.getAmount())
                        )
                        .sum()
        );

        report.setSuccessfulPayments(
                (int) accounts.stream()
                        .filter(account ->
                                "SUCCESS".equalsIgnoreCase(
                                        safeString(account.getPaymentStatus())
                                )
                        )
                        .count()
        );

        report.setFailedPayments(
                (int) accounts.stream()
                        .filter(account ->
                                "FAILED".equalsIgnoreCase(
                                        safeString(account.getPaymentStatus())
                                )
                        )
                        .count()
        );

        // --------------------------------------------------------
        // DETAILED REPORTS
        // --------------------------------------------------------

        report.setUsers(buildUserReports(users, purchaseRequests));
        report.setDepartments(
                buildDepartmentReports(departments, purchaseRequests)
        );
        report.setCategories(
                buildCategoryReports(
                        categories,
                        products,
                        suppliers,
                        purchaseRequests
                )
        );
        report.setProducts(
                buildProductReports(products, purchaseRequests)
        );
        report.setSuppliers(
                buildSupplierReports(suppliers, purchaseRequests)
        );
        report.setPurchaseRequests(
                buildPurchaseRequestReports(purchaseRequests)
        );
        report.setAccounts(
                buildAccountReports(accounts)
        );

        return report;
    }

    // ============================================================
    // OVERVIEW
    // ============================================================

    public ReportDTO getOverview() {

        ReportDTO completeReport = getReport();

        ReportDTO overview = new ReportDTO();

        overview.setTotalUsers(completeReport.getTotalUsers());
        overview.setTotalEmployees(completeReport.getTotalEmployees());
        overview.setTotalAdmins(completeReport.getTotalAdmins());
        overview.setTotalDepartments(
                completeReport.getTotalDepartments()
        );
        overview.setTotalCategories(
                completeReport.getTotalCategories()
        );
        overview.setTotalProducts(
                completeReport.getTotalProducts()
        );
        overview.setTotalSuppliers(
                completeReport.getTotalSuppliers()
        );
        overview.setTotalPurchaseRequests(
                completeReport.getTotalPurchaseRequests()
        );

        overview.setPendingRequests(
                completeReport.getPendingRequests()
        );
        overview.setApprovedRequests(
                completeReport.getApprovedRequests()
        );
        overview.setRejectedRequests(
                completeReport.getRejectedRequests()
        );
        overview.setCancelledRequests(
                completeReport.getCancelledRequests()
        );

        overview.setTotalProcurementAmount(
                completeReport.getTotalProcurementAmount()
        );

        overview.setTotalPendingAmount(
                completeReport.getTotalPendingAmount()
        );

        overview.setTotalApprovedAmount(
                completeReport.getTotalApprovedAmount()
        );

        overview.setTotalPaidAmount(
                completeReport.getTotalPaidAmount()
        );

        overview.setSuccessfulPayments(
                completeReport.getSuccessfulPayments()
        );

        overview.setFailedPayments(
                completeReport.getFailedPayments()
        );

        return overview;
    }

    // ============================================================
    // USERS
    // ============================================================

    public List<ReportUserDTO> getUserReports() {

        return buildUserReports(
                userRepository.findAll(),
                purchaseRequestRepository.findAll()
        );
    }

    private List<ReportUserDTO> buildUserReports(
            List<User> users,
            List<PurchaseRequest> purchaseRequests
    ) {

        List<ReportUserDTO> result = new ArrayList<>();

        for (User user : users) {

            ReportUserDTO dto = new ReportUserDTO();

            dto.setUserId(user.getUserId());
            dto.setUsername(user.getUsername());
            dto.setEmail(user.getEmail());
            dto.setPhoneNumber(user.getPhoneNumber());
            dto.setDesignation(user.getDesignation());
            dto.setRole(user.getRole());

            if (user.getDepartment() != null) {
                dto.setDepartmentId(
                        user.getDepartment().getDepartmentId()
                );
                dto.setDepartmentName(
                        user.getDepartment().getDepartmentName()
                );
            }

            List<PurchaseRequest> userRequests =
                    purchaseRequests.stream()
                            .filter(request ->
                                    request.getUser() != null
                                            && Objects.equals(
                                            request.getUser().getUserId(),
                                            user.getUserId()
                                    )
                            )
                            .toList();

            dto.setPurchaseRequestCount(userRequests.size());

            dto.setTotalProcurementAmount(
                    sumPurchaseRequestAmount(userRequests)
            );

            result.add(dto);
        }

        return result;
    }

    // ============================================================
    // DEPARTMENTS
    // ============================================================

    public List<ReportDepartmentDTO> getDepartmentReports() {

        return buildDepartmentReports(
                departmentRepository.findAll(),
                purchaseRequestRepository.findAll()
        );
    }

    private List<ReportDepartmentDTO> buildDepartmentReports(
            List<Department> departments,
            List<PurchaseRequest> purchaseRequests
    ) {

        List<ReportDepartmentDTO> result = new ArrayList<>();

        for (Department department : departments) {

            ReportDepartmentDTO dto = new ReportDepartmentDTO();

            dto.setDepartmentId(department.getDepartmentId());
            dto.setDepartmentName(department.getDepartmentName());

            dto.setEmployeeCount(
                    department.getEmployees() == null
                            ? 0
                            : department.getEmployees().size()
            );

            List<PurchaseRequest> departmentRequests =
                    purchaseRequests.stream()
                            .filter(request ->
                                    request.getUser() != null
                                            && request.getUser().getDepartment() != null
                                            && Objects.equals(
                                            request.getUser()
                                                    .getDepartment()
                                                    .getDepartmentId(),
                                            department.getDepartmentId()
                                    )
                            )
                            .toList();

            dto.setPurchaseRequestCount(
                    departmentRequests.size()
            );

            dto.setPendingRequestCount(
                    countPurchaseRequests(
                            departmentRequests,
                            "PENDING"
                    )
            );

            dto.setApprovedRequestCount(
                    countPurchaseRequests(
                            departmentRequests,
                            "APPROVED"
                    )
            );

            dto.setRejectedRequestCount(
                    countPurchaseRequests(
                            departmentRequests,
                            "REJECTED"
                    )
            );

            dto.setTotalProcurementAmount(
                    sumPurchaseRequestAmount(
                            departmentRequests
                    )
            );

            result.add(dto);
        }

        return result;
    }

    // ============================================================
    // CATEGORIES
    // ============================================================

    public List<ReportCategoryDTO> getCategoryReports() {

        return buildCategoryReports(
                categoryRepository.findAll(),
                productRepository.findAll(),
                supplierRepository.findAll(),
                purchaseRequestRepository.findAll()
        );
    }

    private List<ReportCategoryDTO> buildCategoryReports(
            List<Category> categories,
            List<Product> products,
            List<Supplier> suppliers,
            List<PurchaseRequest> purchaseRequests
    ) {

        List<ReportCategoryDTO> result = new ArrayList<>();

        for (Category category : categories) {

            ReportCategoryDTO dto = new ReportCategoryDTO();

            dto.setCategoryId(category.getCategoryId());
            dto.setCategoryName(category.getCategoryName());

            int productCount =
                    (int) products.stream()
                            .filter(product ->
                                    product.getCategory() != null
                                            && Objects.equals(
                                            product.getCategory()
                                                    .getCategoryId(),
                                            category.getCategoryId()
                                    )
                            )
                            .count();

            int supplierCount =
                    (int) suppliers.stream()
                            .filter(supplier ->
                                    supplier.getCategory() != null
                                            && Objects.equals(
                                            supplier.getCategory()
                                                    .getCategoryId(),
                                            category.getCategoryId()
                                    )
                            )
                            .count();

            dto.setProductCount(productCount);
            dto.setSupplierCount(supplierCount);

            List<PurchaseRequest> categoryRequests =
                    findRequestsForCategory(
                            purchaseRequests,
                            category.getCategoryId()
                    );

            dto.setPurchaseRequestCount(
                    categoryRequests.size()
            );

            dto.setTotalProcurementAmount(
                    sumPurchaseRequestAmount(categoryRequests)
            );

            result.add(dto);
        }

        return result;
    }

    // ============================================================
    // PRODUCTS
    // ============================================================

    public List<ReportProductDTO> getProductReports() {

        return buildProductReports(
                productRepository.findAll(),
                purchaseRequestRepository.findAll()
        );
    }

    private List<ReportProductDTO> buildProductReports(
            List<Product> products,
            List<PurchaseRequest> purchaseRequests
    ) {

        List<ReportProductDTO> result = new ArrayList<>();

        for (Product product : products) {

            ReportProductDTO dto = new ReportProductDTO();

            dto.setProductId(product.getProductId());
            dto.setProductName(product.getName());
            dto.setDescription(product.getDescription());
            dto.setPrice(product.getPrice());
            dto.setStockQuantity(product.getNumberOfQuantities());

            dto.setStatus(
                    product.getStatus() == null
                            ? null
                            : product.getStatus().name()
            );

            if (product.getCategory() != null) {

                dto.setCategoryId(
                        product.getCategory().getCategoryId()
                );

                dto.setCategoryName(
                        product.getCategory().getCategoryName()
                );
            }

            List<PurchaseRequestItem> matchingItems =
                    findItemsForProduct(
                            purchaseRequests,
                            product.getProductId()
                    );

            dto.setPurchaseRequestCount(
                    (int) matchingItems.stream()
                            .map(PurchaseRequestItem::getPurchaseRequest)
                            .filter(Objects::nonNull)
                            .map(PurchaseRequest::getPurchaseRequestId)
                            .distinct()
                            .count()
            );

            dto.setTotalQuantityRequested(
                    matchingItems.stream()
                            .filter(item -> item.getQuantity() != null)
                            .mapToInt(PurchaseRequestItem::getQuantity)
                            .sum()
            );

            dto.setTotalProcurementAmount(
                    matchingItems.stream()
                            .mapToDouble(item ->
                                    safeDouble(
                                            item.getItemTotalPrice()
                                    )
                            )
                            .sum()
            );

            result.add(dto);
        }

        return result;
    }

    // ============================================================
    // SUPPLIERS
    // ============================================================

    public List<ReportSupplierDTO> getSupplierReports() {

        return buildSupplierReports(
                supplierRepository.findAll(),
                purchaseRequestRepository.findAll()
        );
    }

    private List<ReportSupplierDTO> buildSupplierReports(
            List<Supplier> suppliers,
            List<PurchaseRequest> purchaseRequests
    ) {

        List<ReportSupplierDTO> result = new ArrayList<>();

        for (Supplier supplier : suppliers) {

            ReportSupplierDTO dto = new ReportSupplierDTO();

            dto.setSupplierId(supplier.getSupplierId());
            dto.setSupplierName(supplier.getSupplierName());
            dto.setPhoneNumber(supplier.getPhoneNumber());
            dto.setEmail(supplier.getEmail());
            dto.setAddress(supplier.getAddress());
            dto.setGstNumber(supplier.getGstNumber());
            dto.setRating(supplier.getRating());
            dto.setFeedback(supplier.getFeedback());

            dto.setStatus(
                    supplier.getStatus() == null
                            ? null
                            : supplier.getStatus().name()
            );

            /*
             * IMPORTANT:
             * Supplier category may be NULL.
             * Therefore we NEVER call supplier.getCategory().get...
             * without checking for null.
             */
            if (supplier.getCategory() != null) {

                dto.setCategoryId(
                        supplier.getCategory().getCategoryId()
                );

                dto.setCategoryName(
                        supplier.getCategory().getCategoryName()
                );
            } else {

                dto.setCategoryId(null);
                dto.setCategoryName("Unassigned");
            }

            List<PurchaseRequestItem> matchingItems =
                    findItemsForSupplier(
                            purchaseRequests,
                            supplier.getSupplierId()
                    );

            dto.setPurchaseRequestCount(
                    (int) matchingItems.stream()
                            .map(PurchaseRequestItem::getPurchaseRequest)
                            .filter(Objects::nonNull)
                            .map(PurchaseRequest::getPurchaseRequestId)
                            .distinct()
                            .count()
            );

            dto.setTotalProcurementAmount(
                    matchingItems.stream()
                            .mapToDouble(item ->
                                    safeDouble(
                                            item.getItemTotalPrice()
                                    )
                            )
                            .sum()
            );

            result.add(dto);
        }

        return result;
    }

    // ============================================================
    // PURCHASE REQUESTS
    // ============================================================

    public List<ReportPurchaseRequestDTO> getPurchaseRequestReports() {

        return buildPurchaseRequestReports(
                purchaseRequestRepository.findAll()
        );
    }

    private List<ReportPurchaseRequestDTO> buildPurchaseRequestReports(
            List<PurchaseRequest> purchaseRequests
    ) {

        List<ReportPurchaseRequestDTO> result = new ArrayList<>();

        for (PurchaseRequest request : purchaseRequests) {

            ReportPurchaseRequestDTO dto =
                    new ReportPurchaseRequestDTO();

            dto.setPurchaseRequestId(
                    request.getPurchaseRequestId()
            );

            if (request.getUser() != null) {

                dto.setUserId(
                        request.getUser().getUserId()
                );

                dto.setUsername(
                        request.getUser().getUsername()
                );

                if (request.getUser().getDepartment() != null) {

                    dto.setDepartmentId(
                            request.getUser()
                                    .getDepartment()
                                    .getDepartmentId()
                    );

                    dto.setDepartmentName(
                            request.getUser()
                                    .getDepartment()
                                    .getDepartmentName()
                    );
                }
            }

            dto.setTotalPrice(request.getTotalPrice());
            dto.setRemarks(request.getRemarks());
            dto.setAdminRemarks(request.getAdminRemarks());

            dto.setStatus(
                    request.getStatus() == null
                            ? null
                            : request.getStatus().name()
            );

            dto.setCurrentApprovalLevel(
                    request.getCurrentApprovalLevel()
            );

            dto.setRequestDate(request.getRequestDate());
            dto.setApprovedDate(request.getApprovedDate());

            int itemCount =
                    request.getItems() == null
                            ? 0
                            : request.getItems().size();

            dto.setItemCount(itemCount);

            int totalQuantity = 0;

            if (request.getItems() != null) {

                totalQuantity =
                        request.getItems()
                                .stream()
                                .filter(Objects::nonNull)
                                .filter(item ->
                                        item.getQuantity() != null
                                )
                                .mapToInt(
                                        PurchaseRequestItem::getQuantity
                                )
                                .sum();
            }

            dto.setTotalQuantity(totalQuantity);

            dto.setApprovalStatus(
                    getApprovalStatusLabel(
                            request.getStatus()
                    )
            );

            result.add(dto);
        }

        return result;
    }

    // ============================================================
    // ACCOUNTS / PAYMENTS
    // ============================================================

    public List<ReportAccountDTO> getPaymentReports() {

        return buildAccountReports(
                accountRepository.findAll()
        );
    }

    private List<ReportAccountDTO> buildAccountReports(
            List<Account> accounts
    ) {

        List<ReportAccountDTO> result = new ArrayList<>();

        for (Account account : accounts) {

            ReportAccountDTO dto = new ReportAccountDTO();

            dto.setAccountId(account.getAccountId());

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

                dto.setUsername(
                        account.getUser().getUsername()
                );

                if (account.getUser().getDepartment() != null) {

                    dto.setDepartmentName(
                            account.getUser()
                                    .getDepartment()
                                    .getDepartmentName()
                    );
                }
            }

            dto.setAmount(account.getAmount());
            dto.setPaymentStatus(account.getPaymentStatus());
            dto.setPaymentDate(account.getPaymentDate());
            dto.setPaymentReference(account.getPaymentReference());

            result.add(dto);
        }

        return result;
    }

    // ============================================================
    // CSV EXPORT
    // ============================================================

    public String exportCsv() {

        ReportDTO report = getReport();

        StringBuilder csv = new StringBuilder();

        csv.append("Enterprise Procurement System Report\n\n");

        csv.append("OVERVIEW\n");

        csv.append("Metric,Value\n");
        csv.append("Total Users,")
                .append(safeInteger(report.getTotalUsers()))
                .append("\n");

        csv.append("Total Employees,")
                .append(safeInteger(report.getTotalEmployees()))
                .append("\n");

        csv.append("Total Admins,")
                .append(safeInteger(report.getTotalAdmins()))
                .append("\n");

        csv.append("Total Departments,")
                .append(safeInteger(report.getTotalDepartments()))
                .append("\n");

        csv.append("Total Categories,")
                .append(safeInteger(report.getTotalCategories()))
                .append("\n");

        csv.append("Total Products,")
                .append(safeInteger(report.getTotalProducts()))
                .append("\n");

        csv.append("Total Suppliers,")
                .append(safeInteger(report.getTotalSuppliers()))
                .append("\n");

        csv.append("Total Purchase Requests,")
                .append(safeInteger(report.getTotalPurchaseRequests()))
                .append("\n");

        csv.append("Pending Requests,")
                .append(safeInteger(report.getPendingRequests()))
                .append("\n");

        csv.append("Approved Requests,")
                .append(safeInteger(report.getApprovedRequests()))
                .append("\n");

        csv.append("Rejected Requests,")
                .append(safeInteger(report.getRejectedRequests()))
                .append("\n");

        csv.append("Cancelled Requests,")
                .append(safeInteger(report.getCancelledRequests()))
                .append("\n");

        csv.append("Total Procurement Amount,")
                .append(safeDouble(report.getTotalProcurementAmount()))
                .append("\n");

        csv.append("Total Pending Amount,")
                .append(safeDouble(report.getTotalPendingAmount()))
                .append("\n");

        csv.append("Total Approved Amount,")
                .append(safeDouble(report.getTotalApprovedAmount()))
                .append("\n");

        csv.append("Total Paid Amount,")
                .append(safeDouble(report.getTotalPaidAmount()))
                .append("\n");

        csv.append("Successful Payments,")
                .append(safeInteger(report.getSuccessfulPayments()))
                .append("\n");

        csv.append("Failed Payments,")
                .append(safeInteger(report.getFailedPayments()))
                .append("\n\n");

        // --------------------------------------------------------
        // USER REPORT
        // --------------------------------------------------------

        csv.append("USERS\n");

        csv.append(
                "User ID,Username,Email,Phone,Designation,Role,"
                        + "Department,Purchase Requests,Procurement Amount\n"
        );

        for (ReportUserDTO user : safeList(report.getUsers())) {

            csv.append(csvValue(user.getUserId()))
                    .append(",")
                    .append(csvValue(user.getUsername()))
                    .append(",")
                    .append(csvValue(user.getEmail()))
                    .append(",")
                    .append(csvValue(user.getPhoneNumber()))
                    .append(",")
                    .append(csvValue(user.getDesignation()))
                    .append(",")
                    .append(csvValue(user.getRole()))
                    .append(",")
                    .append(csvValue(user.getDepartmentName()))
                    .append(",")
                    .append(csvValue(user.getPurchaseRequestCount()))
                    .append(",")
                    .append(csvValue(user.getTotalProcurementAmount()))
                    .append("\n");
        }

        // --------------------------------------------------------
        // DEPARTMENT REPORT
        // --------------------------------------------------------

        csv.append("\nDEPARTMENTS\n");

        csv.append(
                "Department ID,Department Name,Employees,"
                        + "Purchase Requests,Pending,Approved,Rejected,"
                        + "Procurement Amount\n"
        );

        for (ReportDepartmentDTO department :
                safeList(report.getDepartments())) {

            csv.append(csvValue(department.getDepartmentId()))
                    .append(",")
                    .append(csvValue(department.getDepartmentName()))
                    .append(",")
                    .append(csvValue(department.getEmployeeCount()))
                    .append(",")
                    .append(csvValue(department.getPurchaseRequestCount()))
                    .append(",")
                    .append(csvValue(department.getPendingRequestCount()))
                    .append(",")
                    .append(csvValue(department.getApprovedRequestCount()))
                    .append(",")
                    .append(csvValue(department.getRejectedRequestCount()))
                    .append(",")
                    .append(csvValue(
                            department.getTotalProcurementAmount()
                    ))
                    .append("\n");
        }

        // --------------------------------------------------------
        // CATEGORY REPORT
        // --------------------------------------------------------

        csv.append("\nCATEGORIES\n");

        csv.append(
                "Category ID,Category Name,Products,Suppliers,"
                        + "Purchase Requests,Procurement Amount\n"
        );

        for (ReportCategoryDTO category :
                safeList(report.getCategories())) {

            csv.append(csvValue(category.getCategoryId()))
                    .append(",")
                    .append(csvValue(category.getCategoryName()))
                    .append(",")
                    .append(csvValue(category.getProductCount()))
                    .append(",")
                    .append(csvValue(category.getSupplierCount()))
                    .append(",")
                    .append(csvValue(
                            category.getPurchaseRequestCount()
                    ))
                    .append(",")
                    .append(csvValue(
                            category.getTotalProcurementAmount()
                    ))
                    .append("\n");
        }

        // --------------------------------------------------------
        // PRODUCT REPORT
        // --------------------------------------------------------

        csv.append("\nPRODUCTS\n");

        csv.append(
                "Product ID,Product Name,Price,Stock,Status,"
                        + "Category,Purchase Requests,Quantity Requested,"
                        + "Procurement Amount\n"
        );

        for (ReportProductDTO product :
                safeList(report.getProducts())) {

            csv.append(csvValue(product.getProductId()))
                    .append(",")
                    .append(csvValue(product.getProductName()))
                    .append(",")
                    .append(csvValue(product.getPrice()))
                    .append(",")
                    .append(csvValue(product.getStockQuantity()))
                    .append(",")
                    .append(csvValue(product.getStatus()))
                    .append(",")
                    .append(csvValue(product.getCategoryName()))
                    .append(",")
                    .append(csvValue(product.getPurchaseRequestCount()))
                    .append(",")
                    .append(csvValue(
                            product.getTotalQuantityRequested()
                    ))
                    .append(",")
                    .append(csvValue(
                            product.getTotalProcurementAmount()
                    ))
                    .append("\n");
        }

        // --------------------------------------------------------
        // SUPPLIER REPORT
        // --------------------------------------------------------

        csv.append("\nSUPPLIERS\n");

        csv.append(
                "Supplier ID,Supplier Name,Phone,Email,Address,GST,"
                        + "Rating,Status,Category,Purchase Requests,"
                        + "Procurement Amount\n"
        );

        for (ReportSupplierDTO supplier :
                safeList(report.getSuppliers())) {

            csv.append(csvValue(supplier.getSupplierId()))
                    .append(",")
                    .append(csvValue(supplier.getSupplierName()))
                    .append(",")
                    .append(csvValue(supplier.getPhoneNumber()))
                    .append(",")
                    .append(csvValue(supplier.getEmail()))
                    .append(",")
                    .append(csvValue(supplier.getAddress()))
                    .append(",")
                    .append(csvValue(supplier.getGstNumber()))
                    .append(",")
                    .append(csvValue(supplier.getRating()))
                    .append(",")
                    .append(csvValue(supplier.getStatus()))
                    .append(",")
                    .append(csvValue(supplier.getCategoryName()))
                    .append(",")
                    .append(csvValue(
                            supplier.getPurchaseRequestCount()
                    ))
                    .append(",")
                    .append(csvValue(
                            supplier.getTotalProcurementAmount()
                    ))
                    .append("\n");
        }

        // --------------------------------------------------------
        // PURCHASE REQUEST REPORT
        // --------------------------------------------------------

        csv.append("\nPURCHASE REQUESTS\n");

        csv.append(
                "Request ID,Username,Department,Total Price,Status,"
                        + "Approval Level,Request Date,Approved Date,"
                        + "Items,Quantity,Approval Status\n"
        );

        for (ReportPurchaseRequestDTO request :
                safeList(report.getPurchaseRequests())) {

            csv.append(csvValue(
                            request.getPurchaseRequestId()
                    ))
                    .append(",")
                    .append(csvValue(request.getUsername()))
                    .append(",")
                    .append(csvValue(request.getDepartmentName()))
                    .append(",")
                    .append(csvValue(request.getTotalPrice()))
                    .append(",")
                    .append(csvValue(request.getStatus()))
                    .append(",")
                    .append(csvValue(
                            request.getCurrentApprovalLevel()
                    ))
                    .append(",")
                    .append(csvValue(request.getRequestDate()))
                    .append(",")
                    .append(csvValue(request.getApprovedDate()))
                    .append(",")
                    .append(csvValue(request.getItemCount()))
                    .append(",")
                    .append(csvValue(request.getTotalQuantity()))
                    .append(",")
                    .append(csvValue(
                            request.getApprovalStatus()
                    ))
                    .append("\n");
        }

        // --------------------------------------------------------
        // PAYMENT REPORT
        // --------------------------------------------------------

        csv.append("\nPAYMENTS\n");

        csv.append(
                "Account ID,Purchase Request ID,Username,"
                        + "Department,Amount,Payment Status,"
                        + "Payment Date,Payment Reference\n"
        );

        for (ReportAccountDTO account :
                safeList(report.getAccounts())) {

            csv.append(csvValue(account.getAccountId()))
                    .append(",")
                    .append(csvValue(
                            account.getPurchaseRequestId()
                    ))
                    .append(",")
                    .append(csvValue(account.getUsername()))
                    .append(",")
                    .append(csvValue(account.getDepartmentName()))
                    .append(",")
                    .append(csvValue(account.getAmount()))
                    .append(",")
                    .append(csvValue(
                            account.getPaymentStatus()
                    ))
                    .append(",")
                    .append(csvValue(account.getPaymentDate()))
                    .append(",")
                    .append(csvValue(
                            account.getPaymentReference()
                    ))
                    .append("\n");
        }

        return csv.toString();
    }

    // ============================================================
    // HELPER METHODS
    // ============================================================

    private int countPurchaseRequests(
            List<PurchaseRequest> requests,
            String status
    ) {

        return (int) requests.stream()
                .filter(request ->
                        request.getStatus() != null
                                && status.equalsIgnoreCase(
                                request.getStatus().name()
                        )
                )
                .count();
    }

    private double sumPurchaseRequestAmount(
            List<PurchaseRequest> requests
    ) {

        return requests.stream()
                .mapToDouble(request ->
                        safeDouble(request.getTotalPrice())
                )
                .sum();
    }

    private double sumPurchaseRequestAmountByStatus(
            List<PurchaseRequest> requests,
            String status
    ) {

        return requests.stream()
                .filter(request ->
                        request.getStatus() != null
                                && status.equalsIgnoreCase(
                                request.getStatus().name()
                        )
                )
                .mapToDouble(request ->
                        safeDouble(request.getTotalPrice())
                )
                .sum();
    }

    private List<PurchaseRequest> findRequestsForCategory(
            List<PurchaseRequest> requests,
            Long categoryId
    ) {

        if (categoryId == null) {
            return Collections.emptyList();
        }

        return requests.stream()
                .filter(request -> {

                    if (request.getItems() == null) {
                        return false;
                    }

                    return request.getItems()
                            .stream()
                            .filter(Objects::nonNull)
                            .anyMatch(item ->
                                    item.getProduct() != null
                                            && item.getProduct()
                                            .getCategory() != null
                                            && Objects.equals(
                                            item.getProduct()
                                                    .getCategory()
                                                    .getCategoryId(),
                                            categoryId
                                    )
                            );
                })
                .toList();
    }

    private List<PurchaseRequestItem> findItemsForProduct(
            List<PurchaseRequest> requests,
            Long productId
    ) {

        if (productId == null) {
            return Collections.emptyList();
        }

        List<PurchaseRequestItem> result = new ArrayList<>();

        for (PurchaseRequest request : requests) {

            if (request.getItems() == null) {
                continue;
            }

            for (PurchaseRequestItem item : request.getItems()) {

                if (item == null || item.getProduct() == null) {
                    continue;
                }

                if (Objects.equals(
                        item.getProduct().getProductId(),
                        productId
                )) {

                    result.add(item);
                }
            }
        }

        return result;
    }

    private List<PurchaseRequestItem> findItemsForSupplier(
            List<PurchaseRequest> requests,
            Long supplierId
    ) {

        if (supplierId == null) {
            return Collections.emptyList();
        }

        List<PurchaseRequestItem> result = new ArrayList<>();

        for (PurchaseRequest request : requests) {

            if (request.getItems() == null) {
                continue;
            }

            for (PurchaseRequestItem item : request.getItems()) {

                if (item == null || item.getSupplier() == null) {
                    continue;
                }

                if (Objects.equals(
                        item.getSupplier().getSupplierId(),
                        supplierId
                )) {

                    result.add(item);
                }
            }
        }

        return result;
    }

    private String getApprovalStatusLabel(Object status) {

        if (status == null) {
            return "UNKNOWN";
        }

        String value = status.toString();

        return switch (value.toUpperCase()) {

            case "PENDING" ->
                    "Awaiting Approval";

            case "APPROVED" ->
                    "Fully Approved";

            case "REJECTED" ->
                    "Rejected";

            case "CANCELLED" ->
                    "Cancelled";

            default ->
                    value;
        };
    }

    private double safeDouble(Double value) {
        return value == null ? 0.0 : value;
    }

    private int safeInteger(Integer value) {
        return value == null ? 0 : value;
    }

    private String safeString(String value) {
        return value == null ? "" : value;
    }

    private <T> List<T> safeList(List<T> list) {
        return list == null ? Collections.emptyList() : list;
    }

    private String csvValue(Object value) {

        if (value == null) {
            return "";
        }

        String text = String.valueOf(value);

        if (text.contains(",")
                || text.contains("\"")
                || text.contains("\n")
                || text.contains("\r")) {

            return "\"" +
                    text.replace("\"", "\"\"") +
                    "\"";
        }

        return text;
    }
}