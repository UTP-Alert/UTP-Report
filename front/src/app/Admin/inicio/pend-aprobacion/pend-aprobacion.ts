
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ReporteService, ReporteDTO } from '../../../services/reporte.service';
import { TipoIncidenteService, TipoIncidenteDTO } from '../../../services/tipo-incidente.service';
import { ZonaService, Zona } from '../../../services/zona.service';
import { ReportStateService } from '../../../services/report-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pend-aprobacion',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './pend-aprobacion.html',
  styleUrl: './pend-aprobacion.scss'
})
export class PendAprobacion implements OnInit, OnDestroy {
  reportes: ReporteDTO[] = [];
  loading = false;

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
  
  ngOnDestroy(): void {
    try{ this.sub?.unsubscribe(); }catch(e){}
  }
}
