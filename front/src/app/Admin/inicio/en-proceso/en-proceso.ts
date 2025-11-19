import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportStateService } from '../../../services/report-state.service';
import { ReporteService, ReporteDTO } from '../../../services/reporte.service';
import { PerfilService } from '../../../services/perfil.service';
import { ZonaService } from '../../../services/zona.service';
import { TipoIncidenteService } from '../../../services/tipo-incidente.service';
import { UsuarioService } from '../../../services/usuario.service';
import { finalize } from 'rxjs/operators';

interface InProcessItem { id: number; priority?: 'baja'|'media'|'alta'|''; assigned?: any; report?: any }

@Component({
  selector: 'app-en-proceso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './en-proceso.html',
  styleUrls: ['./en-proceso.scss']
})
export class EnProceso implements OnInit {
  items: InProcessItem[] = [];
  zonasMap: Record<number,string> = {};
  tiposMap: Record<number,string> = {};
  usuariosMap: Record<number,string> = {};
  zonasList: any[] = [];
  showZoneFilter: boolean = false;
  selectedZonaId?: number | null = null;
  // Sede detectada a partir de las zonas de los reportes cargados
  reportSedeId?: number | null = null;
  loading: boolean = false;
  // Timers: llevar el tiempo en proceso y refrescar cada segundo
  private tickTimer: any;
  private processStartAt: Record<number, number> = {};
  timeInProcessLabel: Record<number, string> = {};
  constructor(private reportState: ReportStateService,
              private reporteService: ReporteService,
              private perfilService: PerfilService,
              private zonaService: ZonaService,
              private tipoService: TipoIncidenteService,
              private usuarioService: UsuarioService){}

  ngOnInit(): void{
    // Subscribe in-memory snapshot so newly assigned items appear immediately
    this.reportState.snapshot.subscribe(s => {
      // build map from current items (backend + snapshot)
      const map: Record<number, InProcessItem> = {};
      // seed from current items
      for(const it of this.items) map[it.id] = it;
      // overlay snapshot in-process ids
      const mapReports = s.reports || {};
      (s.inProcessIds || []).forEach(id => {
        map[id] = {
          id,
          priority: s.priorities ? (s.priorities[id] as any) : '',
          assigned: s.assignedSecurity ? s.assignedSecurity[id] : undefined,
          report: mapReports[id]
        };
      });
      this.items = Object.values(map).sort((a,b) => (b.report?.fechaCreacion ? new Date(b.report.fechaCreacion).getTime() : b.id) - (a.report?.fechaCreacion ? new Date(a.report.fechaCreacion).getTime() : a.id));
      this.recomputeProcessStarts();
      this.startTicking();
    });

    // Load persisted EN_PROCESO items from backend (filtered by sede si está disponible)
    const perfilObs: any = (this.perfilService as any).obtenerPerfil ? (this.perfilService as any).obtenerPerfil() : null;
    if(perfilObs){
      perfilObs.subscribe({ next: (perfil: any) => {
        const sedeId = perfil?.sedeId ? Number(perfil.sedeId) : null;
        // Cargamos los reportes persistidos (la función loadPersistedEnProceso
        // intentará detectar la sede a partir de las zonas de los reportes y
        // luego cargará las zonas correctas para el popover).
        this.loadPersistedEnProceso(sedeId, this.selectedZonaId ?? null);
      }, error: () => { this.loadPersistedEnProceso(null, this.selectedZonaId ?? null); this.loadZonesForSede(null); } });
    } else {
      this.loadPersistedEnProceso(null, this.selectedZonaId ?? null);
    }
    // cargar datos auxiliares: zonas, tipos, usuarios
    this.loadAuxData();
  }

