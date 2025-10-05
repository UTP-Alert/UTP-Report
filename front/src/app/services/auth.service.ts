// Importa los decoradores y funciones necesarias de Angular core.
import { Injectable, signal, computed } from '@angular/core';
// Importa HttpClient para realizar peticiones HTTP.
import { HttpClient } from '@angular/common/http';
// Importa Observable y operadores de RxJS para manejar flujos de datos asíncronos.
import { Observable, tap, catchError, throwError } from 'rxjs';
// Importa Router para la navegación programática.
import { Router } from '@angular/router';
// Importa las constantes de roles de la aplicación.
import { ROLES } from '../constants/roles';

// Interfaz que define la estructura de la solicitud de inicio de sesión.
interface LoginRequest {
  usernameOrCorreo: string;
  password: string;
}

// Interfaz que define la estructura de la respuesta JWT.
interface JwtResponse {
  token: string;
  tipoToken: string;
  roles: string[];
}

// Decorador @Injectable que marca la clase como un servicio que puede ser inyectado.
// `providedIn: 'root'` significa que el servicio está disponible en toda la aplicación.
@Injectable({ providedIn: 'root' })
export class AuthService {
  // URL base para las peticiones de autenticación al backend.
  private baseUrl = 'http://localhost:8080/api/auth';
  // Señal que indica si el usuario está autenticado.
  isAuthenticated = signal<boolean>(false);
  // Señal privada que almacena los roles del usuario.
  private rolesSignal = signal<string[]>([]);
  // Señal privada que indica si un administrador está actuando como usuario.
  private adminActingAsUser = signal<boolean>(false);
  // Propiedad computada que expone los roles del usuario.
  roles = computed(() => this.rolesSignal());
  // Temporizador para la expiración del token.
  private tokenExpirationTimer: any = null;
  // Clave para almacenar en localStorage si el admin está actuando como usuario.
  private readonly ADMIN_AS_USER_KEY = 'admin_as_user';
  // Clave para almacenar en localStorage si el admin ya seleccionó un rol.
  private readonly ADMIN_ROLE_SELECTED_KEY = 'admin_role_selected';

  // Constructor del servicio, inyecta HttpClient y Router.
  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Realiza una petición de inicio de sesión al backend.
   * @param username El nombre de usuario o correo electrónico.
   * @param password La contraseña del usuario.
   * @returns Un Observable con la respuesta JWT.
   */
  login(username: string, password: string): Observable<JwtResponse> {
    const body: LoginRequest = { usernameOrCorreo: username, password };
    return this.http.post<JwtResponse>(`${this.baseUrl}/login`, body).pipe(
      tap(res => {
        // Almacena el token de autenticación en localStorage.
        localStorage.setItem('auth_token', res.token);
        if (res.roles) {
          // Almacena los roles en la señal y en localStorage.
          this.rolesSignal.set(res.roles);
          localStorage.setItem('auth_roles', JSON.stringify(res.roles));
        }
        // Actualiza el estado de autenticación.
        this.isAuthenticated.set(true);
        // Programa la expiración del token.
        this.scheduleTokenExpiration(res.token);
      }),
      catchError(err => {
        // Si hay un error, establece el estado de autenticación en falso.
        this.isAuthenticated.set(false);
        // Propaga el error.
        return throwError(() => err);
      })
    );
  }

  /**
   * Cierra la sesión del usuario, eliminando los datos de autenticación y redirigiendo al login.
   */
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_roles');
    localStorage.removeItem(this.ADMIN_AS_USER_KEY);
    localStorage.removeItem(this.ADMIN_ROLE_SELECTED_KEY);
    this.isAuthenticated.set(false);
    this.rolesSignal.set([]);
    this.adminActingAsUser.set(false);
    if (this.tokenExpirationTimer) { clearTimeout(this.tokenExpirationTimer); this.tokenExpirationTimer = null; }
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  /**
   * Obtiene el token de autenticación del localStorage.
   * @returns El token de autenticación o null si no existe.
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Carga el estado de autenticación y los roles desde localStorage.
   */
  loadFromStorage() {
    const token = this.getToken();
    if (token) {
      this.isAuthenticated.set(true);
      const stored = localStorage.getItem('auth_roles');
      if (stored) {
        try { this.rolesSignal.set(JSON.parse(stored)); } catch (_) {}
      }
      const acting = localStorage.getItem(this.ADMIN_AS_USER_KEY);
      if (acting === '1') this.adminActingAsUser.set(true);
      this.scheduleTokenExpiration(token);
    }
  }

