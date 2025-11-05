import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReportaAhora } from './reporta-ahora/reporta-ahora';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TimeService } from '../../services/time.service';
import { DetalleReporte } from './detalle-reporte/detalle-reporte';
import { ReporteService, ReporteDTO } from '../../services/reporte.service';
import { PerfilService } from '../../services/perfil.service';
import { Sede, SedeService } from '../../services/sede.service';
import { Zona, ZonaService } from '../../services/zona.service';

@Component({
  selector: 'app-inicio-usuario',
  standalone: true,
  imports: [CommonModule, NgIf, HttpClientModule, ReportaAhora, DetalleReporte],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss']
})
export class InicioUsuario implements OnInit {
  showReportModal = false;
  // Modal Detalle de Reporte
  showDetalleModal = false;
  usuarioId: number | null = null;
  hasReportesHoy = false;
  // Mini-modales (toasts) y conteo
  showToastLimit = false;
  showToastSuccess = false;
  showToastAuth = false;
  // Mini-modales centrados
  showDialogLimit = false;
  showDialogSuccess = false;
  private toastTimer: any;
  private dialogTimer: any;
  private reportsRefreshTimer: any;
  // Fuente de verdad: el hijo reporta el conteo, pero aquí retenemos el estado para bloquear botón
  reportesUsadosHoy = 0;
  reportesLimite = 3;
  get limiteAlcanzado(): boolean { return this.reportesUsadosHoy >= this.reportesLimite; }
  // Seguimiento de mis reportes (temporal/local hasta que admin gestione estados)
  misReportes: Array<{ id?: number; tipoNombre: string; zonaNombre: string; fechaCreacion: string; estado: string; usuarioId: number; }> = [];
  // Helpers para progreso visual en "Mis Reportes"
  getReporteProgress(r: any): number { return (r && typeof r._progress === 'number') ? r._progress : this.progressInfo(r?.estado).percent; }
  getEstadoLabel(r: any): string { return (r && r._estadoLabel) ? r._estadoLabel : this.progressInfo(r?.estado).label; }
  getBarClass(r: any): string { return (r && r._barClass) ? r._barClass : this.progressInfo(r?.estado).barClass; }
  getEstadoBadgeClass(r: any): string { return (r && r._badgeClass) ? r._badgeClass : this.progressInfo(r?.estado).badgeClass; }
  getEstadoSubtitle(r: any): string { return (r && r._subtitle) ? r._subtitle : this.progressInfo(r?.estado).subtitle; }
  // Mostrar la etiqueta cruda del backend, con formato bonito
  formatEstadoLabel(e: any): string {
    try {
      const s = (e ?? '').toString().trim();
      if (!s) return '';
      const t = s
        .replace(/[_-]+/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (m: string) => m.toUpperCase());
      return t;
    } catch { return (e ?? '').toString(); }
  }
  // Resumen de estados para chips superiores
  estadoResumen: Array<{ key: string; label: string; count: number; badgeClass: string }> = [];
  // Estado de Zonas Universitarias (sección solicitada)
  zonasSede: Array<(Zona & { _incidentes?: number; _status?: 'segura'|'precaucion'|'peligrosa' })> = [];
  lastRefreshLabel: string = 'Hoy';

  constructor(
    private http: HttpClient,
    private reporteService: ReporteService,
    private timeService: TimeService,
    private perfilService: PerfilService,
    private sedeService: SedeService,
    private zonaService: ZonaService
  ) {}

