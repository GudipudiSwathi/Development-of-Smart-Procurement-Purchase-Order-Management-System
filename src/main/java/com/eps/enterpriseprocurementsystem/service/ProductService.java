package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.ProductDTO;
import com.eps.enterpriseprocurementsystem.entity.Category;
import com.eps.enterpriseprocurementsystem.entity.Department;
import com.eps.enterpriseprocurementsystem.entity.Product;
import com.eps.enterpriseprocurementsystem.entity.User;
import com.eps.enterpriseprocurementsystem.enums.ProductStatus;
import com.eps.enterpriseprocurementsystem.exception.ProductAlreadyExistsException;
import com.eps.enterpriseprocurementsystem.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private UserService userService;


    // =====================================================
    // ADMIN - SAVE PRODUCT
    // =====================================================

    public ProductDTO saveProduct(ProductDTO dto) {

        if (productRepository
                .findByName(dto.getName())
                .isPresent()) {

            throw new ProductAlreadyExistsException(
                    "Product already exists."
            );
        }

        Product product = convertToEntity(dto);

        Product savedProduct =
                productRepository.saveAndFlush(product);

        return convertToDTO(savedProduct);
    }


    // =====================================================
    // GET ALL PRODUCTS
    // =====================================================

    public List<ProductDTO> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =====================================================
    // GET PRODUCT BY ID
    // =====================================================

    public ProductDTO getProductById(Long id) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        return convertToDTO(product);
    }


    // =====================================================
    // ADMIN - UPDATE PRODUCT
    // =====================================================

    public ProductDTO updateProduct(
            Long id,
            ProductDTO dto) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setNumberOfQuantities(
                dto.getNumberOfQuantities()
        );

        product.setTotalPrice(
                dto.getPrice()
                        * dto.getNumberOfQuantities()
        );

        product.setDescription(
                dto.getDescription()
        );

        Department department =
                departmentService
                        .getDepartmentEntityById(
                                dto.getDepartmentId()
                        );

        Category category =
                categoryService
                        .getCategoryEntityById(
                                dto.getCategoryId()
                        );

        User user =
                userService
                        .getUserEntityById(
                                dto.getUserId()
                        );

        product.setDepartment(department);
        product.setCategory(category);
        product.setUser(user);

        if (dto.getStatus() != null) {
            try {
                product.setStatus(
                        ProductStatus.valueOf(
                                dto.getStatus()
                                        .trim()
                                        .toUpperCase()
                        )
                );
            } catch (IllegalArgumentException ex) {
                product.setStatus(ProductStatus.ACTIVE);
            }
        } else {
            product.setStatus(ProductStatus.ACTIVE);
        }

        product.setUpdatedDate(
                LocalDateTime.now()
        );

        Product updatedProduct =
                productRepository.saveAndFlush(product);

        return convertToDTO(updatedProduct);
    }


    // =====================================================
    // ADMIN - DELETE PRODUCT
    // =====================================================

    public String deleteProduct(Long id) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        productRepository.delete(product);
        productRepository.flush();

        return "Product deleted successfully.";
    }


    // =====================================================
    // SUPPLIER - GET MY PRODUCTS
    // =====================================================

    public List<ProductDTO> getMyProducts(
            String username) {

        User supplierUser =
                userService
                        .getUserEntityByUsername(username);

        return productRepository
                .findByUserUserId(
                        supplierUser.getUserId()
                )
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =====================================================
    // SUPPLIER - SAVE PRODUCT
    // =====================================================

    public ProductDTO saveSupplierProduct(
            ProductDTO dto,
            String username) {

        // -------------------------------------------------
        // GET LOGGED-IN SUPPLIER
        // -------------------------------------------------

        User supplierUser =
                userService
                        .getUserEntityByUsername(username);

        if (supplierUser == null) {
            throw new RuntimeException(
                    "Supplier account not found."
            );
        }


        // -------------------------------------------------
        // MAKE SURE USER IS SUPPLIER
        // -------------------------------------------------

        if (!"SUPPLIER".equalsIgnoreCase(
                supplierUser.getRole()
        )) {

            throw new RuntimeException(
                    "Only suppliers can create products."
            );
        }


        // -------------------------------------------------
        // CHECK DUPLICATE ONLY FOR THIS SUPPLIER
        // -------------------------------------------------

        if (productRepository
                .findByNameIgnoreCaseAndUserUserId(
                        dto.getName().trim(),
                        supplierUser.getUserId()
                )
                .isPresent()) {

            throw new ProductAlreadyExistsException(
                    "You already have a product with this name."
            );
        }


        // -------------------------------------------------
        // GET DEPARTMENT
        // -------------------------------------------------

        Department department =
                departmentService
                        .getDepartmentEntityById(
                                dto.getDepartmentId()
                        );


        // -------------------------------------------------
        // GET CATEGORY
        // -------------------------------------------------

        Category category =
                categoryService
                        .getCategoryEntityById(
                                dto.getCategoryId()
                        );


        // -------------------------------------------------
        // CREATE PRODUCT
        // -------------------------------------------------

        Product product =
                new Product();

        product.setName(
                dto.getName().trim()
        );

        product.setPrice(
                dto.getPrice()
        );

        product.setNumberOfQuantities(
                dto.getNumberOfQuantities()
        );

        product.setTotalPrice(
                dto.getPrice()
                        * dto.getNumberOfQuantities()
        );

        product.setDescription(
                dto.getDescription()
        );

        product.setDepartment(
                department
        );

        product.setCategory(
                category
        );

        // IMPORTANT:
        // Always use the authenticated supplier.
        product.setUser(
                supplierUser
        );

        product.setStatus(
                ProductStatus.ACTIVE
        );

        product.setCreatedDate(
                LocalDateTime.now()
        );

        product.setUpdatedDate(
                LocalDateTime.now()
        );


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        Product savedProduct =
                productRepository.save(product);

        return convertToDTO(savedProduct);
    }


    // =====================================================
    // SUPPLIER - UPDATE MY PRODUCT
    // =====================================================

    public ProductDTO updateSupplierProduct(
            Long productId,
            ProductDTO dto,
            String username) {

        User supplierUser =
                userService
                        .getUserEntityByUsername(username);

        if (supplierUser == null) {
            throw new RuntimeException(
                    "Supplier account not found."
            );
        }


        Product product =
                productRepository
                        .findByProductIdAndUserUserId(
                                productId,
                                supplierUser.getUserId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found in your products."
                                )
                        );


        // -------------------------------------------------
        // CHECK NAME DUPLICATE
        // -------------------------------------------------

        productRepository
                .findByNameIgnoreCaseAndUserUserId(
                        dto.getName().trim(),
                        supplierUser.getUserId()
                )
                .ifPresent(existing -> {

                    if (!existing.getProductId()
                            .equals(productId)) {

                        throw new ProductAlreadyExistsException(
                                "You already have a product with this name."
                        );
                    }
                });


        Department department =
                departmentService
                        .getDepartmentEntityById(
                                dto.getDepartmentId()
                        );

        Category category =
                categoryService
                        .getCategoryEntityById(
                                dto.getCategoryId()
                        );


        product.setName(
                dto.getName().trim()
        );

        product.setPrice(
                dto.getPrice()
        );

        product.setNumberOfQuantities(
                dto.getNumberOfQuantities()
        );

        product.setTotalPrice(
                dto.getPrice()
                        * dto.getNumberOfQuantities()
        );

        product.setDescription(
                dto.getDescription()
        );

        product.setDepartment(
                department
        );

        product.setCategory(
                category
        );


        // Keep ownership with authenticated supplier.
        product.setUser(
                supplierUser
        );


        if (dto.getStatus() != null) {

            try {

                product.setStatus(
                        ProductStatus.valueOf(
                                dto.getStatus()
                                        .trim()
                                        .toUpperCase()
                        )
                );

            } catch (IllegalArgumentException ex) {

                product.setStatus(
                        ProductStatus.ACTIVE
                );
            }

        } else {

            product.setStatus(
                    ProductStatus.ACTIVE
            );
        }


        product.setUpdatedDate(
                LocalDateTime.now()
        );


        Product updatedProduct =
                productRepository.save(product);

        return convertToDTO(updatedProduct);
    }


    // =====================================================
    // SUPPLIER - DELETE MY PRODUCT
    // =====================================================

    public String deleteSupplierProduct(
            Long productId,
            String username) {

        User supplierUser =
                userService
                        .getUserEntityByUsername(username);

        if (supplierUser == null) {
            throw new RuntimeException(
                    "Supplier account not found."
            );
        }


        Product product =
                productRepository
                        .findByProductIdAndUserUserId(
                                productId,
                                supplierUser.getUserId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found in your products."
                                )
                        );


        productRepository.delete(product);

        return "Product deleted successfully.";
    }


    // =====================================================
    // DTO -> ENTITY
    // =====================================================

    private Product convertToEntity(
            ProductDTO dto) {

        Product product =
                new Product();

        product.setProductId(
                dto.getProductId()
        );

        product.setName(
                dto.getName()
        );

        product.setPrice(
                dto.getPrice()
        );

        product.setNumberOfQuantities(
                dto.getNumberOfQuantities()
        );

        product.setTotalPrice(
                dto.getPrice()
                        * dto.getNumberOfQuantities()
        );

        product.setDescription(
                dto.getDescription()
        );


        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        if (dto.getStatus() != null) {

            try {

                product.setStatus(
                        ProductStatus.valueOf(
                                dto.getStatus()
                                        .trim()
                                        .toUpperCase()
                        )
                );

            } catch (IllegalArgumentException ex) {

                product.setStatus(
                        ProductStatus.ACTIVE
                );
            }

        } else {

            product.setStatus(
                    ProductStatus.ACTIVE
            );
        }


        Department department =
                departmentService
                        .getDepartmentEntityById(
                                dto.getDepartmentId()
                        );

        Category category =
                categoryService
                        .getCategoryEntityById(
                                dto.getCategoryId()
                        );

        User user =
                userService
                        .getUserEntityById(
                                dto.getUserId()
                        );

        product.setDepartment(
                department
        );

        product.setCategory(
                category
        );

        product.setUser(
                user
        );

        product.setCreatedDate(
                LocalDateTime.now()
        );

        product.setUpdatedDate(
                LocalDateTime.now()
        );

        return product;
    }


    // =====================================================
    // ENTITY -> DTO
    // =====================================================

    private ProductDTO convertToDTO(
            Product product) {

        ProductDTO dto =
                new ProductDTO();

        dto.setProductId(
                product.getProductId()
        );

        dto.setName(
                product.getName()
        );

        dto.setPrice(
                product.getPrice()
        );

        dto.setNumberOfQuantities(
                product.getNumberOfQuantities()
        );

        dto.setTotalPrice(
                product.getTotalPrice()
        );

        dto.setDescription(
                product.getDescription()
        );

        dto.setStatus(
                product.getStatus() != null
                        ? product.getStatus().name()
                        : ProductStatus.ACTIVE.name()
        );


        if (product.getDepartment() != null) {

            dto.setDepartmentId(
                    product.getDepartment()
                            .getDepartmentId()
            );
        }


        if (product.getCategory() != null) {

            dto.setCategoryId(
                    product.getCategory()
                            .getCategoryId()
            );
        }


        if (product.getUser() != null) {

            dto.setUserId(
                    product.getUser()
                            .getUserId()
            );
        }

        return dto;
    }


    // =====================================================
    // GET PRODUCT ENTITY BY ID
    // =====================================================

    public Product getProductEntityById(
            Long id) {

        return productRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        )
                );
    }
}