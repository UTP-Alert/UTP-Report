package com.utp_reporta_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SedeDTO {
	private Long id;

    @NotBlank(message = "El nombre de la sede es obligatorio")
    private String nombre;
}
