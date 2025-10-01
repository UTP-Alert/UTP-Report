package com.utp_reporta_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtAuthResponseDTO {

	private String token;
    private String tipoToken = "Bearer";
	
}
