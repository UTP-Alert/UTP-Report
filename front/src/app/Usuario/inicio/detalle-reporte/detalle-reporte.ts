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
  showMenu = false;

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

  // Cerrar menú al hacer click fuera
  @HostListener('document:click', ['$event']) onDocClick(ev: MouseEvent){
    const target = ev.target as HTMLElement | null;
    if (!target) return;
    const container = target.closest('.dr-select');
    if (!container) this.showMenu = false;
  }

  fotoSrc(rep: ReporteDTO | null): string | null {
    if (!rep || !rep.foto || (rep.foto as any).length === 0) return null;
    try {
      // Backend (Spring) serializa byte[] como base64 (string). Soportar ambos casos.
      const f: any = rep.foto as any;
      // Si ya es string base64, devolver con el prefijo correcto
      if (typeof f === 'string') {
        const base64: string = f;
        // Heurística simple para tipo MIME
        const mime = base64.startsWith('iVBORw0') ? 'image/png'
                   : base64.startsWith('/9j/') || base64.startsWith('/9j') ? 'image/jpeg'
                   : base64.startsWith('R0lGOD') ? 'image/gif'
                   : 'image/*';
        return `data:${mime};base64,${base64}`;
      }
      // Si viene como arreglo de números, convertir a base64
      const bytes: number[] = f as number[];
      const bin = new Uint8Array(bytes);
      let binary = '';
      for (let i = 0; i < bin.length; i++) binary += String.fromCharCode(bin[i]);
      const b64 = btoa(binary);
      return `data:image/jpeg;base64,${b64}`;
    } catch { return null; }
  }

  // UI helpers para el dropdown personalizado
  toggleMenu(ev?: Event){ if (ev) ev.stopPropagation(); this.showMenu = !this.showMenu; }
  selectReporte(r: ReporteDTO){ this.seleccionado = r; this.showMenu = false; }
  label(r: ReporteDTO | null): string {
    if (!r) return 'Selecciona un reporte del día';
    const desc = String(r.descripcion || '').trim();
    const slice = desc.length > 34 ? (desc.slice(0,34) + '…') : desc;
    const time = r.fechaCreacion ? new Date(r.fechaCreacion as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    return `${slice} - ${time}`;
  }

}
