package com.utp_reporta_backend.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.utp_reporta_backend.dto.NotificationMessage;
import com.utp_reporta_backend.dto.ZonaDTO;
import com.utp_reporta_backend.model.Zona;
import com.utp_reporta_backend.model.Reporte; // Import Reporte
import com.utp_reporta_backend.dto.ReporteDTO; // Import ReporteDTO
import com.utp_reporta_backend.dto.ReporteGestionDTO; // Import ReporteGestionDTO
import com.utp_reporta_backend.repository.ReporteRepository;
import com.utp_reporta_backend.repository.UsuarioRepository;
import com.utp_reporta_backend.repository.RolRepository;
import com.utp_reporta_backend.enums.ERol;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import jakarta.mail.MessagingException;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ReporteRepository reporteRepository;
    private final EmailService emailService;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    @Autowired
    public NotificationService(SimpMessagingTemplate messagingTemplate, ReporteRepository reporteRepository, EmailService emailService, UsuarioRepository usuarioRepository, RolRepository rolRepository) {
        this.messagingTemplate = messagingTemplate;
        this.reporteRepository = reporteRepository;
        this.emailService = emailService;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
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

        // Send email to all users with ROLE_USER
        rolRepository.findByNombre(ERol.ROLE_USUARIO).ifPresent(rol -> {
            List<String> userEmails = usuarioRepository.findByRoles_Nombre(ERol.ROLE_USUARIO).stream()
                                                    .map(usuario -> usuario.getCorreo()) // Assuming getCorreo() exists
                                                    .collect(Collectors.toList());
            String subject = "Actualización de Estado de Zona: " + zona.getNombre();
            Map<String, Object> templateVariables = new java.util.HashMap<>();
            templateVariables.put("zonaNombre", zona.getNombre());
            templateVariables.put("zonaEstado", zona.getEstado());
            templateVariables.put("message", message);

            for (String email : userEmails) {
                try {
                    emailService.sendHtmlEmail(email, subject, "zone_status_change.html", templateVariables);
                } catch (MessagingException e) {
                    System.err.println("Error al enviar correo de cambio de estado de zona a " + email + ": " + e.getMessage());
                }
            }
        });
    }

    public void notifyReportStatusChange(Long reporteId, String message) {
        reporteRepository.findById(reporteId).ifPresent(reporte -> {
            String recipientUsername = reporte.getUsuario().getUsername();
            messagingTemplate.convertAndSendToUser(
                recipientUsername,
                "/queue/notifications",
                new NotificationMessage(message, mapReporteToDto(reporte))
            );
            // Fallback broadcast por username si la sesión STOMP no tiene Principal asociado
            // Permite que el frontend se suscriba a /topic/report-status.{username}
            messagingTemplate.convertAndSend(
                "/topic/report-status." + recipientUsername,
                new NotificationMessage(message, mapReporteToDto(reporte))
            );

            // Send email to the user who sent the report
            String userEmail = reporte.getUsuario().getCorreo();
            String subject = "Actualización de Estado de Reporte: " + reporte.getId();
            Map<String, Object> templateVariables = new java.util.HashMap<>();
            templateVariables.put("reporteId", reporte.getId());
            templateVariables.put("message", message);
            templateVariables.put("reporteEstado", reporte.getReporteGestion().getEstado());

            try {
                emailService.sendHtmlEmail(userEmail, subject, "report_status_change.html", templateVariables);
            } catch (MessagingException e) {
                System.err.println("Error al enviar correo de cambio de estado de reporte a " + userEmail + ": " + e.getMessage());
            }
        });
    }
}
