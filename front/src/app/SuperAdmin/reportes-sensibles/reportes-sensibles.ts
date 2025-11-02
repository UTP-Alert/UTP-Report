import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PerfilService } from '../../services/perfil.service';
import { ReporteService, ReporteDTO } from '../../services/reporte.service';
import { ZonaService } from '../../services/zona.service';
import { UsuarioService, UsuarioDTO } from '../../services/usuario.service';
import { TipoIncidenteService } from '../../services/tipo-incidente.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-reportes-sensibles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-sensibles.html',
  styleUrl: './reportes-sensibles.scss'
})
export class ReportesSensibles {

  // Modal de autenticación
  showAuthModal: boolean = true;
  passwordInput: string = '';
  authError: string | null = null;
  loadingAuth: boolean = false;

  // Indica si se concedió acceso sensible (tras re-autenticación)
  accesoConcedido: boolean = false;

  constructor(
    private auth: AuthService,
    private perfil: PerfilService,
    private router: Router,
    private reporteService: ReporteService,
    private zonaService: ZonaService,
    private usuarioService: UsuarioService
    , private tipoService: TipoIncidenteService
  ) {
    // mostrar modal al entrar
    this.showAuthModal = true;
    this.accesoConcedido = false;
  }

  // listados y filtros
  reports: ReporteDTO[] = [];
  searchText: string = '';
  selectedEstado: string = 'all';
  selectedPrioridad: string = 'all';
  selectedTipo: string = 'all';
  tipos: any[] = [];

  async loadReports() {
    try {
      // para sensibilidad usamos el endpoint general; backend debe retornar toda la info al SuperAdmin
      this.reporteService.getAll().subscribe({
        next: async (list: ReporteDTO[]) => {
          const baseList = (list || []).map((r: ReporteDTO) => ({ ...r } as any));
          // cargar zonas y usuarios para resolver nombres
          try {
            const zonas = await firstValueFrom(this.zonaService.obtenerZonas());
            const usuarios = await firstValueFrom(this.usuarioService.getAll());
            const tipos = await firstValueFrom(this.tipoService.getAll());
            this.tipos = (tipos || []);
            const tipoMap = new Map<number,string>((tipos || []).map(t => [t.id, t.nombre]));
            const zonaMap = new Map<number,string>((zonas || []).map(z => [z.id, z.nombre]));
            const userMap = new Map<number, UsuarioDTO>((usuarios || []).map(u => [u.id, u]));

            this.reports = baseList.map((r: any) => {
              const item: any = { ...r };
              item.zonaNombre = item.zonaNombre || item.ubicacionNombre || (zonaMap.get(item.zonaId) || `Zona ${item.zonaId}`);
              item.tipoNombre = item.tipoNombre || (tipoMap.get(item.tipoIncidenteId) || (item.tipoIncidenteId ? `Tipo ${item.tipoIncidenteId}` : ''));
              const u = userMap.get(item.usuarioId as number);
              if (u) {
                item.reporterNombre = item.reporterNombre || u.nombreCompleto || (`Usuario ${u.id}`);
                item.reporterCorreo = item.reporterCorreo || (u as any).correo || (u as any).email || 'Email no disponible';
                item.reporterRol = item.reporterRol || (u as any).roles?.[0] || 'No especificado';
              } else {
                item.reporterNombre = item.reporterNombre || (item.contacto || 'Usuario Desconocido');
                item.reporterCorreo = item.reporterCorreo || (item.contacto || 'Email no disponible');
                item.reporterRol = item.reporterRol || 'No especificado';
              }
              return item as ReporteDTO;
            });
          } catch (err) {
            console.warn('No se pudieron resolver zonas/usuarios, usando valores por defecto', err);
            this.reports = baseList as ReporteDTO[];
          }
        },
        error: (err: any) => { console.error('Error cargando reportes sensibles', err); this.reports = []; }
      });
    } catch (err: any) {
      console.error('Error loadReports', err);
    }
  }

  // Llamar loadReports cuando se concede acceso
  private onAccessGranted() {
    this.loadReports();
  }

  get filteredReports(): ReporteDTO[] {
    const q = (this.searchText || '').trim().toLowerCase();
    return (this.reports || []).filter(r => {
      if (this.selectedEstado && this.selectedEstado !== 'all') {
        const state = (r.reporteGestion && r.reporteGestion.estado) ? r.reporteGestion.estado : (r.ultimoEstado || '');
        if (state !== this.selectedEstado) return false;
      }
      if (this.selectedPrioridad && this.selectedPrioridad !== 'all') {
        const pr = (r.reporteGestion && r.reporteGestion.prioridad) ? r.reporteGestion.prioridad : '';
        if (pr !== this.selectedPrioridad) return false;
      }
      // tipo filtering is approximate here: compare tipoIncidenteId text
      if (this.selectedTipo && this.selectedTipo !== 'all') {
        // compare tipoIncidenteId with selectedTipo (string-safe)
        const tipoId = (r.tipoIncidenteId || '');
        if (String(tipoId) !== String(this.selectedTipo)) return false;
      }
      if (!q) return true;
      // construir un string con todos los campos relevantes para búsqueda
      const hayParts: string[] = [];
      try {
        hayParts.push(String(r.descripcion || ''));
        hayParts.push(String(r.contacto || ''));
        hayParts.push(String(r.usuarioId || ''));
        hayParts.push(String(r.zonaId || ''));
        hayParts.push(String((r as any).ubicacionNombre || ''));
        hayParts.push(String(this.getZonaName(r) || ''));
        hayParts.push(String(this.getReporterName(r) || ''));
        hayParts.push(String(this.getReporterCorreo(r) || ''));
        hayParts.push(String(this.getReporterRol(r) || ''));
        hayParts.push(String(this.getTipoName(r) || ''));
        // campos internos de reporteGestion (estado/prioridad/mensajeAdmin)
        const anyr = r as any;
        if (anyr.reporteGestion) {
          hayParts.push(String(anyr.reporteGestion.estado || ''));
          hayParts.push(String(anyr.reporteGestion.prioridad || ''));
          hayParts.push(String(anyr.reporteGestion.mensajeAdmin || ''));
        }
      } catch (e) {
        // ignore
      }
      const hay = hayParts.join(' ').toLowerCase();
      return hay.includes(q);
    });
  }

