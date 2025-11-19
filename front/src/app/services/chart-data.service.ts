import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReportStatusCount, ZoneCount, ReportsSentCount } from '../interfaces/chart-data.interface';
import { ReporteService, ReporteDTO } from './reporte.service';
import { ZonaService, Zona } from './zona.service';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {
  constructor(
    private http: HttpClient,
    private reporteService: ReporteService,
    private zonaService: ZonaService
  ) { }

  getReportStatusCount(): Observable<ReportStatusCount[]> {
    return this.reporteService.getAll().pipe(
      map(reports => {
        console.log('Raw reports for status count:', reports); // Debugging
        const statusCounts: { [key: string]: number } = {};
        reports.forEach(report => {
          const status = report.reporteGestion?.estado || report.ultimoEstado || 'DESCONOCIDO';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        const result = Object.keys(statusCounts).map(status => ({
          status,
          count: statusCounts[status]
        }));
        console.log('Processed report status count:', result); // Debugging
        return result;
      })
    );
  }

  getZoneCount(): Observable<ZoneCount[]> {
    return forkJoin([
      this.zonaService.obtenerZonas(),
      this.reporteService.getAll()
    ]).pipe(
      map(([zones, reports]) => {
        console.log('Raw zones for zone count:', zones); // Debugging
        console.log('Raw reports for zone count:', reports); // Debugging
        const zoneReportCounts: { [key: number]: number } = {};
        reports.forEach(report => {
          zoneReportCounts[report.zonaId] = (zoneReportCounts[report.zonaId] || 0) + 1;
        });

        const result = zones.map(zone => ({
          zoneName: zone.nombre,
          count: zoneReportCounts[zone.id] || 0
        }));
        console.log('Processed zone count:', result); // Debugging
        return result;
      })
    );
  }

  getReportsSentCount(): Observable<ReportsSentCount[]> {
    return this.reporteService.getAll().pipe(
      map(reports => {
        console.log('Raw reports for reports sent count:', reports); // Debugging
        const dailyCounts: { [key: string]: number } = {};
        reports.forEach(report => {
          const date = new Date(report.fechaCreacion).toISOString().split('T')[0]; // YYYY-MM-DD
          dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });

        const result = Object.keys(dailyCounts).sort().map(date => ({
          date,
          count: dailyCounts[date]
        }));
        console.log('Processed reports sent count:', result); // Debugging
        return result;
      })
    );
  }
}
