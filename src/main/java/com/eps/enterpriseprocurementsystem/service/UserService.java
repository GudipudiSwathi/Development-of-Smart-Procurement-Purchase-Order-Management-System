package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.JwtResponseDTO;
import com.eps.enterpriseprocurementsystem.dto.LoginDTO;
import com.eps.enterpriseprocurementsystem.dto.UserDTO;
import com.eps.enterpriseprocurementsystem.entity.Department;
import com.eps.enterpriseprocurementsystem.entity.User;
import com.eps.enterpriseprocurementsystem.exception.InvalidCredentialsException;
import com.eps.enterpriseprocurementsystem.exception.UserAlreadyExistsException;
import com.eps.enterpriseprocurementsystem.jwt.JwtService;
import com.eps.enterpriseprocurementsystem.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.eps.enterpriseprocurementsystem.entity.Supplier;
import com.eps.enterpriseprocurementsystem.enums.SupplierStatus;
import com.eps.enterpriseprocurementsystem.repository.SupplierRepository;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    // =====================================================
    // REPOSITORY
    // =====================================================

    @Autowired
    private UserRepository userRepository;


    // =====================================================
    // PASSWORD ENCODER
    // =====================================================

    @Autowired
    private PasswordEncoder passwordEncoder;


    // =====================================================
    // JWT SERVICE
    // =====================================================

    @Autowired
    private JwtService jwtService;


    // =====================================================
    // DEPARTMENT SERVICE
    // =====================================================

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private SupplierRepository supplierRepository;


    // =====================================================
    // PUBLIC REGISTER USER
    // =====================================================

    // =====================================================
// PUBLIC REGISTER USER
// =====================================================

    public UserDTO registerUser(UserDTO dto) {

        // -------------------------------------------------
        // NORMALIZE ROLE
        // -------------------------------------------------

        String role =
                dto.getRole() == null
                        ? ""
                        : dto.getRole()
                        .trim()
                        .toUpperCase();


        // -------------------------------------------------
        // PUBLIC REGISTRATION
        // -------------------------------------------------

        if (!"EMPLOYEE".equals(role)
                && !"SUPPLIER".equals(role)) {

            throw new IllegalArgumentException(
                    "Registration is allowed only for Employee or Business accounts."
            );
        }


        // -------------------------------------------------
        // USERNAME
        // -------------------------------------------------

        String username =
                dto.getUsername()
                        .trim();


        if (userRepository
                .findByUsername(username)
                .isPresent()) {

            throw new UserAlreadyExistsException(
                    "Username already exists."
            );
        }


        // -------------------------------------------------
        // EMAIL
        // -------------------------------------------------

        String email =
                dto.getEmail() == null
                        ? null
                        : dto.getEmail()
                        .trim();


        if (email != null
                && !email.isEmpty()
                && userRepository
                .findByEmail(email)
                .isPresent()) {

            throw new UserAlreadyExistsException(
                    "Email already exists."
            );
        }


        // -------------------------------------------------
        // EMPLOYEE DEPARTMENT
        // -------------------------------------------------

        if ("EMPLOYEE".equals(role)) {

            if (dto.getDepartmentId() == null) {

                throw new IllegalArgumentException(
                        "Department is required for Employee registration."
                );
            }
        }


        // -------------------------------------------------
        // BUSINESS DOES NOT USE DEPARTMENT
        // -------------------------------------------------

        if ("SUPPLIER".equals(role)) {

            dto.setDepartmentId(null);

        }


        // -------------------------------------------------
        // CREATE USER
        // -------------------------------------------------

        User user =
                convertToEntity(dto);


        user.setUsername(
                username
        );

        user.setEmail(
                email
        );

        user.setRole(
                role
        );


        // -------------------------------------------------
        // SAVE USER
        // -------------------------------------------------

        User savedUser =
                userRepository.save(user);


        // =================================================
        // CREATE SUPPLIER FOR BUSINESS ACCOUNT
        // =================================================

        if ("SUPPLIER".equals(role)) {

            createSupplierForBusiness(
                    savedUser
            );
        }


        // -------------------------------------------------
        // RETURN
        // -------------------------------------------------

        return convertToDTO(
                savedUser
        );
    }

    // =====================================================
