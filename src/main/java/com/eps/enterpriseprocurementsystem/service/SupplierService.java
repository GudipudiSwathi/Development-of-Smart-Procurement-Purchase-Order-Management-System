package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.SupplierDTO;
import com.eps.enterpriseprocurementsystem.entity.Category;
import com.eps.enterpriseprocurementsystem.entity.Supplier;
import com.eps.enterpriseprocurementsystem.enums.SupplierStatus;
import com.eps.enterpriseprocurementsystem.exception.SupplierAlreadyExistsException;
import com.eps.enterpriseprocurementsystem.repository.CategoryRepository;
import com.eps.enterpriseprocurementsystem.repository.SupplierRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class SupplierService {


    @Autowired
    private SupplierRepository supplierRepository;


    @Autowired
    private CategoryRepository categoryRepository;


    // =====================================================
    // SAVE SUPPLIER
    // ADMIN ONLY
    // =====================================================

    public SupplierDTO saveSupplier(
            SupplierDTO dto) {

        // -------------------------------------------------
        // CHECK GST
        // -------------------------------------------------

        if (dto.getGstNumber() != null
                && !dto.getGstNumber().trim().isEmpty()
                && supplierRepository
                .findByGstNumber(
                        dto.getGstNumber()
                )
                .isPresent()) {

            throw new SupplierAlreadyExistsException(
                    "Supplier already exists."
            );
        }


        // -------------------------------------------------
        // CONVERT DTO -> ENTITY
        // -------------------------------------------------

        Supplier supplier =
                convertToEntity(dto);


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        Supplier savedSupplier =
                supplierRepository.save(
                        supplier
                );


        // -------------------------------------------------
        // RETURN DTO
        // -------------------------------------------------

        return convertToDTO(
                savedSupplier
        );
    }


    // =====================================================
    // GET ALL SUPPLIERS
    // ADMIN + EMPLOYEE
    // =====================================================

    public List<SupplierDTO> getAllSuppliers() {

        List<Supplier> suppliers =
                supplierRepository.findAll();


        // -------------------------------------------------
        // REPAIR LEGACY NULL STATUS
        // -------------------------------------------------

        suppliers.forEach(supplier -> {

            if (supplier.getStatus() == null) {

                supplier.setStatus(
                        SupplierStatus.ACTIVE
                );

                supplierRepository.save(
                        supplier
                );
            }

        });


        // -------------------------------------------------
        // CONVERT
        // -------------------------------------------------

        return suppliers
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =====================================================
    // GET SUPPLIER BY ID
    // =====================================================

    public SupplierDTO getSupplierById(
            Long id) {

        Supplier supplier =
                supplierRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Supplier not found"
                                        )
                        );


        // -------------------------------------------------
        // REPAIR NULL STATUS
        // -------------------------------------------------

        if (supplier.getStatus() == null) {

            supplier.setStatus(
                    SupplierStatus.ACTIVE
            );

            supplierRepository.save(
                    supplier
            );
        }


        return convertToDTO(
                supplier
        );
    }


    // =====================================================
    // GET SUPPLIERS BY CATEGORY
    // =====================================================

    public List<SupplierDTO> getSuppliersByCategory(
            Long categoryId) {

        // -------------------------------------------------
        // CHECK CATEGORY
        // -------------------------------------------------

        categoryRepository
                .findById(categoryId)
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Category not found"
                                )
                );


        // -------------------------------------------------
        // GET SUPPLIERS
        // -------------------------------------------------

        List<Supplier> suppliers =
                supplierRepository
                        .findByCategoryCategoryId(
                                categoryId
                        );


        // -------------------------------------------------
        // REPAIR NULL STATUS
        // -------------------------------------------------

        suppliers.forEach(supplier -> {

            if (supplier.getStatus() == null) {

                supplier.setStatus(
                        SupplierStatus.ACTIVE
                );

                supplierRepository.save(
                        supplier
                );
            }

        });


        // -------------------------------------------------
        // CONVERT
        // -------------------------------------------------

        return suppliers
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =====================================================
    // GET SUPPLIER BY USERNAME
    // BUSINESS / SUPPLIER ONLY
    // =====================================================

    /*
     * Used by:
     *
     * GET /suppliers/me
     *
     * The username comes from the logged-in JWT.
     *
     * This prevents a Business user from requesting
     * another supplier's profile.
     */

    public SupplierDTO getSupplierByUsername(
            String username) {

        if (username == null
                || username.trim().isEmpty()) {

            throw new RuntimeException(
                    "Username is required."
            );
        }


        Supplier supplier =
                supplierRepository
                        .findByUserUsername(
                                username
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Supplier account not found."
                                        )
                        );


        // -------------------------------------------------
        // REPAIR NULL STATUS
        // -------------------------------------------------

        if (supplier.getStatus() == null) {

            supplier.setStatus(
                    SupplierStatus.ACTIVE
            );

            supplierRepository.save(
                    supplier
            );
        }


        return convertToDTO(
                supplier
        );
    }


    // =====================================================
    // GET SUPPLIER BY USER ID
    // BUSINESS / SUPPLIER ONLY
    // =====================================================

    public SupplierDTO getSupplierByUserId(
            Long userId) {

        if (userId == null) {

            throw new RuntimeException(
                    "User ID is required."
            );
        }


        Supplier supplier =
                supplierRepository
                        .findByUserUserId(
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Supplier account not found."
                                        )
                        );


        // -------------------------------------------------
        // REPAIR NULL STATUS
        // -------------------------------------------------

        if (supplier.getStatus() == null) {

            supplier.setStatus(
                    SupplierStatus.ACTIVE
            );

            supplierRepository.save(
                    supplier
            );
        }


        return convertToDTO(
                supplier
        );
    }


    // =====================================================
    // UPDATE SUPPLIER
    // ADMIN ONLY
    // =====================================================

    public SupplierDTO updateSupplier(
            Long id,
            SupplierDTO dto) {

        Supplier supplier =
                supplierRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Supplier not found"
                                        )
                        );


        // -------------------------------------------------
        // CATEGORY
        // -------------------------------------------------

        Category category = null;

        if (dto.getCategoryId() != null) {

            category =
                    categoryRepository
                            .findById(
                                    dto.getCategoryId()
                            )
                            .orElseThrow(
                                    () ->
                                            new RuntimeException(
                                                    "Category not found"
                                            )
                            );
        }


        // -------------------------------------------------
        // BASIC DETAILS
        // -------------------------------------------------

        supplier.setSupplierName(
                dto.getSupplierName()
        );


        supplier.setPhoneNumber(
                dto.getPhoneNumber()
        );


        supplier.setEmail(
                dto.getEmail()
        );


        supplier.setAddress(
                dto.getAddress()
        );


        supplier.setGstNumber(
                dto.getGstNumber()
        );


        // -------------------------------------------------
        // RATING
        // -------------------------------------------------

        supplier.setRating(
                dto.getRating()
        );


        // -------------------------------------------------
        // FEEDBACK
        // -------------------------------------------------

        supplier.setFeedback(
                dto.getFeedback()
        );


        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        supplier.setStatus(
                SupplierStatus.ACTIVE
        );


        // -------------------------------------------------
        // CATEGORY
        // -------------------------------------------------

        supplier.setCategory(
                category
        );


        // -------------------------------------------------
        // UPI
        // -------------------------------------------------

        supplier.setUpiId(
                dto.getUpiId()
        );


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        Supplier updatedSupplier =
                supplierRepository.save(
                        supplier
                );


        return convertToDTO(
                updatedSupplier
        );
    }


    // =====================================================
    // DELETE SUPPLIER
    // ADMIN ONLY
    // =====================================================

    public String deleteSupplier(
            Long id) {

        Supplier supplier =
                supplierRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Supplier not found"
                                        )
                        );


        supplierRepository.delete(
                supplier
        );


        return "Supplier deleted successfully.";
    }


    // =====================================================
    // DTO -> ENTITY
    // =====================================================

    private Supplier convertToEntity(
            SupplierDTO dto) {

        Supplier supplier =
                new Supplier();


        // -------------------------------------------------
        // CATEGORY
        // -------------------------------------------------

        Category category = null;

        if (dto.getCategoryId() != null) {

            category =
                    categoryRepository
                            .findById(
                                    dto.getCategoryId()
                            )
                            .orElseThrow(
                                    () ->
                                            new RuntimeException(
                                                    "Category not found"
                                            )
                            );
        }


        // -------------------------------------------------
        // BASIC DETAILS
        // -------------------------------------------------

        supplier.setSupplierName(
                dto.getSupplierName()
        );


        supplier.setPhoneNumber(
                dto.getPhoneNumber()
        );


        supplier.setEmail(
                dto.getEmail()
        );


        supplier.setAddress(
                dto.getAddress()
        );


        supplier.setGstNumber(
                dto.getGstNumber()
        );


        // -------------------------------------------------
        // RATING
        // -------------------------------------------------

        supplier.setRating(
                dto.getRating()
        );


        // -------------------------------------------------
        // FEEDBACK
        // -------------------------------------------------

        supplier.setFeedback(
                dto.getFeedback()
        );


        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        supplier.setStatus(
                SupplierStatus.ACTIVE
        );


        // -------------------------------------------------
        // CATEGORY
        // -------------------------------------------------

        supplier.setCategory(
                category
        );


        // -------------------------------------------------
        // UPI
        // -------------------------------------------------

        supplier.setUpiId(
                dto.getUpiId()
        );


        // -------------------------------------------------
        // USER
        // -------------------------------------------------
        //
        // Do NOT manually create/link a User here.
        //
        // Business registration will create the User
        // and UserService will create the Supplier and
        // establish the relationship.
        //
        // -------------------------------------------------

        supplier.setUser(
                null
        );


        return supplier;
    }


    // =====================================================
    // ENTITY -> DTO
    // =====================================================

    private SupplierDTO convertToDTO(
            Supplier supplier) {

        SupplierDTO dto =
                new SupplierDTO();


        // -------------------------------------------------
        // SUPPLIER ID
        // -------------------------------------------------

        dto.setSupplierId(
                supplier.getSupplierId()
        );


        // -------------------------------------------------
        // SUPPLIER NAME
        // -------------------------------------------------

        dto.setSupplierName(
                supplier.getSupplierName()
        );


        // -------------------------------------------------
        // PHONE
        // -------------------------------------------------

        dto.setPhoneNumber(
                supplier.getPhoneNumber()
        );


        // -------------------------------------------------
        // EMAIL
        // -------------------------------------------------

        dto.setEmail(
                supplier.getEmail()
        );


        // -------------------------------------------------
        // ADDRESS
        // -------------------------------------------------

        dto.setAddress(
                supplier.getAddress()
        );


        // -------------------------------------------------
        // GST
        // -------------------------------------------------

        dto.setGstNumber(
                supplier.getGstNumber()
        );


        // -------------------------------------------------
        // RATING
        // -------------------------------------------------

        dto.setRating(
                supplier.getRating()
        );


        // -------------------------------------------------
        // FEEDBACK
        // -------------------------------------------------

        dto.setFeedback(
                supplier.getFeedback()
        );


        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        dto.setStatus(
                supplier.getStatus() != null
                        ? supplier.getStatus().name()
                        : SupplierStatus.ACTIVE.name()
        );


        // -------------------------------------------------
        // CATEGORY
        // -------------------------------------------------

        if (supplier.getCategory() != null) {

            dto.setCategoryId(
                    supplier.getCategory()
                            .getCategoryId()
            );


            dto.setCategoryName(
                    supplier.getCategory()
                            .getCategoryName()
            );

        } else {

            dto.setCategoryId(
                    null
            );


            dto.setCategoryName(
                    null
            );
        }


        // -------------------------------------------------
        // USER
        // -------------------------------------------------

        if (supplier.getUser() != null) {

            dto.setUserId(
                    supplier.getUser()
                            .getUserId()
            );

        } else {

            dto.setUserId(
                    null
            );
        }


        // -------------------------------------------------
        // UPI ID
        // -------------------------------------------------

        dto.setUpiId(
                supplier.getUpiId()
        );


        return dto;
    }

}