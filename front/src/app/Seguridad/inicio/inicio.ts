import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { PerfilService } from '../../services/perfil.service';
import { RouterModule } from '@angular/router';
import { CommonModule, NgForOf } from '@angular/common';
import { ReportesAsignados } from './reportes-asignados/reportes-asignados';
import { ReporteService } from '../../services/reporte.service';
import { ReportStateService } from '../../services/report-state.service';
import { ZonaService, Zona } from '../../services/zona.service';
import { SedeService, Sede } from '../../services/sede.service';

@Component({
  selector: 'app-inicio-seguridad',
  imports: [CommonModule, NgForOf, RouterModule, ReportesAsignados],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss'
})
export class InicioSeguridad implements OnInit {
  nombreSeguridad: string = '';
  secLabel: string = 'Sec.';

  // dinámicos
  statusBadge: 'DISPONIBLE' | 'OCUPADO' | 'FUERA' = 'DISPONIBLE';
  pendingCount: number = 0;
  investigatingCount: number = 0;
  completedTodayCount: number = 0;
  highPriorityCount: number = 0;
  assignedCount: number = 0;

  private reporteListener: any = null;

  // zonas para filtro
  zonesList: Zona[] = [];

  constructor(public auth: AuthService, private perfil: PerfilService, private reporteService: ReporteService, private reportState: ReportStateService, private zonaService: ZonaService, private sedeService: SedeService){
    this.perfil.cargarPerfil();
    setTimeout(()=>{
      const p = this.perfil.perfil();
      if(p){
        this.nombreSeguridad = p.nombreCompleto;
        const nombre = this.nombreSeguridad?.trim() || '';
        this.secLabel = `Sec. ${nombre || 'Seguridad'}`;
      } else {
        this.secLabel = 'Sec. Seguridad';
      }
    },300);
  }

  ngOnInit(): void {
    this.loadAssignedStats();
    // cargar zonas para el filtro: resolver sede del perfil y cargar sólo sus zonas
    try{
      const perfilObs: any = (this.perfil as any).obtenerPerfil ? (this.perfil as any).obtenerPerfil() : null;
      const resolveAndLoad = (p: any) => {
        // heurísticas para resolver sedeId: p.sedeId | p.sede?.id | p.sedeNombre
        const directSedeId = p && (p.sedeId || p.sede?.id) ? Number(p.sedeId || p.sede?.id) : null;
        const sedeNombre = p && p.sedeNombre ? String(p.sedeNombre).trim() : null;
        if(directSedeId){
          // cargar zonas por sedeId
          if((this.zonaService as any).obtenerZonasPorSede){
            (this.zonaService as any).obtenerZonasPorSede(directSedeId).subscribe({ next: (zs: Zona[]) => { this.zonesList = zs || []; }, error: () => { this.zonesList = []; } });
            return;
          } else {
            this.zonaService.obtenerZonas().subscribe({ next: (all: Zona[]) => { this.zonesList = (all||[]).filter(z => (z as any).sedeId == directSedeId); }, error: () => { this.zonesList = []; } });
            return;
          }
        }
        // si tenemos sedeNombre, buscarla en el catálogo de sedes
        if(sedeNombre){
          this.sedeService.obtenerSedes().subscribe({ next: (sedes: Sede[]) => {
            const found = (sedes||[]).find(s => (s.nombre || '').toLowerCase() === (sedeNombre || '').toLowerCase());
            const sid = found && found.id ? Number(found.id) : null;
            if(sid && (this.zonaService as any).obtenerZonasPorSede){
              (this.zonaService as any).obtenerZonasPorSede(sid).subscribe({ next: (zs: Zona[]) => { this.zonesList = zs || []; }, error: () => { this.zonesList = []; } });
            } else if(sid){
              this.zonaService.obtenerZonas().subscribe({ next: (all: Zona[]) => { this.zonesList = (all||[]).filter(z => (z as any).sedeId == sid); }, error: () => { this.zonesList = []; } });
            } else {
              // fallback: cargar todas si no podemos resolver sede
              this.zonaService.obtenerZonas().subscribe({ next: (zs: Zona[]) => { this.zonesList = zs || []; }, error: () => { this.zonesList = []; } });
            }
          }, error: () => { this.zonesList = []; } });
          return;
        }
        // último fallback: cargar todas las zonas
        this.zonaService.obtenerZonas().subscribe({ next: (zs: Zona[]) => { this.zonesList = zs || []; }, error: () => { this.zonesList = []; } });
      };

      if(perfilObs){
        perfilObs.subscribe({ next: (p: any) => resolveAndLoad(p), error: () => { this.zonesList = []; } });
      } else {
        // si no hay observable, intentar leer la señal sincronamente
        try{ const sig = (this.perfil as any).perfil ? (this.perfil as any).perfil() : null; resolveAndLoad(sig); }catch(e){ this.zonesList = []; }
      }
    }catch(e){ this.zonesList = []; }
    // actualizar cuando haya eventos de reporte (WS) o cambio de estado global
    this.reporteListener = (ev: any) => { try { this.loadAssignedStats(); } catch {} };
    window.addEventListener('reporte-status-update', this.reporteListener as any);
    // también reaccionar a cambios en el estado in-memory
    try { this.reportState.snapshot.subscribe(() => { this.loadAssignedStats(); }); } catch {}
  }

