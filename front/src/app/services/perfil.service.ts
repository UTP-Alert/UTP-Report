// Importa `Injectable` y `signal` de Angular core para definir el servicio y manejar estados reactivos.
import { Injectable, signal } from '@angular/core';
// Importa `HttpClient` de Angular common/http para realizar peticiones HTTP.
import { HttpClient } from '@angular/common/http';
// Importa `AuthService` para interactuar con el servicio de autenticación.
import { AuthService } from './auth.service';

/**
 * Interfaz que define la estructura del perfil de un usuario.
 */
export interface PerfilUsuario {
  username: string;       // Nombre de usuario.
  nombreCompleto: string; // Nombre completo del usuario.
  tipoUsuario?: string;   // Tipo de usuario (ej. 'ALUMNO', 'DOCENTE'). Puede ser opcional.
  roles: string[];        // Lista de roles asignados al usuario.
}

/**
 * Servicio `PerfilService` para gestionar la información del perfil del usuario autenticado.
 * Está disponible en toda la aplicación (`providedIn: 'root'`).
 */
@Injectable({providedIn: 'root'})
export class PerfilService {
  // URL base para obtener el perfil del usuario actual.
  private baseUrl = 'http://localhost:8080/api/usuarios/me';
  // Señal que almacena el perfil del usuario. Es `null` si no hay perfil cargado.
  perfil = signal<PerfilUsuario | null>(null);

  /**
   * Constructor del servicio.
   * @param http Cliente HTTP para realizar peticiones.
   * @param auth Servicio de autenticación para verificar el token.
   */
  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Carga el perfil del usuario desde el backend.
   * Solo se realiza la petición si existe un token de autenticación.
   * El perfil se almacena en la señal `perfil`. Si hay un error, la señal se establece en `null`.
   */
  cargarPerfil(){
    // Si no hay token de autenticación, no se intenta cargar el perfil.
    if(!this.auth.getToken()) return;

    // Realiza una petición GET para obtener el perfil del usuario.
    this.http.get<PerfilUsuario>(this.baseUrl).subscribe({
      // Si la petición es exitosa, actualiza la señal `perfil` con los datos recibidos.
      next: p => this.perfil.set(p),
      // Si hay un error, establece la señal `perfil` en `null`.
      error: _ => this.perfil.set(null)
    });
  }
}
