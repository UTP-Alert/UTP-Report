import { Component, OnInit, NgZone, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenteService } from '../../../services/incidente.service';
import { ZonaService, Zona } from '../../../services/zona.service';
import { ReporteService } from '../../../services/reporte.service';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reporta-ahora',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, FormsModule],
  templateUrl: './reporta-ahora.html',
  styleUrls: ['./reporta-ahora.scss']
})
export class ReportaAhora implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();
  @Output() authRequired = new EventEmitter<void>();
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
  // Conteo de reportes diarios (backend controla el límite)
  reportesUsadosHoy = 0;
  reportesLimite = 3;
  // Control de límite
  get limiteAlcanzado(): boolean { return this.reportesUsadosHoy >= this.reportesLimite; }

  constructor(
    private incidenteService: IncidenteService,
    private zonaService: ZonaService,
    private reporteService: ReporteService,
    private auth: AuthService,
    private http: HttpClient,
    private zone: NgZone
  ) {}

  get estaAutenticado(): boolean {
    const tok = this.auth.getToken();
    return !!tok;
  }

  ngOnInit(): void {
    this.incidenteService.obtenerTipos().subscribe(t => this.tipos = t || []);
    this.zonaService.obtenerZonas().subscribe(z => this.zonas = z || []);
    // cerrar menús al hacer click global
    document.addEventListener('click', this.closeAllMenus, true);

    // Resolver usuarioId e intentos usando el JWT + /api/usuarios (evitamos /me que no existe)
    const base = 'http://localhost:8080';
    const username = this.extractUsernameFromToken();
    if (username) {
      this.http.get<any[]>(`${base}/api/usuarios`).subscribe({
        next: lista => {
          const found = (lista || []).find(u => u.username === username);
          if (found?.id) this.usuarioId = Number(found.id);
          if (typeof found?.intentos === 'number') this.reportesUsadosHoy = found.intentos;
        },
        error: _ => {}
      });
    }
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
    return !!(this.selectedTipo && this.selectedZona && this.descripcion.trim().length >= 10) && !this.submitting;
  }

  enviarReporte() {
    // Validación de límite diario (UX): si alcanzó 3, mostrar aviso y no enviar
    if (this.limiteAlcanzado) return;
    // Requiere autenticación
    if (!this.estaAutenticado) {
      this.authRequired.emit();
      this.close.emit();
      return;
    }
    this.attemptedSubmit = true;
    if (!this.canSubmit()) return;
    this.submitting = true;
    const base = 'http://localhost:8080';
    if (!this.usuarioId) {
      const username = this.extractUsernameFromToken();
      if (!username) {
        this.submitting = false;
        this.authRequired.emit();
        this.close.emit();
        return;
      }
      this.http.get<any[]>(`${base}/api/usuarios`).subscribe({
        next: lista => {
          const found = (lista || []).find(u => u.username === username);
          if (found?.id) {
            this.usuarioId = Number(found.id);
            this._submitNow();
          } else {
            this.submitting = false;
            this.authRequired.emit();
            this.close.emit();
          }
        },
        error: _ => {
          this.submitting = false;
          this.authRequired.emit();
          this.close.emit();
        }
      });
    } else {
      this._submitNow();
    }
  }

  // Extrae username/sub del JWT si existe
  private extractUsernameFromToken(): string | null {
    try {
      const tok = localStorage.getItem('auth_token');
      if (!tok) return null;
      const payload = tok.split('.')[1];
      const json = atob(payload.replace(/-/g,'+').replace(/_/g,'/'));
      const decoded = JSON.parse(json);
      return decoded?.sub || decoded?.username || null;
    } catch { return null; }
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
        // Incrementar contador local de reportes usados (máximo al límite)
        this.reportesUsadosHoy = Math.min(this.reportesUsadosHoy + 1, this.reportesLimite);
        // Notificar envío exitoso al padre y cerrar el modal
        try { this.submitted.emit(); } catch {}
        try { this.close.emit(); } catch {}
      },
      error: err => {
        console.warn('Error al enviar reporte', err);
        this.submitting = false;
        // Si backend devolvió límite alcanzado, mostrar mensaje claro
        const msg = (err?.error && typeof err.error === 'string') ? err.error : '';
        if (msg && msg.toLowerCase().includes('límite') || msg.toLowerCase().includes('limite')) {
          // Mantener feedback claro cuando el backend avisa límite
          this.reportesUsadosHoy = this.reportesLimite;
        } else {
          alert('No se pudo enviar el reporte');
        }
      }
    });
  }

  // Cerrar modal: emite evento y hace back como fallback
  closeModal() {
    try { this.close.emit(); } catch {}
  }
}
