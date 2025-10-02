package com.utp_reporta_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.utp_reporta_backend.dto.JwtAuthResponseDTO;
import com.utp_reporta_backend.dto.LoginDTO;
import com.utp_reporta_backend.dto.RegistroDTO;
import com.utp_reporta_backend.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "false")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponseDTO> login(@RequestBody LoginDTO loginDTO) {
        String token = authService.login(loginDTO);
        
        JwtAuthResponseDTO jwtAuthResponse = new JwtAuthResponseDTO();
        jwtAuthResponse.setToken(token);
        
        return ResponseEntity.ok(jwtAuthResponse);
    }

    @PostMapping("/registrar")
    public ResponseEntity<String> registrar(@RequestBody RegistroDTO registroDTO) {
        String respuesta = authService.registrar(registroDTO);
        return ResponseEntity.ok(respuesta);
    }
    


}
