import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReportaAhora } from './reporta-ahora/reporta-ahora';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TimeService } from '../../services/time.service';
import { DetalleReporte } from './detalle-reporte/detalle-reporte';
import { ReporteService, ReporteDTO } from '../../services/reporte.service';

@Component({
  selector: 'app-inicio-usuario',
  standalone: true,
  imports: [CommonModule, NgIf, HttpClientModule, ReportaAhora, DetalleReporte],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss']
})
export class InicioUsuario implements OnInit {
  showReportModal = false;
  // Modal Detalle de Reporte
  showDetalleModal = false;
  usuarioId: number | null = null;
  hasReportesHoy = false;
  // Mini-modales (toasts) y conteo
  showToastLimit = false;
  showToastSuccess = false;
  showToastAuth = false;
  // Mini-modales centrados
  showDialogLimit = false;
  showDialogSuccess = false;
  private toastTimer: any;
  private dialogTimer: any;
  // Fuente de verdad: el hijo reporta el conteo, pero aquí retenemos el estado para bloquear botón
  reportesUsadosHoy = 0;
  reportesLimite = 3;
  get limiteAlcanzado(): boolean { return this.reportesUsadosHoy >= this.reportesLimite; }
  constructor(private http: HttpClient, private reporteService: ReporteService, private timeService: TimeService) {}

  ngOnInit(): void {
    // Cargar el conteo diario al iniciar para bloquear el botón si corresponde
    const base = 'http://localhost:8080';
    const username = this.extractUsernameFromToken();
    if (!username) return;
    // Traer hora real del server y UsuarioDTO, luego decidir intentos locales
    this.timeService.getServerDateISO().subscribe({
      next: (serverISO) => {
        this.http.get<any[]>(`${base}/api/usuarios`).subscribe({
          next: lista => {
            const found = (lista || []).find(u => u.username === username);
            if (typeof found?.id === 'number') this.usuarioId = found.id;
            // Si backend manda fechaUltimoReporte, comparar con fecha real del servidor
            const fechaUlt = (found?.fechaUltimoReporte as string | undefined) || null; // esperado "YYYY-MM-DD"
            const intentos = typeof found?.intentos === 'number' ? found.intentos : 0;
            if (fechaUlt && typeof fechaUlt === 'string') {
              if (fechaUlt !== serverISO) {
                // Nuevo día según servidor: resetear intentos solo en el front
                this.reportesUsadosHoy = 0;
              } else {
                this.reportesUsadosHoy = intentos;
              }
            } else {
              // Si no hay fecha registrada, no bloqueamos de más
              this.reportesUsadosHoy = intentos;
            }
            if (typeof found?.id === 'number') this.checkReportesHoy(found.id);
          },
          error: _ => { /* silencioso */ }
        });
      },
      error: _ => {
        // Si no podemos obtener hora real, usar lo que venga del backend como fallback
        this.http.get<any[]>(`${base}/api/usuarios`).subscribe({
          next: lista => {
            const found = (lista || []).find(u => u.username === username);
            if (typeof found?.intentos === 'number') this.reportesUsadosHoy = found.intentos;
            if (typeof found?.id === 'number') {
              this.usuarioId = found.id;
              this.checkReportesHoy(found.id);
            }
          },
          error: _ => {}
        });
      }
    });
  }

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

  openReportModal() {
    if (this.limiteAlcanzado) {
      this.showLimitDialog();
      return;
    }
    this.showReportModal = true;
    try { document.body.style.overflow = 'hidden'; } catch {}
  }
  closeReportModal() {
    this.showReportModal = false;
    try { document.body.style.overflow = ''; } catch {}
  }

  // Abrir/Cerrar Detalle de Reporte
  openDetalleModal() {
    if (!this.usuarioId) return;
    this.showDetalleModal = true;
    try { document.body.style.overflow = 'hidden'; } catch {}
  }
  closeDetalleModal() {
    this.showDetalleModal = false;
    try { document.body.style.overflow = ''; } catch {}
  }

  // Recepción del evento de éxito desde el modal hijo
  onReporteEnviado() {
    try { console.debug('[InicioUsuario] Reporte enviado: mostrando toast de éxito'); } catch {}
    // incrementar contador local (el hijo ya hizo su incremento local)
    this.reportesUsadosHoy = Math.min(this.reportesUsadosHoy + 1, this.reportesLimite);
    // Desde el primer envío del día, habilitar botón de detalle
    this.hasReportesHoy = true;
    this.showSuccessDialog();
  }

  // Utilidades para mini-modales
  private showLimitToast() {
    this.showToastLimit = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.showToastLimit = false; }, 2500);
  }
  private showSuccessToast() {
    this.showToastSuccess = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.showToastSuccess = false; }, 2200);
  }
  // Diálogos centrados
  private showLimitDialog() {
    this.showDialogLimit = true;
    if (this.dialogTimer) clearTimeout(this.dialogTimer);
    this.dialogTimer = setTimeout(() => { this.showDialogLimit = false; }, 3000);
  }
  private showSuccessDialog() {
    this.showDialogSuccess = true;
    if (this.dialogTimer) clearTimeout(this.dialogTimer);
    this.dialogTimer = setTimeout(() => { this.showDialogSuccess = false; }, 2500);
  }
  onAuthRequired() {
    this.showToastAuth = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.showToastAuth = false; }, 3000);
  }

  // Cerrar con tecla ESC
  @HostListener('document:keydown.escape') onEsc() {
    if (this.showReportModal) this.closeReportModal();
    else if (this.showDetalleModal) this.closeDetalleModal();
  }

  ngOnDestroy() {
    // En caso el componente se destruya con el modal abierto, restablecer scroll
    try { document.body.style.overflow = ''; } catch {}
    if (this.toastTimer) { try { clearTimeout(this.toastTimer); } catch {} }
    if (this.dialogTimer) { try { clearTimeout(this.dialogTimer); } catch {} }
  }

  private checkReportesHoy(uid: number) {
    this.reporteService.getAll().subscribe({
      next: (lista: ReporteDTO[]) => {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = hoy.getMonth();
        const dd = hoy.getDate();
        const hay = (lista || []).some(r => {
          if (r.usuarioId !== uid) return false;
          if (!r.fechaCreacion) return false;
          const d = new Date(r.fechaCreacion as any);
          return d.getFullYear() === yyyy && d.getMonth() === mm && d.getDate() === dd;
        });
        this.hasReportesHoy = hay;
      },
      error: _ => { this.hasReportesHoy = false; }
    });
  }
}
