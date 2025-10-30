package com.utp_reporta_backend.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
//Entidad para representar una zona en el sistema.
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Zona {
	@Id//Clave primaria de la entidad.
	@GeneratedValue(strategy = GenerationType.IDENTITY)//Generación automática del ID.
	private Long id;
	private String nombre;
	private String descripcion;

	@Lob
	@Column(name = "foto", columnDefinition = "LONGBLOB")
	private byte[] foto;

	@ManyToOne
	@JoinColumn(name = "sede_id", nullable = false)
	private Sede sede;
}
