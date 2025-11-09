package com.utp_reporta_backend.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.utp_reporta_backend.dto.NotificationMessage;
import com.utp_reporta_backend.dto.ZonaDTO;
import com.utp_reporta_backend.model.Zona;
import com.utp_reporta_backend.model.Reporte; // Import Reporte
import com.utp_reporta_backend.dto.ReporteDTO; // Import ReporteDTO
import com.utp_reporta_backend.dto.ReporteGestionDTO; // Import ReporteGestionDTO
import com.utp_reporta_backend.repository.ReporteRepository; // Import ReporteRepository
import org.springframework.beans.factory.annotation.Autowired; // Import Autowired

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ReporteRepository reporteRepository; // Inject ReporteRepository

    @Autowired
    public NotificationService(SimpMessagingTemplate messagingTemplate, ReporteRepository reporteRepository) {
        this.messagingTemplate = messagingTemplate;
        this.reporteRepository = reporteRepository;
    }

    private ZonaDTO mapToDto(Zona z) {
        if (z == null) return null;
        ZonaDTO dto = new ZonaDTO();
        dto.setId(z.getId());
        dto.setNombre(z.getNombre());
        dto.setDescripcion(z.getDescripcion());
        dto.setFoto(z.getFoto());
        dto.setSedeId(z.getSede() != null ? z.getSede().getId() : null);
        dto.setActivo(z.isActivo());
        dto.setEstado(z.getEstado());
        dto.setReportCount(z.getReportCount());
        return dto;
    }

    // New method to map Reporte to ReporteDTO
    private ReporteDTO mapReporteToDto(Reporte reporte) {
        if (reporte == null) return null;
        ReporteDTO dto = new ReporteDTO();
        dto.setId(reporte.getId());
        dto.setTipoIncidenteId(reporte.getTipoIncidente().getId());
        dto.setZonaId(reporte.getZona().getId());
        dto.setDescripcion(reporte.getDescripcion());
        dto.setFoto(reporte.getFoto());
        dto.setFechaCreacion(reporte.getFechaCreacion());
        dto.setIsAnonimo(reporte.getIsAnonimo());
        dto.setContacto(reporte.getContacto());
        dto.setUsuarioId(reporte.getUsuario().getId());
        if (reporte.getSeguridadAsignado() != null)
            dto.setSeguridadAsignadoId(reporte.getSeguridadAsignado().getId());
        if (reporte.getReporteGestion() != null) {
            ReporteGestionDTO gestionDTO = new ReporteGestionDTO();
            gestionDTO.setId(reporte.getReporteGestion().getId());
            gestionDTO.setEstado(reporte.getReporteGestion().getEstado());
            gestionDTO.setPrioridad(reporte.getReporteGestion().getPrioridad());
            gestionDTO.setFechaActualizacion(reporte.getReporteGestion().getFechaActualizacion());
            dto.setReporteGestion(gestionDTO);
        }
        dto.setMensajeSeguridad(reporte.getMensajeSeguridad());
        dto.setMensajeAdmin(reporte.getMensajeAdmin());
        return dto;
    }

    public void notifyZoneStatusChange(Zona zona) {
        // Deprecated: se evita notificar sin mensaje explícito para no saturar
        messagingTemplate.convertAndSend("/topic/zone-status", new NotificationMessage(null, mapToDto(zona)));
    }

    public void notifyZoneStatusChange(Zona zona, String message) {
        messagingTemplate.convertAndSend("/topic/zone-status", new NotificationMessage(message, mapToDto(zona)));
    }

    public void notifyReportStatusChange(Long reporteId, String message) {
        reporteRepository.findById(reporteId).ifPresent(reporte -> {
            String recipientUsername = reporte.getUsuario().getUsername();
            messagingTemplate.convertAndSendToUser(
                recipientUsername,
                "/queue/notifications",
                new NotificationMessage(message, mapReporteToDto(reporte))
            );
        });
    }
}
