package com.utp_reporta_backend.repository;

import com.utp_reporta_backend.model.TipoIncidente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoIncidenteRepository extends JpaRepository<TipoIncidente, Long> {
}