  private loadPersistedEnProceso(sedeId?: number | null, zonaId?: number | null, onComplete?: () => void){
    this.reporteService.getFiltered(undefined, sedeId ?? undefined).subscribe(
      (list: ReporteDTO[]) => {
      const map: Record<number, InProcessItem> = {};
      // Intentamos detectar la sede a partir de los reportes: si todos los
      // reportes traen zonaId, y las zonas contienen sedeId (vía servicio),
      // usamos esa sede para cargar sólo sus zonas en el popover.
      // Guardamos la sede detectada en `reportSedeId`.
      this.reportSedeId = null;
      const zonaIds: Set<number> = new Set();
      for(const r of list || []){
        // Backend ahora incorpora la info de gestión dentro de `reporteGestion`.
        // Compatibilidad: preferir `reporteGestion.estado` / `reporteGestion.prioridad`
        // y caer a campos antiguos (`ultimoEstado` / `ultimaPrioridad`) si no existen.
        const estado = (r as any).reporteGestion && (r as any).reporteGestion.estado ? String((r as any).reporteGestion.estado) : ((r as any).ultimoEstado || '');
  // filter by estados that represent an active in-process flow
  // keep reports that are EN_PROCESO, UBICANDO or INVESTIGANDO so
  // when seguridad marca 'Ir a la Zona' (UBICANDO) the report stays
  // visible in this list until it's finally sent (PENDIENTE_APROBACION)
  if(['EN_PROCESO','UBICANDO','INVESTIGANDO'].includes(estado)){
          if(zonaId != null && Number(r.zonaId) !== Number(zonaId)) continue;
          const priority = (r as any).reporteGestion && (r as any).reporteGestion.prioridad ? String((r as any).reporteGestion.prioridad).toLowerCase() : ((r as any).ultimaPrioridad ? String((r as any).ultimaPrioridad).toLowerCase() : '');
          map[r.id] = { id: r.id, priority: (priority as any), assigned: (r as any).seguridadAsignadoId ? { id: (r as any).seguridadAsignadoId } : undefined, report: r };
          if(r.zonaId) zonaIds.add(Number(r.zonaId));
        }
      }
      // Si detectamos alguna zonaId, intentamos resolver su sede consultando
      // el endpoint de zonas por sede (el backend expone la relación), pero
      // primero pedimos todas las zonas en batch y comprobamos sus sedeId.
      if(zonaIds.size){
        // cargar todas las zonas y buscar la primera que coincida
        this.zonaService.obtenerZonas().subscribe(
          (allZs: any[]) => {
            for(const z of allZs || []){
              this.zonasMap[z.id] = z.nombre;
              if(zonaIds.has(Number(z.id)) && z.sedeId){
                this.reportSedeId = Number(z.sedeId);
                break;
              }
            }
            // si encontramos una sede asociada a las zonas, cargar zonas de esa sede
            if(this.reportSedeId != null){
              this.loadZonesForSede(this.reportSedeId);
            } else {
              // fallback: si no se detectó sede, usar el sedeId pasado por parámetro
              if(sedeId != null) this.loadZonesForSede(sedeId);
            }
          },
          () => { if(sedeId != null) this.loadZonesForSede(sedeId); }
        );
      } else {
        // no hay zonaIds detectadas, cargar por sedeId si fue provisto
        if(sedeId != null) this.loadZonesForSede(sedeId);
      }
      // merge with any existing items from snapshot (snapshot subscriber will overlay later)
      const merged = { ...map };
      for(const it of this.items) merged[it.id] = it;
      this.items = Object.values(merged).sort((a,b) => (b.report?.fechaCreacion ? new Date(b.report.fechaCreacion).getTime() : b.id) - (a.report?.fechaCreacion ? new Date(a.report.fechaCreacion).getTime() : a.id));
        this.recomputeProcessStarts();
        this.startTicking();
        if(onComplete) onComplete();
      },
      (err: any) => { console.error('Error cargando reportes EN_PROCESO desde backend', err); if(onComplete) onComplete(); }
    );
  }

