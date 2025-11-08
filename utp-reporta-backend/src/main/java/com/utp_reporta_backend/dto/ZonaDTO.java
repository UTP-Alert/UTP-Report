package com.utp_reporta_backend.dto;

import com.utp_reporta_backend.enums.EstadoZona;
import lombok.Data;
//DTO para encapsular los datos de una zona.
@Data
public class ZonaDTO {
	private Long id;
	private String nombre;
	private String descripcion;
	private byte[] foto;
	private Long sedeId;
	private Boolean activo;
	private EstadoZona estado; // estado actual (segura, precaucion, peligrosa)
	private Integer reportCount; // cantidad de reportes resueltos usados para determinar estado
}
