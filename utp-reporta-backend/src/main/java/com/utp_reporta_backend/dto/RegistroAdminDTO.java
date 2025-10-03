package com.utp_reporta_backend.dto;


import lombok.Data;
@Data
public class RegistroAdminDTO {
	
	private String nombreCompleto;
	private String username;
    private String correo;
    private String password;
    private String telefono;
    private Long sedeId; 	
	

}
