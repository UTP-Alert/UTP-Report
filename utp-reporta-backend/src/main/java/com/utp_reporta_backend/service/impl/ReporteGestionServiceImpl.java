package com.utp_reporta_backend.service.impl;

import com.utp_reporta_backend.dto.ReporteGestionDTO;
import com.utp_reporta_backend.enums.EstadoReporte;
import com.utp_reporta_backend.enums.PrioridadReporte;
import com.utp_reporta_backend.model.Reporte;
import com.utp_reporta_backend.model.ReporteGestion;
import com.utp_reporta_backend.model.Usuario;
import com.utp_reporta_backend.repository.ReporteGestionRepository;
import com.utp_reporta_backend.repository.ReporteRepository;
import com.utp_reporta_backend.repository.UsuarioRepository;
import com.utp_reporta_backend.service.IReporteGestionService;
import com.utp_reporta_backend.service.TimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.Optional;

@Service
public class ReporteGestionServiceImpl implements IReporteGestionService {

    @Autowired
    private ReporteGestionRepository reporteGestionRepository;

    @Autowired
    private ReporteRepository reporteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TimeService timeService;

    @Override
    public ReporteGestionDTO updateReporteGestion(Long reporteId, EstadoReporte estado, PrioridadReporte prioridad, Long seguridadId) {
        Optional<Reporte> reporteOptional = reporteRepository.findById(reporteId);
        if (reporteOptional.isEmpty()) {
            throw new RuntimeException("Reporte no encontrado con ID: " + reporteId);
        }
        Reporte reporte = reporteOptional.get();

        if (seguridadId != null) {
            Optional<Usuario> seguridadOptional = usuarioRepository.findById(seguridadId);
            if (seguridadOptional.isEmpty()) {
                throw new RuntimeException("Usuario de seguridad no encontrado con ID: " + seguridadId);
            }
            reporte.setSeguridadAsignado(seguridadOptional.get());
            reporteRepository.save(reporte);
        }

        ReporteGestion reporteGestion = new ReporteGestion();
        reporteGestion.setReporte(reporte);
        reporteGestion.setEstado(estado);
        reporteGestion.setPrioridad(prioridad);
        reporteGestion.setFechaActualizacion(timeService.getCurrentLocalDateTimePeru());

        ReporteGestion savedReporteGestion = reporteGestionRepository.save(reporteGestion);

        ReporteGestionDTO dto = new ReporteGestionDTO();
        dto.setId(savedReporteGestion.getId());
        dto.setReporteId(savedReporteGestion.getReporte().getId());
        dto.setEstado(savedReporteGestion.getEstado());
        dto.setPrioridad(savedReporteGestion.getPrioridad());
        dto.setFechaActualizacion(savedReporteGestion.getFechaActualizacion());
        if (reporte.getSeguridadAsignado() != null) {
            dto.setSeguridadId(reporte.getSeguridadAsignado().getId());
        }
        return dto;
    }
}
