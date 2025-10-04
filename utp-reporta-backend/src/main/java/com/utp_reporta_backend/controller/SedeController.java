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
//Controlador para manejar las operaciones CRUD de las sedes.
@RestController
@RequestMapping("/api/sedes")
@RequiredArgsConstructor
//Controlador para manejar las operaciones CRUD de las sedes.
public class SedeController {
	private final SedeService sedeService;

	@GetMapping
    // Listar todas las sedes
    public ResponseEntity<List<SedeDTO>> listarSedes() {
        return ResponseEntity.ok(sedeService.obtenerTodasLasSedes());
    }
    // Obtener una sede por su ID
    @GetMapping("/{id}")
    public ResponseEntity<SedeDTO> obtenerSedePorId(@PathVariable Long id) {
        return sedeService.obtenerSedePorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // Crear una nueva sede
    @PostMapping
    public ResponseEntity<SedeDTO> crearSede(@Valid @RequestBody SedeDTO sedeDTO) {
        SedeDTO creada = sedeService.crearSede(sedeDTO);
        return ResponseEntity.ok(creada);
    }
    // Actualizar una sede existente
    @PutMapping("/{id}")
    public ResponseEntity<SedeDTO> actualizarSede(@PathVariable Long id, @Valid @RequestBody SedeDTO sedeDTO) {
        return sedeService.actualizarSede(id, sedeDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // Eliminar una sede por su ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSede(@PathVariable Long id) {
        sedeService.eliminarSede(id);
        return ResponseEntity.noContent().build();
    }
}
