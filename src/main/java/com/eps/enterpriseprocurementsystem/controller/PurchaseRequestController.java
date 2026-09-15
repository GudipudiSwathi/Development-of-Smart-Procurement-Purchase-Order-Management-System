package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.PurchaseRequestDTO;
import com.eps.enterpriseprocurementsystem.dto.PurchaseRequestStatusDTO;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequest;
import com.eps.enterpriseprocurementsystem.entity.PurchaseRequestItem;
import com.eps.enterpriseprocurementsystem.entity.User;
import com.eps.enterpriseprocurementsystem.jwt.JwtService;
import com.eps.enterpriseprocurementsystem.service.PurchaseRequestService;
import com.eps.enterpriseprocurementsystem.service.UserService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/purchase-requests")
@CrossOrigin(origins = "http://localhost:4200")
public class PurchaseRequestController {

    @Autowired
    private PurchaseRequestService purchaseRequestService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;


    // =========================================================
    // CREATE PURCHASE REQUEST
    // ADMIN + EMPLOYEE
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public PurchaseRequestDTO savePurchaseRequest(
            @Valid @RequestBody PurchaseRequestDTO dto) {

        return purchaseRequestService.savePurchaseRequest(dto);
    }


    // =========================================================
    // GET ALL PURCHASE REQUESTS
    // ADMIN + EMPLOYEE
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public List<PurchaseRequestDTO> getAllPurchaseRequests() {

        return purchaseRequestService.getAllPurchaseRequests();
    }


