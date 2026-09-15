package com.eps.enterpriseprocurementsystem.jwt;

import com.eps.enterpriseprocurementsystem.service.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;


@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {


    @Autowired
    private JwtService jwtService;


    @Autowired
    private CustomUserDetailsService userDetailsService;



    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {


        // =====================================================
        // REQUEST INFORMATION
        // =====================================================

        System.out.println(
                "================================================="
        );

        System.out.println(
                "JWT FILTER - REQUEST: "
                        + request.getMethod()
                        + " "
                        + request.getRequestURI()
        );


        // =====================================================
        // GET AUTHORIZATION HEADER
        // =====================================================

        String authHeader =
                request.getHeader("Authorization");


        System.out.println(
                "JWT FILTER - AUTH HEADER: "
                        + (
                        authHeader != null
                                ? "PRESENT"
                                : "MISSING"
                )
        );


        // =====================================================
        // NO JWT
        // =====================================================

        if (
                authHeader == null ||
                        !authHeader.startsWith("Bearer ")
        ) {


            System.out.println(
                    "JWT FILTER - NO BEARER TOKEN"
            );


            filterChain.doFilter(
                    request,
                    response
            );


            return;
        }



        // =====================================================
        // EXTRACT TOKEN
        // =====================================================

        String token =
                authHeader.substring(7);


        if (token.isBlank()) {

            System.out.println(
                    "JWT FILTER - EMPTY TOKEN"
            );


            filterChain.doFilter(
                    request,
                    response
            );


            return;
        }


        System.out.println(
                "JWT FILTER - BEARER TOKEN FOUND"
        );



        // =====================================================
        // VALIDATE TOKEN
        // =====================================================

        if (!jwtService.validateToken(token)) {


            System.out.println(
                    "JWT FILTER - TOKEN VALIDATION FAILED"
            );


            filterChain.doFilter(
                    request,
                    response
            );


            return;
        }


        System.out.println(
                "JWT FILTER - TOKEN VALIDATED SUCCESSFULLY"
        );



        // =====================================================
        // EXTRACT USERNAME
        // =====================================================

        String username;


        try {


            username =
                    jwtService.extractUsername(
                            token
                    );


        } catch (Exception e) {


            System.out.println(
                    "JWT FILTER - USERNAME EXTRACTION FAILED"
            );


            System.out.println(
                    "JWT ERROR: "
                            + e.getClass()
                            .getSimpleName()
                            + " - "
                            + e.getMessage()
            );


            filterChain.doFilter(
                    request,
                    response
            );


            return;
        }



        System.out.println(
                "JWT FILTER - USERNAME: "
                        + username
        );



        // =====================================================
        // CHECK EXISTING AUTHENTICATION
        // =====================================================

        if (
                username != null &&
                        SecurityContextHolder
                                .getContext()
                                .getAuthentication() == null
        ) {


            // =================================================
            // LOAD USER FROM DATABASE
            // =================================================

            UserDetails userDetails;


            try {


                userDetails =
                        userDetailsService
                                .loadUserByUsername(
                                        username
                                );


            } catch (Exception e) {


                System.out.println(
                        "JWT FILTER - USER LOAD FAILED"
                );


                System.out.println(
                        "JWT ERROR: "
                                + e.getClass()
                                .getSimpleName()
                                + " - "
                                + e.getMessage()
                );


                filterChain.doFilter(
                        request,
                        response
                );


                return;
            }



            // =================================================
            // USER FOUND
            // =================================================

            System.out.println(
                    "JWT FILTER - USER FOUND: "
                            + userDetails.getUsername()
            );


            System.out.println(
                    "JWT FILTER - AUTHORITIES: "
                            + userDetails.getAuthorities()
            );



            // =================================================
            // CREATE AUTHENTICATION
            // =================================================

            UsernamePasswordAuthenticationToken authentication =

                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );



            // =================================================
            // REQUEST DETAILS
            // =================================================

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );



            // =================================================
            // SET SECURITY CONTEXT
            // =================================================

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(
                            authentication
                    );


            System.out.println(
                    "JWT FILTER - AUTHENTICATION SET"
            );


            System.out.println(
                    "JWT FILTER - ROLE: "
                            + userDetails
                            .getAuthorities()
            );

        }



        // =====================================================
        // CONTINUE REQUEST
        // =====================================================

        filterChain.doFilter(
                request,
                response
        );


        System.out.println(
                "JWT FILTER - REQUEST COMPLETED"
        );

        System.out.println(
                "================================================="
        );
    }

}