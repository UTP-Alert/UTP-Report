import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SedeService, Sede } from '../../services/sede.service';
import { Zonas } from './zonas/zonas';
import { ZonaService } from '../../services/zona.service';
import { AuthService } from '../../services/auth.service';
import { ROLES } from '../../constants/roles';


@Component({
  selector: 'app-sedes',
  standalone: true,
  imports: [CommonModule, FormsModule, Zonas],
  templateUrl: './sedes.html',
  styleUrl: './sedes.scss'
})
export class Sedes {
  sedes: Sede[] = [];
  newNombre: string = '';
  loading = false;
  selectedSedeId: number | null = null;
  // editing state for zones
  editingZoneId: number | null = null;
  editedZone: Partial<any> = {};
  // campos para edición de imagen en inline edit
  editedFotoFile: File | null = null;
  editedFotoPreview: string | null = null;
  // control panel para crear zona
  showCreateZone: boolean = false;

  constructor(private sedeService: SedeService, private zonaService: ZonaService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadSedes();
  }

  toggleCreateZone() {
    this.showCreateZone = !this.showCreateZone;
    if (this.showCreateZone) {
      // esperar al render y hacer scroll + focus en primer input si existe
      setTimeout(() => {
        const el = document.getElementById('create-zone-panel');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // focus al primer input dentro del panel
        const input = document.querySelector('#create-zone-panel input');
        if (input) (input as HTMLElement).focus();
      }, 150);
    }
  }

  onZonaCreated(sedeId?: number) {
    // recargar zonas y cerrar panel
    if (sedeId != null) this.loadZonasForSede(sedeId);
    this.showCreateZone = false;
  }

  loadSedes() {
    this.sedeService.obtenerSedes().subscribe({ next: s => {
      this.sedes = s || [];
      // cargar zonas para cada sede
      for (const sd of this.sedes) {
        this.loadZonasForSede(sd.id);
      }
      // seleccionar la primera sede por defecto
      if (this.sedes.length && this.selectedSedeId == null) {
        this.selectedSedeId = this.sedes[0].id;
      }
    }, error: err => { console.error('Error cargando sedes', err); } });
  }

  get selectedSede() {
    return this.sedes.find(s => s.id === this.selectedSedeId) || null;
  }

  /** Calcula estadísticas derivadas para la sede seleccionada */
  get sedeStats() {
    const s = this.selectedSede as any;
    if (!s) return { seguras: 0, precaucion: 0, peligrosas: 0, estudiantes: 0 };
    const zonas: any[] = s.zonas || [];

    let seguras = 0;
    let precaucion = 0;
    let peligrosas = 0;
    let estudiantes = 0;

    for (const z of zonas) {
      const cat = this.categorizarZona(z);
      if (cat === 'segura') seguras++;
      else if (cat === 'precaucion') precaucion++;
      else if (cat === 'peligrosa') peligrosas++;

      // sumar estudiantes si existe la propiedad en la zona o en la sede
      const sCount = Number((z && (z.estudiantes || z.studentCount || z.students)) || 0);
      estudiantes += isNaN(sCount) ? 0 : sCount;
    }

    // fallback: si la sede tiene un contador global de estudiantes
    if ((!estudiantes || estudiantes === 0) && s.estudiantes) {
      estudiantes = Number(s.estudiantes) || 0;
    }

    return { seguras, precaucion, peligrosas, estudiantes };
  }

  /** Intento de categorizar una zona en base a campos comunes */
  public categorizarZona(z: any): 'segura' | 'precaucion' | 'peligrosa' | 'desconocida' {
    if (!z) return 'desconocida';
    const candidates: string[] = [];
    const add = (v: any) => { if (v != null) candidates.push(String(v).toLowerCase()); };
    add(z.estado); add(z.nivel); add(z.nivelSeguridad); add(z.prioridad); add(z.status); add(z.risk);

    for (const val of candidates) {
      if (!val) continue;
      if (val.includes('segur') || val.includes('safe') || val.includes('bajo')) return 'segura';
      if (val.includes('precauc') || val.includes('precau') || val.includes('medio') || val.includes('caution')) return 'precaucion';
      if (val.includes('pelig') || val.includes('danger') || val.includes('alto') || val.includes('riesgo')) return 'peligrosa';
    }

    // fallback por prioridad numérica
    const pri = z.prioridad || z.priority || z.level;
    if (pri != null) {
      const n = Number(pri);
      if (!isNaN(n)) {
        if (n >= 75) return 'peligrosa';
        if (n >= 40) return 'precaucion';
        return 'segura';
      }
    }

    return 'desconocida';
  }

