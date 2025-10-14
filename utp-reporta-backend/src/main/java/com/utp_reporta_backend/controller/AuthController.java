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
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;

//Controlador para manejar la autenticación y registro de usuarios.
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
//Controlador para manejar la autenticación y registro de usuarios.
public class AuthController {
    private final AuthService authService;
    // Removed UsuarioRepository and TimeService injections

    // Endpoint para el login de usuarios
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        try {
            String token = authService.login(loginDTO);

            JwtAuthResponseDTO jwtAuthResponse = new JwtAuthResponseDTO();
            jwtAuthResponse.setToken(token);
            // Extraer roles del SecurityContext (ya autenticado en AuthServiceImpl)
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getAuthorities() != null) {
                java.util.List<String> roles = auth.getAuthorities().stream()
                        .map(a -> a.getAuthority())
                        .toList();
                jwtAuthResponse.setRoles(roles);
            }
            return ResponseEntity.ok(jwtAuthResponse);

        } catch (AuthenticationException e) {
            // AuthServiceImpl now handles lockout logic and throws AuthenticationException with specific messages
            // We can check the message to return different HTTP statuses if needed, but for now, UNAUTHORIZED is fine.
            if (e.getMessage().contains("bloqueada")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
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
