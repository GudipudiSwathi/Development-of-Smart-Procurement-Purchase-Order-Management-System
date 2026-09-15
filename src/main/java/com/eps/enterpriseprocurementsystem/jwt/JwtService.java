package com.eps.enterpriseprocurementsystem.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    // =====================================================
    // JWT CONFIGURATION
    // =====================================================

    private static final String SECRET_KEY =
            "EnterpriseProcurementSystemJWTSecretKey123456789";

    private static final long EXPIRATION_TIME =
            1000 * 60 * 60; // 1 hour


    // =====================================================
    // SIGNING KEY
    // =====================================================

    private SecretKey getSigningKey() {

        return Keys.hmacShaKeyFor(
                SECRET_KEY.getBytes(StandardCharsets.UTF_8)
        );
    }


    // =====================================================
    // GENERATE LOGIN JWT TOKEN
    // =====================================================

    public String generateToken(
            String username,
            String role) {

        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + EXPIRATION_TIME
                        )
                )
                .signWith(getSigningKey())
                .compact();
    }


    // =====================================================
    // EXTRACT USERNAME
    // =====================================================

    public String extractUsername(String token) {

        Claims claims =
                Jwts.parser()
                        .verifyWith(getSigningKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

        return claims.getSubject();
    }


    // =====================================================
    // EXTRACT ROLE
    // =====================================================

    public String extractRole(String token) {

        Claims claims =
                Jwts.parser()
                        .verifyWith(getSigningKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

        return claims.get("role", String.class);
    }


    // =====================================================
    // VALIDATE LOGIN JWT TOKEN
    // =====================================================

    public boolean validateToken(String token) {

        try {

            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);

            System.out.println(
                    "JWT VALIDATION: SUCCESS"
            );

            return true;

        } catch (Exception e) {

            System.out.println(
                    "JWT VALIDATION: FAILED"
            );

            System.out.println(
                    "JWT ERROR: "
                            + e.getClass().getSimpleName()
                            + " - "
                            + e.getMessage()
            );

            return false;
        }
    }


    // =====================================================
    // GENERATE DOWNLOAD TOKEN
    // =====================================================

    public String generateDownloadToken(Long userId) {

        long downloadExpiration =
                1000 * 60 * 15; // 15 minutes

        return Jwts.builder()
                .claim("userId", userId)
                .claim(
                        "type",
                        "PURCHASE_REQUEST_DOWNLOAD"
                )
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + downloadExpiration
                        )
                )
                .signWith(getSigningKey())
                .compact();
    }


    // =====================================================
    // EXTRACT USER ID FROM DOWNLOAD TOKEN
    // =====================================================

    public Long extractUserIdFromDownloadToken(
            String token) {

        Claims claims =
                Jwts.parser()
                        .verifyWith(getSigningKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

        return claims.get("userId", Long.class);
    }


    // =====================================================
    // VALIDATE DOWNLOAD TOKEN
    // =====================================================

    public boolean validateDownloadToken(
            String token) {

        try {

            Claims claims =
                    Jwts.parser()
                            .verifyWith(getSigningKey())
                            .build()
                            .parseSignedClaims(token)
                            .getPayload();

            String type =
                    claims.get("type", String.class);

            return "PURCHASE_REQUEST_DOWNLOAD"
                    .equals(type);

        } catch (Exception e) {

            return false;
        }
    }
}