  loadZonasForSede(sedeId: number) {
    const includeInactive = this.auth.hasRole(ROLES.SUPERADMIN);
    this.zonaService.obtenerZonasPorSedeEx(sedeId, includeInactive).subscribe({ next: (z) => {
      const idx = this.sedes.findIndex(s => s.id === sedeId);
      if (idx !== -1) {
        // attach zonas array to the sede object
        const zonas = (z || []).map((zone: any) => {
          // convertir foto (byte[] o base64) a data URL para mostrar en <img>
          let fotoUrl: string | null = null;
          try {
            if (zone.foto && Array.isArray(zone.foto) && zone.foto.length > 0) {
              const bin = new Uint8Array(zone.foto);
              let binary = '';
              bin.forEach((b: number) => binary += String.fromCharCode(b));
              const b64 = btoa(binary);
              fotoUrl = `data:image/jpeg;base64,${b64}`;
            } else if (zone.foto && typeof zone.foto === 'string' && zone.foto.length > 0) {
              // si backend devuelve ya base64 en string (sin prefijo)
              fotoUrl = zone.foto.startsWith('data:') ? zone.foto : `data:image/jpeg;base64,${zone.foto}`;
            }
          } catch (e) { fotoUrl = null; }
          return { ...zone, fotoUrl };
        });
        (this.sedes[idx] as any).zonas = zonas;
      }
    }, error: err => console.error('Error cargando zonas por sede', err) });
  }

  selectSede(sedeId: number | null) {
    if (sedeId == null) return;
    this.selectedSedeId = sedeId;
    // cargar las zonas para la sede seleccionada y mostrar inmediatamente
    this.loadZonasForSede(sedeId);
  }

  startEditZona(zona: any) {
    this.editingZoneId = zona.id;
    this.editedZone = { nombre: zona.nombre, descripcion: zona.descripcion };
    this.editedFotoFile = null;
    this.editedFotoPreview = zona.fotoUrl || null;
  }

  saveEditZona(zonaId: number, sedeId: number) {
    const fd = new FormData();
    if ((this.editedZone as any)['nombre']) fd.append('nombre', String((this.editedZone as any)['nombre']));
    if ((this.editedZone as any)['descripcion']) fd.append('descripcion', String((this.editedZone as any)['descripcion']));
    // adjuntar foto si el usuario seleccionó una nueva
    if (this.editedFotoFile) fd.append('foto', this.editedFotoFile, this.editedFotoFile.name);
    
    // Asegurar que enviamos la sedeId requerida por el backend
    fd.append('sedeId', String(sedeId));
    this.zonaService.actualizarZona(zonaId, fd).subscribe({ next: (res) => {
      if (!res) { alert('No se pudo actualizar la zona. Revisa el servidor.'); return; }
      this.editingZoneId = null;
      this.editedZone = {};
      this.editedFotoFile = null;
      this.editedFotoPreview = null;
      this.loadZonasForSede(sedeId);
    }, error: (err) => { console.error('Error actualizando zona', err); alert('Error actualizando zona'); } });
  }

  onEditFileSelected(ev: Event) {
    const inp = ev.target as HTMLInputElement;
    if (!inp.files || inp.files.length === 0) {
      this.editedFotoFile = null;
      this.editedFotoPreview = null;
      return;
    }
    this.editedFotoFile = inp.files[0];
    const reader = new FileReader();
    reader.onload = () => this.editedFotoPreview = String(reader.result);
    reader.readAsDataURL(this.editedFotoFile);
  }

  cancelEditZona() {
    this.editingZoneId = null;
    this.editedZone = {};
    this.editedFotoFile = null;
    this.editedFotoPreview = null;
  }

  eliminarZona(zonaId: number, sedeId: number) {
    // Esta función ya no elimina físicamente la zona; se mantiene por compatibilidad si alguien llama directamente.
    if (!confirm('¿Desactivar zona?')) return;
    this.zonaService.setActivoZona(zonaId, false).subscribe({ next: () => {
      this.loadZonasForSede(sedeId);
    }, error: (err) => {
      console.error('Error desactivando zona', err);
      alert('Error cambiando el estado de la zona');
    } });
  }

  toggleZona(zonaId: number, sedeId: number, nuevoEstado: boolean) {
    // Aplicación optimista: cambiar visualmente antes de la respuesta para feedback instantáneo
    const sedeIdx = this.sedes.findIndex(s => s.id === sedeId);
    let zonaRef: any = null;
    if (sedeIdx !== -1) {
      zonaRef = (this.sedes[sedeIdx] as any).zonas?.find((z: any) => z.id === zonaId);
      if (zonaRef) zonaRef.activo = nuevoEstado;
    }

    // Confirmación para desactivar
    if (!nuevoEstado && !confirm('¿Desactivar zona? Esta acción puede ocultar la zona en listados.')) {
      // revertir cambio visual
      if (zonaRef) zonaRef.activo = !nuevoEstado;
      return;
    }

    this.zonaService.setActivoZona(zonaId, nuevoEstado).subscribe({ next: (res: any) => {
      // Si el backend devuelve la zona actualizada la usamos para sincronizar
      if (res) {
        // refrescar solo la sede para obtener datos consistentes
        this.loadZonasForSede(sedeId);
      }
    }, error: (err) => {
      // Revertir cambio visual en caso de error
      if (zonaRef) zonaRef.activo = !nuevoEstado;
      console.error('Error cambiando estado de zona', err);
      alert('Error cambiando estado de zona');
    } });
  }

  agregarSede() {
    const nombre = (this.newNombre || '').trim();
    if (!nombre) return;
    this.loading = true;
    this.sedeService.crearSede(nombre).subscribe({ next: (res) => {
      this.loading = false;
      this.newNombre = '';
      // recargar lista
      this.loadSedes();
    }, error: err => {
      this.loading = false;
      console.error('Error creando sede', err);
    } });
  }
}
