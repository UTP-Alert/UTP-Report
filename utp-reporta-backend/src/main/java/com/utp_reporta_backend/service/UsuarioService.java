package com.utp_reporta_backend.service;

import com.utp_reporta_backend.dto.UsuarioDTO;
import java.util.List;

public interface UsuarioService {
    List<UsuarioDTO> getAllUsuarios();
    List<UsuarioDTO> getUsuariosByRolUsuario();
    List<UsuarioDTO> getUsuariosByRolAdmin();
    List<UsuarioDTO> getUsuariosByRolSeguridad();
    List<UsuarioDTO> getFilteredSeguridadUsers(Long zonaId, Long sedeId);
    List<UsuarioDTO> getUsuariosByTipoDocente();
    List<UsuarioDTO> getUsuariosByTipoAlumno();
    UsuarioDTO findByCodigo(String codigo);
    List<UsuarioDTO> getUsuariosByEnabledStatus(boolean enabled);
    UsuarioDTO updateUsuarioEnabledStatus(Long id, boolean enabled);
    UsuarioDTO updateUsuario(Long id, UsuarioDTO usuarioDTO, String password); // Optional password as parameter
    List<UsuarioDTO> getAllUsersExcludingSuperAdmin();
    Boolean isTelefonoUnique(String telefono, Long id); // New method for phone number uniqueness check
}
