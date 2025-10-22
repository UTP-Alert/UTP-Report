import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface PerfilUsuario {
  username: string;
  nombreCompleto: string;
  tipoUsuario?: string; // ALUMNO | DOCENTE | null
  roles: string[];
}

@Injectable({providedIn: 'root'})
export class PerfilService {
  private baseUrl = 'http://localhost:8080/api/usuarios/me';
  perfil = signal<PerfilUsuario | null>(null);

  constructor(private http: HttpClient, private auth: AuthService) {}

  cargarPerfil(){
    if(!this.auth.getToken()) return;
    this.http.get<PerfilUsuario>(this.baseUrl).subscribe({
      next: p => this.perfil.set(p),
      error: _ => this.perfil.set(null)
    });
  }

  obtenerPerfil() {
    if(!this.auth.getToken()) return null;
    return this.http.get<PerfilUsuario>(this.baseUrl);
  }
}
