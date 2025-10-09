import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteDTO, ReporteService } from '../../../services/reporte.service';

@Component({
  selector: 'app-detalle-reporte',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, FormsModule],
  templateUrl: './detalle-reporte.html',
  styleUrls: ['./detalle-reporte.scss']
})
export class DetalleReporte implements OnInit {
  @Input() usuarioId!: number;
  @Output() close = new EventEmitter<void>();

  reportesHoy: ReporteDTO[] = [];
  seleccionado: ReporteDTO | null = null;

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void {
    // Cargar todos y filtrar por usuario y fecha de hoy (cliente)
    this.reporteService.getAll().subscribe(lista => {
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = hoy.getMonth();
      const dd = hoy.getDate();
      this.reportesHoy = (lista || []).filter(r => {
        if (r.usuarioId !== this.usuarioId) return false;
        if (!r.fechaCreacion) return false;
        const d = new Date(r.fechaCreacion as any);
        return d.getFullYear() === yyyy && d.getMonth() === mm && d.getDate() === dd;
      }).sort((a,b) => new Date(b.fechaCreacion as any).getTime() - new Date(a.fechaCreacion as any).getTime());
      this.seleccionado = this.reportesHoy[0] || null;
    });
  }

  cerrar() { this.close.emit(); }

  @HostListener('document:keydown.escape') onEsc() { this.cerrar(); }

  fotoSrc(rep: ReporteDTO | null): string | null {
    if (!rep || !rep.foto || (rep.foto as any).length === 0) return null;
    try {
      // En el DTO del backend, foto es byte[]; la convertimos a base64
      // Si ya viniera como base64 en rep.foto, basta con prefijar
      // Aquí asumimos que llega como bytes serializados a array de números
      const bytes: number[] = rep.foto as any;
      const bin = new Uint8Array(bytes);
      let binary = '';
      bin.forEach(b => binary += String.fromCharCode(b));
      const b64 = btoa(binary);
      return `data:image/jpeg;base64,${b64}`;
    } catch { return null; }
  }

}
