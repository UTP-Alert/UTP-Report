package com.utp_reporta_backend.repository;

import com.utp_reporta_backend.model.Reporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.utp_reporta_backend.enums.EstadoReporte;
import com.utp_reporta_backend.enums.PrioridadReporte;


import java.util.List;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Long> {
    long countByZonaId(Long zonaId);
    List<Reporte> findByZonaId(Long zonaId);
    List<Reporte> findByZonaSedeId(Long sedeId);
    List<Reporte> findByZonaIdAndZonaSedeId(Long zonaId, Long sedeId);

    List<Reporte> findByReporteGestion_PrioridadAndReporteGestion_EstadoAndIsAnonimo(
            PrioridadReporte prioridad, EstadoReporte estado, Boolean isAnonimo);

    List<Reporte> findByReporteGestion_PrioridadAndReporteGestion_Estado(
            PrioridadReporte prioridad, EstadoReporte estado);

    List<Reporte> findByReporteGestion_PrioridadAndIsAnonimo(
            PrioridadReporte prioridad, Boolean isAnonimo);

    List<Reporte> findByReporteGestion_EstadoAndIsAnonimo(
            EstadoReporte estado, Boolean isAnonimo);

    List<Reporte> findByReporteGestion_Prioridad(PrioridadReporte prioridad);

    List<Reporte> findByReporteGestion_Estado(EstadoReporte estado);

    List<Reporte> findByIsAnonimo(Boolean isAnonimo);

    List<Reporte> findByUsuarioUsername(String username);
}
