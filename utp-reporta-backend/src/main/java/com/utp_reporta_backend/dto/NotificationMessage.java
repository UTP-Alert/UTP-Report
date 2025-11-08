package com.utp_reporta_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Mensaje de notificación enviado por WebSocket/STOMP.
 * Enví­a un objeto ZonaDTO en lugar de la entidad JPA para evitar problemas
 * de serialización y exponer solo los campos necesarios al frontend.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationMessage {
    private String message;
    private ZonaDTO zona;
}
