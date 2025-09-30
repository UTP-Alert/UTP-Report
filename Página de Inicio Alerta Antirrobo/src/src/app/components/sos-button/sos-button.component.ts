import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../ui/button/button.component';

@Component({
  selector: 'app-sos-button',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="fixed bottom-6 right-6 z-50">
      <app-button
        [class]="getSosButtonClasses()"
        (click)="handleSosClick()"
        [attr.aria-label]="'Botón de emergencia SOS'"
        size="lg">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="ml-2 font-bold">SOS</span>
      </app-button>

      <!-- Pulse animation rings -->
      <div *ngIf="isPulsing()" class="absolute inset-0 -z-10">
        <div class="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20"></div>
        <div class="absolute inset-2 rounded-full bg-red-400 animate-ping opacity-30 animation-delay-150"></div>
        <div class="absolute inset-4 rounded-full bg-red-400 animate-ping opacity-40 animation-delay-300"></div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes pulse-sos {
      0%, 100% {
        transform: scale(1);
        opacity: 0.8;
      }
      50% {
        transform: scale(1.05);
        opacity: 1;
      }
    }

    .animate-pulse-sos {
      animation: pulse-sos 1.5s ease-in-out infinite;
    }

    .animation-delay-150 {
      animation-delay: 150ms;
    }

    .animation-delay-300 {
      animation-delay: 300ms;
    }
  `]
})
export class SOSButtonComponent {
  isPulsing = signal(false);

  getSosButtonClasses(): string {
    return `
      w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl
      transition-all duration-300 transform hover:scale-110 hover:shadow-red-500/25
      flex items-center justify-center relative
      ${this.isPulsing() ? 'animate-pulse-sos' : ''}
    `;
  }

  handleSosClick(): void {
    // Activate pulsing animation
    this.isPulsing.set(true);

    // Show emergency alert
    const confirmed = confirm(
      '🚨 BOTÓN DE EMERGENCIA ACTIVADO 🚨\n\n' +
      '¿Estás en una situación de emergencia real?\n\n' +
      '• SÍ: Se contactará inmediatamente a las autoridades\n' +
      '• NO: Cancelar y usar el botón "Reportar" para incidentes normales\n\n' +
      '⚠️ El mal uso de este botón constituye una falta grave.'
    );

    if (confirmed) {
      this.triggerEmergencyProtocol();
    } else {
      // Stop pulsing if cancelled
      setTimeout(() => {
        this.isPulsing.set(false);
      }, 1000);
    }
  }

  private triggerEmergencyProtocol(): void {
    // Simulate emergency protocol
    alert(
      '🚨 PROTOCOLO DE EMERGENCIA ACTIVADO 🚨\n\n' +
      '✅ Alertando a Seguridad Universidad\n' +
      '✅ Notificando a Policía Nacional\n' +
      '✅ Enviando ubicación actual\n' +
      '✅ Activando grabación de emergencia\n\n' +
      '📞 Permanece en línea, la ayuda está en camino.\n' +
      '⏱️ Tiempo estimado de respuesta: 2-5 minutos'
    );

    // Keep pulsing for a longer period to indicate active emergency
    setTimeout(() => {
      this.isPulsing.set(false);
      alert('📱 Emergencia reportada exitosamente.\n\nManténte seguro y espera a las autoridades.');
    }, 3000);
  }
}