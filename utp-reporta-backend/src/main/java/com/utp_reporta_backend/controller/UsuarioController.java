package com.utp_reporta_backend.controller;

import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.utp_reporta_backend.dto.PerfilUsuarioDTO;
import com.utp_reporta_backend.model.Usuario;
import com.utp_reporta_backend.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {
    private final UsuarioRepository usuarioRepository;

    @GetMapping("/me")
    public ResponseEntity<PerfilUsuarioDTO> miPerfil(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        var usuarioOpt = usuarioRepository.findByUsernameOrCorreo(auth.getName(), auth.getName());
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Usuario u = usuarioOpt.get();
        var roles = u.getRoles().stream().map(r -> r.getNombre().name()).collect(Collectors.toList());
        PerfilUsuarioDTO dto = new PerfilUsuarioDTO(u.getUsername(), u.getNombreCompleto(), u.getTipoUsuario(), roles);
        return ResponseEntity.ok(dto);
    }
}
