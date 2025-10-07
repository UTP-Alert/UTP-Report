import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ROLES } from '../constants/roles';

interface LoginRequest {
  usernameOrCorreo: string;
  password: string;
}

interface JwtResponse {
  token: string;
  tipoToken: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth'; // Ajustar si cambia el puerto backend
  isAuthenticated = signal<boolean>(false);
  private rolesSignal = signal<string[]>([]);
  private adminActingAsUser = signal<boolean>(false); // flag cuando admin entra como usuario
  roles = computed(() => this.rolesSignal());
  private tokenExpirationTimer: any = null;
  private readonly ADMIN_AS_USER_KEY = 'admin_as_user';
  private readonly ADMIN_ROLE_SELECTED_KEY = 'admin_role_selected';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<JwtResponse> {
    const body: LoginRequest = { usernameOrCorreo: username, password };
    return this.http.post<JwtResponse>(`${this.baseUrl}/login`, body).pipe(
      tap(res => {
        localStorage.setItem('auth_token', res.token);
        if (res.roles) {
          this.rolesSignal.set(res.roles);
          localStorage.setItem('auth_roles', JSON.stringify(res.roles));
        }
        this.isAuthenticated.set(true);
        this.scheduleTokenExpiration(res.token);
      }),
      catchError(err => {
        this.isAuthenticated.set(false);
        return throwError(() => err);
      })
    );
  }

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

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

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

  hasRole(role: string) {
    return this.rolesSignal().includes(role);
  }

  setAdminActingAsUser(value: boolean) { 
    this.adminActingAsUser.set(value); 
    if (value) localStorage.setItem(this.ADMIN_AS_USER_KEY,'1');
    else localStorage.removeItem(this.ADMIN_AS_USER_KEY);
  }
  isAdminAsUser() { return this.adminActingAsUser(); }

  // Marca si el admin ya eligió un rol en el selector (User/Admin)
  setAdminRoleSelected(value: boolean) {
    if (value) localStorage.setItem(this.ADMIN_ROLE_SELECTED_KEY, '1');
    else localStorage.removeItem(this.ADMIN_ROLE_SELECTED_KEY);
  }
  isAdminRoleSelected(): boolean { return localStorage.getItem(this.ADMIN_ROLE_SELECTED_KEY) === '1'; }

  // Prefijo según requisitos:
  // Alumno: "alum.[nombre]"  Docente: "doc.[nombre]"  Admin como usuario: "Admin.[nombre]"
  // Seguridad: "seg.[nombre]"  Superadmin: "superadmin.[nombre]"
  buildDisplayName(nombreCompleto: string, tipoUsuario?: string): string {
    const name = nombreCompleto?.trim() || 'Usuario';
    if (this.hasRole(ROLES.SUPERADMIN)) return `superadmin. ${name}`;
    if (this.isAdminAsUser()) return `Admin. ${name}`;
    if (this.hasRole(ROLES.ADMIN)) return `Admin. ${name}`;
    if (this.hasRole(ROLES.SEGURIDAD)) return `seg. ${name}`;
    if (this.hasRole(ROLES.USUARIO) && tipoUsuario) {
      const upper = tipoUsuario.toUpperCase();
      if (upper === 'ALUMNO') return `alum. ${name}`;
      if (upper === 'DOCENTE') return `doc. ${name}`;
    }
    return name;
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g,'+').replace(/_/g,'/'));
      return JSON.parse(json);
    } catch { return null; }
  }

  private scheduleTokenExpiration(token: string) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return; // exp en segundos
    const expMs = decoded.exp * 1000;
    const now = Date.now();
    const remaining = expMs - now;
    if (remaining <= 0) {
      this.logout();
      return;
    }
    if (this.tokenExpirationTimer) clearTimeout(this.tokenExpirationTimer);
    // Logout 5 segundos antes para margen
    const timeout = remaining - 5000;
    this.tokenExpirationTimer = setTimeout(() => this.logout(), timeout > 0 ? timeout : 0);
  }
}
