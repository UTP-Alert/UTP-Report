package com.utp_reporta_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
//DTO para encapsular los datos de una sede.
@Data
public class SedeDTO {
	private Long id;//Identificador único de la sede.

    @NotBlank(message = "El nombre de la sede es obligatorio")//Validación para asegurar que el nombre no esté en blanco.
    private String nombre;//Nombre de la sede.
}
