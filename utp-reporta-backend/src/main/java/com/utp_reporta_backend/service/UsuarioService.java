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
}
