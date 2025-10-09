import { Component, OnInit, NgZone, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenteService } from '../../../services/incidente.service';
import { ZonaService, Zona } from '../../../services/zona.service';
import { ReporteService } from '../../../services/reporte.service';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ReportesHoyService, ReportesHoy } from '../../../services/reportes-hoy.service';

@Component({
  selector: 'app-reporta-ahora',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporta-ahora.html',
  styleUrls: ['./reporta-ahora.scss']
})
export class ReportaAhora implements OnInit {
  @Output() close = new EventEmitter<void>();
  tipos: any[] = [];
  zonas: Zona[] = [];
  selectedTipo: any | null = null;
  selectedZona: Zona | null = null;
  showTiposMenu = false;
  showZonasMenu = false;
  descripcion = '';
  isAnonimo = true;
  contacto: string | undefined;
  evidenciaFile: File | null = null;
  submitting = false;
  usuarioId: number | null = null;
  meInfo: any | null = null;
  showUploadMenu = false;
  showCamera = false;
  private mediaStream: MediaStream | null = null;
  previewUrl: string | null = null;
  snapshotUrl: string | null = null;
  private snapshotBlob: Blob | null = null;
  showContactInfo = true;
  attemptedSubmit = false;
  reportesHoy: ReportesHoy | null = null;

  constructor(
    private incidenteService: IncidenteService,
    private zonaService: ZonaService,
    private reporteService: ReporteService,
    private auth: AuthService,
    private http: HttpClient,
    private reportesHoyService: ReportesHoyService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.incidenteService.obtenerTipos().subscribe(t => this.tipos = t || []);
    this.zonaService.obtenerZonas().subscribe(z => this.zonas = z || []);
    // cerrar menús al hacer click global
    document.addEventListener('click', this.closeAllMenus, true);

    // Obtener usuarioId del backend (JWT no trae id)
    const base = 'http://localhost:8080';
    this.http.get<any>(`${base}/api/usuarios/me`).subscribe({
      next: me => {
        this.meInfo = me || null;
        // Preferir id directo del endpoint /me
        if (me?.id) {
          this.usuarioId = Number(me.id);
        } else {
          const username = me?.username;
          if (!username) return;
          // Fallback: buscar por username (si el endpoint lista usuarios está permitido)
          this.http.get<any[]>(`${base}/api/usuarios`).subscribe({
            next: lista => {
              const found = (lista || []).find(u => u.username === username);
              if (found?.id) this.usuarioId = Number(found.id);
            },
            error: _ => {}
          });
        }
      },
      error: _ => {}
    });

    // Obtener conteo de reportes de hoy
    this.reportesHoyService.obtener().subscribe({
      next: (d) => this.reportesHoy = d,
      error: _ => this.reportesHoy = { usados: 0, limite: 3 }
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.closeAllMenus, true);
  }

  closeAllMenus = () => {
    this.showTiposMenu = false;
    this.showZonasMenu = false;
    this.showUploadMenu = false;
  };

  toggleTipos(): void {
    this.showTiposMenu = !this.showTiposMenu;
    if (this.showTiposMenu) this.showZonasMenu = false;
  }

  toggleZonas(): void {
    this.showZonasMenu = !this.showZonasMenu;
    if (this.showZonasMenu) this.showTiposMenu = false;
  }

  selectTipo(t: any): void {
    this.selectedTipo = t;
    this.showTiposMenu = false;
  }

  selectZona(z: Zona): void {
    this.selectedZona = z;
    this.showZonasMenu = false;
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.evidenciaFile = input.files[0];
      if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = URL.createObjectURL(this.evidenciaFile);
    }
  }

  toggleUploadMenu(ev: Event) {
    ev.stopPropagation();
    this.showUploadMenu = !this.showUploadMenu;
  }

  pickFromFiles() {
    const el = document.getElementById('ra-file-input') as HTMLInputElement | null;
    if (el) el.click();
    this.showUploadMenu = false;
  }

