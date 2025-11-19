import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { ReporteService, ReporteDTO } from '../../../../services/reporte.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { ZonaService } from '../../../../services/zona.service';
import { TipoIncidenteService } from '../../../../services/tipo-incidente.service';
import { finalize, switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { ScrollLockService } from '../../../../services/scroll-lock.service';

@Component({
  selector: 'app-asignar-seguridad',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf],
  templateUrl: './asignar-seguridad.html',
  styleUrls: ['./asignar-seguridad.scss']
})
export class AsignarSeguridad implements OnDestroy {
  private _visible: boolean = false;
  @Input()
  set visible(v: boolean){
    this._visible = v;
    if(v){
      this.scrollLock.lock();
      // cuando se abre, cargar datos reales del reporte si se proporcionó reporteId
      // reset selectedCandidate a menos que se abra con initialSelectedUserId
      if(!this.initialSelectedUserId) this.selectedCandidate = null;
      if(this.reporteId){
        this.loadReporte(this.reporteId);
      } else {
        this.reporte = null;
      }
    } else {
      this.scrollLock.unlock();
    }
  }
  get visible(){ return this._visible; }
  @Input() priority: '' | 'baja' | 'media' | 'alta' = '';
  private _reporteId?: number;
  @Input()
  set reporteId(v: number | undefined){
    this._reporteId = v;
    console.debug('[AsignarSeguridad] input reporteId set ->', v);
    // si el modal ya está abierto y nos pasan un id, cargar el reporte
    if(this._visible && v != null){
      this.loadReporte(v);
    }
  }
  get reporteId(): number | undefined{ return this._reporteId; }

  // Input para preseleccionar un candidato cuando se abre el modal desde editar
  @Input() initialSelectedUserId?: number | null = null;
  @Output() selected = new EventEmitter<{ reporteId?: number; seguridad: any }>();
  reporte?: ReporteDTO | null = null;
  loading: boolean = false;
  saving: boolean = false;
  @Output() close = new EventEmitter<void>();
  candidatos: any[] = [];
  recomendado: any | null = null;
  zonaNombre: string = '';
  tipoNombre: string = '';
  zonasCache: any[] = [];
  tiposCache: any[] = [];
  selectedCandidate: any | null = null;
  savingAssignment: boolean = false;
  constructor(
    private reporteService: ReporteService,
    private usuarioService: UsuarioService,
    private zonaService: ZonaService,
    private tipoService: TipoIncidenteService,
    private scrollLock: ScrollLockService
  ){}

  loadReporte(id: number){
    this.loading = true;
    this.reporteService.getById(id).pipe(finalize(()=> this.loading = false)).subscribe({
      next: r => {
        this.reporte = r;
        console.debug('[AsignarSeguridad] reporte cargado:', r);
        // cargar candidatos ahora que tenemos el reporte
        if(this.reporte && this.reporte.zonaId) this.loadCandidatos(this.reporte.zonaId, this.reporte);
        else this.loadCandidatos(undefined, this.reporte);
      },
      error: _ => { this.reporte = null; }
    });
  }

  assignReport(){
    if(!this.reporteId || !this.priority) return;
    this.saving = true;
    // Mapir prioridad a ENUM backend (BAJA/MEDIA/ALTA) y estado a PENDIENTE->EN_PROCESO/otro
    const prioridadPayload = this.priority.toUpperCase();
    const estadoPayload = 'EN_PROCESO';
    this.reporteService.updateGestion(this.reporteId, estadoPayload, prioridadPayload)
      .pipe(finalize(()=> this.saving = false))
      .subscribe({
        next: _ => {
          // cerrar modal y emitir close
          this.closeModal();
        },
        error: err => {
          // por ahora solo cerramos y dejamos log en consola; futura mejora: mostrar toast
          console.error('Error asignando reporte', err);
        }
      });
  }

