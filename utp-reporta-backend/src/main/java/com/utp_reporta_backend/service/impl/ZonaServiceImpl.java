package com.utp_reporta_backend.service.impl;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.utp_reporta_backend.dto.ZonaDTO;
import com.utp_reporta_backend.model.Sede;
import com.utp_reporta_backend.model.Zona;
import com.utp_reporta_backend.repository.SedeRepository;
import com.utp_reporta_backend.repository.ZonaRepository;
import com.utp_reporta_backend.service.ZonaService;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ZonaServiceImpl implements ZonaService{
	
	private final ZonaRepository zonaRepository;
	private final SedeRepository sedeRepository;
    
	@Override
	public List<ZonaDTO> obtenerTodasLasZonas() {
		return obtenerTodasLasZonas(false);
	}
    
	@Override
	public List<ZonaDTO> obtenerTodasLasZonas(boolean includeInactive) {
		List<Zona> zonas = includeInactive ? zonaRepository.findAll() : zonaRepository.findAllByActivoTrue();
		return zonas.stream().map(zona -> {
			ZonaDTO dto = new ZonaDTO();
			dto.setId(zona.getId());
			dto.setNombre(zona.getNombre());
			dto.setDescripcion(zona.getDescripcion());
			dto.setFoto(zona.getFoto());
			dto.setSedeId(zona.getSede().getId()); // Set sedeId
			dto.setActivo(zona.isActivo());
			dto.setEstado(zona.getEstado());
			dto.setReportCount(zona.getReportCount());
			return dto;
		}).collect(Collectors.toList());
	}

	@Override
	public List<ZonaDTO> obtenerZonasPorSedeId(Long sedeId) {
		return obtenerZonasPorSedeId(sedeId, false);
	}

	@Override
	public List<ZonaDTO> obtenerZonasPorSedeId(Long sedeId, boolean includeInactive) {
		List<Zona> zonas = includeInactive ? zonaRepository.findBySedeId(sedeId) : zonaRepository.findBySedeIdAndActivoTrue(sedeId);
		return zonas.stream().map(zona -> {
			ZonaDTO dto = new ZonaDTO();
			dto.setId(zona.getId());
			dto.setNombre(zona.getNombre());
			dto.setDescripcion(zona.getDescripcion());
			dto.setFoto(zona.getFoto());
			dto.setSedeId(zona.getSede().getId()); // Set sedeId
			dto.setActivo(zona.isActivo());
			dto.setEstado(zona.getEstado());
			dto.setReportCount(zona.getReportCount());
			return dto;
		}).collect(Collectors.toList());
	}

	@Override
	public ZonaDTO crearZona(String nombre, String descripcion, MultipartFile foto, Long sedeId) {
		Optional<Sede> sedeOptional = sedeRepository.findById(sedeId);
		if (!sedeOptional.isPresent()) {
			throw new RuntimeException("Sede no encontrada con ID: " + sedeId);
		}
		Sede sede = sedeOptional.get();

		Zona zona = new Zona();
		zona.setNombre(nombre);
		zona.setDescripcion(descripcion);
		if (foto != null && !foto.isEmpty()) {
            try {
                zona.setFoto(foto.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Error al procesar la foto", e);
            }
        }
		zona.setSede(sede);

		Zona savedZona = zonaRepository.save(zona);

		ZonaDTO savedZonaDTO = new ZonaDTO();
		savedZonaDTO.setId(savedZona.getId());
		savedZonaDTO.setNombre(savedZona.getNombre());
		savedZonaDTO.setDescripcion(savedZona.getDescripcion());
		savedZonaDTO.setFoto(savedZona.getFoto());
		savedZonaDTO.setSedeId(savedZona.getSede().getId());
		savedZonaDTO.setActivo(savedZona.isActivo());
		savedZonaDTO.setEstado(savedZona.getEstado());
		savedZonaDTO.setReportCount(savedZona.getReportCount());

		return savedZonaDTO;
	}

	@Override
	public ZonaDTO updateZona(Long id, String nombre, String descripcion, MultipartFile foto, Long sedeId) {
		Optional<Zona> zonaOptional = zonaRepository.findById(id);
		if (!zonaOptional.isPresent()) {
			throw new RuntimeException("Zona no encontrada con ID: " + id);
		}
		Zona zona = zonaOptional.get();

		Optional<Sede> sedeOptional = sedeRepository.findById(sedeId);
		if (!sedeOptional.isPresent()) {
			throw new RuntimeException("Sede no encontrada con ID: " + sedeId);
		}
		Sede sede = sedeOptional.get();

		zona.setNombre(nombre);
		zona.setDescripcion(descripcion);
		if (foto != null && !foto.isEmpty()) {
            try {
                zona.setFoto(foto.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Error al procesar la foto", e);
            }
        } else if (foto == null) {
            // If foto is explicitly null, clear the existing photo
            zona.setFoto(null);
        }
		zona.setSede(sede);

		Zona updatedZona = zonaRepository.save(zona);

		ZonaDTO updatedZonaDTO = new ZonaDTO();
		updatedZonaDTO.setId(updatedZona.getId());
		updatedZonaDTO.setNombre(updatedZona.getNombre());
		updatedZonaDTO.setDescripcion(updatedZona.getDescripcion());
		updatedZonaDTO.setFoto(updatedZona.getFoto());
		updatedZonaDTO.setSedeId(updatedZona.getSede().getId());
		updatedZonaDTO.setActivo(updatedZona.isActivo());
		updatedZonaDTO.setEstado(updatedZona.getEstado());
		updatedZonaDTO.setReportCount(updatedZona.getReportCount());

		return updatedZonaDTO;
	}

	@Override
	public void deleteZona(Long id) {
		Optional<Zona> zonaOptional = zonaRepository.findById(id);
		if (!zonaOptional.isPresent()) {
			throw new RuntimeException("Zona no encontrada con ID: " + id);
		}
		zonaRepository.deleteById(id);
	}

	@Override
    @Transactional
	public ZonaDTO setActivoZona(Long id, boolean activo) {
		Optional<Zona> zonaOptional = zonaRepository.findById(id);
		if (!zonaOptional.isPresent()) {
			throw new RuntimeException("Zona no encontrada con ID: " + id);
		}
		Zona zona = zonaOptional.get();
		zona.setActivo(activo);
		Zona saved = zonaRepository.save(zona);
		ZonaDTO dto = new ZonaDTO();
		dto.setId(saved.getId());
		dto.setNombre(saved.getNombre());
		dto.setDescripcion(saved.getDescripcion());
		dto.setFoto(saved.getFoto());
		dto.setSedeId(saved.getSede().getId());
		dto.setActivo(saved.isActivo());
		dto.setEstado(saved.getEstado());
		dto.setReportCount(saved.getReportCount());

		return dto;
	}
}
