import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface TipoIncidenteDTO {
  id: number;
  nombre: string;
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
}
