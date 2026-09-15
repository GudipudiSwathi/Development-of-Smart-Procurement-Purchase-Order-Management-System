package com.eps.enterpriseprocurementsystem.config;

import com.eps.enterpriseprocurementsystem.jwt.JwtAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;


@Configuration
@EnableMethodSecurity
public class SecurityConfig {


    // =====================================================
    // JWT AUTHENTICATION FILTER
    // =====================================================

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;


    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // =================================================
                // CSRF
                // =================================================

                .csrf(csrf -> csrf.disable())


                // =================================================
                // CORS
                // =================================================

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )


                // =================================================
                // SESSION MANAGEMENT
                // =================================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // =================================================
                // AUTHORIZATION
                // =================================================

                .authorizeHttpRequests(auth -> auth

                        // -----------------------------------------
                        // LOGIN
                        // -----------------------------------------

                        .requestMatchers(
                                "/users/login"
                        ).permitAll()


                        // -----------------------------------------
                        // REGISTRATION
                        // -----------------------------------------

                        .requestMatchers(
                                "/users/register"
                        ).permitAll()


                        // -----------------------------------------
                        // DEPARTMENT LIST
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/departments"
                        ).permitAll()


                        // -----------------------------------------
                        // DOWNLOAD BY TOKEN
                        // -----------------------------------------

                        .requestMatchers(
                                "/purchase-requests/download-by-token"
                        ).permitAll()


                        // -----------------------------------------
                        // GET ALL USERS
                        // ADMIN ONLY
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/users"
                        ).hasAuthority("ADMIN")


                        // -----------------------------------------
                        // EVERYTHING ELSE
                        // -----------------------------------------

                        .anyRequest().authenticated()
                )


                // =================================================
                // EXCEPTION HANDLING
                // =================================================

                .exceptionHandling(exception -> exception

                        // -----------------------------------------
                        // 401 UNAUTHORIZED
                        // -----------------------------------------

                        .authenticationEntryPoint(
                                (request, response, authException) -> {

                                    System.out.println(
                                            "SECURITY - 401 UNAUTHORIZED"
                                    );

                                    System.out.println(
                                            "REQUEST: "
                                                    + request.getMethod()
                                                    + " "
                                                    + request.getRequestURI()
                                    );

                                    response.setStatus(
                                            HttpServletResponse.SC_UNAUTHORIZED
                                    );

                                    response.setContentType(
                                            "text/plain"
                                    );

                                    response.getWriter().write(
                                            "Unauthorized"
                                    );
                                }
                        )


                        // -----------------------------------------
                        // 403 FORBIDDEN
                        // -----------------------------------------

                        .accessDeniedHandler(
                                (request, response, accessDeniedException) -> {

                                    System.out.println(
                                            "SECURITY - 403 FORBIDDEN"
                                    );

                                    System.out.println(
                                            "REQUEST: "
                                                    + request.getMethod()
                                                    + " "
                                                    + request.getRequestURI()
                                    );

                                    response.setStatus(
                                            HttpServletResponse.SC_FORBIDDEN
                                    );

                                    response.setContentType(
                                            "text/plain"
                                    );

                                    response.getWriter().write(
                                            "Access Denied"
                                    );
                                }
                        )
                );


        // =====================================================
        // ADD JWT FILTER
        // =====================================================

        http.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );


        // =====================================================
        // BUILD SECURITY CONFIGURATION
        // =====================================================

        return http.build();
    }


    // =====================================================
    // CORS CONFIGURATION
    // =====================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();


        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:4200"
                )
        );


        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );


        configuration.setAllowedHeaders(
                List.of("*")
        );


        configuration.setAllowCredentials(
                true
        );


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
                "/**",
                configuration
        );


        return source;
    }


    // =====================================================
    // PASSWORD ENCODER
    // =====================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    // =====================================================
    // AUTHENTICATION MANAGER
    // =====================================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

}