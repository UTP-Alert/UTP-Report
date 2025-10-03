package com.utp_reporta_backend.service.impl;

import java.util.HashSet;
import java.util.Set;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.utp_reporta_backend.config.JwtTokenProvider;
import com.utp_reporta_backend.dto.LoginDTO;
import com.utp_reporta_backend.dto.RegistroAdminDTO;
import com.utp_reporta_backend.dto.RegistroSeguridadDTO;
import com.utp_reporta_backend.dto.RegistroUsuarioDTO;
import com.utp_reporta_backend.enums.ERol;
import com.utp_reporta_backend.model.Rol;
import com.utp_reporta_backend.model.Sede;
import com.utp_reporta_backend.model.Usuario;
import com.utp_reporta_backend.model.Zona;
import com.utp_reporta_backend.repository.RolRepository;
import com.utp_reporta_backend.repository.SedeRepository;
import com.utp_reporta_backend.repository.UsuarioRepository;
import com.utp_reporta_backend.repository.ZonaRepository;
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
	private final ZonaRepository zonaRepository;
	private final SedeRepository sedeRepository;

	@Override
	public String login(LoginDTO loginDTO) {

		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(loginDTO.getUsernameOrCorreo(), loginDTO.getPassword()));
		SecurityContextHolder.getContext().setAuthentication(authentication);

		return jwtTokenProvider.generateToken((UserDetails) authentication.getPrincipal());
	}

	@Override
	public String registrarUsuario(RegistroUsuarioDTO registroUsuarioDTO) {
		if (usuarioRepository.existsByUsername(registroUsuarioDTO.getUsername())) {
			return "El nombre de usuario ya existe";
		}
		if (usuarioRepository.existsByCorreo(registroUsuarioDTO.getCorreo())) {
			return "El email ya está en uso";
		}
		 // Buscar sede (Ahora, getSedeId() no es nulo)
	    Sede sede = sedeRepository.findById(registroUsuarioDTO.getSedeId())
	             .orElseThrow(() -> new RuntimeException("Sede no encontrada"));
		Usuario usuario = new Usuario();
		usuario.setNombreCompleto(registroUsuarioDTO.getNombreCompleto());
		usuario.setUsername(registroUsuarioDTO.getUsername());
		usuario.setCorreo(registroUsuarioDTO.getCorreo());
		usuario.setPassword(passwordEncoder.encode(registroUsuarioDTO.getPassword()));
		usuario.setTelefono(registroUsuarioDTO.getTelefono());
		Rol rol = rolRepository.findByNombre(ERol.ROLE_USUARIO)
				.orElseThrow(() -> new RuntimeException("Rol no encontrado"));
		usuario.setTipoUsuario(registroUsuarioDTO.getTipoUsuario());
		usuario.setSede(sede);
		
		
		usuario.getRoles().add(rol);
		usuarioRepository.save(usuario);

		return "Usuario registrado exitosamente";

	}

	@Override
	public String registrarAdmin(RegistroAdminDTO registroAdminDTO) {
		
		if (usuarioRepository.existsByUsername(registroAdminDTO.getUsername())) {
			//throw new RuntimeException("El nombre de admin ya existe");
			return "el nombre de admin ya existe";
		}
		if (usuarioRepository.existsByCorreo(registroAdminDTO.getCorreo())) {
			return "El email ya está en uso";
		}
		
		 // Buscar sede (Ahora, getSedeId() no es nulo)
	    Sede sede = sedeRepository.findById(registroAdminDTO.getSedeId())
	             .orElseThrow(() -> new RuntimeException("Sede no encontrada"));
	    
		Usuario usuario = new Usuario();
		usuario.setNombreCompleto(registroAdminDTO.getNombreCompleto());
		usuario.setUsername(registroAdminDTO.getUsername());
		usuario.setCorreo(registroAdminDTO.getCorreo());
		usuario.setPassword(passwordEncoder.encode(registroAdminDTO.getPassword()));
		usuario.setTelefono(registroAdminDTO.getTelefono());
		Rol rolAdmin = rolRepository.findByNombre(ERol.ROLE_ADMIN)
				.orElseThrow(() -> new RuntimeException("Rol no encontrado"));
		usuario.setSede(sede);
		Rol rolUser = rolRepository.findByNombre(ERol.ROLE_USUARIO)
	            .orElseThrow(() -> new RuntimeException("Rol USER no encontrado"));
		
		
		usuario.getRoles().add(rolAdmin);
		usuario.getRoles().add(rolUser);
		usuarioRepository.save(usuario);

		return "Admin registrado exitosamente";
	}

	@Override
	public String registrarSeguridad(RegistroSeguridadDTO registroSeguridadDTO) {
		
		 // 1. VALIDACIÓN CLAVE: El ID de Sede NO debe ser nulo.
	    if (registroSeguridadDTO.getSedeId() == null) {
	        return "El ID de la sede (sedeId) no puede ser nulo."; 
	    }
	    
	    // 2. VALIDACIÓN ADICIONAL: El conjunto de IDs de Zona NO debe ser nulo.
	    if (registroSeguridadDTO.getZonaIds() == null) {
	        return "La lista de IDs de zona (zonaIds) no puede ser nula.";
	    }

	    // Validar username y correo
	    if (usuarioRepository.existsByUsername(registroSeguridadDTO.getUsername())) {
	        return "El nombre de usuario ya existe";
	    }

	    if (usuarioRepository.existsByCorreo(registroSeguridadDTO.getCorreo())) {
	        return "El correo ya está en uso";
	    }

	    // Buscar sede (Ahora, getSedeId() no es nulo)
	    Sede sede = sedeRepository.findById(registroSeguridadDTO.getSedeId())
	             .orElseThrow(() -> new RuntimeException("Sede no encontrada"));

	    // Buscar zonas
	    Set<Zona> zonas = new HashSet<>(zonaRepository.findAllById(registroSeguridadDTO.getZonaIds()));
	    if (zonas.isEmpty()) {
	        return "Debe seleccionar al menos una zona válida";
	    }

	    // Buscar rol de seguridad
	    Rol rolSeguridad = rolRepository.findByNombre(ERol.ROLE_SEGURIDAD)
	                .orElseThrow(() -> new RuntimeException("Rol de seguridad no encontrado"));

	    // Crear y guardar usuario
	    Usuario usuario = new Usuario();
	    usuario.setNombreCompleto(registroSeguridadDTO.getNombreCompleto());
	    usuario.setUsername(registroSeguridadDTO.getUsername());
	    usuario.setCorreo(registroSeguridadDTO.getCorreo());
	    usuario.setTelefono(registroSeguridadDTO.getTelefono());
	    usuario.setPassword(passwordEncoder.encode(registroSeguridadDTO.getPassword()));
	    usuario.setSede(sede);
	    usuario.setZonas(zonas);
	    usuario.setEnabled(true);
	    usuario.setIntentos(0);
	    usuario.getRoles().add(rolSeguridad);

	    usuarioRepository.save(usuario);

	    return "Usuario de seguridad registrado exitosamente";
	}

}