  // Helpers para template (evitan accesos directos a propiedades no tipadas)
  getZonaName(r: ReporteDTO) {
    const anyr = r as any;
    return anyr.zonaNombre || anyr.ubicacionNombre || (`Zona ${r.zonaId}`);
  }

  getReporterName(r: ReporteDTO) {
    const anyr = r as any;
    return anyr.reporterNombre || anyr.reporter?.nombreCompleto || anyr.nombreCompleto || 'Usuario Desconocido';
  }

  getReporterCorreo(r: ReporteDTO) {
    const anyr = r as any;
    return anyr.reporterCorreo || anyr.reporter?.correo || anyr.correo || anyr.contacto || 'Email no disponible';
  }

  getReporterRol(r: ReporteDTO) {
    const anyr = r as any;
    return anyr.reporterRol || (anyr.reporter && anyr.reporter.roles && anyr.reporter.roles[0]) || anyr.rol || 'No especificado';
  }

  getTipoName(r: ReporteDTO) {
    const anyr = r as any;
    if (anyr.tipoNombre) return anyr.tipoNombre;
    if (r.tipoIncidenteId) return `Tipo: ${r.tipoIncidenteId}`;
    return '';
  }

  formatDate(iso?: string | null) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return String(iso);
    }
  }

  async submitAuth() {
    this.authError = null;
    if (!this.passwordInput || !this.passwordInput.trim()) { this.authError = 'Ingrese la contraseña especial'; return; }
    this.loadingAuth = true;
    try {
      // Obtener perfil para conocer username actual
      const perfilObs = this.perfil.obtenerPerfil();
      if (!perfilObs) {
        this.authError = 'No hay sesión activa. Por favor inicie sesión.';
        this.loadingAuth = false;
        return;
      }
      const perfil: any = await firstValueFrom(perfilObs as any);
      if (!perfil || !perfil.username) {
        this.authError = 'No se pudo obtener información del usuario. Intente iniciar sesión de nuevo.';
        this.loadingAuth = false;
        return;
      }
      // Re-login con mismo username y la contraseña ingresada
      await firstValueFrom(this.auth.login(perfil.username, this.passwordInput));
      // Si llega aquí, la autenticación fue exitosa
      this.accesoConcedido = true;
      this.showAuthModal = false;
      this.loadingAuth = false;
      // cargar reportes sensibles
      this.onAccessGranted();
    } catch (err: any) {
      this.loadingAuth = false;
      this.authError = err?.error?.message || err?.message || 'Credenciales inválidas';
    }
  }

  cancelAuth() {
    // Volver al dashboard del SuperAdmin
    this.router.navigate(['/superadmin']);
  }

  // Cerrar la sesión sensible (botón superior)
  closeSensitiveSession() {
    // revocar el acceso sensible y volver al dashboard
    this.accesoConcedido = false;
    this.showAuthModal = false;
    this.passwordInput = '';
    this.router.navigate(['/superadmin']);
  }

  // Estadísticas para los cards superiores
  get totalReports(): number {
    return (this.reports || []).length;
  }

  get identificadosCount(): number {
    return (this.reports || []).filter(r => !((r as any).isAnonimo)).length;
  }

  get anonimosCount(): number {
    return (this.reports || []).filter(r => !!((r as any).isAnonimo)).length;
  }

  get altaPrioridadCount(): number {
    return (this.reports || []).filter(r => {
      const anyr = r as any;
      return (anyr.reporteGestion && anyr.reporteGestion.prioridad === 'ALTA') || (anyr.ultimaPrioridad === 'ALTA');
    }).length;
  }

  get uniqueUsersCount(): number {
    const s = new Set<any>();
    (this.reports || []).forEach(r => {
      const anyr = r as any;
      if (anyr.usuarioId) s.add(anyr.usuarioId);
      else if (anyr.reporter && anyr.reporter.id) s.add(anyr.reporter.id);
    });
    return s.size;
  }

  // Limpiar filtros
  clearFilters(){
    this.searchText = '';
    this.selectedEstado = 'all';
    this.selectedPrioridad = 'all';
    this.selectedTipo = 'all';
  }

  // Exportar reportes sensibles a Excel (usa endpoint backend que devuelve un blob)
  exportToExcel(){
    // llamar al servicio y forzar descarga
    this.reporteService.exportExcel().subscribe({
      next: (blob: Blob) => {
        try {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'reportes.xlsx';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        } catch (e) {
          console.error('Error descargando el excel', e);
        }
      },
      error: (err) => { console.error('Export failed', err); alert('Error al exportar. Revisa la consola.'); }
    });
  }

}
