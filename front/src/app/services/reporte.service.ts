import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReporteDTO {
  id: number;
  tipoIncidenteId: number;
  zonaId: number;
  descripcion: string;
  fechaCreacion: string;
  isAnonimo: boolean;
  contacto?: string;
  usuarioId: number;
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
}
