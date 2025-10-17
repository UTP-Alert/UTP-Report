package com.utp_reporta_backend.repository;

import com.utp_reporta_backend.model.ReporteGestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReporteGestionRepository extends JpaRepository<ReporteGestion, Long> {
}
