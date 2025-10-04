package com.utp_reporta_backend.model;

import com.utp_reporta_backend.enums.ERol;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
//Entidad para representar un rol de usuario en el sistema.
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
//Entidad para representar un rol de usuario en el sistema.
public class Rol {
	@Id//Clave primaria de la entidad.
	@GeneratedValue(strategy = GenerationType.IDENTITY)//Generación automática del ID.
	private Long id;//Identificador único del rol.
	@Enumerated(EnumType.STRING) // Esto almacena el nombre del enum como String
	@Column(nullable = false, unique = true)//El nombre del rol debe ser único y no nulo.
	private ERol nombre;//Nombre del rol, basado en el enum ERol.
}