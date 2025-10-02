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
		return zonaRepository.findAll().stream().map(sede -> {
			ZonaDTO dto = new ZonaDTO();
			dto.setId(sede.getId());
			dto.setNombre(sede.getNombre());
			return dto;
		}).collect(Collectors.toList());
	}

	

}
