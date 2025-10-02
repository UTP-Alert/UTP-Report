import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sede } from './sede.service';

/*export interface Sede {
  id: number;
  nombre: string;
}*/
export interface RegistroDTO {
  nombreCompleto: string;
  username: string;
  correo: string;
  password: string;
  telefono: string;
  tipoUsuario: string; // puede ser "USER", "ADMIN", "SECURITY", etc.
  sede: Sede;

}
export interface RegistroAdminDTO {
  nombreCompleto: string;
  username: string;
  correo: string;
  password: string;
  telefono: string;
  sede: Sede;
}


@Injectable({
  providedIn: 'root'
})
export class UsuarioRolService {
  private baseUrl = 'http://localhost:8080/api/auth';
    constructor(private http: HttpClient) {}
     registrarUsuario(data: RegistroDTO): Observable<string> {
    return this.http.post(`${this.baseUrl}/registrarUsuario`, data, { responseType: 'text' });
  }
      registrarAdmin(data: RegistroAdminDTO): Observable<string> {
    return this.http.post(`${this.baseUrl}/registrarAdmin`, data, { responseType: 'text' });
  }

  
}
