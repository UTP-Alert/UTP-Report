package com.utp_reporta_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Mensaje de notificación enviado por WebSocket/STOMP.
 * Enví­a un objeto ZonaDTO o ReporteDTO en lugar de la entidad JPA para evitar problemas
 * de serialización y exponer solo los campos necesarios al frontend.
 */
@Data
@NoArgsConstructor
public class NotificationMessage {
    private String message;
    private ZonaDTO zona;
    private ReporteDTO reporte;

    // Constructor for zone notifications
    public NotificationMessage(String message, ZonaDTO zona) {
        this.message = message;
        this.zona = zona;
        this.reporte = null; // Ensure reporte is null for zone notifications
    }

    // Constructor for report notifications
    public NotificationMessage(String message, ReporteDTO reporte) {
        this.message = message;
        this.reporte = reporte;
        this.zona = null; // Ensure zona is null for report notifications
    }
}
