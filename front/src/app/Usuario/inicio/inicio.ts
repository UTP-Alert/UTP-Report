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

  openReportModal() { this.showReportModal = true; }
  closeReportModal() { this.showReportModal = false; }

  // Cerrar con tecla ESC
  @HostListener('document:keydown.escape') onEsc() {
    if (this.showReportModal) this.closeReportModal();
  }

}
