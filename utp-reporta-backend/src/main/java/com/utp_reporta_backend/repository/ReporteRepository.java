package com.utp_reporta_backend.repository;

import com.utp_reporta_backend.model.Reporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Long> {
    List<Reporte> findByZonaId(Long zonaId);
    List<Reporte> findByZonaSedeId(Long sedeId);
    List<Reporte> findByZonaIdAndZonaSedeId(Long zonaId, Long sedeId);
}
