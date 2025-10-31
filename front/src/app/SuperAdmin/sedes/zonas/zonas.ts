import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SedeService, Sede } from '../../../services/sede.service';
import { ZonaService, Zona } from '../../../services/zona.service';

@Component({
  selector: 'app-zonas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './zonas.html',
  styleUrl: './zonas.scss'
})
export class Zonas implements OnInit {
  @Input() parentSedeId?: number | null;
  @Output() created = new EventEmitter<number>();

  sedes: Sede[] = [];
  zonas: Zona[] = [];

  // Form fields
  newNombre: string = '';
  newDescripcion: string = '';
  selectedSedeId: number | null = null;
  fotoFile: File | null = null;
  fotoPreview: string | null = null;

  loading = false;

  constructor(private sedeService: SedeService, private zonaService: ZonaService) {}

  ngOnInit(): void {
    this.loadSedes();
    if (this.parentSedeId) {
      this.selectedSedeId = this.parentSedeId;
      this.loadZonasForSede(this.parentSedeId);
    }
  }

  loadSedes() {
    this.sedeService.obtenerSedes().subscribe({
      next: (data) => {
        this.sedes = data || [];
        if (!this.selectedSedeId && this.sedes.length) {
          this.selectedSedeId = this.sedes[0].id;
          this.loadZonasForSede(this.selectedSedeId);
        }
      },
      error: (err) => console.error('Error cargando sedes', err)
    });
  }

  onSedeChange() {
    if (this.selectedSedeId != null) this.loadZonasForSede(this.selectedSedeId);
  }

  loadZonasForSede(sedeId: number) {
    this.zonaService.obtenerZonasPorSede(sedeId).subscribe({
      next: (z) => this.zonas = z || [],
      error: (err) => console.error('Error cargando zonas por sede', err)
    });
  }

  onFileSelected(ev: Event) {
    const inp = ev.target as HTMLInputElement;
    if (!inp.files || inp.files.length === 0) {
      this.fotoFile = null;
      this.fotoPreview = null;
      return;
    }
    this.fotoFile = inp.files[0];
    const reader = new FileReader();
    reader.onload = () => this.fotoPreview = String(reader.result);
    reader.readAsDataURL(this.fotoFile);
  }

  crearZona() {
    const nombre = (this.newNombre || '').trim();
    if (!nombre) return;
    if (!this.selectedSedeId) return;

    const fd = new FormData();
    fd.append('nombre', nombre);
    fd.append('sedeId', String(this.selectedSedeId));
    if (this.newDescripcion) fd.append('descripcion', this.newDescripcion);
    if (this.fotoFile) fd.append('foto', this.fotoFile, this.fotoFile.name);

    this.loading = true;
    this.zonaService.crearZona(fd).subscribe({
      next: (res) => {
        this.loading = false;
        // reset form
        this.newNombre = '';
        this.newDescripcion = '';
        this.fotoFile = null;
        this.fotoPreview = null;
        // reload list
        if (this.selectedSedeId) this.loadZonasForSede(this.selectedSedeId);
        // notify parent that a zona was created (emit the sedeId)
        if (this.selectedSedeId != null) this.created.emit(this.selectedSedeId);
        if (!res) { alert('No se pudo crear la zona. Revisa el servidor.'); }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error creando zona', err);
      }
    });
  }

    cancelCrearZona() {
      this.newNombre = '';
      this.newDescripcion = '';
      this.fotoFile = null;
      this.fotoPreview = null;
    }
}
