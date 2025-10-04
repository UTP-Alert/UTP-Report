package com.utp_reporta_backend.dto;

import java.util.List;

import com.utp_reporta_backend.enums.TipoUsuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PerfilUsuarioDTO {
    private String username;
    private String nombreCompleto;
    private TipoUsuario tipoUsuario; // Puede ser null para roles que no lo usan (ADMIN, SEGURIDAD, SUPERADMIN)
    private List<String> roles;
}
