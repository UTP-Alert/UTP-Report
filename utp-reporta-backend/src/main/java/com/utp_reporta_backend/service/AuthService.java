package com.utp_reporta_backend.service;

import com.utp_reporta_backend.dto.LoginDTO;
import com.utp_reporta_backend.dto.RegistroDTO;

public interface AuthService {
	 String login(LoginDTO loginDTO);
	 String registrar(RegistroDTO registroDTO);
}
