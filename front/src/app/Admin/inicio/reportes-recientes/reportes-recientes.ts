import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { AsignarSeguridad } from './asignar-seguridad/asignar-seguridad';
import { ReporteService, ReporteDTO } from '../../../services/reporte.service';
import { ZonaService, Zona } from '../../../services/zona.service';
import { TipoIncidenteService, TipoIncidenteDTO } from '../../../services/tipo-incidente.service';
import { UsuarioService, UsuarioDTO } from '../../../services/usuario.service';
import { SedeService } from '../../../services/sede.service';
import { PerfilService } from '../../../services/perfil.service';
import { ReportStateService } from '../../../services/report-state.service';

@Component({
  selector: 'app-reportes-recientes',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, AsignarSeguridad],
  templateUrl: './reportes-recientes.html',
  styleUrls: ['./reportes-recientes.scss']
})
export class ReportesRecientes {
  // prioridad actual: 'baja' | 'media' | 'alta' | '' (sin seleccionar)
  // datos reales
  reports: ReporteDTO[] = [];
  // Sede actual del admin (si se obtuvo del perfil)
  currentSedeId?: number | null = undefined;
  // Zonas disponibles para la sede actual
  zonesList: Zona[] = [];
  // Zona seleccionada para filtrar
  selectedZonaId?: number | null = null;
  // mostrar menu de filtrado
  showFilterMenu: boolean = false;
  zonasMap: Record<number,string> = {};
  tiposMap: Record<number,string> = {};
  usuariosMap: Record<number,string> = {};
  // map para prioridades por reporte id
  priorityById: Record<number, 'baja'|'media'|'alta'|''> = {};
  // flags de guardado para prioridades por reporte
  prioritySavingById: Record<number, boolean> = {};
  // estado por reporte (simplificado)
  statusById: Record<number,string> = {};
  // control del modal
  showAssignModal: boolean = false;
  selectedReporteId?: number;
  // si un reporte ya tiene una seguridad asignada (localmente después de guardar)
  assignedSecurityById: Record<number, any> = {};
  // valor que se pasa al modal como initialSelectedUserId
  modalInitialSelectedUserId?: number | null = null;
  // flags de guardado de asignación por reporte
  assignSavingById: Record<number, boolean> = {};
  assignConfirmedById: Record<number, boolean> = {};
  // indicador de carga para el botón Actualizar
  isLoading: boolean = false;
  // contador de reportes nuevos (estado 'nuevo')
  newReportsCount: number = 0;

  constructor(private reporteService: ReporteService,
              private zonaService: ZonaService,
              private tipoService: TipoIncidenteService,
              private usuarioService: UsuarioService,
              private sedeService: SedeService,
              private perfilService: PerfilService,
              private reportState: ReportStateService){}

  ngOnInit(): void {
    // Cargar datos auxiliares primero, luego reportes (los reportes intentarán filtrarse por sede del perfil)
    this.loadAuxData();
    this.loadReports();
  }

  /** Carga reportes; si se pasa zonaId, aplica esa zona además de la sede del perfil */
  loadReports(zonaId?: number | null){
    const finish = (r: ReporteDTO[]) => {
      const sorted = [...r].sort((a,b) => {
        const aTime = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : (a.id || 0);
        const bTime = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : (b.id || 0);
        return bTime - aTime;
      });
      // Excluir reportes que ya están en EN_PROCESO según lo provisto por el backend
      this.reports = sorted.filter(rep => {
        const backendEstado = (rep as any).ultimoEstado ? ((rep as any).ultimoEstado || '').toUpperCase() : '';
        return backendEstado !== 'EN_PROCESO';
      });
      for(const rep of this.reports){
        // Inicializar prioridad/estado desde el backend si están disponibles
        const backendPriority = (rep as any).ultimaPrioridad ? ((rep as any).ultimaPrioridad || '').toLowerCase() : '';
        const backendEstado = (rep as any).ultimoEstado ? ((rep as any).ultimoEstado || '').toLowerCase() : '';
        this.priorityById[rep.id] = this.priorityById[rep.id] || (backendPriority as any) || '';
        // Si el backend indica EN_PROCESO, usar ese estado; si no, fallback a 'nuevo'
        this.statusById[rep.id] = this.statusById[rep.id] || (backendEstado ? backendEstado : 'nuevo');
      }
      // calcular contador de reportes nuevos
      this.newReportsCount = this.reports.filter(x => this.statusById[x.id] === 'nuevo').length;
      this.isLoading = false;
    };

    const perfilObs: any = (this.perfilService as any).obtenerPerfil ? (this.perfilService as any).obtenerPerfil() : null;
    if(perfilObs){
      perfilObs.subscribe({
        next: (perfil: any) => {
          const sedeIdFromPerfil = perfil?.sedeId;
          const sedeNombre = perfil?.sedeNombre;
          if(sedeIdFromPerfil){
            this.currentSedeId = Number(sedeIdFromPerfil);
            const zId = zonaId ?? null;
            this.loadZonesForSede(this.currentSedeId);
            this.reporteService.getFiltered(zId, Number(sedeIdFromPerfil)).subscribe({ next: finish, error: (err: any) => { this.reporteService.getAll().subscribe({ next: finish, error: (err2: any) => console.error('Error cargando reportes', err2) }); } });
            return;
          }
          if(sedeNombre){
            this.sedeService.obtenerSedes().subscribe({ next: sedes => {
              const found = (sedes || []).find(s => s.nombre === sedeNombre);
              if(found && found.id){
                this.currentSedeId = Number(found.id);
                const zId = zonaId ?? null;
                this.loadZonesForSede(this.currentSedeId);
                this.reporteService.getFiltered(zId, Number(found.id)).subscribe({ next: finish, error: (err: any) => { this.reporteService.getAll().subscribe({ next: finish, error: (err2: any) => console.error('Error cargando reportes', err2) }); } });
              } else {
                this.reporteService.getAll().subscribe({ next: finish, error: (err: any) => console.error('Error cargando reportes', err) });
              }
            }, error: _ => { this.reporteService.getAll().subscribe({ next: finish, error: err => console.error('Error cargando reportes', err) }); } });
            return;
          }
          // sin sede: fallback
          this.reporteService.getAll().subscribe({ next: finish, error: (err: any) => console.error('Error cargando reportes', err) });
        },
        error: (err: any) => { this.reporteService.getAll().subscribe({ next: finish, error: (err2: any) => console.error('Error cargando reportes', err2) }); }
      });
      return;
    }

    // Si no hay obtenerPerfil disponible, fallback a getAll
    this.reporteService.getAll().subscribe({ next: finish, error: err => { console.error('Error cargando reportes', err); this.isLoading = false; } });
  }

