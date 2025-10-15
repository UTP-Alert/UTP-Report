package com.utp_reporta_backend.dto;

import com.utp_reporta_backend.enums.EstadoReporte;
import com.utp_reporta_backend.enums.PrioridadReporte;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteGestionDTO {
    private Long id;
    private Long reporteId;
    private EstadoReporte estado;
    private PrioridadReporte prioridad;
    private LocalDateTime fechaActualizacion;
}
