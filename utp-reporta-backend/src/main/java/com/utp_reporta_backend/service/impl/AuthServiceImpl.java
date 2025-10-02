package com.utp_reporta_backend.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.utp_reporta_backend.config.JwtTokenProvider;
import com.utp_reporta_backend.dto.LoginDTO;
import com.utp_reporta_backend.dto.RegistroDTO;
import com.utp_reporta_backend.enums.ERol;
import com.utp_reporta_backend.model.Rol;
import com.utp_reporta_backend.model.Usuario;
import com.utp_reporta_backend.repository.RolRepository;
import com.utp_reporta_backend.repository.UsuarioRepository;
import com.utp_reporta_backend.service.AuthService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
	private final AuthenticationManager authenticationManager;
	private final UsuarioRepository usuarioRepository;
	private final RolRepository rolRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenProvider jwtTokenProvider;

	@Override
	public String login(LoginDTO loginDTO) {

		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(loginDTO.getUsernameOrCorreo(), loginDTO.getPassword()));
		SecurityContextHolder.getContext().setAuthentication(authentication);

		return jwtTokenProvider.generateToken((UserDetails) authentication.getPrincipal());
	}

	@Override
	public String registrar(RegistroDTO registroDTO) {
		if (usuarioRepository.existsByUsername(registroDTO.getUsername())) {
			throw new RuntimeException("El nombre de usuario ya existe");
		}
		if (usuarioRepository.existsByCorreo(registroDTO.getCorreo())) {
			throw new RuntimeException("El email ya está en uso");
		}
		Usuario usuario = new Usuario();
		usuario.setUsername(registroDTO.getUsername());
		usuario.setCorreo(registroDTO.getCorreo());
		usuario.setPassword(passwordEncoder.encode(registroDTO.getPassword()));
		Rol rol = rolRepository.findByNombre(ERol.ROLE_USUARIO)
				.orElseThrow(() -> new RuntimeException("Rol no encontrado"));
		usuario.setTipoUsuario(registroDTO.getTipoUsuario());
		usuario.getRoles().add(rol);
		usuarioRepository.save(usuario);

		return "Usuario registrado exitosamente";

	}

}
