package com.utp_reporta_backend.dto;

import lombok.Data;
//DTO para encapsular los datos de inicio de sesión.
@Data
public class LoginDTO {
	private String usernameOrCorreo;
    private String password;
}