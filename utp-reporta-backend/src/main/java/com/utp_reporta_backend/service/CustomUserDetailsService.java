package com.utp_reporta_backend.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.utp_reporta_backend.model.Usuario;
import com.utp_reporta_backend.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
	private final UsuarioRepository usuarioRepository;

	@Override
	public UserDetails loadUserByUsername(String usernameOrCorreo) throws UsernameNotFoundException {
		Usuario usuario = usuarioRepository.findByUsernameOrCorreo(usernameOrCorreo, usernameOrCorreo).orElseThrow(
				() -> new UsernameNotFoundException("Usuario no encontrado con username o email: " + usernameOrCorreo));
		return new User(
					usuario.getUsername(),
					usuario.getPassword(),
					usuario.isEnabled(), // Pass the enabled status from our Usuario object
					usuario.isAccountNonExpired(),
					usuario.isCredentialsNonExpired(),
					usuario.isAccountNonLocked(),
					usuario.getAuthorities()
				);
	}

}