  /**
   * Verifica si el usuario tiene un rol específico.
   * @param role El rol a verificar.
   * @returns True si el usuario tiene el rol, false en caso contrario.
   */
  hasRole(role: string) {
    return this.rolesSignal().includes(role);
  }

  /**
   * Establece si un administrador está actuando como usuario.
   * @param value True si el admin actúa como usuario, false en caso contrario.
   */
  setAdminActingAsUser(value: boolean) {
    this.adminActingAsUser.set(value);
    if (value) localStorage.setItem(this.ADMIN_AS_USER_KEY,'1');
    else localStorage.removeItem(this.ADMIN_AS_USER_KEY);
  }

  /**
   * Verifica si un administrador está actuando como usuario.
   * @returns True si el admin actúa como usuario, false en caso contrario.
   */
  isAdminAsUser() { return this.adminActingAsUser(); }

  /**
   * Marca si el administrador ya eligió un rol en el selector (Usuario/Admin).
   * @param value True si el rol fue seleccionado, false en caso contrario.
   */
  setAdminRoleSelected(value: boolean) {
    if (value) localStorage.setItem(this.ADMIN_ROLE_SELECTED_KEY, '1');
    else localStorage.removeItem(this.ADMIN_ROLE_SELECTED_KEY);
  }

  /**
   * Verifica si el administrador ya eligió un rol en el selector.
   * @returns True si el rol fue seleccionado, false en caso contrario.
   */
  isAdminRoleSelected(): boolean { return localStorage.getItem(this.ADMIN_ROLE_SELECTED_KEY) === '1'; }

  /**
   * Construye el nombre a mostrar en la barra de navegación según el rol y tipo de usuario.
   * @param nombreCompleto El nombre completo del usuario.
   * @param tipoUsuario El tipo de usuario (ej. 'ALUMNO', 'DOCENTE').
   * @returns El nombre formateado para mostrar.
   */
  buildDisplayName(nombreCompleto: string, tipoUsuario?: string): string {
    if (this.hasRole(ROLES.SUPERADMIN)) return `Super Admin`;
    if (this.isAdminAsUser()) return `Admin. ${nombreCompleto}`;
    if (this.hasRole(ROLES.ADMIN)) return `Admin. ${nombreCompleto}`;
    if (tipoUsuario) {
      const upper = tipoUsuario.toUpperCase();
      if (upper === 'ALUMNO') return `Alum. ${nombreCompleto}`;
      if (upper === 'DOCENTE') return `Doc. ${nombreCompleto}`;
    }
    if (this.hasRole(ROLES.SEGURIDAD)) return nombreCompleto;
    return nombreCompleto;
  }

  /**
   * Decodifica un token JWT.
   * @param token El token JWT a decodificar.
   * @returns El payload decodificado del token o null si falla.
   */
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g,'+').replace(/_/g,'/'));
      return JSON.parse(json);
    } catch { return null; }
  }

  /**
   * Programa la expiración del token de autenticación.
   * Si el token expira, se cierra la sesión automáticamente.
   * @param token El token JWT.
   */
  private scheduleTokenExpiration(token: string) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return;
    const expMs = decoded.exp * 1000; // Tiempo de expiración en milisegundos.
    const now = Date.now(); // Tiempo actual en milisegundos.
    const remaining = expMs - now; // Tiempo restante hasta la expiración.
    if (remaining <= 0) {
      this.logout(); // Si ya expiró, cierra la sesión.
      return;
    }
    if (this.tokenExpirationTimer) clearTimeout(this.tokenExpirationTimer); // Limpia el temporizador anterior.
    // Cierra la sesión 5 segundos antes de la expiración real para un margen de seguridad.
    const timeout = remaining - 5000;
    this.tokenExpirationTimer = setTimeout(() => this.logout(), timeout > 0 ? timeout : 0);
  }
}
