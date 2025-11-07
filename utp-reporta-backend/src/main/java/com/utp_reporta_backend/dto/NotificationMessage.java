package com.utp_reporta_backend.dto;

import com.utp_reporta_backend.model.Zona;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationMessage {
    private String message;
    private Zona zona;
}
