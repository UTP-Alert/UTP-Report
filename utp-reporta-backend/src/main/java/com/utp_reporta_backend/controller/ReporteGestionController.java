package com.utp_reporta_backend.controller;

import com.utp_reporta_backend.dto.ReporteGestionDTO;
import com.utp_reporta_backend.enums.EstadoReporte;
import com.utp_reporta_backend.enums.PrioridadReporte;
import com.utp_reporta_backend.service.IReporteGestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
            @RequestParam PrioridadReporte prioridad) {
        try {
            ReporteGestionDTO updatedGestion = reporteGestionService.updateReporteGestion(reporteId, estado, prioridad);
            return new ResponseEntity<>(updatedGestion, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
