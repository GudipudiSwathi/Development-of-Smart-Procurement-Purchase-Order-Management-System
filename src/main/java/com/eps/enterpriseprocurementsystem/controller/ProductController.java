package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.ProductDTO;
import com.eps.enterpriseprocurementsystem.entity.Product;
import com.eps.enterpriseprocurementsystem.repository.ProductRepository;
import com.eps.enterpriseprocurementsystem.service.ProductService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;


    // =====================================================
    // ADMIN - SAVE PRODUCT
    // =====================================================

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ProductDTO saveProduct(
            @Valid @RequestBody ProductDTO dto) {

        return productService.saveProduct(dto);
    }


    // =====================================================
    // ADMIN + EMPLOYEE
    // GET ALL PRODUCTS
    // =====================================================

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public List<ProductDTO> getAllProducts() {

        return productService.getAllProducts();
    }


    // =====================================================
    // ADMIN + EMPLOYEE
    // GET PRODUCT BY ID
    // =====================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ProductDTO getProductById(
            @PathVariable Long id) {

        return productService.getProductById(id);
    }


    // =====================================================
    // SUPPLIER / BUSINESS
    // GET MY PRODUCTS
    // =====================================================

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('SUPPLIER')")
    public List<ProductDTO> getMyProducts(
            Authentication authentication) {

        return productService.getMyProducts(
                authentication.getName()
        );
    }


    // =====================================================
    // SUPPLIER / BUSINESS
    // ADD PRODUCT
    // =====================================================

    @PostMapping("/supplier")
    @PreAuthorize("hasAuthority('SUPPLIER')")
    public ProductDTO saveSupplierProduct(
            @Valid @RequestBody ProductDTO dto,
            Authentication authentication) {

        return productService.saveSupplierProduct(
                dto,
                authentication.getName()
        );
    }


    // =====================================================
    // SUPPLIER / BUSINESS
    // UPDATE OWN PRODUCT
    // =====================================================

    @PutMapping("/supplier/{id}")
    @PreAuthorize("hasAuthority('SUPPLIER')")
    public ProductDTO updateSupplierProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO dto,
            Authentication authentication) {

        return productService.updateSupplierProduct(
                id,
                dto,
                authentication.getName()
        );
    }


    // =====================================================
    // SUPPLIER / BUSINESS
    // DELETE OWN PRODUCT
    // =====================================================

    @DeleteMapping("/supplier/{id}")
    @PreAuthorize("hasAuthority('SUPPLIER')")
    public String deleteSupplierProduct(
            @PathVariable Long id,
            Authentication authentication) {

        return productService.deleteSupplierProduct(
                id,
                authentication.getName()
        );
    }


    // =====================================================
    // ADMIN - UPDATE PRODUCT
    // =====================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ProductDTO updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO dto) {

        return productService.updateProduct(
                id,
                dto
        );
    }


    // =====================================================
    // ADMIN - DELETE PRODUCT
    // =====================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public String deleteProduct(
            @PathVariable Long id) {

        return productService.deleteProduct(id);
    }


    // =====================================================
    // DOWNLOAD PRODUCTS CSV
    // ADMIN + EMPLOYEE
    // =====================================================

    @GetMapping("/download")
    @PreAuthorize("hasAnyAuthority('ADMIN','EMPLOYEE')")
    public ResponseEntity<byte[]> downloadProductsCsv() {

        List<Product> products =
                productRepository.findAll();

        StringBuilder csv =
                new StringBuilder();

        csv.append(
                "Product ID,Name,Price,Quantity,Total Price,"
                        + "Description,Status,Department,Category"
        );

        csv.append("\n");

        for (Product product : products) {

            csv.append(
                    product.getProductId()
            ).append(",");

            csv.append(
                    escapeCsv(product.getName())
            ).append(",");

            csv.append(
                    product.getPrice() != null
                            ? product.getPrice()
                            : ""
            ).append(",");

            csv.append(
                    product.getNumberOfQuantities() != null
                            ? product.getNumberOfQuantities()
                            : ""
            ).append(",");

            csv.append(
                    product.getTotalPrice() != null
                            ? product.getTotalPrice()
                            : ""
            ).append(",");

            csv.append(
                    escapeCsv(product.getDescription())
            ).append(",");

            csv.append(
                    product.getStatus() != null
                            ? product.getStatus().name()
                            : ""
            ).append(",");

            if (product.getDepartment() != null) {

                csv.append(
                        escapeCsv(
                                product.getDepartment()
                                        .getDepartmentName()
                        )
                );

            } else {

                csv.append("");
            }

            csv.append(",");

            if (product.getCategory() != null) {

                csv.append(
                        escapeCsv(
                                product.getCategory()
                                        .getCategoryName()
                        )
                );

            } else {

                csv.append("");
            }

            csv.append("\n");
        }

        byte[] csvBytes =
                csv.toString()
                        .getBytes(
                                StandardCharsets.UTF_8
                        );

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=products.csv"
                )
                .contentType(
                        MediaType.parseMediaType(
                                "text/csv"
                        )
                )
                .body(csvBytes);
    }


    // =====================================================
    // CSV ESCAPE
    // =====================================================

    private String escapeCsv(
            String value) {

        if (value == null) {
            return "";
        }

        if (value.contains(",")
                || value.contains("\"")
                || value.contains("\n")
                || value.contains("\r")) {

            return "\""
                    + value.replace(
                    "\"",
                    "\"\""
            )
                    + "\"";
        }

        return value;
    }
}