import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReporteDTO {
  id: number;
  tipoIncidenteId: number;
  zonaId: number;
  descripcion: string;
  foto?: number[] | string | null;
  fechaCreacion: string;
  isAnonimo: boolean;
  contacto?: string;
  usuarioId: number;
  mensajeSeguridad?: string | null;
  mensajeAdmin?: string | null;
  // campos adicionales proporcionados por el backend para estado actual
  ultimoEstado?: string | null;
  ultimaPrioridad?: string | null;
  seguridadAsignadoId?: number | null;
  fechaUltimaGestion?: string | null;
  reporteGestion?: ReporteGestionDTO | null;
  // flag usado internamente por el frontend para filtros/local UI
  _isCancelled?: boolean;
}

export interface ReporteGestionDTO {
  id: number;
  reporteId: number;
  estado: string;
  prioridad: string;
  fechaActualizacion: string;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private baseUrl = 'http://localhost:8080/api/reportes';

  constructor(private http: HttpClient) {}

  crearReporte(params: {
    tipoIncidenteId: number;
    zonaId: number;
    descripcion: string;
    isAnonimo: boolean;
    contacto?: string;
    usuarioId: number;
    foto?: File | null;
  }): Observable<ReporteDTO> {
    const fd = new FormData();
    fd.append('tipoIncidenteId', String(params.tipoIncidenteId));
    fd.append('zonaId', String(params.zonaId));
    fd.append('descripcion', params.descripcion);
    fd.append('isAnonimo', String(params.isAnonimo));
    fd.append('usuarioId', String(params.usuarioId));
    if (params.contacto) fd.append('contacto', params.contacto);
    if (params.foto) fd.append('foto', params.foto);
    return this.http.post<ReporteDTO>(this.baseUrl, fd);
  }

  getAll(): Observable<ReporteDTO[]> {
    return this.http.get<ReporteDTO[]>(this.baseUrl);
  }

  getFiltered(zonaId?: number | null, sedeId?: number | null): Observable<ReporteDTO[]> {
    let url = `${this.baseUrl}/filter`;
    const params: string[] = [];
    if (zonaId != null) params.push(`zonaId=${encodeURIComponent(String(zonaId))}`);
    if (sedeId != null) params.push(`sedeId=${encodeURIComponent(String(sedeId))}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.http.get<ReporteDTO[]>(url);
  }

  getById(id: number): Observable<ReporteDTO> {
    return this.http.get<ReporteDTO>(`${this.baseUrl}/${id}`);
  }

  exportExcel(): Observable<Blob> {
    const url = `${this.baseUrl}/export/excel`;
    return this.http.get(url, { responseType: 'blob' });
  }

  updateGestion(reporteId: number, estado: string, prioridad: string, seguridadId?: number | null): Observable<ReporteGestionDTO> {
    let url = `${this.baseUrl}/gestion/${reporteId}`;
    const params: string[] = [];
    if (estado != null) params.push(`estado=${encodeURIComponent(estado)}`);
    if (prioridad != null) params.push(`prioridad=${encodeURIComponent(prioridad)}`);
    if (seguridadId != null) params.push(`seguridadId=${encodeURIComponent(String(seguridadId))}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.http.post<ReporteGestionDTO>(url, {});
  }

  irAZona(reporteId: number): Observable<ReporteGestionDTO> {
    return this.http.put<ReporteGestionDTO>(`${this.baseUrl}/gestion/${reporteId}/ir-a-zona`, {});
  }

  zonaUbicada(reporteId: number): Observable<ReporteGestionDTO> {
    return this.http.put<ReporteGestionDTO>(`${this.baseUrl}/gestion/${reporteId}/zona-ubicada`, {});
  }

  completarReporteConParte(reporteId: number, mensajeSeguridad: string): Observable<ReporteGestionDTO> {
    const url = `${this.baseUrl}/gestion/${reporteId}/completar?mensajeSeguridad=${encodeURIComponent(mensajeSeguridad)}`;
    return this.http.put<ReporteGestionDTO>(url, {});
  }

  rechazarPorAdmin(reporteId: number, mensajeAdmin: string): Observable<ReporteGestionDTO> {
    const url = `${this.baseUrl}/gestion/${reporteId}/rechazar-admin` + (mensajeAdmin ? `?mensajeAdmin=${encodeURIComponent(mensajeAdmin)}` : '');
    return this.http.put<ReporteGestionDTO>(url, {});
  }

  marcarResueltoPorAdmin(reporteId: number, mensajeAdmin: string): Observable<ReporteGestionDTO> {
    const url = `${this.baseUrl}/gestion/${reporteId}/marcar-resuelto-admin` + (mensajeAdmin ? `?mensajeAdmin=${encodeURIComponent(mensajeAdmin)}` : '');
    return this.http.put<ReporteGestionDTO>(url, {});
  }
}
