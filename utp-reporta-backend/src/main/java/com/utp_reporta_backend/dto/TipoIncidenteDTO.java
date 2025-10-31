package com.utp_reporta_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoIncidenteDTO {
    private Long id;
    private String nombre;
    private String descripcion;
}