  // Ensure zonasList is loaded when opening the popover
  toggleZoneFilter(){
    // if already loaded, just toggle
    if(this.zonasList && this.zonasList.length){
      this.showZoneFilter = !this.showZoneFilter;
      return;
    }
    // Prefer synchronous perfil signal if available
    try{
      // Si ya detectamos una sede a partir de los reportes, preferirla
      if(this.reportSedeId != null){ this.loadZonesForSede(this.reportSedeId); this.showZoneFilter = true; return; }
      const p: any = (this.perfilService as any).perfil ? (this.perfilService as any).perfil() : null;
      const sedeId = p && p.sedeId ? Number(p.sedeId) : null;
      if(sedeId != null){ this.loadZonesForSede(sedeId); this.showZoneFilter = true; return; }
    }catch(e){ /* ignore */ }

    // Fallback: try obtenerPerfil() async
    const perfilObs: any = (this.perfilService as any).obtenerPerfil ? (this.perfilService as any).obtenerPerfil() : null;
    if(perfilObs){
      perfilObs.subscribe({ next: (perfil: any) => { const sedeId = perfil?.sedeId ? Number(perfil.sedeId) : null; if(sedeId != null) this.loadZonesForSede(sedeId); else this.loadZonesForSede(null); this.showZoneFilter = true; }, error: (err: any) => { this.loadZonesForSede(null); this.showZoneFilter = true; } });
      return;
    }

    // Last resort: load all zones
    this.zonaService.obtenerZonas().subscribe({ next: (zs: any) => { this.zonasList = zs || []; for(const z of this.zonasList) this.zonasMap[z.id] = z.nombre; this.showZoneFilter = true; }, error: (err: any) => { this.zonasList = []; this.showZoneFilter = true; } });
  }

  applyZoneFilter(zonaId?: number | null){
    this.selectedZonaId = zonaId ?? null;
    // recargar con filtro
    const perfilObs: any = (this.perfilService as any).obtenerPerfil ? (this.perfilService as any).obtenerPerfil() : null;
    if(perfilObs){
      perfilObs.subscribe({ next: (perfil: any) => { const sedeId = perfil?.sedeId ? Number(perfil.sedeId) : null; this.loadPersistedEnProceso(sedeId, this.selectedZonaId); }, error: () => this.loadPersistedEnProceso(null, this.selectedZonaId) });
    } else {
      this.loadPersistedEnProceso(null, this.selectedZonaId);
    }
    this.showZoneFilter = false;
  }

  refreshEnProceso(){
    if(this.loading) return; // evita multiples clicks
    this.loading = true;
    const done = () => { this.loading = false; };
    const perfilObs: any = (this.perfilService as any).obtenerPerfil ? (this.perfilService as any).obtenerPerfil() : null;
    if(perfilObs){
      perfilObs.subscribe({ next: (perfil:any) => { const sedeId = perfil?.sedeId ? Number(perfil.sedeId) : null; this.loadPersistedEnProceso(sedeId, this.selectedZonaId, done); }, error: () => this.loadPersistedEnProceso(null, this.selectedZonaId, done) });
    } else {
      this.loadPersistedEnProceso(null, this.selectedZonaId, done);
    }
  }

  private loadZonesForSede(sedeId?: number | null){
    if(sedeId != null && (this.zonaService as any).obtenerZonasPorSede){
      (this.zonaService as any).obtenerZonasPorSede(sedeId).subscribe({ next: (zs: any) => { this.zonasList = zs || []; for(const z of this.zonasList) this.zonasMap[z.id] = z.nombre; }, error: (_: any) => { this.zonasList = []; } });
    } else {
      // if no sedeId, load all zonas
      this.zonaService.obtenerZonas().subscribe((zs: any) => { this.zonasList = zs || []; for(const z of this.zonasList) this.zonasMap[z.id] = z.nombre; }, (err: any) => { this.zonasList = []; });
    }
  }

  private loadAuxData(){
    this.zonaService.obtenerZonas().subscribe(zs => { for(const z of zs) this.zonasMap[z.id] = z.nombre; }, err => {});
    this.tipoService.getAll().subscribe(ts => { for(const t of ts) this.tiposMap[t.id] = t.nombre; }, err => {});
    this.usuarioService.getAll().subscribe(us => { for(const u of us) this.usuariosMap[u.id] = u.nombreCompleto || u.username || String(u.id); }, err => {});
  }

