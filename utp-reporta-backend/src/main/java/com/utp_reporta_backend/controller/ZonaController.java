package com.utp_reporta_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.utp_reporta_backend.dto.ZonaDTO;
import com.utp_reporta_backend.service.ZonaService;

import lombok.RequiredArgsConstructor;
//Controlador para manejar las operaciones CRUD de las zonas.
@RestController
@RequestMapping("/api/zonas")
@RequiredArgsConstructor
//Controlador para manejar las operaciones CRUD de las zonas.
public class ZonaController {
	private final ZonaService zonaService;
	@GetMapping
    public ResponseEntity<List<ZonaDTO>> listarZonas() {
        return ResponseEntity.ok(zonaService.obtenerTodasLasZonas());
    }

    @GetMapping("/sede/{sedeId}")
    public ResponseEntity<List<ZonaDTO>> listarZonasPorSede(@PathVariable Long sedeId) {
        return ResponseEntity.ok(zonaService.obtenerZonasPorSedeId(sedeId));
    }

    @PostMapping
    public ResponseEntity<ZonaDTO> crearZona(
            @RequestParam String nombre,
            @RequestParam String descripcion,
            @RequestParam(value = "foto", required = false) MultipartFile foto,
            @RequestParam Long sedeId) {
        ZonaDTO createdZona = zonaService.crearZona(nombre, descripcion, foto, sedeId);
        return new ResponseEntity<>(createdZona, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ZonaDTO> updateZona(
            @PathVariable Long id,
            @RequestParam String nombre,
            @RequestParam String descripcion,
            @RequestParam(value = "foto", required = false) MultipartFile foto,
            @RequestParam Long sedeId) {
        ZonaDTO updatedZona = zonaService.updateZona(id, nombre, descripcion, foto, sedeId);
        return ResponseEntity.ok(updatedZona);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteZona(@PathVariable Long id) {
        zonaService.deleteZona(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
