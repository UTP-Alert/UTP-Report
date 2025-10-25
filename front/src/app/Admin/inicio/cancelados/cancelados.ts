import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteService, ReporteDTO } from '../../../services/reporte.service';
import { ZonaService } from '../../../services/zona.service';
import { TipoIncidenteService } from '../../../services/tipo-incidente.service';
import { UsuarioService } from '../../../services/usuario.service';
import { ReportStateService } from '../../../services/report-state.service';


@Component({
  selector: 'app-cancelados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cancelados.html',
  styleUrls: ['./cancelados.scss']
})
export class Cancelados implements OnInit {
  reports: ReporteDTO[] = [];
  zonasMap: Record<number,string> = {};
  tiposMap: Record<number,string> = {};
  usuariosMap: Record<number,string> = {};

  constructor(private reporteService: ReporteService,
              private zonaService: ZonaService,
              private tipoService: TipoIncidenteService,
              private usuarioService: UsuarioService,
              private reportState: ReportStateService){}

  ngOnInit(): void{
    this.loadAuxData();
    this.loadCancelledReports();

    // Suscribir a cambios en el estado compartido para añadir cancelaciones inmediatas
    try{
      this.reportState.snapshot.subscribe(snapshot => {
        const cancelled = (snapshot && snapshot.cancelledIds) ? snapshot.cancelledIds : [];
        if(cancelled && cancelled.length){
          // traer los que no estén ya en la lista
          const missing = cancelled.filter(id => !this.reports.some(r => r.id === id));
          for(const id of missing){
            // obtener detalle y añadir
            this.reporteService.getById(id).subscribe({ next: rep => {
              if(rep) this.reports.unshift(rep);
            }, error: () => {} });
          }
        }
      });
    }catch(e){}
  }

  loadAuxData(){
    this.zonaService.obtenerZonas().subscribe(zs => { for(const z of zs) this.zonasMap[z.id] = z.nombre; }, _ => {});
    this.tipoService.getAll().subscribe(ts => { for(const t of ts) this.tiposMap[t.id] = t.nombre; }, _ => {});
    this.usuarioService.getAll().subscribe(us => { for(const u of us) this.usuariosMap[u.id] = u.nombreCompleto || u.username || String(u.id); }, _ => {});
  }

  loadCancelledReports(){
    this.reporteService.getAll().subscribe({ next: (list: ReporteDTO[]) => {
      const filtered = (list || []).filter(r => {
        const backendEstado = String(((r as any).reporteGestion && (r as any).reporteGestion.estado) || (r as any).ultimoEstado || '').toUpperCase();
        return backendEstado === 'CANCELADO';
      });
      // ordenar por fecha de gestión/cancelación si está disponible
      filtered.sort((a,b) => {
        const aTime = (a.reporteGestion && a.reporteGestion.fechaActualizacion) ? new Date(a.reporteGestion.fechaActualizacion).getTime() : (a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : a.id || 0);
        const bTime = (b.reporteGestion && b.reporteGestion.fechaActualizacion) ? new Date(b.reporteGestion.fechaActualizacion).getTime() : (b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : b.id || 0);
        return bTime - aTime;
      });
      this.reports = filtered;
    }, error: err => { console.error('Error cargando cancelados', err); } });
  }

  // helper para convertir foto a data url (reutilizar lógica del proyecto)
  toDataUrl(foto: any): string | null{
    if(!foto) return null;
    try{
      if(typeof foto === 'string'){
        if(foto.startsWith('data:')) return foto;
        return 'data:image/jpeg;base64,' + foto;
      }
      if(Array.isArray(foto) || foto instanceof Uint8Array){
        const byteArray = new Uint8Array(foto as any);
        let binary = '';
        for(let i=0;i<byteArray.length;i++) binary += String.fromCharCode(byteArray[i]);
        return 'data:image/jpeg;base64,' + btoa(binary);
      }
    }catch(e){ }
    return null;
  }

}
