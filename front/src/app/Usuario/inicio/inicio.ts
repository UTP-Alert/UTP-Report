import { Component, HostListener } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReportaAhora } from './reporta-ahora/reporta-ahora';

@Component({
  selector: 'app-inicio-usuario',
  standalone: true,
  imports: [CommonModule, NgIf, ReportaAhora],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss']
})
export class InicioUsuario {
  showReportModal = false;

  openReportModal() {
    this.showReportModal = true;
    try { document.body.style.overflow = 'hidden'; } catch {}
  }
  closeReportModal() {
    this.showReportModal = false;
    try { document.body.style.overflow = ''; } catch {}
  }

  // Cerrar con tecla ESC
  @HostListener('document:keydown.escape') onEsc() {
    if (this.showReportModal) this.closeReportModal();
  }

  ngOnDestroy() {
    // En caso el componente se destruya con el modal abierto, restablecer scroll
    try { document.body.style.overflow = ''; } catch {}
  }

}
