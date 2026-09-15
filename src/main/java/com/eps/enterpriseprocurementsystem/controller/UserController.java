package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.JwtResponseDTO;
import com.eps.enterpriseprocurementsystem.dto.LoginDTO;
import com.eps.enterpriseprocurementsystem.dto.UserDTO;
import com.eps.enterpriseprocurementsystem.service.UserService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/users")
public class UserController {


    @Autowired
    private UserService userService;


    // =====================================================
    // PUBLIC REGISTRATION
    // =====================================================

    @PostMapping("/register")
    public UserDTO registerUser(
            @Valid @RequestBody UserDTO dto) {

        return userService.registerUser(dto);
    }


    // =====================================================
    // PUBLIC LOGIN
    // =====================================================

    @PostMapping("/login")
    public JwtResponseDTO loginUser(
            @Valid @RequestBody LoginDTO dto) {

        return userService.loginUser(dto);
    }


    // =====================================================
    // GET CURRENT USER
    // EMPLOYEE / SUPPLIER / ADMIN
    // =====================================================

    @PreAuthorize(
            "hasAnyAuthority('ADMIN', 'EMPLOYEE', 'SUPPLIER')"
    )
    @GetMapping("/me")
    public UserDTO getCurrentUser() {

        return userService.getCurrentUser();
    }


    // =====================================================
    // UPDATE CURRENT USER
    // EMPLOYEE / SUPPLIER / ADMIN
    // =====================================================

    @PreAuthorize(
            "hasAnyAuthority('ADMIN', 'EMPLOYEE', 'SUPPLIER')"
    )
    @PutMapping("/me")
    public UserDTO updateCurrentUser(
            @Valid @RequestBody UserDTO dto) {

        return userService.updateCurrentUser(dto);
    }


    // =====================================================
    // GET ALL USERS
    // ADMIN ONLY
    // =====================================================

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public List<UserDTO> getAllUsers() {

        return userService.getAllUsers();
    }


    // =====================================================
    // GET USER BY ID
    // ADMIN ONLY
    // =====================================================

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/{id}")
    public UserDTO getUserById(
            @PathVariable Long id) {

        return userService.getUserById(id);
    }


    // =====================================================
    // UPDATE USER
    // ADMIN ONLY
    // =====================================================

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public UserDTO updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserDTO dto) {

        return userService.updateUser(
                id,
                dto
        );
    }


    // =====================================================
    // DELETE USER
    // ADMIN ONLY
    // =====================================================

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body("User deleted successfully.");
    }

}