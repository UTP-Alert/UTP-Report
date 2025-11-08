import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Zona {
  id: number;
  nombre: string;
  descripcion?: string;
  fotoUrl?: string;
  sedeId?: number;
  activo?: boolean;
  estado?: 'ZONA_SEGURA' | 'ZONA_PRECAUCION' | 'ZONA_PELIGROSA' | string;
  reportCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ZonaService {
    private baseUrl = 'http://localhost:8080';
 constructor(private http: HttpClient) {}
  obtenerZonas(): Observable<Zona[]> {
    return this.http.get<Zona[]>(`${this.baseUrl}/api/zonas`).pipe(
      catchError((err) => {
        console.warn('obtenerZonas() falló', err);
        return of([]);
      })
    );
  }

  /**
   * Crea una nueva zona. Se espera un FormData con campos:
   * - nombre: string
   * - sedeId: number|string
   * - descripcion: string (opcional)
   * - foto: File (opcional)
   */
  crearZona(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/zonas`, formData).pipe(
      catchError((err) => {
        console.warn('crearZona() falló', err);
        return of(null);
      })
    );
  }

  /** Actualiza una zona por id. Se puede enviar FormData con campos a actualizar. */
  actualizarZona(id: number, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/zonas/${id}`, formData).pipe(
      catchError((err) => {
        console.warn(`actualizarZona(${id}) falló`, err);
        return of(null);
      })
    );
  }

  /** Elimina una zona por id */
  eliminarZona(id: number): Observable<any> {
    // Intentar adjuntar el token explícitamente en caso de que el interceptor no lo esté
    const token = localStorage.getItem('auth_token');
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    // No consumir el error aquí: devolvemos la Response completa para que el componente
    // pueda manejar códigos 204/409/401 y mostrar mensajes adecuados.
    return this.http.delete<any>(`${this.baseUrl}/api/zonas/${id}`, { headers, observe: 'response' as 'response' });
  }

  /** Activa o desactiva una zona (soft-enable/disable) */
  setActivoZona(id: number, activo: boolean): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    // Usamos PATCH para cambiar sólo el estado 'activo'
    return this.http.patch<any>(`${this.baseUrl}/api/zonas/${id}/activo?activo=${activo}`, {}, { headers }).pipe(
      catchError((err) => {
        console.warn(`setActivoZona(${id}) falló`, err);
        throw err; // propagar error para que el componente gestione la reversión
      })
    );
  }

  obtenerZonasPorSede(sedeId: number): Observable<Zona[]> {
    return this.obtenerZonasPorSedeEx(sedeId, false);
  }

  /** Variante que permite incluir zonas inactivas cuando se requiere */
  obtenerZonasPorSedeEx(sedeId: number, includeInactive: boolean): Observable<Zona[]> {
    if (sedeId == null) return of([]);
    const q = includeInactive ? '?includeInactive=true' : '';
    return this.http.get<Zona[]>(`${this.baseUrl}/api/zonas/sede/${sedeId}${q}`).pipe(
      catchError((err) => {
        console.warn(`obtenerZonasPorSede(${sedeId}) falló`, err);
        return of([]);
      })
    );
  }

}
