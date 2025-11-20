import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor, NgClass } from '@angular/common';
import { ReporteService, ReporteDTO } from '../../../services/reporte.service';
import { TipoIncidenteService } from '../../../services/tipo-incidente.service';
import { ZonaService } from '../../../services/zona.service';

@Component({
  selector: 'app-pend-resueltos',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, NgClass],
  templateUrl: './pend-resueltos.html',
  styleUrls: ['./pend-resueltos.scss']
})
export class PendResueltos implements OnInit {
  reportes: ReporteDTO[] = [];
  loading = false;
  tiposMap: Record<number,string> = {};
  zonasMap: Record<number,string> = {};
  // Modal de detalle
  detalleVisible = false;
  reporteSeleccionado: ReporteDTO | null = null;
  private sub: any = null; // suscripción para refrescar al cambiar estados
  // Lista memoizada de estados para el reporte seleccionado
  estadosDetalleList: Array<{ key: 'PENDIENTE'|'UBICANDO'|'INVESTIGANDO'|'PENDIENTE_APROBACION'|'RESUELTO'|'CANCELADO'; label: string; fecha?: string | Date | null; comentarios?: string | null; origin?: 'admin'|'seguridad'|null }> = [];

  constructor(private reporteService: ReporteService, private tipoService: TipoIncidenteService, private zonaService: ZonaService){}

  ngOnInit(): void{
    this.loadAux();
    this.loadResueltos();
    // Suscribirse al estado global si existe ReportStateService para refrescar tras aprobar
    try {
      const rs: any = (this as any).reportState || (this as any).reportStateService;
      if(rs && rs.snapshot && rs.snapshot.subscribe){
        this.sub = rs.snapshot.subscribe(() => this.loadResueltos());
      }
    } catch(e) { /* silencioso */ }
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

  // Abrir/cerrar modal de detalle
  abrirDetalle(r: ReporteDTO){
    this.reporteSeleccionado = r;
    this.detalleVisible = true;
    this.estadosDetalleList = this._buildEstadosDetalle();
  }
  cerrarDetalle(){ this.detalleVisible = false; this.reporteSeleccionado = null; }

  // Construye columnas por estado (mostrar SIEMPRE todas las etapas conocidas en orden fijo)
  // Estados esperados: PENDIENTE, UBICANDO, INVESTIGANDO, PENDIENTE_APROBACION, RESUELTO, CANCELADO.
  // Heurística de fechas: sólo conocemos fechaCreacion y fechaActualizacion final; las demás quedan sin registro.
  private _buildEstadosDetalle(): Array<{ key: 'PENDIENTE'|'UBICANDO'|'INVESTIGANDO'|'PENDIENTE_APROBACION'|'RESUELTO'|'CANCELADO'; label: string; fecha?: string | Date | null; comentarios?: string | null; origin?: 'admin'|'seguridad'|null }>{
    const r: any = this.reporteSeleccionado;
    if(!r) return [];
    const comentarioAdmin = r.mensajeAdmin || null; // comentario opcional del Admin
    const comentarioSeg = r.mensajeSeguridad || null; // comentario ingresado por Seguridad al completar (Pend. Aprobación)

    // Si el backend expone un único reporteGestion (estado actual) sólo tenemos su fechaActualizacion.
    // Para evitar poner la misma hora en todo, sólo asignamos fechas a los estados ocurridos según últimoEstado.
    const ultimo = String(r.ultimoEstado || r.reporteGestion?.estado || '').toUpperCase();
    const fechaActual = r.reporteGestion?.fechaActualizacion || r.fechaUltimaGestion || null;
    const fechaCreado = r.fechaCreacion || null;

    // Map de orden de estados esperados
    const orden: string[] = ['PENDIENTE','UBICANDO','INVESTIGANDO','PENDIENTE_APROBACION','RESUELTO','CANCELADO'];

    // Determinar qué estados han sido alcanzados por comparación con ultimo
    const indiceUltimo = orden.indexOf(ultimo);

    function fechaPara(key: string): string | Date | null {
      if(key==='PENDIENTE') return fechaCreado;
      // Para estados intermedios sin timestamp específico, sólo mostrar fecha si ya fueron alcanzados pero sin repetir la final.
      if(indiceUltimo >= orden.indexOf(key)) {
        // Si es el estado final y tenemos fechaActual la usamos, si no dejamos null para "No registrado"
        if(key===ultimo) return fechaActual;
        // Para intermedios: dejamos null (No registrado) hasta que tengamos historial real
        return null;
      }
      return null; // futuro/no alcanzado
    }

    return [
      { key: 'PENDIENTE',            label: 'Pendiente',            fecha: fechaPara('PENDIENTE') },
      { key: 'UBICANDO',             label: 'Ubicando',             fecha: fechaPara('UBICANDO') },
      // El comentario de Seguridad (parte) pertenece a Pendiente de Aprobación, no a Investigando
      { key: 'INVESTIGANDO',         label: 'Investigando',         fecha: fechaPara('INVESTIGANDO'), comentarios: null, origin: null },
  { key: 'PENDIENTE_APROBACION', label: 'Pend. Aprobación',     fecha: fechaPara('PENDIENTE_APROBACION'), comentarios: indiceUltimo >= orden.indexOf('PENDIENTE_APROBACION') ? comentarioSeg : null, origin: comentarioSeg && indiceUltimo >= orden.indexOf('PENDIENTE_APROBACION') ? 'seguridad' : null },
      // En RESUELTO solo mostrar comentario del ADMIN; si no existe, dejar 'Sin comentarios'
      { key: 'RESUELTO',             label: 'Resuelto',             fecha: fechaPara('RESUELTO'),
        comentarios: ultimo==='RESUELTO' ? comentarioAdmin : null,
        origin: (ultimo==='RESUELTO' && comentarioAdmin) ? 'admin' : null },
      { key: 'CANCELADO',            label: 'Cancelado',            fecha: fechaPara('CANCELADO') }
    ];
  }

  // trackBy para estados en el *ngFor
  trackEstado = (_: number, item: { key: string }) => item.key;

  ngOnDestroy(){ try{ this.sub?.unsubscribe(); }catch(e){} }

}
