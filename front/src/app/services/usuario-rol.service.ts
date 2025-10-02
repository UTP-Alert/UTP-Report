import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface RegistroDTO {
  username: string;
  correo: string;
  password: string;
  tipoUsuario: string; // puede ser "USER", "ADMIN", "SECURITY", etc.
}


@Injectable({
  providedIn: 'root'
})
export class UsuarioRolService {
  private baseUrl = 'http://localhost:8080/api/auth';
    constructor(private http: HttpClient) {}
     registrarUsuario(data: RegistroDTO): Observable<any> {
    // CORREGIDO: ahora coincide con tu backend
    return this.http.post(`${this.baseUrl}/registrar`, data);
  }

  
}