  ngOnDestroy(): void {
    try { window.removeEventListener('reporte-status-update', this.reporteListener as any); } catch {}
  }

  logout(){ this.auth.logout(); }

  private async loadAssignedStats(){
    try{
      const perfilObs: any = (this.perfil as any).obtenerPerfil ? (this.perfil as any).obtenerPerfil() : null;
      const finish = (list: any[], myId: number | null) => {
        const assigned = (list || []).filter(r => r && r.seguridadAsignadoId != null && r.seguridadAsignadoId === myId);
        this.assignedCount = assigned.length;
        let pending = 0, investigando = 0, completadosHoy = 0, high = 0;
        const today = new Date();
        const isSameDay = (dstr?: string | null) => {
          if(!dstr) return false;
          const d = new Date(dstr);
          return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
        };
        assigned.forEach(r => {
          const estadoRaw = (r && (r as any).reporteGestion && (r as any).reporteGestion.estado) ? (r as any).reporteGestion.estado : (r && r.ultimoEstado ? r.ultimoEstado : '');
          const estado = (estadoRaw || '').toString().toLowerCase();
          const prioridadRaw = (r && (r as any).reporteGestion && (r as any).reporteGestion.prioridad) ? (r as any).reporteGestion.prioridad : (r && (r as any).ultimaPrioridad ? (r as any).ultimaPrioridad : '');
          const prioridad = (prioridadRaw || '').toString().toLowerCase();

          // Fecha relevante para cambios de estado: preferir fechaUltimaGestion, luego reporteGestion.fechaActualizacion, luego fechaCreacion
          const fechaStr = (r && ((r as any).fechaUltimaGestion || ((r as any).reporteGestion && (r as any).reporteGestion.fechaActualizacion) || (r as any).fechaCreacion)) || null;

          // Considerar completado cualquier estado que contenga 'resuel' (más tolerant)
          if (estado.includes('resuel')) {
            if (isSameDay(fechaStr)) completadosHoy++;
          } else if (estado.includes('cancel')) {
            // ignorar cancelados
          } else if (estado.includes('en_proceso') || estado.includes('ubicando') || estado.includes('investig')) {
            investigando++;
          } else if (estado.includes('pend')) {
            pending++;
          } else {
            // cualquier otro estado no resuelto => considerar pendiente
            pending++;
          }
          if (prioridad && prioridad.includes('alta')) high++;
        });
        this.pendingCount = pending;
        this.investigatingCount = investigando;
        this.completedTodayCount = completadosHoy;
        this.highPriorityCount = high;
        this.statusBadge = investigando > 0 ? 'OCUPADO' : (this.assignedCount > 0 ? 'DISPONIBLE' : 'DISPONIBLE');
      };

      if(perfilObs){
        perfilObs.subscribe({ next: (p: any) => {
          const myId = p && (p.id || p.usuarioId) ? Number(p.id || p.usuarioId) : null;
          this.reporteService.getAll().subscribe({ next: list => finish(list, myId), error: () => finish([], myId) });
        }, error: () => { this.reporteService.getAll().subscribe({ next: list => finish(list, null), error: () => finish([], null) }); } });
      } else {
        const sig = (this.perfil as any).perfil ? (this.perfil as any).perfil() : null;
        const myId = sig && (sig.id || sig.usuarioId) ? Number(sig.id || sig.usuarioId) : null;
        this.reporteService.getAll().subscribe({ next: list => finish(list, myId), error: () => finish([], myId) });
      }
    }catch(e){ console.error('loadAssignedStats error', e); }
  }
}
