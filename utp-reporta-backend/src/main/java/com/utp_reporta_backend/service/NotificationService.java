package com.utp_reporta_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.utp_reporta_backend.dto.NotificationMessage;
import com.utp_reporta_backend.model.Zona;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notifyZoneStatusChange(Zona zona) {
        messagingTemplate.convertAndSend("/topic/zone-status", new NotificationMessage(null, zona));
    }

    public void notifyZoneStatusChange(Zona zona, String message) {
        messagingTemplate.convertAndSend("/topic/zone-status", new NotificationMessage(message, zona));
    }
}