  ngOnInit(): void {
    // Cargar el conteo diario al iniciar para bloquear el botón si corresponde
    const base = 'http://localhost:8080';
    const username = this.extractUsernameFromToken();
    if (!username) return;
    // Traer hora real del server y UsuarioDTO, luego decidir intentos locales
    this.timeService.getServerDateISO().subscribe({
      next: (serverISO) => {
        this.http.get<any[]>(`${base}/api/usuarios`).subscribe({
          next: lista => {
            const found = (lista || []).find(u => u.username === username);
            if (typeof found?.id === 'number') this.usuarioId = found.id;
            // Si backend manda fechaUltimoReporte, comparar con fecha real del servidor
            const fechaUlt = (found?.fechaUltimoReporte as string | undefined) || null; // esperado "YYYY-MM-DD"
            const intentos = typeof found?.intentos === 'number' ? found.intentos : 0;
            if (fechaUlt && typeof fechaUlt === 'string') {
              if (fechaUlt !== serverISO) {
                // Nuevo día según servidor: resetear intentos solo en el front
                this.reportesUsadosHoy = 0;
              } else {
                this.reportesUsadosHoy = intentos;
              }
            } else {
              // Si no hay fecha registrada, no bloqueamos de más
              this.reportesUsadosHoy = intentos;
            }
            if (typeof found?.id === 'number') {
              this.checkReportesHoy(found.id);
              this.cargarMisReportesLocal(found.id);
              this.startAutoRefresh(found.id);
            }
          },
          error: _ => { /* silencioso */ }
        });
      },
      error: _ => {
        // Si no podemos obtener hora real, usar lo que venga del backend como fallback
        this.http.get<any[]>(`${base}/api/usuarios`).subscribe({
          next: lista => {
            const found = (lista || []).find(u => u.username === username);
            if (typeof found?.intentos === 'number') this.reportesUsadosHoy = found.intentos;
            if (typeof found?.id === 'number') {
              this.usuarioId = found.id;
              this.checkReportesHoy(found.id);
              this.cargarMisReportesLocal(found.id);
              this.startAutoRefresh(found.id);
            }
          },
          error: _ => {}
        });
      }
    });

    // Cargar sólo la sección de estado de zonas universitarias
    this.cargarEstadoZonasUniversitarias();
  }

  private extractUsernameFromToken(): string | null {
    try {
      const tok = localStorage.getItem('auth_token');
      if (!tok) return null;
      const payload = tok.split('.')[1];
      const json = atob(payload.replace(/-/g,'+').replace(/_/g,'/'));
      const decoded = JSON.parse(json);
      return decoded?.sub || decoded?.username || null;
    } catch { return null; }
  }

  /**
   * Carga la sede del alumno a partir de /api/usuarios/me (espera sedeNombre),
   * resuelve el sedeId desde el catálogo de sedes y consulta zonas y conteo real de incidentes por zona.
   * Mapea el estado según la regla: 0–1 segura, 2 precaución, 3+ peligrosa.
   */
  private cargarEstadoZonasUniversitarias() {
    // 1) Obtener catálogo de sedes
    this.sedeService.obtenerSedes().subscribe({
      next: (sedes: Sede[]) => {
        const listaSedes = sedes || [];
        // 2) Obtener perfil con sedeNombre (si no existe, usar primera sede como fallback)
        this.perfilService.obtenerPerfil()?.subscribe({
          next: (perfil: any) => {
            const sedeNombre: string | null = perfil?.sedeNombre || null;
            const encontrada = sedeNombre
              ? listaSedes.find(s => (s.nombre || '').toLowerCase() === String(sedeNombre).toLowerCase())
              : null;
            const sedeId = encontrada?.id ?? (listaSedes.length ? listaSedes[0].id : null);
            this.cargarZonasYConteos(sedeId);
          },
          error: _ => {
            const sedeId = listaSedes.length ? listaSedes[0].id : null;
            this.cargarZonasYConteos(sedeId);
          }
        });
      },
      error: _ => {
        // Si no hay sedes, no hay nada que mostrar en la sección
        this.zonasSede = [];
      }
    });
  }

