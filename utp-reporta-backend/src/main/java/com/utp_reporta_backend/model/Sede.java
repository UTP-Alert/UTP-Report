package com.utp_reporta_backend.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
//Entidad para representar una sede en el sistema.
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
//Entidad para representar una sede en el sistema.
public class Sede {
	@Id//Clave primaria de la entidad.
	@GeneratedValue(strategy = GenerationType.IDENTITY)//Generación automática del ID.
	private Long id;//Identificador único de la sede.
	@Column(nullable = false, unique = true)//El nombre de la sede debe ser único y no nulo.
	private String nombre;//Nombre de la sede.

}
