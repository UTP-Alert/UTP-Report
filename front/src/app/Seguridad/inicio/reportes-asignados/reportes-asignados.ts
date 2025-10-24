import { Component } from '@angular/core';
import { CommonModule, NgIf, NgForOf, NgClass } from '@angular/common';
import { ReporteService, ReporteDTO } from '../../../services/reporte.service';
import { PerfilService } from '../../../services/perfil.service';
import { ReportStateService } from '../../../services/report-state.service';
import { ZonaService } from '../../../services/zona.service';
import { UsuarioService } from '../../../services/usuario.service';
import { TipoIncidenteService } from '../../../services/tipo-incidente.service';

@Component({
  selector: 'app-reportes-asignados',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, NgClass],
  templateUrl: './reportes-asignados.html',
  styleUrls: ['./reportes-asignados.scss']
})
export class ReportesAsignados {
  reportes: ReporteDTO[] = [];
  loading: boolean = false;
  zonasMap: Record<number,string> = {};
  usuariosMap: Record<number,string> = {};
  tiposMap: Record<number,string> = {};

  constructor(
    private reporteService: ReporteService,
    private perfil: PerfilService,
    private reportState: ReportStateService,
    private zonaService: ZonaService,
    private usuarioService: UsuarioService,
    private tipoService: TipoIncidenteService
  ){
    this.loadAuxData();
    this.loadReportesAsignados();
    // subscribe snapshot to reflect in-memory assignments
    this.reportState.snapshot.subscribe(s => {
      // if there are in-memory assignedSecurity entries, merge them into displayed list
      const assigned = s.assignedSecurity || {};
      Object.keys(assigned).forEach(k => {
        const id = Number(k);
        const seg = assigned[id];
        const idx = this.reportes.findIndex(r => r.id === id);
        if(idx === -1 && seg && s.reports && s.reports[id]){
          this.reportes.unshift(s.reports[id]);
        }
      });
    });
  }

  private loadAuxData(){
    // load zonas
    this.zonaService.obtenerZonas().subscribe({ next: list => { (list||[]).forEach(z => this.zonasMap[z.id] = z.nombre); }, error: _ => {} });
    // load usuarios map
    this.usuarioService.getAll().subscribe({ next: list => { (list||[]).forEach(u => this.usuariosMap[u.id] = u.nombreCompleto || u.username || String(u.id)); }, error: _ => {} });
    // tipos
    this.tipoService.getAll().subscribe({ next: list => { (list||[]).forEach(t => this.tiposMap[t.id] = t.nombre); }, error: _ => {} });
  }

  loadReportesAsignados(){
    this.loading = true;
    // intención: mostrar reportes donde seguridadAsignadoId === perfil.id
    const perfilObs: any = (this.perfil as any).obtenerPerfil ? (this.perfil as any).obtenerPerfil() : null;
    const finishWithList = (list: ReporteDTO[], myId: number | null) => {
      const filtered = (list || []).filter(r => r.seguridadAsignadoId === myId);
      // normalize prioridad/estado to lowercase keys we expect, prefer backend.reporteGestion
      this.reportes = filtered.map(r => ({
        ...r,
        ultimaPrioridad: (r as any).reporteGestion && (r as any).reporteGestion.prioridad ? String((r as any).reporteGestion.prioridad).toLowerCase() : ((r as any).ultimaPrioridad ? String((r as any).ultimaPrioridad).toLowerCase() : ''),
        ultimoEstado: (r as any).reporteGestion && (r as any).reporteGestion.estado ? String((r as any).reporteGestion.estado) : ((r as any).ultimoEstado || '')
      }));
      this.loading = false;
    };

    if(perfilObs){
      perfilObs.subscribe({ next: (p: any) => {
        const myId = p && (p.id || p.usuarioId) ? Number(p.id || p.usuarioId) : null;
        this.reporteService.getAll().subscribe({ next: list => finishWithList(list, myId), error: () => { this.loading = false; this.reportes = []; } });
      }, error: () => { this.reporteService.getAll().subscribe({ next: list => finishWithList(list, null), error: () => { this.loading = false; this.reportes = []; } }); } });
      return;
    }

    // fallback: try to use perfil signal (may not contain id)
    const sig = (this.perfil as any).perfil ? (this.perfil as any).perfil() : null;
    const myId = sig && (sig.id || sig.usuarioId) ? Number(sig.id || sig.usuarioId) : null;
    this.reporteService.getAll().subscribe({ next: list => finishWithList(list, myId), error: () => { this.loading = false; this.reportes = []; } });
  }

  marcarEnProgreso(reporteId: number){
    // placeholder: actualizar estado local y en backend si es necesario
    this.reporteService.updateGestion(reporteId, 'EN_PROCESO', 'media', null).subscribe({ next: _ => { this.loadReportesAsignados(); }, error: _ => { this.loadReportesAsignados(); } });
  }

  completarReporte(reporteId: number){
    this.reporteService.updateGestion(reporteId, 'RESUELTO', 'media', null).subscribe({ next: _ => { this.loadReportesAsignados(); }, error: _ => { this.loadReportesAsignados(); } });
  }
}
