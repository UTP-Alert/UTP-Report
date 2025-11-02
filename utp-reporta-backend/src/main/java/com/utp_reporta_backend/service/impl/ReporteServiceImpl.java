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
import com.utp_reporta_backend.service.IReporteGestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import com.utp_reporta_backend.enums.EstadoReporte;
import com.utp_reporta_backend.enums.PrioridadReporte;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.utp_reporta_backend.enums.ERol;

import jakarta.servlet.http.HttpServletResponse;

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

    @Autowired
    private IReporteGestionService reporteGestionService;

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
                    if (reporte.getSeguridadAsignado() != null)
                        dto.setSeguridadAsignadoId(reporte.getSeguridadAsignado().getId());
                    if (reporte.getReporteGestion() != null) {
                        ReporteGestionDTO gestionDTO = new ReporteGestionDTO();
                        gestionDTO.setId(reporte.getReporteGestion().getId());
                        gestionDTO.setEstado(reporte.getReporteGestion().getEstado());
                        gestionDTO.setPrioridad(reporte.getReporteGestion().getPrioridad());
                        gestionDTO.setFechaActualizacion(reporte.getReporteGestion().getFechaActualizacion());
                        dto.setReporteGestion(gestionDTO);
                    }
                    dto.setMensajeSeguridad(reporte.getMensajeSeguridad());
                    dto.setMensajeAdmin(reporte.getMensajeAdmin());
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
            if (r.getSeguridadAsignado() != null)
                dto.setSeguridadAsignadoId(r.getSeguridadAsignado().getId());
            if (r.getReporteGestion() != null) {
                ReporteGestionDTO gestionDTO = new ReporteGestionDTO();
                gestionDTO.setId(r.getReporteGestion().getId());
                gestionDTO.setEstado(r.getReporteGestion().getEstado());
                gestionDTO.setPrioridad(r.getReporteGestion().getPrioridad());
                gestionDTO.setFechaActualizacion(r.getReporteGestion().getFechaActualizacion());
                dto.setReporteGestion(gestionDTO);
            }
            dto.setMensajeSeguridad(r.getMensajeSeguridad());
            dto.setMensajeAdmin(r.getMensajeAdmin());
            return dto;
        }).orElse(null);
    }

    @Override
    public ReporteDTO createReporte(Long tipoIncidenteId, Long zonaId, String descripcion, MultipartFile foto,
            Boolean isAnonimo, String contacto, Long usuarioId) {
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

        // fin de la lógica
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

        // Crear la gestión inicial en estado PENDIENTE para que el reporte tenga
        // reporteGestion desde su creación
        ReporteGestionDTO createdGestionDto = null;
        try {
            createdGestionDto = reporteGestionService.updateReporteGestion(savedReporte.getId(),
                    EstadoReporte.PENDIENTE, null, null);
        } catch (Exception e) {
            // No detener la creación del reporte por un fallo al crear la gestión; pero
            // loguear en futura iteración.
        }

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
        // Si el servicio de gestión devolvió DTO, usarlo; si no, intentar reconsultar
        // la entidad para anexar la gestión
        if (createdGestionDto != null) {
            savedDto.setReporteGestion(createdGestionDto);
        } else {
            Optional<Reporte> maybe = reporteRepository.findById(savedReporte.getId());
            if (maybe.isPresent() && maybe.get().getReporteGestion() != null) {
                ReporteGestionDTO gestionDTO = new ReporteGestionDTO();
                gestionDTO.setId(maybe.get().getReporteGestion().getId());
                gestionDTO.setEstado(maybe.get().getReporteGestion().getEstado());
                gestionDTO.setPrioridad(maybe.get().getReporteGestion().getPrioridad());
                gestionDTO.setFechaActualizacion(maybe.get().getReporteGestion().getFechaActualizacion());
                savedDto.setReporteGestion(gestionDTO);
            }
        }
        return savedDto;
    }

    @Override
    public ReporteDTO updateReporte(Long id, Long tipoIncidenteId, Long zonaId, String descripcion, MultipartFile foto,
            Boolean isAnonimo, String contacto, Long usuarioId) {
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
    public List<ReporteDTO> getReportsByUsername(String username) {
        return reporteRepository.findByUsuarioUsername(username).stream()
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
                    if (reporte.getSeguridadAsignado() != null)
                        dto.setSeguridadAsignadoId(reporte.getSeguridadAsignado().getId());
                    if (reporte.getReporteGestion() != null) {
                        ReporteGestionDTO gestionDTO = new ReporteGestionDTO();
                        gestionDTO.setId(reporte.getReporteGestion().getId());
                        gestionDTO.setEstado(reporte.getReporteGestion().getEstado());
                        gestionDTO.setPrioridad(reporte.getReporteGestion().getPrioridad());
                        gestionDTO.setFechaActualizacion(reporte.getReporteGestion().getFechaActualizacion());
                        dto.setReporteGestion(gestionDTO);
                    }
                    dto.setMensajeSeguridad(reporte.getMensajeSeguridad());
                    dto.setMensajeAdmin(reporte.getMensajeAdmin());
                    return dto;
                })
                .collect(Collectors.toList());
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
                    if (reporte.getSeguridadAsignado() != null)
                        dto.setSeguridadAsignadoId(reporte.getSeguridadAsignado().getId());
                    if (reporte.getReporteGestion() != null) {
                        ReporteGestionDTO gestionDTO = new ReporteGestionDTO();
                        gestionDTO.setId(reporte.getReporteGestion().getId());
                        gestionDTO.setEstado(reporte.getReporteGestion().getEstado());
                        gestionDTO.setPrioridad(reporte.getReporteGestion().getPrioridad());
                        gestionDTO.setFechaActualizacion(reporte.getReporteGestion().getFechaActualizacion());
                        dto.setReporteGestion(gestionDTO);
                    }
                    dto.setMensajeSeguridad(reporte.getMensajeSeguridad());
                    dto.setMensajeAdmin(reporte.getMensajeAdmin());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ReporteDTO> getFilteredReports(PrioridadReporte prioridad, EstadoReporte estado, Boolean isAnonimo) {
        List<Reporte> reportes;

        if (prioridad != null && estado != null && isAnonimo != null) {
            reportes = reporteRepository.findByReporteGestion_PrioridadAndReporteGestion_EstadoAndIsAnonimo(prioridad,
                    estado, isAnonimo);
        } else if (prioridad != null && estado != null) {
            reportes = reporteRepository.findByReporteGestion_PrioridadAndReporteGestion_Estado(prioridad, estado);
        } else if (prioridad != null && isAnonimo != null) {
            reportes = reporteRepository.findByReporteGestion_PrioridadAndIsAnonimo(prioridad, isAnonimo);
        } else if (estado != null && isAnonimo != null) {
            reportes = reporteRepository.findByReporteGestion_EstadoAndIsAnonimo(estado, isAnonimo);
        } else if (prioridad != null) {
            reportes = reporteRepository.findByReporteGestion_Prioridad(prioridad);
        } else if (estado != null) {
            reportes = reporteRepository.findByReporteGestion_Estado(estado);
        } else if (isAnonimo != null) {
            reportes = reporteRepository.findByIsAnonimo(isAnonimo);
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
                    if (reporte.getSeguridadAsignado() != null)
                        dto.setSeguridadAsignadoId(reporte.getSeguridadAsignado().getId());
                    if (reporte.getReporteGestion() != null) {
                        ReporteGestionDTO gestionDTO = new ReporteGestionDTO();
                        gestionDTO.setId(reporte.getReporteGestion().getId());
                        gestionDTO.setEstado(reporte.getReporteGestion().getEstado());
                        gestionDTO.setPrioridad(reporte.getReporteGestion().getPrioridad());
                        gestionDTO.setFechaActualizacion(reporte.getReporteGestion().getFechaActualizacion());
                        dto.setReporteGestion(gestionDTO);
                    }
                    dto.setMensajeSeguridad(reporte.getMensajeSeguridad());
                    dto.setMensajeAdmin(reporte.getMensajeAdmin());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public void exportToExcel(HttpServletResponse response) throws IOException {
        List<ReporteDTO> reportes = getAllReportes();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Reportes");

        // Title
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Reporte de Incidentes Sensibles");
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 12));
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex()); // Color de fondo para el título
        titleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        titleStyle.setBorderBottom(BorderStyle.THIN);
        titleStyle.setBorderTop(BorderStyle.THIN);
        titleStyle.setBorderLeft(BorderStyle.THIN);
        titleStyle.setBorderRight(BorderStyle.THIN);
        titleCell.setCellStyle(titleStyle);

        // Header
        Row headerRow = sheet.createRow(2);
        String[] headers = { "ID", "Tipo Incidente", "Zona", "Descripción", "Fecha Creación", "Anónimo", "Contacto",
                "Usuario", "Seguridad Asignado", "Estado", "Prioridad", "Mensaje Seguridad", "Mensaje Admin" };
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setColor(IndexedColors.WHITE.getIndex()); // Color de texto blanco para el encabezado
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex()); // Color de fondo para el encabezado
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setAlignment(HorizontalAlignment.CENTER); // Centrar texto del encabezado
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
            sheet.autoSizeColumn(i); // Auto-ajustar columnas
        }

        // Data
        int rowNum = 3;
        CellStyle evenRowStyle = workbook.createCellStyle();
        evenRowStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex()); // Color para filas pares
        evenRowStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        evenRowStyle.setBorderBottom(BorderStyle.THIN);
        evenRowStyle.setBorderTop(BorderStyle.THIN);
        evenRowStyle.setBorderLeft(BorderStyle.THIN);
        evenRowStyle.setBorderRight(BorderStyle.THIN);
        evenRowStyle.setWrapText(true); // Habilitar ajuste de texto

        CellStyle oddRowStyle = workbook.createCellStyle(); // Estilo para filas impares (sin color de fondo)
        oddRowStyle.setBorderBottom(BorderStyle.THIN);
        oddRowStyle.setBorderTop(BorderStyle.THIN);
        oddRowStyle.setBorderLeft(BorderStyle.THIN);
        oddRowStyle.setBorderRight(BorderStyle.THIN);
        oddRowStyle.setWrapText(true); // Habilitar ajuste de texto

        // Conditional styles for Priority
        CellStyle highPriorityStyle = workbook.createCellStyle();
        highPriorityStyle.setFillForegroundColor(IndexedColors.RED.getIndex());
        highPriorityStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font highPriorityFont = workbook.createFont();
        highPriorityFont.setColor(IndexedColors.WHITE.getIndex());
        highPriorityStyle.setFont(highPriorityFont);
        highPriorityStyle.setBorderBottom(BorderStyle.THIN);
        highPriorityStyle.setBorderTop(BorderStyle.THIN);
        highPriorityStyle.setBorderLeft(BorderStyle.THIN);
        highPriorityStyle.setBorderRight(BorderStyle.THIN);

        CellStyle mediumPriorityStyle = workbook.createCellStyle();
        mediumPriorityStyle.setFillForegroundColor(IndexedColors.ORANGE.getIndex());
        mediumPriorityStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font mediumPriorityFont = workbook.createFont();
        mediumPriorityFont.setColor(IndexedColors.WHITE.getIndex());
        mediumPriorityStyle.setFont(mediumPriorityFont);
        mediumPriorityStyle.setBorderBottom(BorderStyle.THIN);
        mediumPriorityStyle.setBorderTop(BorderStyle.THIN);
        mediumPriorityStyle.setBorderLeft(BorderStyle.THIN);
        mediumPriorityStyle.setBorderRight(BorderStyle.THIN);

        CellStyle lowPriorityStyle = workbook.createCellStyle();
        lowPriorityStyle.setFillForegroundColor(IndexedColors.GREEN.getIndex());
        lowPriorityStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font lowPriorityFont = workbook.createFont();
        lowPriorityFont.setColor(IndexedColors.WHITE.getIndex());
        lowPriorityStyle.setFont(lowPriorityFont);
        lowPriorityStyle.setBorderBottom(BorderStyle.THIN);
        lowPriorityStyle.setBorderTop(BorderStyle.THIN);
        lowPriorityStyle.setBorderLeft(BorderStyle.THIN);
        lowPriorityStyle.setBorderRight(BorderStyle.THIN);


        for (ReporteDTO reporte : reportes) {
            Row row = sheet.createRow(rowNum++);
            CellStyle currentRowStyle = (rowNum % 2 == 0) ? evenRowStyle : oddRowStyle; // Alternar estilos

            Cell cell0 = row.createCell(0);
            cell0.setCellValue(reporte.getId());
            cell0.setCellStyle(currentRowStyle);

            TipoIncidente tipoIncidente = tipoIncidenteRepository.getById(reporte.getTipoIncidenteId());
            Cell cell1 = row.createCell(1);
            cell1.setCellValue(tipoIncidente.getNombre());
            cell1.setCellStyle(currentRowStyle);

            Zona zona = zonaRepository.getById(reporte.getZonaId());
            Cell cell2 = row.createCell(2);
            cell2.setCellValue(zona.getNombre());
            cell2.setCellStyle(currentRowStyle);

            Cell cell3 = row.createCell(3);
            cell3.setCellValue(reporte.getDescripcion());
            cell3.setCellStyle(currentRowStyle);

            Cell cell4 = row.createCell(4);
            cell4.setCellValue(reporte.getFechaCreacion().toString());
            cell4.setCellStyle(currentRowStyle);

            Cell cell5 = row.createCell(5);
            cell5.setCellValue(reporte.getIsAnonimo());
            cell5.setCellStyle(currentRowStyle);

            Cell cell6 = row.createCell(6);
            cell6.setCellValue(reporte.getContacto());
            cell6.setCellStyle(currentRowStyle);

            Usuario usuario = usuarioRepository.getById(reporte.getUsuarioId());
            Cell cell7 = row.createCell(7);
            cell7.setCellValue(usuario.getNombreCompleto());
            cell7.setCellStyle(currentRowStyle);

            if (reporte.getSeguridadAsignadoId() != null) {
                Usuario seguridad = usuarioRepository.getById(reporte.getSeguridadAsignadoId());
                Cell cell8 = row.createCell(8);
                cell8.setCellValue(seguridad.getNombreCompleto());
                cell8.setCellStyle(currentRowStyle);
            } else {
                Cell cell8 = row.createCell(8);
                cell8.setCellValue("");
                cell8.setCellStyle(currentRowStyle);
            }

            if (reporte.getReporteGestion() != null) {
                if (reporte.getReporteGestion().getEstado() != null) {
                    Cell cell9 = row.createCell(9);
                    cell9.setCellValue(reporte.getReporteGestion().getEstado().toString());
                    cell9.setCellStyle(currentRowStyle);
                } else {
                    Cell cell9 = row.createCell(9);
                    cell9.setCellValue("");
                    cell9.setCellStyle(currentRowStyle);
                }
                if (reporte.getReporteGestion().getPrioridad() != null) {
                    Cell cell10 = row.createCell(10);
                    cell10.setCellValue(reporte.getReporteGestion().getPrioridad().toString());
                    
                    // Apply conditional style based on priority
                    if (reporte.getReporteGestion().getPrioridad().equals(PrioridadReporte.ALTA.toString())) {
                        cell10.setCellStyle(highPriorityStyle);
                    } else if (reporte.getReporteGestion().getPrioridad().equals(PrioridadReporte.MEDIA.toString())) {
                        cell10.setCellStyle(mediumPriorityStyle);
                    } else if (reporte.getReporteGestion().getPrioridad().equals(PrioridadReporte.BAJA.toString())) {
                        cell10.setCellStyle(lowPriorityStyle);
                    } else {
                        cell10.setCellStyle(currentRowStyle);
                    }
                } else {
                    Cell cell10 = row.createCell(10);
                    cell10.setCellValue("");
                    cell10.setCellStyle(currentRowStyle);
                }
            } else {
                Cell cell9 = row.createCell(9);
                cell9.setCellValue("");
                cell9.setCellStyle(currentRowStyle);
                Cell cell10 = row.createCell(10);
                cell10.setCellValue("");
                cell10.setCellStyle(currentRowStyle);
            }

            Cell cell11 = row.createCell(11);
            cell11.setCellValue(reporte.getMensajeSeguridad());
            cell11.setCellStyle(currentRowStyle);

            Cell cell12 = row.createCell(12);
            cell12.setCellValue(reporte.getMensajeAdmin());
            cell12.setCellStyle(currentRowStyle);
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
           
        }
        
        // Set response headers for file download
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"reportes.xlsx\"");

        workbook.write(response.getOutputStream());
        workbook.close();
    }
}
