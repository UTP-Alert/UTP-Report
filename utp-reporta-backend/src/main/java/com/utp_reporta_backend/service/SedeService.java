package com.utp_reporta_backend.service;

import java.util.List;
import java.util.Optional;

import com.utp_reporta_backend.dto.SedeDTO;

public interface SedeService {
	List<SedeDTO> obtenerTodasLasSedes();
	Optional<SedeDTO> obtenerSedePorId(Long id);
	SedeDTO crearSede(SedeDTO dto);
	Optional<SedeDTO> actualizarSede(Long id, SedeDTO dto);
	void eliminarSede(Long id);
}
