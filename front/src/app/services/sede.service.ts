import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
export interface Sede {
  id: number;
  nombre: string;
  zonas?: any[];
}
@Injectable({
  providedIn: 'root'
})
export class SedeService {
    private baseUrl = 'http://localhost:8080/api/sedes';
 constructor(private http: HttpClient) {}

  obtenerSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>(`${this.baseUrl}`);
   
  }
  
  crearSede(nombre: string): Observable<Sede> {
    const payload = { nombre };
    return this.http.post<Sede>(`${this.baseUrl}`, payload);
  }
}
