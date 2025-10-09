import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class IncidenteService {
  // Backend expone /api/tipoincidentes (ver TipoIncidenteController)
  private baseUrl = 'http://localhost:8080/api/tipoincidentes';
  constructor(private http: HttpClient) {}

  obtenerTipos(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      catchError((err) => {
        console.warn('obtenerTipos() falló', err);
        return of([]);
      })
    );
  }
}