  loadAuxData(){
    this.zonaService.obtenerZonas().subscribe(zs => {
      for(const z of zs) this.zonasMap[z.id] = z.nombre;
    });
    this.tipoService.getAll().subscribe(ts => {
      for(const t of ts) this.tiposMap[t.id] = t.nombre;
    });
    this.usuarioService.getAll().subscribe(us => {
      for(const u of us) this.usuariosMap[u.id] = u.nombreCompleto || u.username || String(u.id);
    });
    // Intentar cargar perfil para tener sedeNombre/sedeId en la señal
    try{ this.perfilService.cargarPerfil(); }catch(e){ /* ignore */ }
  }

  // Carga zonas específicas para la sede actual
  loadZonesForSede(sedeId: number){
    if(!sedeId) return;
    // asumimos que ZonaService tiene obtenerZonasPorSede
    if((this.zonaService as any).obtenerZonasPorSede){
      (this.zonaService as any).obtenerZonasPorSede(sedeId).subscribe({ next: (zs: Zona[]) => {
        this.zonesList = zs || [];
        for(const z of this.zonesList) this.zonasMap[z.id] = z.nombre;
      }, error: (err: any) => console.error('Error cargando zonas por sede', err) });
    } else {
      // fallback: cargar todas y filtrar
      this.zonaService.obtenerZonas().subscribe(zs => {
        this.zonesList = (zs || []).filter(z => (z as any).sedeId == sedeId);
        for(const z of this.zonesList) this.zonasMap[z.id] = z.nombre;
      });
    }
  }

  // Aplicar filtro por zona (null para limpiar)
  applyZonaFilter(zonaId?: number | null){
    this.selectedZonaId = zonaId ?? null;
    // cerrar menu después de seleccionar
    this.showFilterMenu = false;
    this.isLoading = true;
    this.loadReports(this.selectedZonaId);
  }

  toggleFilterMenu(){
    this.showFilterMenu = !this.showFilterMenu;
  }

  refreshReports(){
    this.isLoading = true;
    this.loadReports(this.selectedZonaId);
  }

  // Marca un reporte como visto localmente (debería persistirse en backend si se desea)
  markAsSeen(reportId: number){
    if(!this.statusById[reportId] || this.statusById[reportId] === 'nuevo'){
      this.statusById[reportId] = 'visto';
      // actualizar contador local
      this.newReportsCount = Math.max(0, this.newReportsCount - 1);
    }
  }

  // Maneja el cambio desde el select por reporte
  onPriorityChange(reportId: number, value: string){
    const prev = this.priorityById[reportId] || '';
    if(value === 'baja' || value === 'media' || value === 'alta'){
      // llamar al backend para persistir prioridad
      const prioridad = value as any;
      this.prioritySavingById[reportId] = true;
      const estadoPayload = 'PENDIENTE';
      this.reporteService.updateGestion(reportId, estadoPayload, prioridad.toUpperCase())
        .pipe(finalize(() => { this.prioritySavingById[reportId] = false; }))
        .subscribe({ next: _ => {
          this.priorityById[reportId] = prioridad;
          // opcional: actualizar estado local
          this.statusById[reportId] = this.statusById[reportId] || 'nuevo';
        }, error: err => {
          console.error('Error guardando prioridad', err);
          // revertir en UI
          this.priorityById[reportId] = prev as any;
        }});
    } else {
      this.priorityById[reportId] = '';
    }
  }

  // Abrir modal de asignación
  openAssignModal(reporteId?: number, initialSelectedUserId?: number | null){
    this.selectedReporteId = reporteId;
    this.modalInitialSelectedUserId = initialSelectedUserId ?? null;
    this.showAssignModal = true;
  }

