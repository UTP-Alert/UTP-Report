package com.utp_reporta_backend.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.utp_reporta_backend.dto.ZonaDTO;


public interface ZonaService {
	List<ZonaDTO> obtenerTodasLasZonas();
	List<ZonaDTO> obtenerZonasPorSedeId(Long sedeId);
	ZonaDTO crearZona(String nombre, String descripcion, MultipartFile foto, Long sedeId);
	ZonaDTO updateZona(Long id, String nombre, String descripcion, MultipartFile foto, Long sedeId);
	void deleteZona(Long id);
}
