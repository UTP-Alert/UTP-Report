package com.utp_reporta_backend.service.impl;

import com.utp_reporta_backend.dto.ReporteGestionDTO;
import com.utp_reporta_backend.enums.EstadoReporte;
import com.utp_reporta_backend.enums.PrioridadReporte;
import com.utp_reporta_backend.model.Reporte;
import com.utp_reporta_backend.model.ReporteGestion;
import com.utp_reporta_backend.model.Usuario;
import com.utp_reporta_backend.model.Zona;
import com.utp_reporta_backend.enums.EstadoZona;
import com.utp_reporta_backend.repository.ReporteGestionRepository;
import com.utp_reporta_backend.repository.ReporteRepository;
import com.utp_reporta_backend.repository.UsuarioRepository;
import com.utp_reporta_backend.repository.ZonaRepository;
import com.utp_reporta_backend.service.IReporteGestionService;
import com.utp_reporta_backend.service.NotificationService;
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

    @Autowired
    private ZonaRepository zonaRepository;

    @Autowired
    private NotificationService notificationService;

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

        ReporteGestion reporteGestionToSave;
        Optional<ReporteGestion> existingReporteGestion = reporteGestionRepository.findByReporte(reporte);

        if (existingReporteGestion.isPresent()) {
            reporteGestionToSave = existingReporteGestion.get();
            reporteGestionToSave.setEstado(estado);
            if (prioridad != null) { // Only update priority if provided
                reporteGestionToSave.setPrioridad(prioridad);
            }
            reporteGestionToSave.setFechaActualizacion(timeService.getCurrentLocalDateTimePeru());
        } else {
            reporteGestionToSave = new ReporteGestion();
            reporteGestionToSave.setReporte(reporte);
            reporteGestionToSave.setEstado(estado);
            // For new ReporteGestion, set priority if provided, otherwise it will be null
            reporteGestionToSave.setPrioridad(prioridad);
            reporteGestionToSave.setFechaActualizacion(timeService.getCurrentLocalDateTimePeru());
        }

        ReporteGestion savedReporteGestion = reporteGestionRepository.save(reporteGestionToSave);

        // Send notification if report status is one of the specified states
        boolean shouldNotify = (estado == EstadoReporte.UBICANDO ||
                                estado == EstadoReporte.INVESTIGANDO ||
                                estado == EstadoReporte.RESUELTO ||
                                estado == EstadoReporte.CANCELADO);

        if (shouldNotify) {
            String notificationMessage = "El estado de tu reporte ha cambiado a " + estado.toString() + ".";
            notificationService.notifyReportStatusChange(reporteId, notificationMessage);
        }

        if (estado == EstadoReporte.RESUELTO) {
            Zona zona = reporte.getZona();
            // estado previo para decidir notificación de cambio de estado
            EstadoZona anterior = zona.getEstado();

            if (zona.getFirstReportDate() == null) {
                zona.setFirstReportDate(timeService.getCurrentLocalDateTimePeru());
                zona.setReportCount(1);
            } else if (timeService.getCurrentLocalDateTimePeru().isAfter(zona.getFirstReportDate().plusWeeks(1))) {
                // reiniciar ventana semanal
                zona.setFirstReportDate(timeService.getCurrentLocalDateTimePeru());
                zona.setReportCount(1);
            } else {
                zona.setReportCount(zona.getReportCount() + 1);
            }

            int reportCount = zona.getReportCount();
            if (reportCount <= 5) {
                zona.setEstado(EstadoZona.ZONA_SEGURA);
            } else if (reportCount <= 10) {
                zona.setEstado(EstadoZona.ZONA_PRECAUCION);
            } else {
                zona.setEstado(EstadoZona.ZONA_PELIGROSA);
            }

            zonaRepository.save(zona);

            // Notificar SOLO cuando cambia de estado y el nuevo estado es de alerta (precaución o peligrosa)
            if (zona.getEstado() != anterior) {
                if (zona.getEstado() == EstadoZona.ZONA_PRECAUCION || zona.getEstado() == EstadoZona.ZONA_PELIGROSA) {
                    String msg = (zona.getEstado() == EstadoZona.ZONA_PRECAUCION)
                            ? "Zona en precaución, mantener cuidado"
                            : "Zona peligrosa, evitar";
                    notificationService.notifyZoneStatusChange(zona, msg);
                }
                // Si vuelve a ZONA_SEGURA, no enviamos notificación al usuario final.
            }
        }

        ReporteGestionDTO dto = new ReporteGestionDTO();
        dto.setId(savedReporteGestion.getId());
        dto.setEstado(savedReporteGestion.getEstado());
        dto.setPrioridad(savedReporteGestion.getPrioridad());
        dto.setFechaActualizacion(savedReporteGestion.getFechaActualizacion());
        return dto;
    }

    @Override
    public ReporteGestionDTO irAZona(Long reporteId) {
        return updateReporteGestion(reporteId, EstadoReporte.UBICANDO, null, null);
    }

    @Override
    public ReporteGestionDTO zonaUbicada(Long reporteId) {
        return updateReporteGestion(reporteId, EstadoReporte.INVESTIGANDO, null, null);
    }

    @Override
    public ReporteGestionDTO completarReporte(Long reporteId, String mensajeSeguridad) {
        Optional<Reporte> reporteOptional = reporteRepository.findById(reporteId);
        if (reporteOptional.isEmpty()) {
            throw new RuntimeException("Reporte no encontrado con ID: " + reporteId);
        }
        Reporte reporte = reporteOptional.get();
        reporte.setMensajeSeguridad(mensajeSeguridad); // Assuming a setter for mensajeSeguridad exists in Reporte
        reporteRepository.save(reporte);
    return updateReporteGestion(reporteId, EstadoReporte.PENDIENTE_APROBACION, null, null);
    }

    @Override
    public ReporteGestionDTO marcarComoResueltoPorAdmin(Long reporteId, String mensajeAdmin) {
        Optional<Reporte> reporteOptional = reporteRepository.findById(reporteId);
        if (reporteOptional.isEmpty()) {
            throw new RuntimeException("Reporte no encontrado con ID: " + reporteId);
        }
        Reporte reporte = reporteOptional.get();
        if (mensajeAdmin != null && !mensajeAdmin.isEmpty()) {
            reporte.setMensajeAdmin(mensajeAdmin);
        }
        reporteRepository.save(reporte);
        return updateReporteGestion(reporteId, EstadoReporte.RESUELTO, null, null);
    }

    @Override
    public ReporteGestionDTO rechazarPorAdmin(Long reporteId, String mensajeAdmin) {
        Optional<Reporte> reporteOptional = reporteRepository.findById(reporteId);
        if (reporteOptional.isEmpty()) {
            throw new RuntimeException("Reporte no encontrado con ID: " + reporteId);
        }
        Reporte reporte = reporteOptional.get();
        if (mensajeAdmin != null && !mensajeAdmin.isEmpty()) {
            reporte.setMensajeAdmin(mensajeAdmin);
        }
        reporteRepository.save(reporte);
        return updateReporteGestion(reporteId, EstadoReporte.INVESTIGANDO, null, null);
    }
}
