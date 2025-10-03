import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Zona {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class ZonaService {
    private baseUrl = 'http://localhost:8080/';
 constructor(private http: HttpClient) {}
  obtenerZonas(): Observable<Zona[]> {
    return this.http.get<Zona[]>(`${this.baseUrl}api/zonas`);
  }

}
