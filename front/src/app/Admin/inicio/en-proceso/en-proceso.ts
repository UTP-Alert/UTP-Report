import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportStateService } from '../../../services/report-state.service';
import { ReporteService, ReporteDTO } from '../../../services/reporte.service';
import { PerfilService } from '../../../services/perfil.service';
import { ZonaService } from '../../../services/zona.service';
import { TipoIncidenteService } from '../../../services/tipo-incidente.service';
import { UsuarioService } from '../../../services/usuario.service';

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
        const estado = (r as any).ultimoEstado || '';
        // filter by estado EN_PROCESO and by selectedZonaId if provided
        if(estado === 'EN_PROCESO'){
          if(zonaId != null && Number(r.zonaId) !== Number(zonaId)) continue;
          const priority = (r as any).ultimaPrioridad ? ((r as any).ultimaPrioridad as string).toLowerCase() : '';
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

}
