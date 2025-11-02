package com.utp_reporta_backend.service;

import com.utp_reporta_backend.dto.ReporteDTO;
import com.utp_reporta_backend.enums.EstadoReporte;
import com.utp_reporta_backend.enums.PrioridadReporte;
import java.io.IOException;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;

public interface ReporteService {
    void exportToExcel(HttpServletResponse response) throws IOException;
    List<ReporteDTO> getAllReportes();
    ReporteDTO getReporteById(Long id);
    List<ReporteDTO> getFilteredReportes(Long zonaId, Long sedeId);
    List<ReporteDTO> getFilteredReports(PrioridadReporte prioridad, EstadoReporte estado, Boolean isAnonimo);
    ReporteDTO createReporte(Long tipoIncidenteId, Long zonaId, String descripcion, MultipartFile foto, Boolean isAnonimo, String contacto, Long usuarioId);
    ReporteDTO updateReporte(Long id, Long tipoIncidenteId, Long zonaId, String descripcion, MultipartFile foto, Boolean isAnonimo, String contacto, Long usuarioId);
    void deleteReporte(Long id);
    List<ReporteDTO> getReportsByUsername(String username);
}
