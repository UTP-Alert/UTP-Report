package com.utp_reporta_backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
//DTO para encapsular la respuesta de autenticación JWT.
@Data
@AllArgsConstructor
@NoArgsConstructor
//DTO para encapsular la respuesta de autenticación JWT.
public class JwtAuthResponseDTO {
	private String token;
    private String tipoToken = "Bearer";
	private List<String> roles;
}