  pickFromCamera() {
    this.openCamera();
  }

  async openCamera() {
    this.showUploadMenu = false;
    try {
      if (!('mediaDevices' in navigator)) throw new Error('Este navegador no soporta cámara');
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      this.showCamera = true; // mostrar primero para asegurar que el video existe en DOM
      setTimeout(async () => {
        const video = document.getElementById('ra-camera-video') as HTMLVideoElement | null;
        if (video) {
          (video as any).srcObject = this.mediaStream;
          await new Promise<void>(resolve => {
            if (video.readyState >= 1) return resolve();
            video.onloadedmetadata = () => resolve();
          });
          await video.play();
        }
      }, 0);
    } catch (err) {
      console.warn('No se pudo abrir la cámara', err);
      alert('No se pudo acceder a la cámara. Revisa los permisos del navegador.');
      this.stopCamera();
    }
  }

  stopCamera() {
    try {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(t => t.stop());
      }
    } catch {}
    this.mediaStream = null;
    const video = document.getElementById('ra-camera-video') as HTMLVideoElement | null;
    if (video) {
      try { video.pause(); } catch {}
      (video as any).srcObject = null;
      video.removeAttribute('src');
    }
  }

  async capturePhoto() {
    const video = document.getElementById('ra-camera-video') as HTMLVideoElement | null;
    if (!video) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 0));
    canvas.toBlob((blob) => {
      this.zone.run(() => {
        if (blob) {
          // Guardar snapshot para confirmación; no cerramos la cámara aún
          if (this.snapshotUrl) URL.revokeObjectURL(this.snapshotUrl);
          this.snapshotBlob = blob;
          this.snapshotUrl = URL.createObjectURL(blob);
        }
      });
    }, 'image/jpeg', 0.92);
  }

  retakeSnapshot() {
    if (this.snapshotUrl) URL.revokeObjectURL(this.snapshotUrl);
    this.snapshotUrl = null;
    this.snapshotBlob = null;
    // El <video> se destruye/crea con *ngIf; reasignar stream tras re-render
    setTimeout(async () => {
      const video = document.getElementById('ra-camera-video') as HTMLVideoElement | null;
      if (video && this.mediaStream) {
        (video as any).srcObject = this.mediaStream;
        await new Promise<void>(resolve => {
          if (video.readyState >= 1) return resolve();
          video.onloadedmetadata = () => resolve();
        });
        try { await video.play(); } catch {}
      }
    }, 0);
  }

  confirmSnapshot() {
    if (!this.snapshotBlob) return;
    // Crear File y asignar como evidencia; mostrar preview en el cuadro principal
    const file = new File([this.snapshotBlob], 'evidencia.jpg', { type: 'image/jpeg' });
    this.evidenciaFile = file;
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = URL.createObjectURL(file);
    // Limpiar snapshot temporal y cerrar cámara/overlay
    if (this.snapshotUrl) { URL.revokeObjectURL(this.snapshotUrl); this.snapshotUrl = null; }
    this.snapshotBlob = null;
    this.closeCamera();
  }

  closeCamera() {
    this.stopCamera();
    this.showCamera = false;
    if (this.snapshotUrl) { URL.revokeObjectURL(this.snapshotUrl); this.snapshotUrl = null; }
    this.snapshotBlob = null;
  }

  removeEvidence() {
    this.evidenciaFile = null;
    if (this.previewUrl) { URL.revokeObjectURL(this.previewUrl); this.previewUrl = null; }
    const f1 = document.getElementById('ra-file-input') as HTMLInputElement | null;
    const f2 = document.getElementById('ra-camera-input') as HTMLInputElement | null;
    if (f1) f1.value = '';
    if (f2) f2.value = '';
  }

  // Toggle anónimo en todo el card
  onAnonCardClick(ev: MouseEvent) {
    // Evitar doble toggle si el click viene del propio checkbox
    const target = ev.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.closest('input[type="checkbox"]') || target.closest('.no-toggle'))) {
      return;
    }
    this.isAnonimo = !this.isAnonimo;
    // Si deja de ser anónimo, mostrar sección de contacto por defecto
    this.showContactInfo = !this.isAnonimo;
    ev.preventDefault();
    ev.stopPropagation();
  }

  onAnonCardKeydown(ev: KeyboardEvent) {
    const key = ev.key.toLowerCase();
    if (key === 'enter' || key === ' ' || key === 'spacebar') {
      this.isAnonimo = !this.isAnonimo;
      this.showContactInfo = !this.isAnonimo;
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  toggleContactInfo(ev?: Event) {
    if (ev) { ev.preventDefault(); ev.stopPropagation(); }
    this.showContactInfo = !this.showContactInfo;
  }

  canSubmit(): boolean {
    // No requerimos usuarioId para habilitar el botón; lo recuperamos al enviar
    const baseOk = !!(this.selectedTipo && this.selectedZona && this.descripcion.trim().length >= 10) && !this.submitting;
    if (!baseOk) return false;
    if (this.reportesHoy && this.reportesHoy.usados >= this.reportesHoy.limite) return false;
    return true;
  }

  enviarReporte() {
    this.attemptedSubmit = true;
    if (!this.canSubmit()) {
      if (this.reportesHoy && this.reportesHoy.usados >= this.reportesHoy.limite) {
        alert('Ya alcanzaste tu límite diario de reportes (3). Vuelve a intentarlo mañana.');
      }
      return;
    }
    this.submitting = true;
    const base = 'http://localhost:8080';
    if (!this.usuarioId) {
      this.http.get<any>(`${base}/api/usuarios/me`).subscribe({
        next: me => {
          if (me?.id) this.usuarioId = Number(me.id);
          if (!this.usuarioId) {
            this.submitting = false;
            alert('No se pudo identificar al usuario. Inicia sesión nuevamente.');
            return;
          }
          this._submitNow();
        },
        error: _ => {
          this.submitting = false;
          alert('No se pudo identificar al usuario. Inicia sesión nuevamente.');
        }
      });
    } else {
      this._submitNow();
    }
  }

  private _submitNow() {
    this.reporteService.crearReporte({
      tipoIncidenteId: this.selectedTipo!.id,
      zonaId: this.selectedZona!.id,
      descripcion: this.descripcion.trim(),
      isAnonimo: this.isAnonimo,
      contacto: this.contacto,
      usuarioId: this.usuarioId!,
      foto: this.evidenciaFile
    }).subscribe({
      next: _ => {
        this.submitting = false;
        // Reset mínimo del formulario
        this.selectedTipo = null;
        this.selectedZona = null;
        this.descripcion = '';
        this.isAnonimo = true;
        this.contacto = undefined;
        // Limpia evidencia, preview e inputs de archivo
        this.removeEvidence();
        // Asegura que la sección de contacto quede oculta al volver a modo anónimo
        this.showContactInfo = false;
        // Cierra menús de carga si quedaran abiertos
        this.showUploadMenu = false;
        this.attemptedSubmit = false;
        // Actualizar contador (sumar uno) y cerrar el modal
        if (this.reportesHoy) {
          this.reportesHoy = { ...this.reportesHoy, usados: Math.min(this.reportesHoy.usados + 1, this.reportesHoy.limite) };
        }
        // Cerrar el modal automáticamente tras el envío exitoso
        try { this.close.emit(); } catch {}
      },
      error: err => {
        console.warn('Error al enviar reporte', err);
        this.submitting = false;
        alert('No se pudo enviar el reporte');
      }
    });
  }

  // Cerrar modal: emite evento y hace back como fallback
  closeModal() {
    try { this.close.emit(); } catch {}
  }
}
