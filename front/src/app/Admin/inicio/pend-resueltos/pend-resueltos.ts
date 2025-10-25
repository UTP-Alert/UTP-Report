import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteService, ReporteDTO } from '../../../services/reporte.service';
import { TipoIncidenteService } from '../../../services/tipo-incidente.service';
import { ZonaService } from '../../../services/zona.service';

@Component({
  selector: 'app-pend-resueltos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pend-resueltos.html',
  styleUrl: './pend-resueltos.scss'
})
export class PendResueltos implements OnInit {
  reportes: ReporteDTO[] = [];
  loading = false;
  tiposMap: Record<number,string> = {};
  zonasMap: Record<number,string> = {};

  constructor(private reporteService: ReporteService, private tipoService: TipoIncidenteService, private zonaService: ZonaService){}

  ngOnInit(): void{
    this.loadAux();
    this.loadResueltos();
  }

  loadAux(){
    this.tipoService.getAll().subscribe(list => { (list||[]).forEach(t=> this.tiposMap[t.id]=t.nombre); }, _=>{});
    this.zonaService.obtenerZonas().subscribe(list => { (list||[]).forEach(z=> this.zonasMap[z.id]=z.nombre); }, _=>{});
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

  // abrir imagen y fallback a nueva pestaña si el modal no aparece
  openImage(src: string){
    this.selectedImageSrc = src;
    this.imageModalVisible = true;
    setTimeout(()=>{ try{ if(!this.imageModalVisible) window.open(src,'_blank'); }catch(e){} }, 80);
  }
  closeImage(){ this.imageModalVisible = false; this.selectedImageSrc = null; }

  loadResueltos(){
    this.loading = true;
    this.reporteService.getAll().subscribe({ next: list => {
      this.reportes = (list||[]).filter(r => {
        const estado = (r as any).reporteGestion && (r as any).reporteGestion.estado ? String((r as any).reporteGestion.estado) : ((r as any).ultimoEstado || '');
        return String(estado).toUpperCase() === 'RESUELTO';
      });
      this.loading = false;
    }, error: _ => { this.reportes = []; this.loading = false; } });
  }

}
