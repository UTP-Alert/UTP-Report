package com.utp_reporta_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteDTO {
    private Long id;
    private Long tipoIncidenteId;
    private Long zonaId;
    private String descripcion;
    private byte[] foto;
    private LocalDateTime fechaCreacion;
    private Boolean isAnonimo;
    private String contacto;
    private Long usuarioId;
    private Long seguridadAsignadoId;
    // Último estado/proceso (si existe)
    private String ultimoEstado;
    private String ultimaPrioridad;
    private java.time.LocalDateTime fechaUltimaGestion;
}
