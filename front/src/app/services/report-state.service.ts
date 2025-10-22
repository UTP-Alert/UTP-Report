import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ReportStateSnapshot {
  priorities: Record<number, 'baja'|'media'|'alta'|''>;
  inProcessIds: number[];
  assignedSecurity: Record<number, any>;
  reports?: Record<number, any>;
}

@Injectable({ providedIn: 'root' })
export class ReportStateService {
  // keep simple maps for priority and in-process ids
  private priorities: Record<number, 'baja'|'media'|'alta'|''> = {} as any;
  private inProcessIdsSet = new Set<number>();
  private assignedSecurity: Record<number, any> = {};
  private reports: Record<number, any> = {};

  private snapshot$ = new BehaviorSubject<ReportStateSnapshot>({ priorities: {}, inProcessIds: [], assignedSecurity: {}, reports: {} });

  get snapshot(): Observable<ReportStateSnapshot> {
    return this.snapshot$.asObservable();
  }

  setPriority(reportId: number, priority: 'baja'|'media'|'alta'|''){
    if(priority) this.priorities[reportId] = priority; else delete this.priorities[reportId];
    this.emit();
  }

  /** Guarda el objeto ReporteDTO para uso en la vista En Proceso */
  setReporte(reporte: any){
    if(reporte && reporte.id) this.reports[reporte.id] = reporte;
    this.emit();
  }

  /** Marca en proceso utilizando el objeto ReporteDTO (si se proporciona) */
  markInProcessWithReporte(reporte: any){
    if(!reporte || !reporte.id) return;
    this.reports[reporte.id] = reporte;
    this.inProcessIdsSet.add(reporte.id);
    this.emit();
  }

  markInProcess(reportId: number){
    this.inProcessIdsSet.add(reportId);
    this.emit();
  }

  unmarkInProcess(reportId: number){
    this.inProcessIdsSet.delete(reportId);
    this.emit();
  }

  setAssignedSecurity(reportId: number, seguridad: any){
    if(seguridad) this.assignedSecurity[reportId] = seguridad; else delete this.assignedSecurity[reportId];
    this.emit();
  }

  private emit(){
    this.snapshot$.next({ priorities: { ...this.priorities }, inProcessIds: Array.from(this.inProcessIdsSet), assignedSecurity: { ...this.assignedSecurity }, reports: { ...this.reports } });
  }
}
