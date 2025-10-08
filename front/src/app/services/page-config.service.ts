import { Injectable } from '@angular/core';
import { ROLES } from '../constants/roles';

export type RoleKey = typeof ROLES[keyof typeof ROLES];
export type PageKey = 'home' | 'zonas' | 'reportes' | 'usuarios' | 'sensibles' | 'guia';

export type RolePagesConfig = Record<PageKey, boolean>;
export type PagesConfig = Record<RoleKey, RolePagesConfig>;

const STORAGE_KEY = 'page_config_v1';

const DEFAULT_CONFIG: PagesConfig = {
  [ROLES.SUPERADMIN]: { home: true, zonas: true, reportes: false, usuarios: true, sensibles: true, guia: false },
  [ROLES.ADMIN]:      { home: true, zonas: true, reportes: true,  usuarios: false, sensibles: false, guia: false },
  [ROLES.USUARIO]:    { home: true, zonas: true, reportes: false, usuarios: false, sensibles: false, guia: true },
  [ROLES.SEGURIDAD]:  { home: true, zonas: true, reportes: false, usuarios: false, sensibles: false, guia: false },
};

@Injectable({ providedIn: 'root' })
export class PageConfigService {
  private config: PagesConfig;

  constructor(){
    this.config = this.load();
  }

  getConfig(): PagesConfig { return this.config; }

  isEnabled(role: RoleKey, page: PageKey): boolean {
    return this.config?.[role]?.[page] ?? false;
  }

  setEnabled(role: RoleKey, page: PageKey, enabled: boolean): void {
    if (!this.config[role]) return;
    this.config[role][page] = enabled;
    this.save();
  }

  setAll(role: RoleKey, entries: Partial<RolePagesConfig>): void {
    if (!this.config[role]) return;
    this.config[role] = { ...this.config[role], ...entries };
    this.save();
  }

  activeCount(): number {
    return Object.values(this.config).reduce((sum, pages) => sum + Object.values(pages).filter(Boolean).length, 0);
  }

  private load(): PagesConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PagesConfig;
        // merge to ensure new keys exist
        return this.mergeDefaults(parsed);
      }
    } catch {}
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
  }

  private mergeDefaults(existing: PagesConfig): PagesConfig {
    const merged: PagesConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    for (const role of Object.keys(merged) as RoleKey[]) {
      merged[role] = { ...merged[role], ...(existing?.[role] || {}) };
    }
    return merged;
  }
}
