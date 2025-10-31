package com.utp_reporta_backend.service.impl;

import com.utp_reporta_backend.dto.TipoIncidenteDTO;
import com.utp_reporta_backend.model.TipoIncidente;
import com.utp_reporta_backend.repository.TipoIncidenteRepository;
import com.utp_reporta_backend.service.TipoIncidenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TipoIncidenteServiceImpl implements TipoIncidenteService {

    @Autowired
    private TipoIncidenteRepository tipoIncidenteRepository;

    @Override
    public List<TipoIncidenteDTO> getAllTipoIncidentes() {
        return tipoIncidenteRepository.findAll().stream()
                .map(tipoIncidente -> new TipoIncidenteDTO(tipoIncidente.getId(), tipoIncidente.getNombre(), tipoIncidente.getDescripcion()))
                .collect(Collectors.toList());
    }

    @Override
    public TipoIncidenteDTO getTipoIncidenteById(Long id) {
        Optional<TipoIncidente> tipoIncidente = tipoIncidenteRepository.findById(id);
        return tipoIncidente.map(ti -> new TipoIncidenteDTO(ti.getId(), ti.getNombre(), ti.getDescripcion())).orElse(null);
    }

    @Override
    public TipoIncidenteDTO createTipoIncidente(TipoIncidenteDTO tipoIncidenteDTO) {
        TipoIncidente tipoIncidente = new TipoIncidente();
        tipoIncidente.setNombre(tipoIncidenteDTO.getNombre());
        tipoIncidente.setDescripcion(tipoIncidenteDTO.getDescripcion());
        TipoIncidente savedTipoIncidente = tipoIncidenteRepository.save(tipoIncidente);
        return new TipoIncidenteDTO(savedTipoIncidente.getId(), savedTipoIncidente.getNombre(), savedTipoIncidente.getDescripcion());
    }

    @Override
    public TipoIncidenteDTO updateTipoIncidente(Long id, TipoIncidenteDTO tipoIncidenteDetailsDTO) {
        Optional<TipoIncidente> tipoIncidente = tipoIncidenteRepository.findById(id);
        if (tipoIncidente.isPresent()) {
            TipoIncidente existingTipoIncidente = tipoIncidente.get();
            existingTipoIncidente.setNombre(tipoIncidenteDetailsDTO.getNombre());
            existingTipoIncidente.setDescripcion(tipoIncidenteDetailsDTO.getDescripcion());
            TipoIncidente updatedTipoIncidente = tipoIncidenteRepository.save(existingTipoIncidente);
            return new TipoIncidenteDTO(updatedTipoIncidente.getId(), updatedTipoIncidente.getNombre(), updatedTipoIncidente.getDescripcion());
        }
        return null;
    }

    @Override
    public void deleteTipoIncidente(Long id) {
        tipoIncidenteRepository.deleteById(id);
    }
}