// CREATE SUPPLIER FOR BUSINESS USER
// =====================================================

    private Supplier createSupplierForBusiness(
            User user) {

        // -------------------------------------------------
        // SAFETY CHECK
        // -------------------------------------------------

        if (user == null) {

            throw new RuntimeException(
                    "Cannot create supplier for null user."
            );
        }


        // -------------------------------------------------
        // CHECK WHETHER SUPPLIER ALREADY EXISTS
        // -------------------------------------------------

        if (supplierRepository
                .findByUserUserId(
                        user.getUserId()
                )
                .isPresent()) {

            return supplierRepository
                    .findByUserUserId(
                            user.getUserId()
                    )
                    .get();
        }


        // -------------------------------------------------
        // CREATE SUPPLIER
        // -------------------------------------------------

        Supplier supplier =
                new Supplier();


        // -------------------------------------------------
        // BUSINESS NAME
        // -------------------------------------------------
        //
        // For now username is used as business name.
        //
        // Example:
        // username = SAP Technologies
        //
        // supplierName = SAP Technologies
        //
        // Later we can add a separate Business Name
        // field to registration.
        //
        // -------------------------------------------------

        supplier.setSupplierName(
                user.getUsername()
        );


        // -------------------------------------------------
        // CONTACT
        // -------------------------------------------------

        supplier.setPhoneNumber(
                user.getPhoneNumber()
        );


        supplier.setEmail(
                user.getEmail()
        );


        // -------------------------------------------------
        // DEFAULT VALUES
        // -------------------------------------------------

        supplier.setAddress(null);

        supplier.setGstNumber(null);

        supplier.setRating(null);

        supplier.setFeedback(null);


        // -------------------------------------------------
        // SUPPLIER STATUS
        // -------------------------------------------------

        supplier.setStatus(
                SupplierStatus.ACTIVE
        );


        // -------------------------------------------------
        // CATEGORY
        // -------------------------------------------------
        //
        // Business can select/configure its category later.
        //
        // -------------------------------------------------

        supplier.setCategory(null);


        // -------------------------------------------------
        // UPI
        // -------------------------------------------------
        //
        // Business can add this later from Supplier Profile.
        //
        // -------------------------------------------------

        supplier.setUpiId(null);


        // -------------------------------------------------
        // LINK USER
        // -------------------------------------------------

        supplier.setUser(
                user
        );


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        return supplierRepository.save(
                supplier
        );
    }

    // =====================================================
