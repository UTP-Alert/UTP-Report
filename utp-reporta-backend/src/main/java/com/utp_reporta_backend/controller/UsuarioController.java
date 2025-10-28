package com.utp_reporta_backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.utp_reporta_backend.dto.UsuarioDTO;
import com.utp_reporta_backend.model.Usuario;
import com.utp_reporta_backend.repository.UsuarioRepository;
import com.utp_reporta_backend.service.UsuarioService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {
    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    @GetMapping("/seguridad/filter")
    public ResponseEntity<List<UsuarioDTO>> getFilteredSeguridadUsers(
            @RequestParam(required = false) Long zonaId,
            @RequestParam(required = false) Long sedeId) {
        List<UsuarioDTO> usuarios = usuarioService.getFilteredSeguridadUsers(zonaId, sedeId);
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> miPerfil(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        var usuarioOpt = usuarioRepository.findByUsernameOrCorreo(auth.getName(), auth.getName());
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Usuario u = usuarioOpt.get();
        var roles = u.getRoles().stream().map(r -> r.getNombre().name()).collect(Collectors.toList());
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(u.getId());
        dto.setNombreCompleto(u.getNombreCompleto());
        dto.setUsername(u.getUsername());
        dto.setCorreo(u.getCorreo());
        dto.setTelefono(u.getTelefono());
        dto.setTipoUsuario(u.getTipoUsuario());
        dto.setSedeNombre(u.getSede() != null ? u.getSede().getNombre() : null);
        dto.setZonasNombres(u.getZonas().stream().map(z -> z.getNombre()).collect(Collectors.toList()));
        dto.setIntentos(u.getIntentosReporte());
        dto.setFechaUltimoReporte(u.getFechaUltimoReporte());
        dto.setEnabled(u.isEnabled());
        dto.setRoles(roles);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<List<UsuarioDTO>> getAllUsuarios() {
        List<UsuarioDTO> usuarios = usuarioService.getAllUsuarios();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/rol/usuario")
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<List<UsuarioDTO>> getUsuariosByRolUsuario() {
        List<UsuarioDTO> usuarios = usuarioService.getUsuariosByRolUsuario();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/rol/admin")
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<List<UsuarioDTO>> getUsuariosByRolAdmin() {
        List<UsuarioDTO> usuarios = usuarioService.getUsuariosByRolAdmin();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/rol/seguridad")
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<List<UsuarioDTO>> getUsuariosByRolSeguridad() {
        List<UsuarioDTO> usuarios = usuarioService.getUsuariosByRolSeguridad();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/tipo/docente")
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<List<UsuarioDTO>> getUsuariosByTipoDocente() {
        List<UsuarioDTO> usuarios = usuarioService.getUsuariosByTipoDocente();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/tipo/alumno")
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<List<UsuarioDTO>> getUsuariosByTipoAlumno() {
        List<UsuarioDTO> usuarios = usuarioService.getUsuariosByTipoAlumno();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/codigo/{codigo}")
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')") // Add appropriate authorization
    public ResponseEntity<UsuarioDTO> getUsuarioByCodigo(@PathVariable String codigo) {
        UsuarioDTO usuario = usuarioService.findByCodigo(codigo);
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/enabled")
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')") // Add appropriate authorization
    public ResponseEntity<List<UsuarioDTO>> getUsuariosByEnabledStatus(@RequestParam boolean enabled) {
        List<UsuarioDTO> usuarios = usuarioService.getUsuariosByEnabledStatus(enabled);
        return ResponseEntity.ok(usuarios);
    }

    @PutMapping("/{id}/enabled")
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')") // Add appropriate authorization
    public ResponseEntity<UsuarioDTO> updateUsuarioEnabledStatus(@PathVariable Long id, @RequestParam boolean enabled) {
        UsuarioDTO updatedUsuario = usuarioService.updateUsuarioEnabledStatus(id, enabled);
        if (updatedUsuario != null) {
            return ResponseEntity.ok(updatedUsuario);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/excluding-superadmin")
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')") // Add appropriate authorization
    public ResponseEntity<List<UsuarioDTO>> getAllUsersExcludingSuperAdmin() {
        List<UsuarioDTO> usuarios = usuarioService.getAllUsersExcludingSuperAdmin();
        return ResponseEntity.ok(usuarios);
    }
}
