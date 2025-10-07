package com.utp_reporta_backend.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.utp_reporta_backend.dto.ZonaDTO;
import com.utp_reporta_backend.repository.ZonaRepository;
import com.utp_reporta_backend.service.ZonaService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ZonaServiceImpl implements ZonaService{
	
	private final ZonaRepository zonaRepository;
	
	@Override
	public List<ZonaDTO> obtenerTodasLasZonas() {
		return zonaRepository.findAll().stream().map(zona -> {
			ZonaDTO dto = new ZonaDTO();
			dto.setId(zona.getId());
			dto.setNombre(zona.getNombre());
			dto.setSedeId(zona.getSede().getId()); // Set sedeId
			return dto;
		}).collect(Collectors.toList());
	}

	@Override
	public List<ZonaDTO> obtenerZonasPorSedeId(Long sedeId) {
		return zonaRepository.findBySedeId(sedeId).stream().map(zona -> {
			ZonaDTO dto = new ZonaDTO();
			dto.setId(zona.getId());
			dto.setNombre(zona.getNombre());
			dto.setSedeId(zona.getSede().getId()); // Set sedeId
			return dto;
		}).collect(Collectors.toList());
	}
}
