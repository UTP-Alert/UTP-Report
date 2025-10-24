package com.utp_reporta_backend.service.impl;

import com.utp_reporta_backend.dto.ReporteDTO;
import com.utp_reporta_backend.model.Reporte;
import com.utp_reporta_backend.model.TipoIncidente;
import com.utp_reporta_backend.model.Usuario;
import com.utp_reporta_backend.model.Zona;
import com.utp_reporta_backend.repository.ReporteRepository;
import com.utp_reporta_backend.repository.TipoIncidenteRepository;
import com.utp_reporta_backend.repository.UsuarioRepository;
import com.utp_reporta_backend.repository.ZonaRepository;
import com.utp_reporta_backend.service.ReporteService;
import com.utp_reporta_backend.dto.ReporteGestionDTO;
import com.utp_reporta_backend.service.TimeService; // Import TimeService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.utp_reporta_backend.enums.ERol;

@Service
public class ReporteServiceImpl implements ReporteService {

    @Autowired
    private ReporteRepository reporteRepository;

    @Autowired
    private TipoIncidenteRepository tipoIncidenteRepository;

    @Autowired
    private ZonaRepository zonaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TimeService timeService; // Inject TimeService

    @Override
    public List<ReporteDTO> getAllReportes() {
        return reporteRepository.findAll().stream()
                .map(reporte -> {
                    ReporteDTO dto = new ReporteDTO();
                    dto.setId(reporte.getId());
                    dto.setTipoIncidenteId(reporte.getTipoIncidente().getId());
                    dto.setZonaId(reporte.getZona().getId());
                    dto.setDescripcion(reporte.getDescripcion());
                    dto.setFoto(reporte.getFoto());
                    dto.setFechaCreacion(reporte.getFechaCreacion());
                    dto.setIsAnonimo(reporte.getIsAnonimo());
                    dto.setContacto(reporte.getContacto());
                    dto.setUsuarioId(reporte.getUsuario().getId());
                    if(reporte.getSeguridadAsignado() != null) dto.setSeguridadAsignadoId(reporte.getSeguridadAsignado().getId());
                    if(reporte.getReporteGestion() != null){
                        ReporteGestionDTO gestionDTO = new ReporteGestionDTO();
                        gestionDTO.setId(reporte.getReporteGestion().getId());
                        gestionDTO.setEstado(reporte.getReporteGestion().getEstado());
                        gestionDTO.setPrioridad(reporte.getReporteGestion().getPrioridad());
                        gestionDTO.setFechaActualizacion(reporte.getReporteGestion().getFechaActualizacion());
                        dto.setReporteGestion(gestionDTO);
                    }
                    dto.setMensajeSeguridad(reporte.getMensajeSeguridad());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public ReporteDTO getReporteById(Long id) {
        Optional<Reporte> reporte = reporteRepository.findById(id);
        return reporte.map(r -> {
            ReporteDTO dto = new ReporteDTO();
            dto.setId(r.getId());
            dto.setTipoIncidenteId(r.getTipoIncidente().getId());
            dto.setZonaId(r.getZona().getId());
            dto.setDescripcion(r.getDescripcion());
            dto.setFoto(r.getFoto());
            dto.setFechaCreacion(r.getFechaCreacion());
            dto.setIsAnonimo(r.getIsAnonimo());
            dto.setContacto(r.getContacto());
            dto.setUsuarioId(r.getUsuario().getId());
            if(r.getSeguridadAsignado() != null) dto.setSeguridadAsignadoId(r.getSeguridadAsignado().getId());
            if(r.getReporteGestion() != null){
                ReporteGestionDTO gestionDTO = new ReporteGestionDTO();
                gestionDTO.setId(r.getReporteGestion().getId());
                gestionDTO.setEstado(r.getReporteGestion().getEstado());
                gestionDTO.setPrioridad(r.getReporteGestion().getPrioridad());
                gestionDTO.setFechaActualizacion(r.getReporteGestion().getFechaActualizacion());
                dto.setReporteGestion(gestionDTO);
            }
            dto.setMensajeSeguridad(r.getMensajeSeguridad());
            return dto;
        }).orElse(null);
    }

    @Override
    public ReporteDTO createReporte(Long tipoIncidenteId, Long zonaId, String descripcion, MultipartFile foto, Boolean isAnonimo, String contacto, Long usuarioId) {
        Reporte reporte = new Reporte();

        TipoIncidente tipoIncidente = tipoIncidenteRepository.findById(tipoIncidenteId)
                .orElseThrow(() -> new RuntimeException("TipoIncidente not found"));
        reporte.setTipoIncidente(tipoIncidente);

        Zona zona = zonaRepository.findById(zonaId)
                .orElseThrow(() -> new RuntimeException("Zona not found"));
        reporte.setZona(zona);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario not found"));
        reporte.setUsuario(usuario);

        // Lógica para limitar reportes diarios para usuarios con rol "USUARIO"
        boolean isUserRole = usuario.getRoles().stream()
                                    .anyMatch(rol -> rol.getNombre().equals(ERol.ROLE_USUARIO));

        if (isUserRole) {
            LocalDate today = timeService.getCurrentLocalDatePeru(); // Use TimeService
            if (usuario.getFechaUltimoReporte() == null || !usuario.getFechaUltimoReporte().equals(today)) {
                usuario.setFechaUltimoReporte(today);
                usuario.setIntentosReporte(1);
            } else {
                if (usuario.getIntentosReporte() >= 3) {
                    throw new RuntimeException("Ha alcanzado el límite de 3 reportes por día.");
                }
                usuario.setIntentosReporte(usuario.getIntentosReporte() + 1);
            }
            usuarioRepository.save(usuario); // Guardar los cambios en el usuario
        }

        //fin de la lógica
        reporte.setDescripcion(descripcion);
        if (foto != null && !foto.isEmpty()) {
            try {
                reporte.setFoto(foto.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Error al procesar la foto", e);
            }
        }
        reporte.setIsAnonimo(isAnonimo);
        reporte.setContacto(contacto);
        reporte.setFechaCreacion(timeService.getCurrentLocalDateTimePeru()); // Use TimeService

        Reporte savedReporte = reporteRepository.save(reporte);

        ReporteDTO savedDto = new ReporteDTO();
        savedDto.setId(savedReporte.getId());
        savedDto.setTipoIncidenteId(savedReporte.getTipoIncidente().getId());
        savedDto.setZonaId(savedReporte.getZona().getId());
        savedDto.setDescripcion(savedReporte.getDescripcion());
        savedDto.setFoto(savedReporte.getFoto());
        savedDto.setFechaCreacion(savedReporte.getFechaCreacion());
        savedDto.setIsAnonimo(savedReporte.getIsAnonimo());
        savedDto.setContacto(savedReporte.getContacto());
        savedDto.setUsuarioId(savedReporte.getUsuario().getId());
        return savedDto;
    }

    @Override
    public ReporteDTO updateReporte(Long id, Long tipoIncidenteId, Long zonaId, String descripcion, MultipartFile foto, Boolean isAnonimo, String contacto, Long usuarioId) {
        Optional<Reporte> reporte = reporteRepository.findById(id);
        if (reporte.isPresent()) {
            Reporte existingReporte = reporte.get();

            tipoIncidenteRepository.findById(tipoIncidenteId)
                    .ifPresent(existingReporte::setTipoIncidente);
            zonaRepository.findById(zonaId).ifPresent(existingReporte::setZona);
            usuarioRepository.findById(usuarioId).ifPresent(existingReporte::setUsuario);

            existingReporte.setDescripcion(descripcion);
            if (foto != null && !foto.isEmpty()) {
                try {
                    existingReporte.setFoto(foto.getBytes());
                } catch (IOException e) {
                    throw new RuntimeException("Error al procesar la foto", e);
                }
            }
            existingReporte.setIsAnonimo(isAnonimo);
            existingReporte.setContacto(contacto);

            Reporte updatedReporte = reporteRepository.save(existingReporte);

            ReporteDTO updatedDto = new ReporteDTO();
            updatedDto.setId(updatedReporte.getId());
            updatedDto.setTipoIncidenteId(updatedReporte.getTipoIncidente().getId());
            updatedDto.setZonaId(updatedReporte.getZona().getId());
            updatedDto.setDescripcion(updatedReporte.getDescripcion());
            updatedDto.setFoto(updatedReporte.getFoto());
            updatedDto.setFechaCreacion(updatedReporte.getFechaCreacion());
            updatedDto.setIsAnonimo(updatedReporte.getIsAnonimo());
            updatedDto.setContacto(updatedReporte.getContacto());
            updatedDto.setUsuarioId(updatedReporte.getUsuario().getId());
            return updatedDto;
        }
        return null;
    }

    @Override
    public void deleteReporte(Long id) {
        reporteRepository.deleteById(id);
    }

    @Override
    public List<ReporteDTO> getFilteredReportes(Long zonaId, Long sedeId) {
        List<Reporte> reportes;
        if (zonaId != null && sedeId != null) {
            reportes = reporteRepository.findByZonaIdAndZonaSedeId(zonaId, sedeId);
        } else if (zonaId != null) {
            reportes = reporteRepository.findByZonaId(zonaId);
        } else if (sedeId != null) {
            reportes = reporteRepository.findByZonaSedeId(sedeId);
        } else {
            reportes = reporteRepository.findAll();
        }

        return reportes.stream()
                .map(reporte -> {
                    ReporteDTO dto = new ReporteDTO();
                    dto.setId(reporte.getId());
                    dto.setTipoIncidenteId(reporte.getTipoIncidente().getId());
                    dto.setZonaId(reporte.getZona().getId());
                    dto.setDescripcion(reporte.getDescripcion());
                    dto.setFoto(reporte.getFoto());
                    dto.setFechaCreacion(reporte.getFechaCreacion());
                    dto.setIsAnonimo(reporte.getIsAnonimo());
                    dto.setContacto(reporte.getContacto());
                    dto.setUsuarioId(reporte.getUsuario().getId());
                    if(reporte.getSeguridadAsignado() != null) dto.setSeguridadAsignadoId(reporte.getSeguridadAsignado().getId());
                    if(reporte.getReporteGestion() != null){
                        ReporteGestionDTO gestionDTO = new ReporteGestionDTO();
                        gestionDTO.setId(reporte.getReporteGestion().getId());
                        gestionDTO.setEstado(reporte.getReporteGestion().getEstado());
                        gestionDTO.setPrioridad(reporte.getReporteGestion().getPrioridad());
                        gestionDTO.setFechaActualizacion(reporte.getReporteGestion().getFechaActualizacion());
                        dto.setReporteGestion(gestionDTO);
                    }
                    dto.setMensajeSeguridad(reporte.getMensajeSeguridad());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
