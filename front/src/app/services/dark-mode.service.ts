import { Injectable, effect, signal, inject } from '@angular/core';
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

  constructor() {
    // Load persisted map (role -> preference)
    try {
      const raw = localStorage.getItem(this.storageMapKey);
      if (raw) this.map = JSON.parse(raw) || {};
    } catch (e) { this.map = {}; }

    // Compute current role key and initialize dark mode from map or system preference
    this.roleKey = this.computeRoleKey();
    const stored = this.map[this.roleKey];
    if (typeof stored === 'boolean') this.darkMode.set(stored);
    else this.darkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Persist per-role preference whenever it changes
    effect(() => {
      try {
        this.map[this.roleKey] = Boolean(this.darkMode());
        localStorage.setItem(this.storageMapKey, JSON.stringify(this.map));
      } catch (e) {}
    });

    // Apply/remove global class on <html> and <body> so the whole app is affected
    effect(() => {
      try {
        const enabled = this.darkMode();
        const html = document.documentElement;
        const body = document.body;
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
        const val = this.map[this.roleKey];
        if (typeof val === 'boolean') this.darkMode.set(val);
        else this.darkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    });
  }

  toggleDarkMode() {
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
