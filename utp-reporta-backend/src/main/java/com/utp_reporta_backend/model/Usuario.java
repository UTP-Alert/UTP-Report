package com.utp_reporta_backend.model;

import com.utp_reporta_backend.enums.TipoUsuario;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Usuario {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombreCompleto;
	private String username;
    private String password;    
    private String correo;
    private String telefono;
    private TipoUsuario tipoUsuario;
    private int intentos;
    private boolean enabled=true;
    
    
}
