import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface UsuarioDTO {
  id: number;
  nombreCompleto: string;
  username?: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private baseUrl = 'http://localhost:8080';
  constructor(private http: HttpClient){}

  getAll(): Observable<UsuarioDTO[]>{
    return this.http.get<UsuarioDTO[]>(`${this.baseUrl}/api/usuarios`).pipe(
      catchError(err => { console.warn('usuarios getAll falló', err); return of([]); })
    );
  }

  getById(id: number): Observable<UsuarioDTO>{
    return this.http.get<UsuarioDTO>(`${this.baseUrl}/api/usuarios/${id}`);
  }

  // Obtener usuarios con rol seguridad filtrados por zona y/o sede
  getSeguridadFiltered(zonaId?: number | null, sedeId?: number | null): Observable<any[]>{
    let url = `${this.baseUrl}/api/usuarios/seguridad/filter`;
    const params: string[] = [];
    if(zonaId != null) params.push(`zonaId=${encodeURIComponent(String(zonaId))}`);
    if(sedeId != null) params.push(`sedeId=${encodeURIComponent(String(sedeId))}`);
    if(params.length) url += `?${params.join('&')}`;
    console.debug('[UsuarioService] getSeguridadFiltered -> URL:', url, 'params:', { zonaId, sedeId });
    return this.http.get<any[]>(url).pipe(
      // log de respuesta para debugging
      // tap(data => console.debug('[UsuarioService] getSeguridadFiltered response', data)),
      catchError(err => { console.warn('getSeguridadFiltered falló', err); return of([]); })
    );
  }

  // Obtener todas las cuentas con rol seguridad
  getSeguridadByRol(): Observable<any[]>{
    const url = `${this.baseUrl}/api/usuarios/rol/seguridad`;
    console.debug('[UsuarioService] getSeguridadByRol -> URL:', url);
    return this.http.get<any[]>(url).pipe(catchError(err => { console.warn('getSeguridadByRol falló', err); return of([]); }));
  }
}
