package com.utp_reporta_backend.repository;

import com.utp_reporta_backend.model.ReporteGestion;
import com.utp_reporta_backend.model.Reporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReporteGestionRepository extends JpaRepository<ReporteGestion, Long> {
    Optional<ReporteGestion> findByReporte(Reporte reporte);
}
