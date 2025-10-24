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

  // Modal state for "Ir a la Zona"
  selectedReport: ReporteDTO | null = null;
  modalVisible: boolean = false;
  // When true, the modal cannot be dismissed except by 'heLlegado' action
  modalLocked: boolean = false;
  // Completar reporte modal
  completeModalVisible: boolean = false;
  policeDescription: string = '';

  async irALaZona(reporte: ReporteDTO){
    // Show modal UI immediately and call backend to set estado = 'UBICANDO'
    // We avoid setting the global `loading` flag so the rest of the UI does not get hidden.
    this.selectedReport = reporte;
    this.modalVisible = true;
    this.modalLocked = true; // lock modal while we optimistically set UBICANDO
    // fire-and-handle the backend update; keep UI responsive
    (async () => {
      try{
        // use dedicated backend endpoint PUT /ir-a-zona
        this.reporteService.irAZona(reporte.id).subscribe({ next: (g: any) => {
          const idx = this.reportes.findIndex(r => r.id === reporte.id);
          if(idx !== -1){
            this.reportes[idx] = {
              ...this.reportes[idx],
              ultimaPrioridad: (g && g.prioridad) ? String(g.prioridad).toLowerCase() : (this.reportes[idx].ultimaPrioridad || ''),
              ultimoEstado: (g && g.estado) ? String(g.estado) : 'UBICANDO'
            } as ReporteDTO;
          }
        }, error: (_: any) => { console.error('Error irAZona', _); this.modalLocked = false; } });
      }catch(e){ this.modalLocked = false; }
    })();
  }

  private async getCurrentUserId(): Promise<number | null> {
    try{
      const perfilObs: any = (this.perfil as any).obtenerPerfil ? (this.perfil as any).obtenerPerfil() : null;
      if(perfilObs){
        return new Promise<number|null>((resolve) => {
          perfilObs.subscribe({ next: (p: any) => resolve(p && (p.id || p.usuarioId) ? Number(p.id || p.usuarioId) : null), error: () => resolve(null) });
        });
      }
      const sig = (this.perfil as any).perfil ? (this.perfil as any).perfil() : null;
      return sig && (sig.id || sig.usuarioId) ? Number(sig.id || sig.usuarioId) : null;
    }catch(e){ return null; }
  }

  async heLlegadoALaZona(){
    if(!this.selectedReport) return;
    this.modalLocked = true;
    this.reporteService.zonaUbicada(this.selectedReport.id).subscribe({ next: (g: any) => {
      this.modalVisible = false;
      this.modalLocked = false;
      this.selectedReport = null;
      this.loadReportesAsignados();
    }, error: (_: any) => { this.modalLocked = false; } });
  }

  closeModal(){
    if(this.modalLocked) return;
    this.modalVisible = false;
    this.selectedReport = null;
  }

  // Emergency force-close, for recovery if modal blocks the UI
  forceClose(){
    this.modalLocked = false;
    this.modalVisible = false;
    this.selectedReport = null;
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
    // open the completar modal for the selected report
    const r = this.reportes.find(x => x.id === reporteId) || null;
    if(r){
      this.selectedReport = r;
      this.policeDescription = '';
      this.completeModalVisible = true;
    }
  }

  submitComplete(){
    if(!this.selectedReport) return;
    const msg = (this.policeDescription || '').trim();
    if(!msg) return;
    // capture id locally to avoid race conditions if selectedReport is cleared before response
    const reporteId = this.selectedReport.id;
    this.reporteService.completarReporteConParte(reporteId, msg).subscribe({ next: (g: any) => {
      // optimistic local update so UI shows pending approval immediately
      const idx = this.reportes.findIndex(r => r.id === reporteId);
      if(idx !== -1){
        this.reportes[idx] = {
          ...this.reportes[idx],
          mensajeSeguridad: msg,
          ultimoEstado: (g && g.estado) ? String(g.estado) : 'PENDIENTE_APROBACION'
        } as ReporteDTO;
        // publish to global snapshot so admin views (pend-aprobacion) can refresh live
        try{ this.reportState.setReporte(this.reportes[idx]); }catch(e){}
      }
      this.completeModalVisible = false;
      // clear selection
      this.selectedReport = null;
      this.policeDescription = '';
      this.loadReportesAsignados();
      console.log('Reporte completado y mensaje guardado');
    }, error: (_: any) => {
      // keep modal open and optionally show error
      console.error('Error completando reporte', _);
      alert('Error al completar el reporte. Revisa la consola o intenta de nuevo.');
    } });
  }

  get officerLabel(): string {
    try{
      const sig = (this.perfil as any).perfil ? (this.perfil as any).perfil() : null;
      if(!sig) return 'Oficial Seguridad';
      return sig.nombreCompleto || sig.nombre || sig.username || (`SEC-${sig.id || sig.usuarioId || ''}`);
    }catch(e){ return 'Oficial Seguridad'; }
  }

  getTipoName(tipoId?: number | null): string {
    if(!tipoId && tipoId !== 0) return '';
    return this.tiposMap[tipoId as number] || String(tipoId);
  }

  getZonaName(zonaId?: number | null): string {
    if(!zonaId && zonaId !== 0) return '';
    return this.zonasMap[zonaId as number] || ('Zona ' + String(zonaId));
  }
}
