package com.utp_reporta_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.utp_reporta_backend.dto.JwtAuthResponseDTO;
import com.utp_reporta_backend.dto.LoginDTO;
import com.utp_reporta_backend.dto.RegistroAdminDTO;
import com.utp_reporta_backend.dto.RegistroSeguridadDTO;
import com.utp_reporta_backend.dto.RegistroUsuarioDTO;
import com.utp_reporta_backend.service.AuthService;

import lombok.RequiredArgsConstructor;
//Controlador para manejar la autenticación y registro de usuarios.
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
//Controlador para manejar la autenticación y registro de usuarios.
public class AuthController {
    private final AuthService authService;
    // Endpoint para el login de usuarios
    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponseDTO> login(@RequestBody LoginDTO loginDTO) {
        String token = authService.login(loginDTO);

        JwtAuthResponseDTO jwtAuthResponse = new JwtAuthResponseDTO();
        jwtAuthResponse.setToken(token);
        // Extraer roles del SecurityContext (ya autenticado en AuthServiceImpl)
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities() != null) {
            java.util.List<String> roles = auth.getAuthorities().stream()
                    .map(a -> a.getAuthority())
                    .toList();
            jwtAuthResponse.setRoles(roles);
        }
        return ResponseEntity.ok(jwtAuthResponse);
    }

    //Registar usuario con con roles alumno y docente
    @PostMapping("/registrarUsuario")
    public ResponseEntity<String> registrarUsuario(@RequestBody RegistroUsuarioDTO registroDTO) {
        String respuesta = authService.registrarUsuario(registroDTO);
        return ResponseEntity.ok(respuesta);
    }
    //Registar usuario con rol admin
    @PostMapping("/registrarAdmin")
    public ResponseEntity<String> registrarAdmin(@RequestBody RegistroAdminDTO registroAdminDTO) {
        String respuesta = authService.registrarAdmin(registroAdminDTO);
        return ResponseEntity.ok(respuesta);
    }
    //Registar usuario con rol seguridad
    @PostMapping("/registrarSeguridad")
    public ResponseEntity<String> registrarSeguridad(@RequestBody RegistroSeguridadDTO dto) {
        String resultado = authService.registrarSeguridad(dto);
        return ResponseEntity.ok(resultado);
    }

    
    

}
