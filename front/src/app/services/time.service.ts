import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimeService {
  private base = 'http://localhost:8080/api/time';
  constructor(private http: HttpClient) {}

  // Devuelve YYYY-MM-DD de la fecha real del backend (America/Lima)
  getServerDateISO(): Observable<string> {
    return this.http.get<string>(`${this.base}/peru-date`).pipe(
      map((d: any) => {
        // Spring serializa LocalDate como "YYYY-MM-DD"
        if (typeof d === 'string') return d;
        if (d && typeof d.year === 'number' && typeof d.monthValue === 'number' && typeof d.dayOfMonth === 'number') {
          const mm = String(d.monthValue).padStart(2, '0');
          const dd = String(d.dayOfMonth).padStart(2, '0');
          return `${d.year}-${mm}-${dd}`;
        }
        return new Date().toISOString().slice(0,10);
      })
    );
  }

  // Devuelve un Date basado en la hora real del backend
  getServerDateTime(): Observable<Date> {
    return this.http.get<string>(`${this.base}/peru-datetime`).pipe(
      map((s: any) => new Date(s))
    );
  }
}
