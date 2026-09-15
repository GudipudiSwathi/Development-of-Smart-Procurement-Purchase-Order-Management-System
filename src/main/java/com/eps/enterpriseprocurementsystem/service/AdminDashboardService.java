package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.AdminDashboardStatsDTO;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequest;
import com.eps.enterpriseprocurementsystem.repository.CategoryRepository;
import com.eps.enterpriseprocurementsystem.repository.DepartmentRepository;
import com.eps.enterpriseprocurementsystem.repository.ProductRepository;
import com.eps.enterpriseprocurementsystem.repository.PurchaseRequestRepository;
import com.eps.enterpriseprocurementsystem.repository.SupplierRepository;
import com.eps.enterpriseprocurementsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminDashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private PurchaseRequestRepository purchaseRequestRepository;


    // ==========================================
    // GET ADMIN DASHBOARD STATISTICS
    // ==========================================

    public AdminDashboardStatsDTO getDashboardStats() {

        AdminDashboardStatsDTO stats =
                new AdminDashboardStatsDTO();


        // ==========================================
        // USER STATISTICS
        // ==========================================

        long totalUsers =
                userRepository.count();

        long totalAdmins =
                userRepository.findAllByRole("ADMIN").size();

        long totalEmployees =
                userRepository.findAllByRole("EMPLOYEE").size();


        stats.setTotalUsers(totalUsers);

        stats.setTotalAdmins(totalAdmins);

        stats.setTotalEmployees(totalEmployees);


        // ==========================================
        // ORGANIZATION STATISTICS
        // ==========================================

        stats.setTotalDepartments(
                departmentRepository.count()
        );

        stats.setTotalCategories(
                categoryRepository.count()
        );


        // ==========================================
        // PRODUCT / SUPPLIER STATISTICS
        // ==========================================

        stats.setTotalProducts(
                productRepository.count()
        );

        stats.setTotalSuppliers(
                supplierRepository.count()
        );


        // ==========================================
        // PURCHASE REQUESTS
        // ==========================================

        List<PurchaseRequest> requests =
                purchaseRequestRepository.findAll();


        long totalRequests =
                requests.size();


        long pendingRequests =
                countByStatus(
                        requests,
                        "PENDING"
                );


        long approvedRequests =
                countByStatus(
                        requests,
                        "APPROVED"
                );


        long rejectedRequests =
                countByStatus(
                        requests,
                        "REJECTED"
                );


        stats.setTotalPurchaseRequests(
                totalRequests
        );

        stats.setPendingRequests(
                pendingRequests
        );

        stats.setApprovedRequests(
                approvedRequests
        );

        stats.setRejectedRequests(
                rejectedRequests
        );


        // ==========================================
        // TOTAL PROCUREMENT AMOUNT
        // ==========================================

        double totalProcurementAmount =
                requests.stream()

                        .filter(
                                request ->
                                        request.getTotalPrice() != null
                        )

                        .mapToDouble(
                                request ->
                                        request.getTotalPrice()
                        )

                        .sum();


        stats.setTotalProcurementAmount(
                totalProcurementAmount
        );


        // ==========================================
        // DEBUG
        // ==========================================

        System.out.println(
                "=========================================="
        );

        System.out.println(
                "ADMIN DASHBOARD STATISTICS"
        );

        System.out.println(
                "Total Users: " + totalUsers
        );

        System.out.println(
                "Total Employees: " + totalEmployees
        );

        System.out.println(
                "Total Admins: " + totalAdmins
        );

        System.out.println(
                "Total Departments: "
                        + stats.getTotalDepartments()
        );

        System.out.println(
                "Total Categories: "
                        + stats.getTotalCategories()
        );

        System.out.println(
                "Total Products: "
                        + stats.getTotalProducts()
        );

        System.out.println(
                "Total Suppliers: "
                        + stats.getTotalSuppliers()
        );

        System.out.println(
                "Total Purchase Requests: "
                        + totalRequests
        );

        System.out.println(
                "Pending Requests: "
                        + pendingRequests
        );

        System.out.println(
                "Approved Requests: "
                        + approvedRequests
        );

        System.out.println(
                "Rejected Requests: "
                        + rejectedRequests
        );

        System.out.println(
                "Total Procurement Amount: ₹"
                        + totalProcurementAmount
        );

        System.out.println(
                "=========================================="
        );


        return stats;
    }


    // ==========================================
    // COUNT REQUESTS BY STATUS
    // ==========================================

    private long countByStatus(
            List<PurchaseRequest> requests,
            String status
    ) {

        return requests.stream()

                .filter(
                        request ->
                                request.getStatus() != null
                )

                .filter(
                        request ->
                                request.getStatus()
                                        .name()
                                        .equalsIgnoreCase(status)
                )

                .count();
    }

}