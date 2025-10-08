package com.utp_reporta_backend.controller;

import com.utp_reporta_backend.dto.TipoIncidenteDTO;
import com.utp_reporta_backend.service.TipoIncidenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipoincidentes")
public class TipoIncidenteController {

    @Autowired
    private TipoIncidenteService tipoIncidenteService;

    @GetMapping
    public ResponseEntity<List<TipoIncidenteDTO>> getAllTipoIncidentes() {
        List<TipoIncidenteDTO> tipoIncidentes = tipoIncidenteService.getAllTipoIncidentes();
        return new ResponseEntity<>(tipoIncidentes, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoIncidenteDTO> getTipoIncidenteById(@PathVariable Long id) {
        TipoIncidenteDTO tipoIncidente = tipoIncidenteService.getTipoIncidenteById(id);
        if (tipoIncidente != null) {
            return new ResponseEntity<>(tipoIncidente, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping
    public ResponseEntity<TipoIncidenteDTO> createTipoIncidente(@RequestBody TipoIncidenteDTO tipoIncidenteDTO) {
        TipoIncidenteDTO createdTipoIncidente = tipoIncidenteService.createTipoIncidente(tipoIncidenteDTO);
        return new ResponseEntity<>(createdTipoIncidente, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoIncidenteDTO> updateTipoIncidente(@PathVariable Long id, @RequestBody TipoIncidenteDTO tipoIncidenteDTO) {
        TipoIncidenteDTO updatedTipoIncidente = tipoIncidenteService.updateTipoIncidente(id, tipoIncidenteDTO);
        if (updatedTipoIncidente != null) {
            return new ResponseEntity<>(updatedTipoIncidente, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTipoIncidente(@PathVariable Long id) {
        tipoIncidenteService.deleteTipoIncidente(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
