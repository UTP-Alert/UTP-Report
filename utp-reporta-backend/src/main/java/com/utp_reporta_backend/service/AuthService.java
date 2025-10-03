package com.utp_reporta_backend.service;

import com.utp_reporta_backend.dto.LoginDTO;
import com.utp_reporta_backend.dto.RegistroAdminDTO;
import com.utp_reporta_backend.dto.RegistroSeguridadDTO;
import com.utp_reporta_backend.dto.RegistroUsuarioDTO;

public interface AuthService {
	 String login(LoginDTO loginDTO);
	 String registrarUsuario(RegistroUsuarioDTO registroUsuarioDTO);
	 String registrarAdmin(RegistroAdminDTO registroAdminDTO);
	 String registrarSeguridad(RegistroSeguridadDTO registroSeguridadDTO);

}
