package com.utp_reporta_backend.controller;

import com.utp_reporta_backend.dto.ReporteDTO;
import com.utp_reporta_backend.service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.utp_reporta_backend.enums.EstadoReporte;
import com.utp_reporta_backend.enums.PrioridadReporte;


import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;

    @GetMapping
    public ResponseEntity<List<ReporteDTO>> getAllReportes() {
        List<ReporteDTO> reportes = reporteService.getAllReportes();
        return new ResponseEntity<>(reportes, HttpStatus.OK);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ReporteDTO>> getFilteredReportes(
            @RequestParam(required = false) Long zonaId,
            @RequestParam(required = false) Long sedeId) {
        List<ReporteDTO> reportes = reporteService.getFilteredReportes(zonaId, sedeId);
        return new ResponseEntity<>(reportes, HttpStatus.OK);
    }

    @GetMapping("/filtered")
    public ResponseEntity<List<ReporteDTO>> getFilteredReports(
            @RequestParam(required = false) PrioridadReporte prioridad,
            @RequestParam(required = false) EstadoReporte estado,
            @RequestParam(required = false) Boolean isAnonimo) {
        List<ReporteDTO> reportes = reporteService.getFilteredReports(prioridad, estado, isAnonimo);
        return new ResponseEntity<>(reportes, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReporteDTO> getReporteById(@PathVariable Long id) {
        ReporteDTO reporte = reporteService.getReporteById(id);
        if (reporte != null) {
            return new ResponseEntity<>(reporte, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

   @PostMapping
    public ResponseEntity<ReporteDTO> createReporte(
            @RequestParam Long tipoIncidenteId,
            @RequestParam Long zonaId,
            @RequestParam String descripcion,
            @RequestPart(value = "foto", required = false) MultipartFile foto,
            @RequestParam Boolean isAnonimo,
            @RequestParam(value = "contacto", required = false) String contacto,
            @RequestParam("usuarioId") Long usuarioId) {
        ReporteDTO createdReporte = reporteService.createReporte(
                tipoIncidenteId, zonaId, descripcion, foto, isAnonimo, contacto, usuarioId);
        return new ResponseEntity<>(createdReporte, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReporteDTO> updateReporte(
            @PathVariable Long id,
            @RequestParam("tipoIncidenteId") Long tipoIncidenteId,
            @RequestParam("zonaId") Long zonaId,
            @RequestParam("descripcion") String descripcion,
            @RequestPart(value = "foto", required = false) MultipartFile foto,
            @RequestParam("isAnonimo") Boolean isAnonimo,
            @RequestParam(value = "contacto", required = false) String contacto,
            @RequestParam("usuarioId") Long usuarioId) {
        ReporteDTO updatedReporte = reporteService.updateReporte(
                id, tipoIncidenteId, zonaId, descripcion, foto, isAnonimo, contacto, usuarioId);
        if (updatedReporte != null) {
            return new ResponseEntity<>(updatedReporte, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReporte(@PathVariable Long id) {
        reporteService.deleteReporte(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/by-username/{username}")
    public ResponseEntity<List<ReporteDTO>> getReportsByUsername(@PathVariable String username) {
        List<ReporteDTO> reportes = reporteService.getReportsByUsername(username);
        if (!reportes.isEmpty()) {
            return new ResponseEntity<>(reportes, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
