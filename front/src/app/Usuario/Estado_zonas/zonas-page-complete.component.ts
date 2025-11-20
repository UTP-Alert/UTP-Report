import { Component, OnInit, signal, effect, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { PerfilService } from '../../services/perfil.service';
import { Sede, SedeService } from '../../services/sede.service';
import { Zona, ZonaService } from '../../services/zona.service';

@Component({
  selector: 'app-zonas-page-complete',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './zonas-page-complete.component.html',
  styleUrls: ['./zonas-page-complete.component.scss']
})
export class ZonasPageCompleteComponent implements OnInit {
  @Input() contextLabel: string = 'alumno';
  @Input() showReportButton: boolean = true;
  loading = false;
  sedes: Sede[] = [];
  selectedSedeId: number | null = null;
  selectedSedeNombre: string | null = null;
  zonas: Array<Zona & { foto?: any; fotoUrl?: string; [k: string]: any } > = [];

  darkMode = signal<boolean>(false);
  private storageKey = 'zonas_dark_mode';

  constructor(
    private perfilService: PerfilService,
    private sedeService: SedeService,
    private zonaService: ZonaService,
    private router: Router,
  ) {
    // Load dark mode preference from local storage
    try {
      const storedPreference = localStorage.getItem(this.storageKey);
      if (storedPreference !== null) {
        this.darkMode.set(JSON.parse(storedPreference));
      } else {
        this.darkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    } catch (e) {
      console.error('Error reading dark mode preference from localStorage', e);
      this.darkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    effect(() => {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.darkMode()));
      } catch (e) {
        console.error('Error writing dark mode preference to localStorage', e);
      }
    });
  }

  ngOnInit(): void {
    this.loading = true;
    // Escuchar actualizaciones de zona provenientes del navbar (WS)
    window.addEventListener('zone-status-update', (ev: any) => {
      const z = ev?.detail;
      if (!z || z.id == null) return;
      const idx = this.zonas.findIndex(zz => zz.id === z.id);
      if (idx >= 0) {
        this.zonas[idx] = { ...this.zonas[idx], estado: z.estado, reportCount: z.reportCount } as any;
      }
    });
    // Cargar sedes y perfil en paralelo y luego resolver la sede del alumno por nombre
    this.sedeService.obtenerSedes().subscribe({
      next: (sedes) => {
        this.sedes = sedes || [];
        this.perfilService.obtenerPerfil()?.subscribe({
          next: (perfil: any) => {
            // Backend expone /api/usuarios/me devolviendo UsuarioDTO con sedeNombre
            const sedeNombre: string | null = perfil?.sedeNombre || null;
            this.selectedSedeNombre = sedeNombre;
            const encontrada = sedeNombre ? this.sedes.find(s => (s.nombre || '').toLowerCase() === sedeNombre.toLowerCase()) : null;
            const sedeId = encontrada?.id ?? (this.sedes.length ? this.sedes[0].id : null);
            this.selectedSedeId = sedeId;
            if (sedeId != null) this.loadZonasForSede(sedeId);
            else this.loading = false;
          },
          error: _ => {
            // Si no hay perfil, usar primera sede disponible como fallback
            const sedeId = this.sedes.length ? this.sedes[0].id : null;
            this.selectedSedeId = sedeId;
            this.selectedSedeNombre = this.sedes.length ? this.sedes[0].nombre : null;
            if (sedeId != null) this.loadZonasForSede(sedeId); else this.loading = false;
          }
        });
      },
      error: _ => { this.loading = false; }
    });
  }

  private loadZonasForSede(sedeId: number) {
    this.zonaService.obtenerZonasPorSede(sedeId).subscribe({
      next: (z) => {
        // Convertir byte[] o string base64 a data URL para mostrar imagen
        this.zonas = (z || []).map((zone: any) => {
          let fotoUrl: string | null = null;
          try {
            if (zone.foto && Array.isArray(zone.foto) && zone.foto.length > 0) {
              const bin = new Uint8Array(zone.foto);
              let binary = '';
              bin.forEach((b: number) => binary += String.fromCharCode(b));
              const b64 = btoa(binary);
              fotoUrl = `data:image/jpeg;base64,${b64}`;
            } else if (zone.foto && typeof zone.foto === 'string' && zone.foto.length > 0) {
              fotoUrl = zone.foto.startsWith('data:') ? zone.foto : `data:image/jpeg;base64,${zone.foto}`;
            }
          } catch { fotoUrl = null; }
          return { ...zone, fotoUrl } as any;
        });
        this.loading = false;
      },
      error: _ => { this.zonas = []; this.loading = false; }
    });
  }

  // Heurística simple (misma que en panel de sedes) para categorizar si existiera algún campo relacionado
  categorizeZone(z: any): 'segura' | 'precaucion' | 'peligrosa' | 'desconocida' {
    if (!z) return 'desconocida';
    const vals: string[] = [];
    const add = (v: any) => { if (v != null) vals.push(String(v).toLowerCase()); };
    add(z.estado); add(z.nivel); add(z.nivelSeguridad); add(z.prioridad); add(z.status); add(z.risk);
    for (const val of vals) {
      if (val.includes('segur') || val.includes('safe') || val.includes('bajo')) return 'segura';
      if (val.includes('precauc') || val.includes('medio') || val.includes('caution')) return 'precaucion';
      if (val.includes('pelig') || val.includes('danger') || val.includes('alto') || val.includes('riesgo')) return 'peligrosa';
    }
    const pri = z.prioridad || z.priority || z.level;
    if (pri != null) {
      const n = Number(pri);
      if (!isNaN(n)) {
        if (n >= 75) return 'peligrosa';
        if (n >= 40) return 'precaucion';
        return 'segura';
      }
    }
    return 'desconocida';
  }

  get stats() {
    let seguras = 0, precaucion = 0, peligrosas = 0;
    for (const z of this.zonas) {
      const c = this.categorizeZone(z);
      if (c === 'segura') seguras++;
      else if (c === 'precaucion') precaucion++;
      else if (c === 'peligrosa') peligrosas++;
    }
    const estudiantes = 0; // sin fuente de datos, mostrar 0 por ahora
    return { seguras, precaucion, peligrosas, estudiantes };
  }

  toggleDarkMode() {
    this.darkMode.update(value => !value);
  }

  // Abre el modal de reporte navegando al home del usuario y disparando evento global
  openReportIncident() {
    const homePath = ['/usuario'];
    const current = this.router.url.replace(/\/+$/,'');
    const homeUrl = homePath.join('/').replace(/\/+$/,'');
    const isExactHome = current === homeUrl;
    if (!isExactHome) {
      this.router.navigate(homePath).then(() => {
        setTimeout(() => { try { window.dispatchEvent(new Event('open-report-modal')); } catch {} }, 150);
      });
    } else {
      try { window.dispatchEvent(new Event('open-report-modal')); } catch {}
    }
  }
}