// GET SUPPLIER BY USER ID
// =====================================================

    public Supplier getSupplierEntityByUserId(
            Long userId) {

        return supplierRepository
                .findByUserUserId(userId)
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Supplier account not found for this user."
                                )
                );
    }
    // =====================================================
    // LOGIN USER
    // =====================================================

    public JwtResponseDTO loginUser(
            LoginDTO dto) {

        // -------------------------------------------------
        // DIAGNOSTIC TIMING
        // -------------------------------------------------
        long lookupStart = System.nanoTime();

        User user =
                userRepository
                        .findByUsername(
                                dto.getUsername()
                        )
                        .orElseThrow(
                                () -> {
                                    long lookupTimeMs =
                                            (System.nanoTime() - lookupStart) / 1_000_000;

                                    System.out.println(
                                            "[LOGIN TIMING] Username lookup: "
                                                    + lookupTimeMs
                                                    + " ms | username not found"
                                    );

                                    return new InvalidCredentialsException(
                                            "Invalid Username"
                                    );
                                }
                        );

        long lookupTimeMs =
                (System.nanoTime() - lookupStart) / 1_000_000;

        System.out.println(
                "[LOGIN TIMING] Username lookup: "
                        + lookupTimeMs
                        + " ms | username found"
        );

        // -------------------------------------------------
        // CHECK PASSWORD
        // -------------------------------------------------
        long passwordStart = System.nanoTime();

        boolean passwordMatches =
                passwordEncoder.matches(
                        dto.getPassword(),
                        user.getPassword()
                );

        long passwordTimeMs =
                (System.nanoTime() - passwordStart) / 1_000_000;

        System.out.println(
                "[LOGIN TIMING] Password verification: "
                        + passwordTimeMs
                        + " ms"
        );

        if (!passwordMatches) {
            throw new InvalidCredentialsException(
                    "Invalid Password"
            );
        }

        // -------------------------------------------------
        // NORMALIZE ROLE
        // -------------------------------------------------
        String role =
                user.getRole() == null
                        ? ""
                        : user.getRole()
                        .trim()
                        .toUpperCase();

        // -------------------------------------------------
        // GENERATE JWT
        // -------------------------------------------------
        String token =
                jwtService.generateToken(
                        user.getUsername(),
                        role
                );

        // -------------------------------------------------
        // RETURN LOGIN RESPONSE
        // -------------------------------------------------
        return new JwtResponseDTO(
                token,
                user.getUserId(),
                user.getUsername(),
                role
        );
    }

    // =====================================================
    // GET CURRENT LOGGED-IN USER
    // =====================================================

    public UserDTO getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {

            throw new RuntimeException(
                    "User is not authenticated."
            );
        }


        String username =
                authentication.getName();


        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Logged-in user not found."
                                        )
                        );


        return convertToDTO(user);
    }


    // =====================================================
    // UPDATE CURRENT LOGGED-IN USER
    // =====================================================

    public UserDTO updateCurrentUser(UserDTO dto) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {

            throw new RuntimeException(
                    "User is not authenticated."
            );
        }


        String currentUsername =
                authentication.getName();


        // -------------------------------------------------
        // FIND CURRENT USER
        // -------------------------------------------------

        User existingUser =
                userRepository
                        .findByUsername(currentUsername)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Logged-in user not found."
                                        )
                        );


        Long currentUserId =
                existingUser.getUserId();


        // =================================================
        // USERNAME
        // =================================================

        if (dto.getUsername() != null
                && !dto.getUsername()
                .trim()
                .isEmpty()) {

            String newUsername =
                    dto.getUsername()
                            .trim();


            boolean usernameTaken =
                    userRepository
                            .findByUsername(newUsername)
                            .filter(
                                    user ->
                                            !user.getUserId()
                                                    .equals(currentUserId)
                            )
                            .isPresent();


            if (usernameTaken) {

                throw new UserAlreadyExistsException(
                        "Username already exists."
                );
            }


            existingUser.setUsername(
                    newUsername
            );
        }


        // =================================================
        // EMAIL
        // =================================================

        if (dto.getEmail() != null
                && !dto.getEmail()
                .trim()
                .isEmpty()) {

            String newEmail =
                    dto.getEmail()
                            .trim();


            boolean emailTaken =
                    userRepository
                            .findByEmail(newEmail)
                            .filter(
                                    user ->
                                            !user.getUserId()
                                                    .equals(currentUserId)
                            )
                            .isPresent();


            if (emailTaken) {

                throw new UserAlreadyExistsException(
                        "Email already exists."
                );
            }


            existingUser.setEmail(
                    newEmail
            );
        }


        // =================================================
        // PHONE NUMBER
        // =================================================

        if (dto.getPhoneNumber() != null
                && !dto.getPhoneNumber()
                .trim()
                .isEmpty()) {

            existingUser.setPhoneNumber(
                    dto.getPhoneNumber()
                            .trim()
            );
        }


        // =================================================
        // DESIGNATION
        // =================================================

        if (dto.getDesignation() != null
                && !dto.getDesignation()
                .trim()
                .isEmpty()) {

            existingUser.setDesignation(
                    dto.getDesignation()
                            .trim()
            );
        }


        // =================================================
        // PASSWORD
        // =================================================

        if (dto.getPassword() != null
                && !dto.getPassword()
                .trim()
                .isEmpty()) {

            existingUser.setPassword(
                    passwordEncoder.encode(
                            dto.getPassword()
                    )
            );
        }


        // =================================================
        // SECURITY
        // =================================================
        //
        // Logged-in users cannot change:
        //
        // - Role
        // - Department
        //
        // These remain controlled by ADMIN.
        //
        // =================================================


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        User updatedUser =
                userRepository.save(
                        existingUser
                );


        // -------------------------------------------------
        // RETURN
        // -------------------------------------------------

        return convertToDTO(
                updatedUser
        );
    }


    // =====================================================
    // GET ALL USERS
    // =====================================================

    public List<UserDTO> getAllUsers() {

        List<User> users =
                userRepository.findAll();


        List<UserDTO> userDTOs =
                new ArrayList<>();


        for (User user : users) {

            userDTOs.add(
                    convertToDTO(user)
            );
        }


        return userDTOs;
    }


    // =====================================================
    // GET USER BY ID
    // =====================================================

    public UserDTO getUserById(
            Long id) {

        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found with ID: "
                                                        + id
                                        )
                        );


        return convertToDTO(user);
    }


    // =====================================================
    // UPDATE USER
    // ADMIN ONLY
    // =====================================================

    public UserDTO updateUser(
            Long id,
            UserDTO dto) {

        // -------------------------------------------------
        // FIND USER
        // -------------------------------------------------

        User existingUser =
                userRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found with ID: "
                                                        + id
                                        )
                        );


        // =================================================
        // USERNAME
        // =================================================

        if (dto.getUsername() != null
                && !dto.getUsername()
                .trim()
                .isEmpty()) {

            String newUsername =
                    dto.getUsername()
                            .trim();


            boolean usernameTaken =
                    userRepository
                            .findByUsername(newUsername)
                            .filter(
                                    user ->
                                            !user.getUserId()
                                                    .equals(id)
                            )
                            .isPresent();


            if (usernameTaken) {

                throw new UserAlreadyExistsException(
                        "Username already exists."
                );
            }


            existingUser.setUsername(
                    newUsername
            );
        }


        // =================================================
        // EMAIL
        // =================================================

        if (dto.getEmail() != null
                && !dto.getEmail()
                .trim()
                .isEmpty()) {

            String newEmail =
                    dto.getEmail()
                            .trim();


            boolean emailTaken =
                    userRepository
                            .findByEmail(newEmail)
                            .filter(
                                    user ->
                                            !user.getUserId()
                                                    .equals(id)
                            )
                            .isPresent();


            if (emailTaken) {

                throw new UserAlreadyExistsException(
                        "Email already exists."
                );
            }


            existingUser.setEmail(
                    newEmail
            );
        }


        // =================================================
        // PHONE
        // =================================================

        if (dto.getPhoneNumber() != null
                && !dto.getPhoneNumber()
                .trim()
                .isEmpty()) {

            existingUser.setPhoneNumber(
                    dto.getPhoneNumber()
                            .trim()
            );
        }


        // =================================================
        // DESIGNATION
        // =================================================

        if (dto.getDesignation() != null
                && !dto.getDesignation()
                .trim()
                .isEmpty()) {

            existingUser.setDesignation(
                    dto.getDesignation()
                            .trim()
            );
        }


        // =================================================
        // ROLE
        // ADMIN ONLY
        // =================================================

        if (dto.getRole() != null
                && !dto.getRole()
                .trim()
                .isEmpty()) {

            String newRole =
                    dto.getRole()
                            .trim()
                            .toUpperCase();


            // -------------------------------------------------
            // VALID ROLES
            // -------------------------------------------------

            if (!"ADMIN".equals(newRole)
                    && !"EMPLOYEE".equals(newRole)
                    && !"SUPPLIER".equals(newRole)) {

                throw new IllegalArgumentException(
                        "Role must be ADMIN, EMPLOYEE or SUPPLIER."
                );
            }


            // -------------------------------------------------
            // ONLY ONE ADMIN
            // -------------------------------------------------

            if ("ADMIN".equals(newRole)
                    && !"ADMIN".equalsIgnoreCase(
                    existingUser.getRole()
            )) {

                boolean adminExists =
                        userRepository
                                .findByRole("ADMIN")
                                .stream()
                                .anyMatch(
                                        user ->
                                                !user.getUserId()
                                                        .equals(id)
                                );


                if (adminExists) {

                    throw new UserAlreadyExistsException(
                            "Only one ADMIN can exist."
                    );
                }
            }


            existingUser.setRole(
                    newRole
            );


            // -------------------------------------------------
            // SUPPLIER DOES NOT NEED DEPARTMENT
            // -------------------------------------------------

            if ("SUPPLIER".equals(newRole)) {

                existingUser.setDepartment(null);

            }

        }


        // =================================================
        // DEPARTMENT
        // =================================================

        if (dto.getDepartmentId() != null) {

            Department department =
                    departmentService
                            .getDepartmentEntityById(
                                    dto.getDepartmentId()
                            );


            existingUser.setDepartment(
                    department
            );
        }


        // =================================================
        // PASSWORD
        // =================================================

        if (dto.getPassword() != null
                && !dto.getPassword()
                .trim()
                .isEmpty()) {

            existingUser.setPassword(
                    passwordEncoder.encode(
                            dto.getPassword()
                    )
            );
        }


        // =================================================
        // SAVE
        // =================================================

        User updatedUser =
                userRepository.save(
                        existingUser
                );


        return convertToDTO(
                updatedUser
        );
    }


    // =====================================================
    // DELETE USER
    // =====================================================

    public void deleteUser(
            Long id) {

        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found with ID: "
                                                        + id
                                        )
                        );


        // -------------------------------------------------
        // PREVENT DELETING ONLY ADMIN
        // -------------------------------------------------

        if ("ADMIN".equalsIgnoreCase(
                user.getRole()
        )) {

            long adminCount =
                    userRepository
                            .findByRole("ADMIN")
                            .size();


            if (adminCount <= 1) {

                throw new RuntimeException(
                        "The only ADMIN cannot be deleted."
                );
            }
        }


        // -------------------------------------------------
        // DELETE
        // -------------------------------------------------

        userRepository.deleteById(id);
    }


    // =====================================================
    // GET USER ENTITY BY ID
    // =====================================================

    public User getUserEntityById(
            Long id) {

        return userRepository
                .findById(id)
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "User not found"
                                )
                );
    }


    // =====================================================
    // GET USER ENTITY BY USERNAME
    // =====================================================

    public User getUserEntityByUsername(
            String username) {

        return userRepository
                .findByUsername(username)
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "User not found"
                                )
                );
    }


    // =====================================================
    // GET ALL ADMINS
    // =====================================================

    public List<User> getAllAdmins() {

        return userRepository
                .findAllByRole("ADMIN");
    }


    // =====================================================
    // DTO -> ENTITY
    // =====================================================

    private User convertToEntity(
            UserDTO dto) {

        User user =
                new User();


        // -------------------------------------------------
        // DEPARTMENT
        // -------------------------------------------------

        if (dto.getDepartmentId() != null) {

            Department department =
                    departmentService
                            .getDepartmentEntityById(
                                    dto.getDepartmentId()
                            );


            user.setDepartment(
                    department
            );
        }


        // -------------------------------------------------
        // USER INFORMATION
        // -------------------------------------------------

        user.setUserId(
                dto.getUserId()
        );


        user.setUsername(
                dto.getUsername()
        );


        user.setEmail(
                dto.getEmail()
        );


        // -------------------------------------------------
        // PASSWORD
        // -------------------------------------------------

        if (dto.getPassword() != null) {

            user.setPassword(
                    passwordEncoder.encode(
                            dto.getPassword()
                    )
            );
        }


        user.setPhoneNumber(
                dto.getPhoneNumber()
        );


        user.setDesignation(
                dto.getDesignation()
        );


        // -------------------------------------------------
        // ROLE
        // -------------------------------------------------

        user.setRole(
                dto.getRole() == null
                        ? null
                        : dto.getRole()
                        .trim()
                        .toUpperCase()
        );


        return user;
    }


    // =====================================================
    // ENTITY -> DTO
    // =====================================================

    private UserDTO convertToDTO(
            User user) {

        UserDTO dto =
                new UserDTO();


        // -------------------------------------------------
        // BASIC INFORMATION
        // -------------------------------------------------

        dto.setUserId(
                user.getUserId()
        );


        dto.setUsername(
                user.getUsername()
        );


        dto.setEmail(
                user.getEmail()
        );


        dto.setPhoneNumber(
                user.getPhoneNumber()
        );


        dto.setDesignation(
                user.getDesignation()
        );


        dto.setRole(
                user.getRole() == null
                        ? null
                        : user.getRole()
                        .trim()
                        .toUpperCase()
        );


        // -------------------------------------------------
        // DEPARTMENT
        // -------------------------------------------------

        if (user.getDepartment() != null) {

            dto.setDepartmentId(
                    user.getDepartment()
                            .getDepartmentId()
            );

            dto.setDepartmentName(
                    user.getDepartment()
                            .getDepartmentName()
            );

        } else {

            dto.setDepartmentId(null);

            dto.setDepartmentName(null);
        }


        // -------------------------------------------------
        // PASSWORD
        // -------------------------------------------------
        //
        // Never return password.
        //
        // -------------------------------------------------

        return dto;
    }

}