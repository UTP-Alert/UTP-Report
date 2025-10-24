package com.utp_reporta_backend.controller;

import com.utp_reporta_backend.dto.ReporteGestionDTO;
import com.utp_reporta_backend.enums.EstadoReporte;
import com.utp_reporta_backend.enums.PrioridadReporte;
import com.utp_reporta_backend.service.IReporteGestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reportes/gestion")
public class ReporteGestionController {

    @Autowired
    private IReporteGestionService reporteGestionService;

    @PostMapping("/{reporteId}")
    public ResponseEntity<ReporteGestionDTO> createReporteGestion(
            @PathVariable Long reporteId,
            @RequestParam EstadoReporte estado,
            @RequestParam PrioridadReporte prioridad,
            @RequestParam(required = false) Long seguridadId) {
        try {
            ReporteGestionDTO updatedGestion = reporteGestionService.updateReporteGestion(reporteId, estado, prioridad, seguridadId);
            return new ResponseEntity<>(updatedGestion, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{reporteId}/ir-a-zona")
    @PreAuthorize("hasRole('SEGURIDAD')")
    public ResponseEntity<ReporteGestionDTO> irAZona(@PathVariable Long reporteId) {
        try {
            ReporteGestionDTO updatedGestion = reporteGestionService.irAZona(reporteId);
            return new ResponseEntity<>(updatedGestion, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{reporteId}/zona-ubicada")
    @PreAuthorize("hasRole('SEGURIDAD')")
    public ResponseEntity<ReporteGestionDTO> zonaUbicada(@PathVariable Long reporteId) {
        try {
            ReporteGestionDTO updatedGestion = reporteGestionService.zonaUbicada(reporteId);
            return new ResponseEntity<>(updatedGestion, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{reporteId}/completar")
    @PreAuthorize("hasRole('SEGURIDAD')")
    public ResponseEntity<ReporteGestionDTO> completarReporte(
            @PathVariable Long reporteId,
            @RequestParam String mensajeSeguridad) {
        try {
            ReporteGestionDTO updatedGestion = reporteGestionService.completarReporte(reporteId, mensajeSeguridad);
            return new ResponseEntity<>(updatedGestion, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