  // Reutilizamos la lógica de clases de prioridad para mantener consistencia visual
  cardClassFor(priority: string): string{
    const map: Record<string,string> = {
      'baja': 'border-l-4 border-l-blue-500 bg-blue-50',
      'media': 'border-l-4 border-l-yellow-500 bg-yellow-50',
      'alta': 'border-l-4 border-l-red-500 bg-red-50'
    };
    if(!priority) return '';
    return map[priority] || '';
  }

  priorityBadgeClassFor(priority?: string): string{
    const p = priority || '';
    const map: Record<string,string> = {
      'baja': 'badge bg-blue-500 hover:bg-blue-600',
      'media': 'badge bg-yellow-500 hover:bg-yellow-600',
      'alta': 'badge bg-red-500 hover:bg-red-600'
    };
    return map[p] || '';
  }

  avatarFillColorForPriority(priority?: string): string{
    const p = priority || '';
    const map: Record<string,string> = {
      'baja': '#3b82f6', // azul
      'media': '#f59e0b', // amarillo
      'alta': '#ef4444'   // rojo
    };
    if(!p) return '#d1d5db';
    return map[p] || '#d1d5db';
  }

  // Cancelar un reporte en proceso: persistir y notificar al estado compartido
  cancelReport(reportId: number){
    if(!reportId) return;
    const item = this.items.find(i => i.id === reportId);
    const prioridad = item && item.priority ? (item.priority as string).toUpperCase() : '';
    this.reporteService.updateGestion(reportId, 'CANCELADO', prioridad)
      .pipe(finalize(() => {}))
      .subscribe({ next: (res: any) => {
        // quitar del listado local
        this.items = this.items.filter(it => it.id !== reportId);
        // notificar al estado compartido
        try{ this.reportState.markCancelled(reportId); }catch(e){}
        // Fallback: actualizar zona asociada (si la encontramos) para ajustar métricas si backend recalcula
        try {
          const zonaId = (item?.report as any)?.zonaId;
          if(typeof zonaId === 'number'){
            this.zonaService.obtenerZonas().subscribe(zs => {
              const z = (zs || []).find((zz: any) => zz.id === zonaId);
              if(z){ try { window.dispatchEvent(new CustomEvent('zone-status-update', { detail: z })); } catch {} }
            });
          }
        } catch {}
      }, error: err => console.error('Error cancelando reporte en proceso', err) });
  }

  // Devuelve una cadena legible para el estado actual del reporte
  estadoDisplay(report: any): string{
    if(!report) return 'Sin estado';
    const raw = (report.reporteGestion && report.reporteGestion.estado) ? String(report.reporteGestion.estado) : (report.ultimoEstado || '');
    const key = (raw || '').toUpperCase();
    switch(key){
      case 'UBICANDO': return 'Ubicando';
      case 'INVESTIGANDO': return 'Investigando';
      case 'EN_PROCESO': return 'En proceso';
      case 'PENDIENTE_APROBACION': return 'Pendiente de aprobación';
      case 'RESUELTO': return 'Resuelto';
      case 'CANCELADO': return 'Cancelado';
      default: return raw ? (raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()) : 'Sin estado';
    }
  }

  // helper para devolver src de imagen si el reporte contiene foto
  getImageSrc(report: any): string | null {
    if(!report) return null;
    const f = (report.foto || report.file || report.image) as any;
    if(!f) return null;
    try{
      if(typeof f === 'string'){
        if(f.startsWith('data:')) return f;
        return 'data:image/jpeg;base64,' + f;
      }
      if(Array.isArray(f)){
        const binary = f.map((b: number) => String.fromCharCode(b)).join('');
        return 'data:image/jpeg;base64,' + btoa(binary);
      }
    }catch(e){ console.error('getImageSrc', e); }
    return null;
  }

  // image modal helpers
  selectedImageSrc: string | null = null;
  imageModalVisible: boolean = false;

