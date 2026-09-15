package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.ReportAccountDTO;
import com.eps.enterpriseprocurementsystem.dto.ReportCategoryDTO;
import com.eps.enterpriseprocurementsystem.dto.ReportDepartmentDTO;
import com.eps.enterpriseprocurementsystem.dto.ReportDTO;
import com.eps.enterpriseprocurementsystem.dto.ReportProductDTO;
import com.eps.enterpriseprocurementsystem.dto.ReportPurchaseRequestDTO;
import com.eps.enterpriseprocurementsystem.dto.ReportSupplierDTO;
import com.eps.enterpriseprocurementsystem.dto.ReportUserDTO;
import com.eps.enterpriseprocurementsystem.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/reports")
@PreAuthorize("hasAuthority('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // ============================================================
    // COMPLETE REPORT
    // ============================================================

    @GetMapping
    public ResponseEntity<ReportDTO> getReport() {

        return ResponseEntity.ok(
                reportService.getReport()
        );
    }

    // ============================================================
    // OVERVIEW
    // ============================================================

    @GetMapping("/overview")
    public ResponseEntity<ReportDTO> getOverview() {

        return ResponseEntity.ok(
                reportService.getOverview()
        );
    }

    // ============================================================
    // USER REPORT
    // ============================================================

    @GetMapping("/users")
    public ResponseEntity<List<ReportUserDTO>> getUserReports() {

        return ResponseEntity.ok(
                reportService.getUserReports()
        );
    }

    // ============================================================
    // DEPARTMENT REPORT
    // ============================================================

    @GetMapping("/departments")
    public ResponseEntity<List<ReportDepartmentDTO>>
    getDepartmentReports() {

        return ResponseEntity.ok(
                reportService.getDepartmentReports()
        );
    }

    // ============================================================
    // CATEGORY REPORT
    // ============================================================

    @GetMapping("/categories")
    public ResponseEntity<List<ReportCategoryDTO>>
    getCategoryReports() {

        return ResponseEntity.ok(
                reportService.getCategoryReports()
        );
    }

    // ============================================================
    // PRODUCT REPORT
    // ============================================================

    @GetMapping("/products")
    public ResponseEntity<List<ReportProductDTO>>
    getProductReports() {

        return ResponseEntity.ok(
                reportService.getProductReports()
        );
    }

    // ============================================================
    // SUPPLIER REPORT
    // ============================================================

    @GetMapping("/suppliers")
    public ResponseEntity<List<ReportSupplierDTO>>
    getSupplierReports() {

        return ResponseEntity.ok(
                reportService.getSupplierReports()
        );
    }

    // ============================================================
    // PURCHASE REQUEST REPORT
    // ============================================================

    @GetMapping("/purchase-requests")
    public ResponseEntity<List<ReportPurchaseRequestDTO>>
    getPurchaseRequestReports() {

        return ResponseEntity.ok(
                reportService.getPurchaseRequestReports()
        );
    }

    // ============================================================
    // PAYMENT REPORT
    // ============================================================

    @GetMapping("/payments")
    public ResponseEntity<List<ReportAccountDTO>>
    getPaymentReports() {

        return ResponseEntity.ok(
                reportService.getPaymentReports()
        );
    }

    // ============================================================
    // CSV EXPORT
    // ============================================================

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportReport() {

        String csv = reportService.exportCsv();

        byte[] content =
                csv.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=enterprise-procurement-report.csv"
                )
                .contentType(
                        MediaType.parseMediaType(
                                "text/csv"
                        )
                )
                .contentLength(content.length)
                .body(content);
    }
}