    // =========================================================
    // GET MY PURCHASE REQUESTS
    // EMPLOYEE ONLY
    // =========================================================

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('EMPLOYEE')")
    public List<PurchaseRequestDTO> getMyPurchaseRequests(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated."
            );
        }


        String username =
                authentication.getName();


        System.out.println(
                "GET /purchase-requests/my"
        );

        System.out.println(
                "Logged-in username: "
                        + username
        );


        User user =
                userService.getUserEntityByUsername(
                        username
                );


        if (user == null) {

            throw new RuntimeException(
                    "Logged-in user not found."
            );
        }


        System.out.println(
                "Logged-in user ID: "
                        + user.getUserId()
        );


        List<PurchaseRequestDTO> requests =
                purchaseRequestService
                        .getMyPurchaseRequestDTOs(
                                user.getUserId()
                        );


        System.out.println(
                "My purchase request count: "
                        + requests.size()
        );


        return requests;
    }


    // =========================================================
    // GET SUPPLIER PURCHASE REQUESTS
    // SUPPLIER ONLY
    //
    // Returns requests containing products assigned to
    // the authenticated supplier.
    // =========================================================

    @GetMapping("/supplier")
    @PreAuthorize("hasAuthority('SUPPLIER')")
    public List<PurchaseRequestDTO> getSupplierPurchaseRequests(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Supplier is not authenticated."
            );
        }


        String username =
                authentication.getName();


        System.out.println(
                "GET /purchase-requests/supplier"
        );

        System.out.println(
                "Logged-in supplier: "
                        + username
        );


        return purchaseRequestService
                .getSupplierPurchaseRequestDTOs(
                        username
                );
    }


    // =========================================================
    // UPDATE DELIVERY STATUS
    // SUPPLIER ONLY
    //
    // Allowed flow:
    //
    // APPROVED
    //     ↓
    // PACKED
    //     ↓
    // SHIPPED
    //     ↓
    // DELIVERED
    //
    // Example request:
    //
    // PUT /purchase-requests/33/delivery-status
    //
    // Body:
    //
    // {
    //     "deliveryStatus": "PACKED"
    // }
    //
    // =========================================================

    @PutMapping("/{id}/delivery-status")
    @PreAuthorize("hasAuthority('SUPPLIER')")
    public PurchaseRequestDTO updateDeliveryStatus(
            @PathVariable Long id,
            @RequestBody DeliveryStatusRequest request,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Supplier is not authenticated."
            );
        }


        if (request == null ||
                request.getDeliveryStatus() == null ||
                request.getDeliveryStatus()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Delivery status is required."
            );
        }


        String username =
                authentication.getName();


        System.out.println(
                "================================================="
        );

        System.out.println(
                "SUPPLIER DELIVERY STATUS UPDATE"
        );

        System.out.println(
                "Purchase Request ID: "
                        + id
        );

        System.out.println(
                "Supplier: "
                        + username
        );

        System.out.println(
                "New Delivery Status: "
                        + request.getDeliveryStatus()
        );

        System.out.println(
                "================================================="
        );


        return purchaseRequestService
                .updateDeliveryStatus(
                        id,
                        request.getDeliveryStatus(),
                        username
                );
    }


    // =========================================================
    // DELIVERY STATUS REQUEST DTO
    // =========================================================

    public static class DeliveryStatusRequest {

        private String deliveryStatus;


        public String getDeliveryStatus() {
            return deliveryStatus;
        }


        public void setDeliveryStatus(
                String deliveryStatus) {

            this.deliveryStatus =
                    deliveryStatus;
        }
    }


    // =========================================================
    // DOWNLOAD MY PURCHASE REQUESTS AS CSV
    // AUTHENTICATED USERS
    // =========================================================

    @GetMapping("/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadMyPurchaseRequestsCsv() {

        String username =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();


        User user =
                userService.getUserEntityByUsername(
                        username
                );


        if (user == null) {

            throw new RuntimeException(
                    "User not found."
            );
        }


        List<PurchaseRequest> requests =
                purchaseRequestService
                        .getPurchaseRequestsByUser(
                                user.getUserId()
                        );


        StringBuilder csv =
                new StringBuilder();


        csv.append(
                "Purchase Request ID,"
                        + "User ID,"
                        + "Product ID,"
                        + "Product Name,"
                        + "Quantity,"
                        + "Item Total Price,"
                        + "Total Request Price,"
                        + "Remarks,"
                        + "Admin Remarks,"
                        + "Status,"
                        + "Delivery Status,"
                        + "Request Date,"
                        + "Approved Date"
        );


        csv.append("\n");


        for (PurchaseRequest request :
                requests) {

            for (PurchaseRequestItem item :
                    request.getItems()) {

                csv.append(
                        request.getPurchaseRequestId()
                ).append(",");


                csv.append(
                        request.getUser().getUserId()
                ).append(",");


                csv.append(
                        item.getProduct().getProductId()
                ).append(",");


                csv.append(
                        escapeCsv(
                                item.getProduct().getName()
                        )
                ).append(",");


                csv.append(
                        item.getQuantity()
                ).append(",");


                csv.append(
                        item.getItemTotalPrice()
                ).append(",");


                csv.append(
                        request.getTotalPrice()
                ).append(",");


                csv.append(
                        escapeCsv(
                                request.getRemarks()
                        )
                ).append(",");


                csv.append(
                        escapeCsv(
                                request.getAdminRemarks()
                        )
                ).append(",");


                csv.append(
                        request.getStatus()
                ).append(",");


                csv.append(
                        request.getDeliveryStatus()
                ).append(",");


                csv.append(
                        request.getRequestDate()
                ).append(",");


                csv.append(
                        request.getApprovedDate()
                );


                csv.append("\n");
            }
        }


        byte[] csvBytes =
                csv.toString()
                        .getBytes(
                                StandardCharsets.UTF_8
                        );


        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=purchase-requests.csv"
                )
                .contentType(
                        MediaType.parseMediaType("text/csv")
                )
                .body(csvBytes);
    }


    // =========================================================
    // CSV ESCAPE HELPER
    // =========================================================

    private String escapeCsv(String value) {

        if (value == null) {
            return "";
        }


        if (value.contains(",")
                || value.contains("\"")
                || value.contains("\n")
                || value.contains("\r")) {

            return "\""
                    + value.replace("\"", "\"\"")
                    + "\"";
        }


        return value;
    }


    // =========================================================
    // DOWNLOAD PURCHASE REQUESTS FROM EMAIL
    // USING DOWNLOAD TOKEN
    // =========================================================

    @GetMapping("/download-by-token")
    public ResponseEntity<byte[]> downloadPurchaseRequestsByToken(
            @RequestParam String token) {

        if (!jwtService.validateDownloadToken(token)) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }


        Long userId =
                jwtService.extractUserIdFromDownloadToken(
                        token
                );


        List<PurchaseRequest> requests =
                purchaseRequestService
                        .getPurchaseRequestsByUser(
                                userId
                        );


        StringBuilder csv =
                new StringBuilder();


        csv.append(
                "Purchase Request ID,"
                        + "User ID,"
                        + "Product ID,"
                        + "Product Name,"
                        + "Quantity,"
                        + "Item Total Price,"
                        + "Total Request Price,"
                        + "Remarks,"
                        + "Admin Remarks,"
                        + "Status,"
                        + "Delivery Status,"
                        + "Request Date,"
                        + "Approved Date"
        );


        csv.append("\n");


        for (PurchaseRequest request :
                requests) {

            for (PurchaseRequestItem item :
                    request.getItems()) {

                csv.append(
                        request.getPurchaseRequestId()
                ).append(",");


                csv.append(
                        request.getUser().getUserId()
                ).append(",");


                csv.append(
                        item.getProduct().getProductId()
                ).append(",");


                csv.append(
                        escapeCsv(
                                item.getProduct().getName()
                        )
                ).append(",");


                csv.append(
                        item.getQuantity()
                ).append(",");


                csv.append(
                        item.getItemTotalPrice()
                ).append(",");


                csv.append(
                        request.getTotalPrice()
                ).append(",");


                csv.append(
                        escapeCsv(
                                request.getRemarks()
                        )
                ).append(",");


                csv.append(
                        escapeCsv(
                                request.getAdminRemarks()
                        )
                ).append(",");


                csv.append(
                        request.getStatus()
                ).append(",");


                csv.append(
                        request.getDeliveryStatus()
                ).append(",");


                csv.append(
                        request.getRequestDate()
                ).append(",");


                csv.append(
                        request.getApprovedDate()
                );


                csv.append("\n");
            }
        }


        byte[] csvBytes =
                csv.toString()
                        .getBytes(
                                StandardCharsets.UTF_8
                        );


        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=purchase-requests.csv"
                )
                .contentType(
                        MediaType.parseMediaType("text/csv")
                )
                .body(csvBytes);
    }



    // =========================================================
    // DOWNLOAD MY PURCHASE REQUESTS AS PDF
    // =========================================================
    @GetMapping("/download/pdf")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadMyPurchaseRequestsPdf() {

        String username =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        User user =
                userService.getUserEntityByUsername(username);

        if (user == null) {
            throw new RuntimeException("User not found.");
        }

        List<PurchaseRequest> requests =
                purchaseRequestService.getPurchaseRequestsByUser(
                        user.getUserId()
                );

        byte[] pdfBytes = createPurchaseRequestsPdf(requests);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=purchase-requests.pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }


    // =========================================================
    // DOWNLOAD MY PURCHASE REQUESTS AS EXCEL
    // =========================================================
    @GetMapping("/download/xlsx")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadMyPurchaseRequestsExcel() {

        String username =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        User user =
                userService.getUserEntityByUsername(username);

        if (user == null) {
            throw new RuntimeException("User not found.");
        }

        List<PurchaseRequest> requests =
                purchaseRequestService.getPurchaseRequestsByUser(
                        user.getUserId()
                );

        byte[] excelBytes = createPurchaseRequestsXlsx(requests);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=purchase-requests.xlsx"
                )
                .contentType(
                        MediaType.parseMediaType(
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        )
                )
                .body(excelBytes);
    }


    // =========================================================
    // PDF GENERATOR
    // =========================================================
    private byte[] createPurchaseRequestsPdf(
            List<PurchaseRequest> requests) {

        try {

            List<String> lines = new ArrayList<>();

            lines.add("ENTERPRISE PROCUREMENT SYSTEM");
            lines.add("MY PURCHASE REQUESTS");
            lines.add("");

            lines.add(
                    "ID | Product | Qty | Item Total | Request Total | Status | Delivery | Request Date"
            );
            lines.add(
                    "----------------------------------------------------------------------------------------------------"
            );

            for (PurchaseRequest request : requests) {

                for (PurchaseRequestItem item : request.getItems()) {

                    String productName =
                            item.getProduct() == null
                                    ? ""
                                    : item.getProduct().getName();

                    lines.add(
                            pdfSafe(
                                    request.getPurchaseRequestId()
                                            + " | "
                                            + productName
                                            + " | "
                                            + item.getQuantity()
                                            + " | "
                                            + item.getItemTotalPrice()
                                            + " | "
                                            + request.getTotalPrice()
                                            + " | "
                                            + request.getStatus()
                                            + " | "
                                            + request.getDeliveryStatus()
                                            + " | "
                                            + request.getRequestDate()
                            )
                    );
                }
            }

            if (requests.isEmpty()) {
                lines.add("No purchase requests found.");
            }

            /*
             * Keep the PDF readable by wrapping long product/details
             * lines before they are written to the page.
             */
            List<String> wrappedLines = new ArrayList<>();

            for (String line : lines) {
                if (line == null) {
                    wrappedLines.add("");
                    continue;
                }

                String current = line;

                while (current.length() > 105) {
                    wrappedLines.add(current.substring(0, 105));
                    current = current.substring(105);
                }

                wrappedLines.add(current);
            }

            final int linesPerPage = 45;
            List<List<String>> pages = new ArrayList<>();

            for (int start = 0;
                 start < wrappedLines.size();
                 start += linesPerPage) {

                int end = Math.min(
                        start + linesPerPage,
                        wrappedLines.size()
                );

                pages.add(
                        new ArrayList<>(
                                wrappedLines.subList(start, end)
                        )
                );
            }

            if (pages.isEmpty()) {
                pages.add(new ArrayList<>());
            }

            /*
             * PDF object layout:
             *
             * 1 = Catalog
             * 2 = Pages
             * 3 = Helvetica font
             * Then every page gets:
             *   page object
             *   content object
             */
            int pageCount = pages.size();
            int firstPageObject = 4;
            int firstContentObject = firstPageObject + pageCount;
            int totalObjects = firstContentObject + pageCount - 1;

            List<String> objects = new ArrayList<>();
            objects.add(
                    "<< /Type /Catalog /Pages 2 0 R >>"
            );

            StringBuilder kids = new StringBuilder();

            for (int i = 0; i < pageCount; i++) {
                kids.append(
                        firstPageObject + i
                ).append(" 0 R ");
            }

            objects.add(
                    "<< /Type /Pages /Kids ["
                            + kids
                            + "] /Count "
                            + pageCount
                            + " >>"
            );

            objects.add(
                    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
            );

            for (int i = 0; i < pageCount; i++) {

                int pageObject =
                        firstPageObject + i;

                int contentObject =
                        firstContentObject + i;

                objects.add(
                        "<< /Type /Page "
                                + "/Parent 2 0 R "
                                + "/MediaBox [0 0 842 595] "
                                + "/Resources << /Font << /F1 3 0 R >> >> "
                                + "/Contents "
                                + contentObject
                                + " 0 R >>"
                );
            }

            for (List<String> pageLines : pages) {

                StringBuilder content =
                        new StringBuilder();

                content.append(
                        "BT\n"
                                + "/F1 9 Tf\n"
                                + "40 555 Td\n"
                );

                for (String line : pageLines) {

                    content.append(
                            "("
                                    + pdfEscape(line)
                                    + ") Tj\n"
                    );

                    content.append(
                            "0 -11 Td\n"
                    );
                }

                content.append("ET\n");

                byte[] contentBytes =
                        content.toString()
                                .getBytes(StandardCharsets.US_ASCII);

                objects.add(
                        "<< /Length "
                                + contentBytes.length
                                + " >>\nstream\n"
                                + content
                                + "endstream"
                );
            }

            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            output.write(
                    "%PDF-1.4\n".getBytes(StandardCharsets.US_ASCII)
            );

            List<Integer> offsets =
                    new ArrayList<>();

            offsets.add(0);

            for (int i = 0; i < objects.size(); i++) {

                offsets.add(output.size());

                String object =
                        (i + 1)
                                + " 0 obj\n"
                                + objects.get(i)
                                + "\nendobj\n";

                output.write(
                        object.getBytes(StandardCharsets.US_ASCII)
                );
            }

            int xrefOffset = output.size();

            output.write(
                    ("xref\n0 "
                            + (objects.size() + 1)
                            + "\n")
                            .getBytes(StandardCharsets.US_ASCII)
            );

            output.write(
                    "0000000000 65535 f \n"
                            .getBytes(StandardCharsets.US_ASCII)
            );

            for (int i = 1; i < offsets.size(); i++) {

                output.write(
                        String.format(
                                "%010d 00000 n \n",
                                offsets.get(i)
                        ).getBytes(StandardCharsets.US_ASCII)
                );
            }

            output.write(
                    ("trailer\n"
                            + "<< /Size "
                            + (objects.size() + 1)
                            + " /Root 1 0 R >>\n"
                            + "startxref\n"
                            + xrefOffset
                            + "\n%%EOF")
                            .getBytes(StandardCharsets.US_ASCII)
            );

            return output.toByteArray();

        } catch (IOException ex) {

            throw new RuntimeException(
                    "Unable to create purchase request PDF.",
                    ex
            );
        }
    }


    private String pdfSafe(String value) {

        if (value == null) {
            return "";
        }

        /*
         * The built-in Helvetica PDF font is ASCII based.
         * Replace unsupported characters so PDF generation
         * never fails because of product/remarks text.
         */
        StringBuilder safe =
                new StringBuilder();

        for (char c : value.toCharArray()) {

            if (c >= 32 && c <= 126) {
                safe.append(c);
            } else {
                safe.append('?');
            }
        }

        return safe.toString();
    }


    private String pdfEscape(String value) {

        return pdfSafe(value)
                .replace("\\", "\\\\")
                .replace("(", "\\(")
                .replace(")", "\\)");
    }


    // =========================================================
    // XLSX GENERATOR
    // =========================================================
    private byte[] createPurchaseRequestsXlsx(
            List<PurchaseRequest> requests) {

        try {

            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            ZipOutputStream zip =
                    new ZipOutputStream(output);

            addZipEntry(
                    zip,
                    "[Content_Types].xml",
                    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                            + "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">"
                            + "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>"
                            + "<Default Extension=\"xml\" ContentType=\"application/xml\"/>"
                            + "<Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/>"
                            + "<Override PartName=\"/xl/worksheets/sheet1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/>"
                            + "</Types>"
            );

            addZipEntry(
                    zip,
                    "_rels/.rels",
                    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                            + "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
                            + "<Relationship Id=\"rId1\" "
                            + "Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" "
                            + "Target=\"xl/workbook.xml\"/>"
                            + "</Relationships>"
            );

            addZipEntry(
                    zip,
                    "xl/workbook.xml",
                    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                            + "<workbook xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" "
                            + "xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\">"
                            + "<sheets>"
                            + "<sheet name=\"Purchase Requests\" sheetId=\"1\" r:id=\"rId1\"/>"
                            + "</sheets>"
                            + "</workbook>"
            );

            addZipEntry(
                    zip,
                    "xl/_rels/workbook.xml.rels",
                    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                            + "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
                            + "<Relationship Id=\"rId1\" "
                            + "Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" "
                            + "Target=\"worksheets/sheet1.xml\"/>"
                            + "</Relationships>"
            );

            StringBuilder sheet =
                    new StringBuilder();

            sheet.append(
                    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                            + "<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">"
                            + "<sheetData>"
            );

            String[] headers = {
                    "Purchase Request ID",
                    "User ID",
                    "Product ID",
                    "Product Name",
                    "Quantity",
                    "Item Total Price",
                    "Total Request Price",
                    "Remarks",
                    "Admin Remarks",
                    "Status",
                    "Delivery Status",
                    "Request Date",
                    "Approved Date"
            };

            sheet.append("<row r=\"1\">");

            for (int i = 0; i < headers.length; i++) {
                sheet.append(
                        xlsxCell(
                                excelColumn(i + 1),
                                1,
                                headers[i]
                        )
                );
            }

            sheet.append("</row>");

            int rowNumber = 2;

            for (PurchaseRequest request : requests) {

                for (PurchaseRequestItem item :
                        request.getItems()) {

                    String productName =
                            item.getProduct() == null
                                    ? ""
                                    : item.getProduct().getName();

                    String userId =
                            request.getUser() == null
                                    ? ""
                                    : String.valueOf(
                                    request.getUser().getUserId()
                            );

                    String productId =
                            item.getProduct() == null
                                    ? ""
                                    : String.valueOf(
                                    item.getProduct().getProductId()
                            );

                    String[] values = {
                            String.valueOf(
                                    request.getPurchaseRequestId()
                            ),
                            userId,
                            productId,
                            productName,
                            String.valueOf(
                                    item.getQuantity()
                            ),
                            String.valueOf(
                                    item.getItemTotalPrice()
                            ),
                            String.valueOf(
                                    request.getTotalPrice()
                            ),
                            request.getRemarks(),
                            request.getAdminRemarks(),
                            String.valueOf(
                                    request.getStatus()
                            ),
                            String.valueOf(
                                    request.getDeliveryStatus()
                            ),
                            String.valueOf(
                                    request.getRequestDate()
                            ),
                            String.valueOf(
                                    request.getApprovedDate()
                            )
                    };

                    sheet.append(
                            "<row r=\""
                                    + rowNumber
                                    + "\">"
                    );

                    for (int i = 0;
                         i < values.length;
                         i++) {

                        sheet.append(
                                xlsxCell(
                                        excelColumn(i + 1),
                                        rowNumber,
                                        values[i]
                                )
                        );
                    }

                    sheet.append("</row>");

                    rowNumber++;
                }
            }

            if (rowNumber == 2) {

                sheet.append(
                        "<row r=\"2\">"
                                + xlsxCell(
                                "A",
                                2,
                                "No purchase requests found."
                        )
                                + "</row>"
                );
            }

            sheet.append(
                    "</sheetData>"
                            + "</worksheet>"
            );

            addZipEntry(
                    zip,
                    "xl/worksheets/sheet1.xml",
                    sheet.toString()
            );

            zip.finish();
            zip.close();

            return output.toByteArray();

        } catch (IOException ex) {

            throw new RuntimeException(
                    "Unable to create purchase request Excel file.",
                    ex
            );
        }
    }


    private void addZipEntry(
            ZipOutputStream zip,
            String name,
            String content)
            throws IOException {

        zip.putNextEntry(
                new ZipEntry(name)
        );

        zip.write(
                content.getBytes(
                        StandardCharsets.UTF_8
                )
        );

        zip.closeEntry();
    }


    private String xlsxCell(
            String column,
            int row,
            String value) {

        return "<c r=\""
                + column
                + row
                + "\" t=\"inlineStr\">"
                + "<is><t xml:space=\"preserve\">"
                + xmlEscape(value)
                + "</t></is>"
                + "</c>";
    }


    private String excelColumn(int number) {

        StringBuilder column =
                new StringBuilder();

        while (number > 0) {

            int remainder =
                    (number - 1) % 26;

            column.insert(
                    0,
                    (char) ('A' + remainder)
            );

            number =
                    (number - 1) / 26;
        }

        return column.toString();
    }


    private String xmlEscape(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }


    // =========================================================
    // GET PURCHASE REQUEST BY ID
    // ADMIN + EMPLOYEE
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public PurchaseRequestDTO getPurchaseRequestById(
            @PathVariable Long id) {

        return purchaseRequestService
                .getPurchaseRequestById(id);
    }


    // =========================================================
    // ADMIN APPROVE / REJECT PURCHASE REQUEST
    // ADMIN ONLY
    // =========================================================

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public PurchaseRequestDTO updatePurchaseRequestStatus(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseRequestStatusDTO dto) {

        return purchaseRequestService
                .updatePurchaseRequestStatus(
                        id,
                        dto.getStatus(),
                        dto.getAdminRemarks()
                );
    }


    // =========================================================
    // DELETE PURCHASE REQUEST
    // ADMIN ONLY
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public String deletePurchaseRequest(
            @PathVariable Long id) {

        return purchaseRequestService
                .deletePurchaseRequest(id);
    }
}