package com.utp_reporta_backend.dto;

import java.util.Set;

import lombok.Data;
@Data
public class RegistroSeguridadDTO {
	  private String nombreCompleto;
	    private String username;
	    private String password;
	    private String correo;
	    private String telefono;
	    private Long sedeId; // Suponiendo que también necesitas asociar la sede
	    private Set<Long> zonaIds; // Aquí vienen los IDs de las zonas seleccionadas
}