  private cargarZonasYConteos(sedeId: number | null) {
    if (sedeId == null) { this.zonasSede = []; return; }
    // 3) Obtener zonas por sede
    this.zonaService.obtenerZonasPorSede(sedeId).subscribe({
      next: (zonas: Zona[]) => {
        const mapaZonas: Record<number, Zona & { _incidentes?: number; _status?: 'segura'|'precaucion'|'peligrosa' }> = {} as any;
        (zonas || []).forEach(z => { mapaZonas[z.id] = { ...z, _incidentes: 0, _status: 'segura' }; });
        // 4) Obtener reportes filtrados por sede para contar incidentes reales
        this.reporteService.getFiltered(undefined, sedeId).subscribe({
          next: (reportes: ReporteDTO[]) => {
            const counts: Record<number, number> = {};
            (reportes || []).forEach(r => {
              const zid = Number(r.zonaId);
              if (!isNaN(zid)) counts[zid] = (counts[zid] || 0) + 1;
            });
            // 5) Mapear conteos y estado a cada zona
            const resultado: Array<Zona & { _incidentes?: number; _status?: 'segura'|'precaucion'|'peligrosa' }> = [];
            for (const z of zonas || []) {
              const c = counts[z.id] || 0;
              const st = this.clasificarEstadoPorConteo(c);
              resultado.push({ ...z, _incidentes: c, _status: st });
            }
            this.zonasSede = resultado;
            this.lastRefreshLabel = 'Hoy';
          },
          error: _ => {
            // Si falla el conteo, mostrar solo las zonas como seguras por defecto
            this.zonasSede = (zonas || []).map(z => ({ ...z, _incidentes: 0, _status: 'segura' as const }));
          }
        });
      },
      error: _ => { this.zonasSede = []; }
    });
  }

  private clasificarEstadoPorConteo(cantidad: number): 'segura'|'precaucion'|'peligrosa' {
    // Regla solicitada: 1–5 -> segura, 6–10 -> precaución, 11–15 -> peligrosa.
    // Asumimos 0 también como segura y >15 permanece como peligrosa.
    if (cantidad >= 11) return 'peligrosa';
    if (cantidad >= 6) return 'precaucion';
    return 'segura'; // 0–5
  }

  // ----- Progreso por estado del reporte (para "Mis Reportes") -----
  private normalizeEstado(e: any): string {
    const s = (e ?? '').toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_').replace(/-+/g, '_');
    return s;
  }

  private progressInfo(estado: string | null | undefined): { percent: number; label: string; subtitle: string; barClass: string; badgeClass: string } {
    const n = this.normalizeEstado(estado);
    // Estados esperados: pendiente, en_proceso, ubicado, investigando, pendiente_de_aprobacion, resuelto (+ equivalentes)
    if (!n || n === 'nuevo' || n === 'pendiente') {
      return { percent: 10, label: 'Pendiente', subtitle: 'Recibido por administración', barClass: 'bg-blue-500', badgeClass: 'bg-blue-500 text-white' };
    }
    if (n.includes('en_proceso') || n === 'proceso' || n === 'revisado' || n === 'asignado') {
      return { percent: 40, label: 'En Proceso', subtitle: 'Gestionando el caso', barClass: 'bg-yellow-500', badgeClass: 'bg-yellow-600 text-white' };
    }
    if (n.includes('ubicado') || n.includes('ubicnado') || n.includes('en_zona') || n.includes('zona_ubicada')) {
      return { percent: 60, label: 'Ubicado', subtitle: 'Zona ubicada / Personal en sitio', barClass: 'bg-indigo-500', badgeClass: 'bg-indigo-500 text-white' };
    }
    if (n.includes('investigando') || n.includes('investigacion')) {
      return { percent: 80, label: 'Investigando', subtitle: 'Investigación en curso', barClass: 'bg-purple-500', badgeClass: 'bg-purple-500 text-white' };
    }
    if (n.includes('pendiente') && n.includes('aprob')) { // pendiente_de_aprobacion | pend_aprobacion
      return { percent: 90, label: 'Pendiente de Aprobación', subtitle: 'Esperando aprobación', barClass: 'bg-orange-500', badgeClass: 'bg-orange-500 text-white' };
    }
    if (n.includes('resuelto') || n.includes('completado') || n.includes('finalizado') || n.includes('cerrado')) {
      return { percent: 100, label: 'Resuelto', subtitle: 'Caso resuelto', barClass: 'bg-green-600', badgeClass: 'bg-green-600 text-white' };
    }
    if (n.includes('rechazado') || n.includes('descartado')) {
      return { percent: 100, label: 'Rechazado', subtitle: 'Reporte rechazado por administración', barClass: 'bg-red-600', badgeClass: 'bg-red-600 text-white' };
    }
    return { percent: 0, label: 'Desconocido', subtitle: 'Estado desconocido', barClass: 'bg-gray-500', badgeClass: 'bg-gray-400 text-white' };
  }

