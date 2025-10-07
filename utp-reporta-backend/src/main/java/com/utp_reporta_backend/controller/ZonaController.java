package com.utp_reporta_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