  // Maneja evento emitido por el modal cuando se guardó la asignación
  onAssigned(event: { reporteId?: number; seguridad: any }){
    if(!event || !event.reporteId || !event.seguridad) return;
    this.assignedSecurityById[Number(event.reporteId)] = event.seguridad;
    // actualizar estado localmente
    this.statusById[Number(event.reporteId)] = 'assigned_to_security';
  }

  // Confirmar (persistir) la asignación seleccionada para un reporte
  confirmAssignment(reporteId: number){
    const seguridad = this.assignedSecurityById[reporteId];
    if(!seguridad) return;
    // validar que exista prioridad seleccionada
    const prioridadVal = this.priorityById[reporteId];
    if(!prioridadVal){
      console.warn('Debe seleccionar una prioridad antes de continuar');
      // podríamos mostrar UI/Toast aquí; por ahora sólo retornamos
      return;
    }
    const prioridad = prioridadVal.toUpperCase();
    const estadoPayload = 'EN_PROCESO';
    this.assignSavingById[reporteId] = true;
    this.reporteService.updateGestion(reporteId, estadoPayload, prioridad, seguridad.id)
      .pipe(finalize(() => { this.assignSavingById[reporteId] = false; }))
      .subscribe({ next: res => {
        console.debug('Asignación persistida', res);
        // actualizar estado/assigned
        this.assignedSecurityById[reporteId] = seguridad;
        this.statusById[reporteId] = 'assigned_to_security';
        this.assignConfirmedById[reporteId] = true;
        // Comunicar al estado compartido: prioridad, objeto del reporte y que está en proceso
        const reporteObj = this.reports.find(r => r.id === reporteId);
        if(reporteObj){
          this.reportState.setReporte(reporteObj);
          this.reportState.setPriority(reporteId, this.priorityById[reporteId] || '');
          this.reportState.setAssignedSecurity(reporteId, seguridad);
          this.reportState.markInProcessWithReporte(reporteObj);
        } else {
          // fallback: marcar inProcess por id
          this.reportState.setPriority(reporteId, this.priorityById[reporteId] || '');
          this.reportState.setAssignedSecurity(reporteId, seguridad);
          this.reportState.markInProcess(reporteId);
        }
        // Quitar el reporte de la lista local de recientes para que desaparezca de la vista
        const idx = this.reports.findIndex(r => r.id === reporteId);
        if(idx !== -1){
          this.reports.splice(idx, 1);
        }
        // limpiar mapas locales relacionados
        delete this.priorityById[reporteId];
        delete this.statusById[reporteId];
        // actualizar contador de nuevos
        this.newReportsCount = Math.max(0, this.reports.filter(x => this.statusById[x.id] === 'nuevo').length);
        // opcional: navegar automáticamente a la pestaña En Proceso
        // this.router.navigateByUrl('/admin/en-proceso');
      }, error: err => {
        console.error('Error persistiendo asignación', err);
      }});
  }

  closeAssignModal(){
    this.showAssignModal = false;
    this.selectedReporteId = undefined;
  }

  // Clase del card según prioridad (string con clases utilitarias)
  cardClassFor(priority: string): string{
    const map: Record<string,string> = {
      'baja': 'border-l-4 border-l-blue-500 bg-blue-50',
      'media': 'border-l-4 border-l-yellow-500 bg-yellow-50',
      'alta': 'border-l-4 border-l-red-500 bg-red-50'
    };
    if(!priority) return '';
    return map[priority] || '';
  }

  priorityBadgeClassFor(reportId: number): string{
    const p = this.priorityById[reportId];
    const map: Record<string,string> = {
      'baja': 'badge bg-blue-500 hover:bg-blue-600',
      'media': 'badge bg-yellow-500 hover:bg-yellow-600',
      'alta': 'badge bg-red-500 hover:bg-red-600'
    };
    return map[p] || '';
  }

  // Color para el avatar circular según prioridad
  avatarFillColorFor(reportId?: number): string {
    const p = reportId ? this.priorityById[reportId] : '';
    const map: Record<string,string> = {
      'baja': '#3b82f6', // azul
      'media': '#f59e0b', // amarillo
      'alta': '#ef4444'   // rojo
    };
    if(!p) return '#d1d5db';
    return map[p] || '#d1d5db';
  }

  // Convierte el campo rep.foto a data URL si es necesario
  toDataUrl(foto: any): string | null{
    if(!foto) return null;
    try{
      if(typeof foto === 'string'){
        if(foto.startsWith('data:')) return foto;
        // si es base64 sin mime
        return 'data:image/jpeg;base64,' + foto;
      }
      if(Array.isArray(foto) || foto instanceof Uint8Array){
        const byteArray = new Uint8Array(foto as any);
        let binary = '';
        for(let i=0;i<byteArray.length;i++) binary += String.fromCharCode(byteArray[i]);
        const base64 = btoa(binary);
        return 'data:image/jpeg;base64,' + base64;
      }
    }catch(e){
      return null;
    }
    return null;
  }

}
