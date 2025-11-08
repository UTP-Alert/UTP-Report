package com.utp_reporta_backend.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.utp_reporta_backend.dto.NotificationMessage;
import com.utp_reporta_backend.dto.ZonaDTO;
import com.utp_reporta_backend.model.Zona;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
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

    public void notifyZoneStatusChange(Zona zona) {
        // Deprecated: se evita notificar sin mensaje explícito para no saturar
        messagingTemplate.convertAndSend("/topic/zone-status", new NotificationMessage(null, mapToDto(zona)));
    }

    public void notifyZoneStatusChange(Zona zona, String message) {
        messagingTemplate.convertAndSend("/topic/zone-status", new NotificationMessage(message, mapToDto(zona)));
    }
}
