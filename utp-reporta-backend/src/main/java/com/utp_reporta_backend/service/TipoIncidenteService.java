package com.utp_reporta_backend.service;

import com.utp_reporta_backend.dto.TipoIncidenteDTO;
import java.util.List;

public interface TipoIncidenteService {
    List<TipoIncidenteDTO> getAllTipoIncidentes();
    TipoIncidenteDTO getTipoIncidenteById(Long id);
    TipoIncidenteDTO createTipoIncidente(TipoIncidenteDTO tipoIncidenteDTO);
    TipoIncidenteDTO updateTipoIncidente(Long id, TipoIncidenteDTO tipoIncidenteDTO);
    void deleteTipoIncidente(Long id);
}