  openImage(src: string){ this.selectedImageSrc = src; this.imageModalVisible = true; }
  closeImage(){ this.imageModalVisible = false; this.selectedImageSrc = null; }

  // fallback: si el modal no aparece por CSS/overlay, abrir en nueva pestaña
  openImageWithFallback(src: string){
    this.openImage(src);
    setTimeout(() => { try{ if(!this.imageModalVisible){ window.open(src, '_blank'); } }catch(e){} }, 80);
  }

  ngOnDestroy(){
    try{ if(this.tickTimer) clearInterval(this.tickTimer); }catch(e){}
  }

  private inProcessStates = new Set(['EN_PROCESO','UBICANDO','INVESTIGANDO']);
  private isPendingApproval(key: string){ return key.includes('PENDIENTE') && key.includes('APROB'); }
  private storageKey(id: number){ return `procStart_${id}`; }

  private recomputeProcessStarts(){
    // Calcula el inicio del conteo para cada item en proceso
    for(const it of this.items){
      const r: any = it.report || {};
      const estado: string = (r.reporteGestion?.estado || r.ultimoEstado || '').toString().toUpperCase();
      // Si salió de 'en proceso' o ya está Pendiente de Aprobación, limpiar y detener
      if(!this.inProcessStates.has(estado) || this.isPendingApproval(estado)) {
        delete this.processStartAt[it.id];
        this.timeInProcessLabel[it.id] = '—';
        try{ localStorage.removeItem(this.storageKey(it.id)); }catch{}
        continue;
      }
      // Mantener el inicio original si ya existe (no reiniciar)
      if(this.processStartAt[it.id]) continue;
      // Intentar restaurar de almacenamiento local para persistencia entre recargas
      try{
        const saved = Number(localStorage.getItem(this.storageKey(it.id)) || '');
        if(!isNaN(saved) && saved > 0) { this.processStartAt[it.id] = saved; continue; }
      }catch{}
      // Estimar inicio (si no hay persistido): usar fecha de última gestión o creación
      const startISO: string | null = r.reporteGestion?.fechaActualizacion || r.fechaUltimaGestion || r.fechaCreacion || null;
      const t = startISO ? new Date(startISO).getTime() : NaN;
      if(!isNaN(t)) { this.processStartAt[it.id] = t; try{ localStorage.setItem(this.storageKey(it.id), String(t)); }catch{} }
    }
    // Actualiza inmediatamente una vez
    this.updateTimeLabels();
  }

  private startTicking(){
    if(this.tickTimer) return; // ya corriendo
    this.tickTimer = setInterval(() => this.updateTimeLabels(), 1000);
  }

  private updateTimeLabels(){
    const now = Date.now();
    for(const it of this.items){
      const start = this.processStartAt[it.id];
      if(!start) { this.timeInProcessLabel[it.id] = '—'; continue; }
      const ms = Math.max(0, now - start);
      this.timeInProcessLabel[it.id] = this.formatDuration(ms);
    }
  }

  private formatDuration(ms: number): string{
    const sec = Math.floor(ms / 1000);
    const s = sec % 60;
    const m = Math.floor(sec / 60) % 60;
    const h = Math.floor(sec / 3600) % 24;
    const d = Math.floor(sec / 86400);
    const pad = (n: number) => String(n).padStart(2,'0');
    if(d > 0) return `${d}d ${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  lastUpdate(report: any): string{
    try{
      const iso = report?.reporteGestion?.fechaActualizacion || report?.fechaUltimaGestion || null;
      if(!iso) return '—';
      const d = new Date(iso);
      // Formato corto similar al resto de la UI
      const dd = String(d.getDate()).padStart(2,'0');
      const mm = String(d.getMonth()+1).padStart(2,'0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2,'0');
      const mi = String(d.getMinutes()).padStart(2,'0');
      return `${dd}/${mm}/${yyyy}, ${hh}:${mi}`;
    }catch{ return '—'; }
  }

}
