import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface TipoIncidenteDTO {
  id: number;
  nombre: string;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class TipoIncidenteService {
  private baseUrl = 'http://localhost:8080';
  constructor(private http: HttpClient){}

  getAll(): Observable<TipoIncidenteDTO[]>{
    return this.http.get<TipoIncidenteDTO[]>(`${this.baseUrl}/api/tipoincidentes`).pipe(
      catchError(err => {
        console.warn('tipo-incidentes getAll falló', err);
        return of([]);
      })
    );
  }

  getById(id: number): Observable<TipoIncidenteDTO>{
    return this.http.get<TipoIncidenteDTO>(`${this.baseUrl}/api/tipoincidentes/${id}`);
  }
  
  create(tipo: { nombre: string; descripcion?: string }){
    return this.http.post<TipoIncidenteDTO>(`${this.baseUrl}/api/tipoincidentes`, tipo);
  }

  update(id: number, tipo: { nombre: string; descripcion?: string }){
    return this.http.put<TipoIncidenteDTO>(`${this.baseUrl}/api/tipoincidentes/${id}`, tipo);
  }

  delete(id: number){
    return this.http.delete(`${this.baseUrl}/api/tipoincidentes/${id}`);
  }
}