    // Cargar candidatos de seguridad por zona y sede
    loadCandidatos(zonaId?: number, reporte?: ReporteDTO | null){
      // Resolver sedeId: 1) desde reporte.sedeId si existe, 2) derivado de zonaId consultando catálogo de zonas, 3) null
      const sedeId$ = (reporte && (reporte as any).sedeId)
        ? of((reporte as any).sedeId as number)
        : (zonaId != null
            ? this.zonaService.obtenerZonas().pipe(
                map(zs => {
                  this.zonasCache = zs || [];
                  const zf = (this.zonasCache || []).find(z => z.id === zonaId);
                  return (zf && typeof zf.sedeId === 'number') ? zf.sedeId as number : null;
                })
              )
            : of(null));

      sedeId$.pipe(
        switchMap((sedeIdResolved: number | null) => {
          console.debug('[AsignarSeguridad] loadCandidatos zonaId,sedeId:', zonaId, sedeIdResolved);
          return this.usuarioService.getSeguridadFiltered(zonaId ?? null, sedeIdResolved ?? null)
            .pipe(map(list => ({ list, sedeIdResolved })));
        })
      ).subscribe({ next: ({ list, sedeIdResolved }) => {
        console.debug('[AsignarSeguridad] candidatos recibidos:', list);
        // Salvaguarda: si el backend no filtró por sede, filtramos aquí si tenemos sedeIdResolved
        const filtered = (Array.isArray(list) ? list : []).filter((c: any) => {
          if (sedeIdResolved == null) return true;
          // Aceptamos coincidencia por campo sedeId o por sede.id anidado en el objeto
          const sid = (c && (c.sedeId ?? c.sede?.id)) ?? null;
          return sid == null ? true : Number(sid) === Number(sedeIdResolved);
        });
        this.candidatos = filtered;
        // Importante: si hay filtros (zona o sede), NO hacer fallback global por rol para no mezclar sedes
        // Solo si no hay filtros en absoluto (ambos nulos) aplicar fallback por rol
        if((this.candidatos || []).length === 0 && zonaId == null){
          console.debug('[AsignarSeguridad] sin filtros activos, fallback por rol');
          this.usuarioService.getSeguridadByRol().subscribe({ next: list => { this.candidatos = list || []; console.debug('[AsignarSeguridad] candidatos por rol:', this.candidatos); }, error: err => console.warn('fallback getSeguridadByRol error', err) });
        }
        // resolver nombres de zona y tipo para mostrar en el panel
          if(reporte && reporte.zonaId){
            // intentar obtener nombre de zona y cachearla
            // Si ya se cargaron zonas arriba al resolver sedeId, se reutiliza cache; en caso contrario, cargar
            const ensureZonas$ = (this.zonasCache && this.zonasCache.length)
              ? of(this.zonasCache)
              : this.zonaService.obtenerZonas();
            ensureZonas$.subscribe(zs => {
              this.zonasCache = zs || this.zonasCache || [];
              const zf = (this.zonasCache || []).find(z => z.id === reporte.zonaId);
              this.zonaNombre = zf ? zf.nombre : '';
            });
          }
          if(reporte && reporte.tipoIncidenteId){
            this.tipoService.getAll().subscribe(ts => { this.tiposCache = ts || []; const tf = (this.tiposCache || []).find(t => t.id === reporte.tipoIncidenteId); this.tipoNombre = tf ? tf.nombre : ''; });
          }
        // seleccionar recomendado: preferir el que tenga la zona en sus zonasNombres y esté enabled
        this.recomendado = null;
        if(this.candidatos.length){
          const zonaName = (reporte && reporte.zonaId) ? this.resolveZonaName(reporte.zonaId) : '';
          const prioritario = this.candidatos.find((c:any) => c.enabled && (c.zonasNombres || []).some((zn:string) => zn === zonaName));
          if(prioritario) this.recomendado = prioritario;
          else {
            const disponible = this.candidatos.find((c:any) => c.enabled);
            if(disponible) this.recomendado = disponible;
            else this.recomendado = this.candidatos[0];
          }
          // No pre-seleccionamos el recomendado automáticamente para evitar
          // que el bloque "Asignaste a..." aparezca en el modal.
          // Solo pre-seleccionamos si abrimos explícitamente para editar (initialSelectedUserId)
          if(this.initialSelectedUserId != null){
            const pre = this.candidatos.find((c:any) => c.id === this.initialSelectedUserId);
            if(pre) this.selectedCandidate = pre;
          }
        }
      }, error: err => { this.candidatos = []; this.recomendado = null; }});
    }

    // resolver nombre de zona por id buscando en report.descripcion/otra fuente (fallback)
    resolveZonaName(zonaId: number): string{
      const z = (this.zonasCache || []).find(z => z.id === zonaId);
      return z ? z.nombre : '';
    }

    // Asignar a un usuario específico
    assignToUser(userId: number){
      // Seleccionar candidato y emitir selección al padre; no persistimos aquí.
      const found = this.candidatos.find(c => c.id === userId);
      if(found){
        this.selectedCandidate = found;
        try{ this.selected.emit({ reporteId: this.reporteId, seguridad: this.selectedCandidate }); }catch(e){}
      }
      // cerrar modal inmediatamente después de seleccionar
      this.closeModal();
    }

    // Note: saving now se realiza desde el padre (botón Continuar en la tarjeta)

    // Permitir cambiar la selección (volver a lista)
    editSelection(){
      this.selectedCandidate = null;
    }

  closeModal(){
    this.scrollLock.unlock();
    // limpiar estado interno
    this.reporte = null;
    this.candidatos = [];
    this.recomendado = null;
    this.zonaNombre = '';
    this.tipoNombre = '';
    this._reporteId = undefined;
    this.initialSelectedUserId = null;
    this.selectedCandidate = null;
    this.close.emit();
  }

  ngOnDestroy(): void {
    // Failsafe en caso el componente se destruya con el modal abierto
    this.scrollLock.reset();
  }

  // helper para clase de header según prioridad
  headerClass(){
    switch(this.priority){
      case 'baja': return 'header-blue';
      case 'media': return 'header-yellow';
      case 'alta': return 'header-red';
      default: return 'header-neutral';
    }
  }

  // devuelve la etiqueta legible para la prioridad
  priorityLabel(){
    switch(this.priority){
      case 'baja': return 'PRIORIDAD BAJA';
      case 'media': return 'PRIORIDAD MEDIA';
      case 'alta': return 'PRIORIDAD ALTA';
      default: return '';
    }
  }
}
