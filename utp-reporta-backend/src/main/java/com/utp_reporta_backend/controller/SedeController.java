package com.utp_reporta_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.utp_reporta_backend.dto.SedeDTO;
import com.utp_reporta_backend.service.SedeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sedes")
@RequiredArgsConstructor
public class SedeController {
	private final SedeService sedeService;

	@GetMapping
    public ResponseEntity<List<SedeDTO>> listarSedes() {
        return ResponseEntity.ok(sedeService.obtenerTodasLasSedes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SedeDTO> obtenerSedePorId(@PathVariable Long id) {
        return sedeService.obtenerSedePorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SedeDTO> crearSede(@Valid @RequestBody SedeDTO sedeDTO) {
        SedeDTO creada = sedeService.crearSede(sedeDTO);
        return ResponseEntity.ok(creada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SedeDTO> actualizarSede(@PathVariable Long id, @Valid @RequestBody SedeDTO sedeDTO) {
        return sedeService.actualizarSede(id, sedeDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSede(@PathVariable Long id) {
        sedeService.eliminarSede(id);
        return ResponseEntity.noContent().build();
    }
}
