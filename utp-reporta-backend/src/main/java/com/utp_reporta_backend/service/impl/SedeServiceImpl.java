package com.utp_reporta_backend.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.utp_reporta_backend.dto.SedeDTO;
import com.utp_reporta_backend.model.Sede;
import com.utp_reporta_backend.repository.SedeRepository;
import com.utp_reporta_backend.service.SedeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SedeServiceImpl implements SedeService {
	private final SedeRepository sedeRepository;

	@Override
	public List<SedeDTO> obtenerTodasLasSedes() {
		return sedeRepository.findAll().stream().map(sede -> {
			SedeDTO dto = new SedeDTO();
			dto.setId(sede.getId());
			dto.setNombre(sede.getNombre());
			return dto;
		}).collect(Collectors.toList());
	}

	@Override
	public Optional<SedeDTO> obtenerSedePorId(Long id) {
		return sedeRepository.findById(id).map(sede -> {
			SedeDTO dto = new SedeDTO();
			dto.setId(sede.getId());
			dto.setNombre(sede.getNombre());
			return dto;
		});
	}

	@Override
	public SedeDTO crearSede(SedeDTO dto) {
		
		Sede sede = new Sede();
		sede.setNombre(dto.getNombre());

		Sede guardada = sedeRepository.save(sede);

		SedeDTO respuesta = new SedeDTO();
		respuesta.setId(guardada.getId());
		respuesta.setNombre(guardada.getNombre());

		return respuesta;
	}

	@Override
	public Optional<SedeDTO> actualizarSede(Long id, SedeDTO dto) {
		return sedeRepository.findById(id).map(sedeExistente -> {
			sedeExistente.setNombre(dto.getNombre());
			Sede actualizada = sedeRepository.save(sedeExistente);

			SedeDTO respuesta = new SedeDTO();
			respuesta.setId(actualizada.getId());
			respuesta.setNombre(actualizada.getNombre());

			return respuesta;
		});
	}

	@Override
	public void eliminarSede(Long id) {
		sedeRepository.deleteById(id);

	}

}
