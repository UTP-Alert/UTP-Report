import { Injectable, effect, signal, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { PerfilService } from './perfil.service';

@Injectable({ providedIn: 'root' })
export class DarkModeService {
  darkMode = signal<boolean>(false);
  private storageMapKey = 'utp_dark_mode_map';
  private roleKey = '';
  private map: Record<string, boolean> = {};

  private auth = inject(AuthService);
  private perfilSrv = inject(PerfilService);
  private router = inject(Router);

  constructor() {
    // Load persisted map (role -> preference)
    try {
      const raw = localStorage.getItem(this.storageMapKey);
      if (raw) this.map = JSON.parse(raw) || {};
    } catch (e) { this.map = {}; }

    // Compute current role key and initialize dark mode from map or system preference
    this.roleKey = this.computeRoleKey();
    const stored = this.map[this.roleKey];
    if (this.roleKey === 'SUPERADMIN') {
      // Forzar siempre modo claro para SUPERADMIN independientemente de preferencias almacenadas
      this.darkMode.set(false);
    } else {
      if (typeof stored === 'boolean') this.darkMode.set(stored);
      else this.darkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    // Persist per-role preference whenever it changes
    effect(() => {
      try {
        this.map[this.roleKey] = Boolean(this.darkMode());
        localStorage.setItem(this.storageMapKey, JSON.stringify(this.map));
      } catch (e) {}
    });

    // Apply/remove global class on <html> and <body> so the whole app is affected
    // EXCEPTION: keep the login/select-role pages always in light mode (no dark-mode class)
    effect(() => {
      try {
        const enabled = this.darkMode() && this.roleKey !== 'SUPERADMIN';
        // Determinar ruta actual para excluir login
        let currentUrl = '';
        try {
          currentUrl = (this.router && (this.router as any).url) ? String((this.router as any).url) : window.location.pathname || '';
        } catch {}
        const isLoginRoute = currentUrl.startsWith('/login') || currentUrl.startsWith('/select-role');

        const html = document.documentElement;
        const body = document.body;
        if (isLoginRoute) {
          // Asegurar que login se mantenga en modo claro
          html.classList.remove('dark-mode');
          body.classList.remove('dark-mode');
          return;
        }

        if (enabled) {
          html.classList.add('dark-mode');
          body.classList.add('dark-mode');
        } else {
          html.classList.remove('dark-mode');
          body.classList.remove('dark-mode');
        }
      } catch (e) {}
    });

    // Listen for role changes and apply stored preference for the new role.
    effect(() => {
      // react to roles and admin-as-user flag
      const roles = this.auth.roles();
      const adminAsUser = (this.auth as any).isAdminAsUser ? (this.auth as any).isAdminAsUser() : false;
      const perfil = this.perfilSrv.perfil();
      void roles; void perfil; void adminAsUser;
      const newKey = this.computeRoleKey();
      if (newKey !== this.roleKey) {
        // save current state already handled by persistence effect; now switch
        this.roleKey = newKey;
        if (this.roleKey === 'SUPERADMIN') {
          // Siempre claro para SUPERADMIN
          this.darkMode.set(false);
          // Remover inmediatamente cualquier clase residual de modo oscuro
          try {
            document.documentElement.classList.remove('dark-mode');
            document.body.classList.remove('dark-mode');
          } catch {}
        } else {
          const val = this.map[this.roleKey];
          if (typeof val === 'boolean') this.darkMode.set(val);
          else this.darkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
      }
    });

    // Refuerzo: si por alguna razón la clase dark-mode persiste estando en SUPERADMIN, quitarla.
    effect(() => {
      const isSuper = (this.auth as any).hasRole && (this.auth as any).hasRole('SUPERADMIN');
      if (isSuper) {
        try {
          document.documentElement.classList.remove('dark-mode');
          document.body.classList.remove('dark-mode');
        } catch {}
      }
    });

    // Escuchar cambios de ruta para forzar que la página de login permanezca en modo claro
    try {
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((ev: any) => {
        try {
          const url = ev && (ev.urlAfterRedirects || ev.url) ? String(ev.urlAfterRedirects || ev.url) : (window.location.pathname || '');
          const isLogin = url.startsWith('/login') || url.startsWith('/select-role');
          const html = document.documentElement;
          const body = document.body;
          if (isLogin) {
            html.classList.remove('dark-mode');
            body.classList.remove('dark-mode');
          } else {
            const enabled = this.darkMode() && this.roleKey !== 'SUPERADMIN';
            if (enabled) {
              html.classList.add('dark-mode');
              body.classList.add('dark-mode');
            } else {
              html.classList.remove('dark-mode');
              body.classList.remove('dark-mode');
            }
          }
        } catch {}
      });
    } catch {}
  }

  toggleDarkMode() {
    // Ignorar toggles en SUPERADMIN para mantener modo claro
    if (this.roleKey === 'SUPERADMIN') return;
    this.darkMode.update(v => !v);
  }

  private computeRoleKey(): string {
    try {
      if ((this.auth as any).hasRole && (this.auth as any).hasRole('SUPERADMIN')) return 'SUPERADMIN';
      if ((this.auth as any).isAdminAsUser && (this.auth as any).isAdminAsUser()) return 'ADMIN_AS_USER';
      if ((this.auth as any).hasRole && (this.auth as any).hasRole('ADMIN')) return 'ADMIN';
      if ((this.auth as any).hasRole && (this.auth as any).hasRole('SEGURIDAD')) return 'SEGURIDAD';
      if ((this.auth as any).hasRole && (this.auth as any).hasRole('USUARIO')) return 'USUARIO';
      return 'ANONYMOUS';
    } catch { return 'UNKNOWN'; }
  }
}
