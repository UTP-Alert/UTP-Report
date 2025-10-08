package com.utp_reporta_backend.dto;

import java.util.List;

import com.utp_reporta_backend.enums.TipoUsuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioDTO {
    private Long id;
    private String nombreCompleto;
    private String username;
    private String correo;
    private String telefono;
    private TipoUsuario tipoUsuario;
    private String sedeNombre;
    private List<String> zonasNombres;
    private int intentos;
    private boolean enabled;
    private List<String> roles;
}
