package com.utp_reporta_backend.service.impl;

import com.utp_reporta_backend.dto.UsuarioDTO;
import com.utp_reporta_backend.enums.ERol;
import com.utp_reporta_backend.enums.TipoUsuario;
import com.utp_reporta_backend.model.Usuario;
import com.utp_reporta_backend.repository.UsuarioRepository;
import com.utp_reporta_backend.service.UsuarioService;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public List<UsuarioDTO> getAllUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        return usuarios.stream().map(usuario -> {
            UsuarioDTO usuarioDTO = new UsuarioDTO();
            usuarioDTO.setId(usuario.getId());
            usuarioDTO.setNombreCompleto(usuario.getNombreCompleto());
            usuarioDTO.setUsername(usuario.getUsername());
            usuarioDTO.setCorreo(usuario.getCorreo());
            usuarioDTO.setTelefono(usuario.getTelefono());
            usuarioDTO.setTipoUsuario(usuario.getTipoUsuario());
            usuarioDTO.setSedeNombre(usuario.getSede() != null ? usuario.getSede().getNombre() : null);
            usuarioDTO.setZonasNombres(usuario.getZonas().stream()
                    .map(zona -> zona.getNombre())
                    .collect(Collectors.toList()));
            usuarioDTO.setIntentos(usuario.getIntentosReporte());
            usuarioDTO.setFechaUltimoReporte(usuario.getFechaUltimoReporte());
            usuarioDTO.setEnabled(usuario.isEnabled());
            usuarioDTO.setRoles(usuario.getRoles().stream()
                    .map(rol -> rol.getNombre().name())
                    .collect(Collectors.toList()));
            return usuarioDTO;
        }).collect(Collectors.toList());
    }

    @Override
    public List<UsuarioDTO> getUsuariosByRolUsuario() {
        List<Usuario> allUsuarios = usuarioRepository.findAll();
        return allUsuarios.stream()
                .filter(usuario -> usuario.getRoles().stream()
                        .anyMatch(rol -> rol.getNombre().equals(ERol.ROLE_USUARIO)))
                .map(usuario -> {
                    UsuarioDTO usuarioDTO = new UsuarioDTO();
                    usuarioDTO.setId(usuario.getId());
                    usuarioDTO.setNombreCompleto(usuario.getNombreCompleto());
                    usuarioDTO.setUsername(usuario.getUsername());
                    usuarioDTO.setCorreo(usuario.getCorreo());
                    usuarioDTO.setTelefono(usuario.getTelefono());
                    usuarioDTO.setTipoUsuario(usuario.getTipoUsuario());
                    usuarioDTO.setSedeNombre(usuario.getSede() != null ? usuario.getSede().getNombre() : null);
                    usuarioDTO.setZonasNombres(usuario.getZonas().stream()
                            .map(zona -> zona.getNombre())
                            .collect(Collectors.toList()));
                    usuarioDTO.setIntentos(usuario.getIntentosReporte());
                    usuarioDTO.setFechaUltimoReporte(usuario.getFechaUltimoReporte());
                    usuarioDTO.setEnabled(usuario.isEnabled());
                    usuarioDTO.setRoles(usuario.getRoles().stream()
                            .map(rol -> rol.getNombre().name())
                            .collect(Collectors.toList()));
                    return usuarioDTO;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<UsuarioDTO> getUsuariosByRolAdmin() {
        List<Usuario> allUsuarios = usuarioRepository.findAll();
        return allUsuarios.stream()
                .filter(usuario -> usuario.getRoles().stream()
                        .anyMatch(rol -> rol.getNombre().equals(ERol.ROLE_ADMIN)))
                .map(usuario -> {
                    UsuarioDTO usuarioDTO = new UsuarioDTO();
                    usuarioDTO.setId(usuario.getId());
                    usuarioDTO.setNombreCompleto(usuario.getNombreCompleto());
                    usuarioDTO.setUsername(usuario.getUsername());
                    usuarioDTO.setCorreo(usuario.getCorreo());
                    usuarioDTO.setTelefono(usuario.getTelefono());
                    usuarioDTO.setTipoUsuario(usuario.getTipoUsuario());
                    usuarioDTO.setSedeNombre(usuario.getSede() != null ? usuario.getSede().getNombre() : null);
                    usuarioDTO.setZonasNombres(usuario.getZonas().stream()
                            .map(zona -> zona.getNombre())
                            .collect(Collectors.toList()));
                    usuarioDTO.setIntentos(usuario.getIntentosReporte());
                    usuarioDTO.setFechaUltimoReporte(usuario.getFechaUltimoReporte());
                    usuarioDTO.setEnabled(usuario.isEnabled());
                    usuarioDTO.setRoles(usuario.getRoles().stream()
                            .map(rol -> rol.getNombre().name())
                            .collect(Collectors.toList()));
                    return usuarioDTO;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<UsuarioDTO> getUsuariosByRolSeguridad() {
        List<Usuario> allUsuarios = usuarioRepository.findAll();
        return allUsuarios.stream()
                .filter(usuario -> usuario.getRoles().stream()
                        .anyMatch(rol -> rol.getNombre().equals(ERol.ROLE_SEGURIDAD)))
                .map(usuario -> {
                    UsuarioDTO usuarioDTO = new UsuarioDTO();
                    usuarioDTO.setId(usuario.getId());
                    usuarioDTO.setNombreCompleto(usuario.getNombreCompleto());
                    usuarioDTO.setUsername(usuario.getUsername());
                    usuarioDTO.setCorreo(usuario.getCorreo());
                    usuarioDTO.setTelefono(usuario.getTelefono());
                    usuarioDTO.setTipoUsuario(usuario.getTipoUsuario());
                    usuarioDTO.setSedeNombre(usuario.getSede() != null ? usuario.getSede().getNombre() : null);
                    usuarioDTO.setZonasNombres(usuario.getZonas().stream()
                            .map(zona -> zona.getNombre())
                            .collect(Collectors.toList()));
                    usuarioDTO.setIntentos(usuario.getIntentosReporte());
                    usuarioDTO.setFechaUltimoReporte(usuario.getFechaUltimoReporte());
                    usuarioDTO.setEnabled(usuario.isEnabled());
                    usuarioDTO.setRoles(usuario.getRoles().stream()
                            .map(rol -> rol.getNombre().name())
                            .collect(Collectors.toList()));
                    return usuarioDTO;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<UsuarioDTO> getUsuariosByTipoDocente() {
        List<Usuario> allUsuarios = usuarioRepository.findAll();
        return allUsuarios.stream()
                .filter(usuario -> usuario.getTipoUsuario() != null && usuario.getTipoUsuario().equals(TipoUsuario.DOCENTE))
                .map(usuario -> {
                    UsuarioDTO usuarioDTO = new UsuarioDTO();
                    usuarioDTO.setId(usuario.getId());
                    usuarioDTO.setNombreCompleto(usuario.getNombreCompleto());
                    usuarioDTO.setUsername(usuario.getUsername());
                    usuarioDTO.setCorreo(usuario.getCorreo());
                    usuarioDTO.setTelefono(usuario.getTelefono());
                    usuarioDTO.setTipoUsuario(usuario.getTipoUsuario());
                    usuarioDTO.setSedeNombre(usuario.getSede() != null ? usuario.getSede().getNombre() : null);
                    usuarioDTO.setZonasNombres(usuario.getZonas().stream()
                            .map(zona -> zona.getNombre())
                            .collect(Collectors.toList()));
                    usuarioDTO.setIntentos(usuario.getIntentosReporte());
                    usuarioDTO.setFechaUltimoReporte(usuario.getFechaUltimoReporte());
                    usuarioDTO.setEnabled(usuario.isEnabled());
                    usuarioDTO.setRoles(usuario.getRoles().stream()
                            .map(rol -> rol.getNombre().name())
                            .collect(Collectors.toList()));
                    return usuarioDTO;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<UsuarioDTO> getUsuariosByTipoAlumno() {
        List<Usuario> allUsuarios = usuarioRepository.findAll();
        return allUsuarios.stream()
                .filter(usuario -> usuario.getTipoUsuario() != null && usuario.getTipoUsuario().equals(TipoUsuario.ALUMNO))
                .map(usuario -> {
                    UsuarioDTO usuarioDTO = new UsuarioDTO();
                    usuarioDTO.setId(usuario.getId());
                    usuarioDTO.setNombreCompleto(usuario.getNombreCompleto());
                    usuarioDTO.setUsername(usuario.getUsername());
                    usuarioDTO.setCorreo(usuario.getCorreo());
                    usuarioDTO.setTelefono(usuario.getTelefono());
                    usuarioDTO.setTipoUsuario(usuario.getTipoUsuario());
                    usuarioDTO.setSedeNombre(usuario.getSede() != null ? usuario.getSede().getNombre() : null);
                    usuarioDTO.setZonasNombres(usuario.getZonas().stream()
                            .map(zona -> zona.getNombre())
                            .collect(Collectors.toList()));
                    usuarioDTO.setIntentos(usuario.getIntentosReporte());
                    usuarioDTO.setEnabled(usuario.isEnabled());
                    usuarioDTO.setRoles(usuario.getRoles().stream()
                            .map(rol -> rol.getNombre().name())
                            .collect(Collectors.toList()));
                    return usuarioDTO;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<UsuarioDTO> getFilteredSeguridadUsers(Long zonaId, Long sedeId) {
        List<Usuario> usuarios;
        if (zonaId != null && sedeId != null) {
            usuarios = usuarioRepository.findByRoles_NombreAndZonas_IdAndSede_Id(ERol.ROLE_SEGURIDAD, zonaId, sedeId);
        } else if (zonaId != null) {
            usuarios = usuarioRepository.findByRoles_NombreAndZonas_Id(ERol.ROLE_SEGURIDAD, zonaId);
        } else if (sedeId != null) {
            usuarios = usuarioRepository.findByRoles_NombreAndSede_Id(ERol.ROLE_SEGURIDAD, sedeId);
        } else {
            usuarios = usuarioRepository.findByRoles_Nombre(ERol.ROLE_SEGURIDAD);
        }

        return usuarios.stream().map(usuario -> {
            UsuarioDTO usuarioDTO = new UsuarioDTO();
            usuarioDTO.setId(usuario.getId());
            usuarioDTO.setNombreCompleto(usuario.getNombreCompleto());
            usuarioDTO.setUsername(usuario.getUsername());
            usuarioDTO.setCorreo(usuario.getCorreo());
            usuarioDTO.setTelefono(usuario.getTelefono());
            usuarioDTO.setTipoUsuario(usuario.getTipoUsuario());
            usuarioDTO.setSedeNombre(usuario.getSede() != null ? usuario.getSede().getNombre() : null);
            usuarioDTO.setZonasNombres(usuario.getZonas().stream()
                    .map(zona -> zona.getNombre())
                    .collect(Collectors.toList()));
            usuarioDTO.setIntentos(usuario.getIntentosReporte());
            usuarioDTO.setFechaUltimoReporte(usuario.getFechaUltimoReporte());
            usuarioDTO.setEnabled(usuario.isEnabled());
            usuarioDTO.setRoles(usuario.getRoles().stream()
                    .map(rol -> rol.getNombre().name())
                    .collect(Collectors.toList()));
            return usuarioDTO;
        }).collect(Collectors.toList());
    }

    @Override
    public UsuarioDTO findByCodigo(String codigo) {
        return usuarioRepository.findByUsername(codigo)
                .map(usuario -> {
                    UsuarioDTO usuarioDTO = new UsuarioDTO();
                    usuarioDTO.setId(usuario.getId());
                    usuarioDTO.setNombreCompleto(usuario.getNombreCompleto());
                    usuarioDTO.setUsername(usuario.getUsername());
                    usuarioDTO.setCorreo(usuario.getCorreo());
                    usuarioDTO.setTelefono(usuario.getTelefono());
                    usuarioDTO.setTipoUsuario(usuario.getTipoUsuario());
                    usuarioDTO.setSedeNombre(usuario.getSede() != null ? usuario.getSede().getNombre() : null);
                    usuarioDTO.setZonasNombres(usuario.getZonas().stream()
                            .map(zona -> zona.getNombre())
                            .collect(Collectors.toList()));
                    usuarioDTO.setIntentos(usuario.getIntentosReporte());
                    usuarioDTO.setFechaUltimoReporte(usuario.getFechaUltimoReporte());
                    usuarioDTO.setEnabled(usuario.isEnabled());
                    usuarioDTO.setRoles(usuario.getRoles().stream()
                            .map(rol -> rol.getNombre().name())
                            .collect(Collectors.toList()));
                    return usuarioDTO;
                })
                .orElse(null); // Return null if user not found
    }

    @Override
    public List<UsuarioDTO> getUsuariosByEnabledStatus(boolean enabled) {
        List<Usuario> usuarios = usuarioRepository.findByEnabled(enabled);
        return usuarios.stream().map(usuario -> {
            UsuarioDTO usuarioDTO = new UsuarioDTO();
            usuarioDTO.setId(usuario.getId());
            usuarioDTO.setNombreCompleto(usuario.getNombreCompleto());
            usuarioDTO.setUsername(usuario.getUsername());
            usuarioDTO.setCorreo(usuario.getCorreo());
            usuarioDTO.setTelefono(usuario.getTelefono());
            usuarioDTO.setTipoUsuario(usuario.getTipoUsuario());
            usuarioDTO.setSedeNombre(usuario.getSede() != null ? usuario.getSede().getNombre() : null);
            usuarioDTO.setZonasNombres(usuario.getZonas().stream()
                    .map(zona -> zona.getNombre())
                    .collect(Collectors.toList()));
            usuarioDTO.setIntentos(usuario.getIntentosReporte());
            usuarioDTO.setFechaUltimoReporte(usuario.getFechaUltimoReporte());
            usuarioDTO.setEnabled(usuario.isEnabled());
            usuarioDTO.setRoles(usuario.getRoles().stream()
                    .map(rol -> rol.getNombre().name())
                    .collect(Collectors.toList()));
            return usuarioDTO;
        }).collect(Collectors.toList());
    }

    @Override
    public UsuarioDTO updateUsuarioEnabledStatus(Long id, boolean enabled) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setEnabled(enabled);
                    Usuario updatedUsuario = usuarioRepository.save(usuario);
                    UsuarioDTO usuarioDTO = new UsuarioDTO();
                    usuarioDTO.setId(updatedUsuario.getId());
                    usuarioDTO.setNombreCompleto(updatedUsuario.getNombreCompleto());
                    usuarioDTO.setUsername(updatedUsuario.getUsername());
                    usuarioDTO.setCorreo(updatedUsuario.getCorreo());
                    usuarioDTO.setTelefono(updatedUsuario.getTelefono());
                    usuarioDTO.setTipoUsuario(updatedUsuario.getTipoUsuario());
                    usuarioDTO.setSedeNombre(updatedUsuario.getSede() != null ? updatedUsuario.getSede().getNombre() : null);
                    usuarioDTO.setZonasNombres(updatedUsuario.getZonas().stream()
                            .map(zona -> zona.getNombre())
                            .collect(Collectors.toList()));
                    usuarioDTO.setIntentos(updatedUsuario.getIntentosReporte());
                    usuarioDTO.setFechaUltimoReporte(updatedUsuario.getFechaUltimoReporte());
                    usuarioDTO.setEnabled(updatedUsuario.isEnabled());
                    usuarioDTO.setRoles(updatedUsuario.getRoles().stream()
                            .map(rol -> rol.getNombre().name())
                            .collect(Collectors.toList()));
                    return usuarioDTO;
                })
                .orElse(null); // Return null if user not found
    }
}
