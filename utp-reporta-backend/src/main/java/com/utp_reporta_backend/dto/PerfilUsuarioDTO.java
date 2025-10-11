package com.utp_reporta_backend.dto;

import java.util.List;
import java.time.LocalDate;

import com.utp_reporta_backend.enums.TipoUsuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PerfilUsuarioDTO {
    private Long id;
    private String username;
    private String nombreCompleto;
    private TipoUsuario tipoUsuario; // Puede ser null para roles que no lo usan (ADMIN, SEGURIDAD, SUPERADMIN)
    private List<String> roles;
    // Campos para control de reportes diarios (para el front)
    private Integer intentos; // intentos de reporte del día
    private LocalDate fechaUltimoReporte; // última fecha de reporte registrada en backend
}
