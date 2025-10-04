package com.utp_reporta_backend.dto;

import com.utp_reporta_backend.enums.TipoUsuario;

import lombok.Data;
//DTO para encapsular los datos necesarios para registrar un usuario.
@Data
public class RegistroUsuarioDTO {
	private String nombreCompleto;
	private String username;
    private String correo;
    private String password;
    private String telefono;
    private TipoUsuario tipoUsuario;
    private Long sedeId;     
}
