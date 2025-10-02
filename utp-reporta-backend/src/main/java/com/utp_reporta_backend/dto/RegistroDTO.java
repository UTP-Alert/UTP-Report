package com.utp_reporta_backend.dto;

import com.utp_reporta_backend.enums.TipoUsuario;

import lombok.Data;

@Data
public class RegistroDTO {
	private String username;
    private String correo;
    private String password;
    private TipoUsuario tipoUsuario;
}
