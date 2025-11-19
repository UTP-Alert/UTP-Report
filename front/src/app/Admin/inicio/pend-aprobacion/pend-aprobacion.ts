
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService, ReporteDTO } from '../../../services/reporte.service';
import { finalize } from 'rxjs/operators';
import { TipoIncidenteService, TipoIncidenteDTO } from '../../../services/tipo-incidente.service';
import { ZonaService, Zona } from '../../../services/zona.service';
import { ReportStateService } from '../../../services/report-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pend-aprobacion',
  standalone: true,
  imports: [CommonModule, NgClass, FormsModule],
  templateUrl: './pend-aprobacion.html',
  styleUrl: './pend-aprobacion.scss'
})
export class PendAprobacion implements OnInit, OnDestroy {
  reportes: ReporteDTO[] = [];
  loading = false;
  selectedForReview: ReporteDTO | null = null;
  adminComment: string = '';

  tiposMap: Record<number,string> = {};
  zonasMap: Record<number,string> = {};

  constructor(private reporteService: ReporteService, private reportState: ReportStateService,
              private tipoService: TipoIncidenteService, private zonaService: ZonaService) {}

  private sub: Subscription | null = null;

  ngOnInit(): void {
    this.loadPendientes();
    this.loadAux();
    // subscribe to global snapshot to refresh when security completes a report
    try{
      this.sub = (this as any).reportState?.snapshot?.subscribe ? (this as any).reportState.snapshot.subscribe(() => this.loadPendientes()) : null;
    }catch(e){}
  }

  openReview(r: ReporteDTO){
    this.selectedForReview = r;
    this.adminComment = '';
  }

  closeReview(){
    this.selectedForReview = null;
    this.adminComment = '';
  }

  approveSelected(){
    if(!this.selectedForReview) return;
    if(!this.adminComment || this.adminComment.trim().length === 0) return; // require comment
    const id = this.selectedForReview.id;
    // Usar endpoint específico para que se guarde el mensaje del admin al resolver
    this.reporteService.marcarResueltoPorAdmin(id, this.adminComment)
      .pipe(finalize(() => {
        // Asegurar que el modal se cierra y la lista se refresca aunque la respuesta no incluya body
        this.loadPendientes();
        this.closeReview();
      }))
      .subscribe({ next: _ => {
        // refresh report and UI (best-effort)
        this.reporteService.getById(id).subscribe(rf => {
          this.reportState.setReporte(rf);
          try{ this.reportState.markResolved(id); }catch(e){}
          try {
            const zonaId = (rf as any)?.zonaId;
            if (typeof zonaId === 'number') {
              this.zonaService.obtenerZonas().subscribe(zs => {
                const z = (zs || []).find(zz => zz.id === zonaId);
                if(z){ try { window.dispatchEvent(new CustomEvent('zone-status-update', { detail: z })); } catch {} }
              });
            }
          } catch {}
        }, err => { console.error('Error fetching updated report', err); });
      }, error: err => { console.error('Error approving', err); } });
  }

  rejectSelected(){
    if(!this.selectedForReview) return;
    if(!this.adminComment || this.adminComment.trim().length === 0) return; // require comment
    const id = this.selectedForReview.id;
    const prioridad = (this.selectedForReview as any).reporteGestion && (this.selectedForReview as any).reporteGestion.prioridad ? (this.selectedForReview as any).reporteGestion.prioridad : (this.selectedForReview.ultimaPrioridad || '');
    // Reject via new admin endpoint: set mensajeAdmin and move estado back to INVESTIGANDO
    this.reporteService.rechazarPorAdmin(id, this.adminComment)
      .pipe(finalize(() => { this.loadPendientes(); this.closeReview(); }))
      .subscribe({ next: _ => {
        this.reporteService.getById(id).subscribe(rf => { this.reportState.setReporte(rf); }, err => { console.error('Error fetching report after reject', err); });
      }, error: err => { console.error('Error rejecting', err); } });
  }

  loadAux(){
    // load tipos
    try{
      this.tipoService.getAll().subscribe(list => {
        (list || []).forEach((t: TipoIncidenteDTO) => this.tiposMap[t.id] = t.nombre);
      });
    }catch(e){}
    // load zonas
    try{
      this.zonaService.obtenerZonas().subscribe(list => {
        (list || []).forEach((z: Zona) => this.zonasMap[z.id] = z.nombre);
      });
    }catch(e){}
  }

  loadPendientes(){
    this.loading = true;
    this.reporteService.getAll().subscribe({ next: list => {
      // Only show reports that have mensajeSeguridad and whose latest estado is PENDIENTE_APROBACION
      // Backend may return the estado inside reporteGestion.estado or in the legacy ultimoEstado field,
      // so check both places.
      this.reportes = (list || []).filter(r => {
        const backendEstado = String(((r as any).reporteGestion && (r as any).reporteGestion.estado) || (r as any).ultimoEstado || '').toLowerCase();
        return Boolean(r.mensajeSeguridad) && backendEstado === 'pendiente_aprobacion';
      });
      this.loading = false;
    }, error: _ => { this.loading = false; this.reportes = []; } });
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
  
  ngOnDestroy(): void {
    try{ this.sub?.unsubscribe(); }catch(e){}
  }

  // Image modal state and helpers
  selectedImageSrc: string | null = null;
  imageModalVisible: boolean = false;

  closeImage(){ this.imageModalVisible = false; this.selectedImageSrc = null; }

  // abrir imagen y fallback a nueva pestaña si el modal no se visualiza
  openImage(src: string){
    this.selectedImageSrc = src;
    this.imageModalVisible = true;
    setTimeout(()=>{ try{ if(!this.imageModalVisible) window.open(src,'_blank'); }catch(e){} }, 80);
  }
}
