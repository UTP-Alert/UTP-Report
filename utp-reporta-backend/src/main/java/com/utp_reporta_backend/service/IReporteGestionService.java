package com.utp_reporta_backend.service;

import com.utp_reporta_backend.dto.ReporteGestionDTO;
import com.utp_reporta_backend.enums.EstadoReporte;
import com.utp_reporta_backend.enums.PrioridadReporte;

public interface IReporteGestionService {
    ReporteGestionDTO updateReporteGestion(Long reporteId, EstadoReporte estado, PrioridadReporte prioridad, Long seguridadId);
    ReporteGestionDTO irAZona(Long reporteId);
    ReporteGestionDTO zonaUbicada(Long reporteId);
    ReporteGestionDTO completarReporte(Long reporteId, String mensajeSeguridad);
    ReporteGestionDTO marcarComoResueltoPorAdmin(Long reporteId, String mensajeAdmin);
    // Potentially add other methods like getLatestReporteGestion if needed later
}