  private estadoKeyFromLabel(lbl: string): string {
    const s = (lbl || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (s.includes('nuevo')) return 'nuevo';
    if (s.includes('proceso')) return 'proceso';
    if (s.includes('ruta')) return 'ruta';
    if (s.includes('zona')) return 'zona';
    if (s.includes('complet')) return 'completado';
    if (s.includes('rechaz')) return 'rechazado';
    return 'desconocido';
  }

  private actualizarEstadoResumen() {
    const buckets: Record<string, { label: string; count: number; badgeClass: string }> = {
      nuevo:       { label: 'Nuevo',       count: 0, badgeClass: 'bg-gray-500 text-white' },
      proceso:     { label: 'En Proceso',  count: 0, badgeClass: 'bg-yellow-500 text-white' },
      ruta:        { label: 'En Ruta',     count: 0, badgeClass: 'bg-blue-500 text-white' },
      zona:        { label: 'En Zona',     count: 0, badgeClass: 'bg-indigo-500 text-white' },
      completado:  { label: 'Completado',  count: 0, badgeClass: 'bg-green-600 text-white' },
      rechazado:   { label: 'Rechazado',   count: 0, badgeClass: 'bg-red-600 text-white' },
      desconocido: { label: 'Desconocido', count: 0, badgeClass: 'bg-gray-400 text-white' }
    };
    for (const r of this.misReportes as any[]) {
      const info = this.progressInfo(r?.estado);
      const k = this.estadoKeyFromLabel(info.label);
      buckets[k].count++;
    }
    this.estadoResumen = Object.entries(buckets)
      .filter(([k]) => k !== 'desconocido')
      .map(([key, v]) => ({ key, label: v.label, count: v.count, badgeClass: v.badgeClass }));
  }

  openReportModal() {
    if (this.limiteAlcanzado) {
      this.showLimitDialog();
      return;
    }
    this.showReportModal = true;
    try { document.body.style.overflow = 'hidden'; } catch {}
  }
  closeReportModal() {
    this.showReportModal = false;
    try { document.body.style.overflow = ''; } catch {}
  }

  // Abrir/Cerrar Detalle de Reporte
  openDetalleModal() {
    if (!this.usuarioId) return;
    this.showDetalleModal = true;
    try { document.body.style.overflow = 'hidden'; } catch {}
  }
  closeDetalleModal() {
    this.showDetalleModal = false;
    try { document.body.style.overflow = ''; } catch {}
  }

  // Recepción del evento de éxito desde el modal hijo
  onReporteEnviado() {
    try { console.debug('[InicioUsuario] Reporte enviado: mostrando toast de éxito'); } catch {}
    // incrementar contador local (el hijo ya hizo su incremento local)
    this.reportesUsadosHoy = Math.min(this.reportesUsadosHoy + 1, this.reportesLimite);
    // Desde el primer envío del día, habilitar botón de detalle
    this.hasReportesHoy = true;
    this.showSuccessDialog();
    // Refrescar la lista desde localStorage para mostrar el reporte al instante
    if (this.usuarioId !== null) {
      this.cargarMisReportesLocal(this.usuarioId);
    }
  }

  // Maneja el DTO creado desde el modal y lo inserta inmediatamente en la lista de 'misReportes'
  onSavedReport(createdReport?: any) {
    if (!createdReport || !this.usuarioId) return;
    try {
      const exists = this.misReportes.some(r => r.id && createdReport.id && Number(r.id) === Number(createdReport.id));
      if (exists) return;
      const estadoNuevo = ((createdReport.ultimoEstado as string) || 'nuevo') as string;
      const info = this.progressInfo(estadoNuevo);
      const item = {
        id: createdReport.id,
        tipoNombre: (createdReport as any).tipoNombre || '',
        zonaNombre: (createdReport as any).zonaNombre || '',
        fechaCreacion: createdReport.fechaCreacion || new Date().toISOString(),
        estado: estadoNuevo,
        usuarioId: createdReport.usuarioId || this.usuarioId,
        _progress: info.percent,
        _estadoLabel: info.label,
        _barClass: info.barClass,
        _badgeClass: info.badgeClass,
        _subtitle: info.subtitle
      } as any;
      // Insertar al inicio para visibilidad inmediata
      this.misReportes = [item, ...this.misReportes];
      this.hasReportesHoy = true;
      this.actualizarEstadoResumen();
    } catch (e) {
      // si ocurre algo, no bloquear la experiencia
      console.warn('onSavedReport error', e);
    }
  }

  // Utilidades para mini-modales
  private showLimitToast() {
    this.showToastLimit = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.showToastLimit = false; }, 2500);
  }
  private showSuccessToast() {
    this.showToastSuccess = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.showToastSuccess = false; }, 2200);
  }
  // Diálogos centrados
  private showLimitDialog() {
    this.showDialogLimit = true;
    if (this.dialogTimer) clearTimeout(this.dialogTimer);
    this.dialogTimer = setTimeout(() => { this.showDialogLimit = false; }, 3000);
  }
  private showSuccessDialog() {
    this.showDialogSuccess = true;
    if (this.dialogTimer) clearTimeout(this.dialogTimer);
    this.dialogTimer = setTimeout(() => { this.showDialogSuccess = false; }, 2500);
  }
  onAuthRequired() {
    this.showToastAuth = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.showToastAuth = false; }, 3000);
  }

  // Cerrar con tecla ESC
  @HostListener('document:keydown.escape') onEsc() {
    if (this.showReportModal) this.closeReportModal();
    else if (this.showDetalleModal) this.closeDetalleModal();
  }

  ngOnDestroy() {
    // En caso el componente se destruya con el modal abierto, restablecer scroll
    try { document.body.style.overflow = ''; } catch {}
    if (this.toastTimer) { try { clearTimeout(this.toastTimer); } catch {} }
    if (this.dialogTimer) { try { clearTimeout(this.dialogTimer); } catch {} }
    if (this.reportsRefreshTimer) { try { clearInterval(this.reportsRefreshTimer); } catch {} }
  }

  private checkReportesHoy(uid: number) {
    this.reporteService.getAll().subscribe({
      next: (lista: ReporteDTO[]) => {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = hoy.getMonth();
        const dd = hoy.getDate();
        const hay = (lista || []).some(r => {
          if (r.usuarioId !== uid) return false;
          if (!r.fechaCreacion) return false;
          const d = new Date(r.fechaCreacion as any);
          return d.getFullYear() === yyyy && d.getMonth() === mm && d.getDate() === dd;
        });
        this.hasReportesHoy = hay;
      },
      error: _ => { this.hasReportesHoy = false; }
    });
  }

  cargarMisReportesLocal(uid: number) {
    // Ya no leemos desde localStorage; consultamos al backend y filtramos por usuarioId
    this.reporteService.getAll().subscribe({
      next: (lista: ReporteDTO[]) => {
        try{
          this.misReportes = (lista || [])
            .filter(r => Number(r.usuarioId) === Number(uid))
            .map(r => {
              const estado = (r.ultimoEstado ?? r.reporteGestion?.estado ?? (r as any).estado ?? (r as any).estadoActual ?? 'nuevo') as string;
              const info = this.progressInfo(estado);
              return {
                id: r.id,
                tipoNombre: (r as any).tipoNombre || '',
                zonaNombre: (r as any).zonaNombre || '',
                fechaCreacion: r.fechaCreacion || '',
                estado,
                usuarioId: r.usuarioId,
                _progress: info.percent,
                _estadoLabel: info.label,
                _barClass: info.barClass,
                _badgeClass: info.badgeClass,
                _subtitle: info.subtitle
              } as any;
            });
          this.actualizarEstadoResumen();
        }catch(e){ this.misReportes = []; }
      },
      error: _ => { this.misReportes = []; }
    });
  }

  private startAutoRefresh(uid: number) {
    if (this.reportsRefreshTimer) { try { clearInterval(this.reportsRefreshTimer); } catch {} }
    // refresco cada 30s para traer el último estado desde backend
    this.reportsRefreshTimer = setInterval(() => {
      this.cargarMisReportesLocal(uid);
    }, 30000);
  }

  // Formato corto de fecha/hora para el template
  formatFecha(fechaISO: string): string {
    try {
      const d = new Date(fechaISO);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy}, ${hh}:${mi}`;
    } catch { return fechaISO; }
  }
}
