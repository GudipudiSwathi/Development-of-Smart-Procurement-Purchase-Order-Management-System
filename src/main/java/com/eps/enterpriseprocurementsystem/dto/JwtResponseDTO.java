package com.eps.enterpriseprocurementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponseDTO {

    private String token;

    private Long userId;

    private String username;

    private String role;
}