package com.utp_reporta_backend.dto;

import lombok.Data;

@Data
public class LoginDTO {
	private String usernameOrCorreo;
    private String password;
}
