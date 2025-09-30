import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../ui/card/card.component';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { AlertComponent, AlertDescriptionComponent } from '../../ui/alert/alert.component';
import { SOSButtonComponent } from '../../sos-button/sos-button.component';

@Component({
  selector: 'app-soporte-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    BadgeComponent,
    AlertComponent,
    AlertDescriptionComponent,
    SOSButtonComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center gap-4 mb-4">
            <div class="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
              </svg>
            </div>
            <div>
              <h1 class="text-4xl font-bold text-gray-900 mb-2">SOPORTE Y AYUDA</h1>
              <p class="text-xl text-gray-600">Centro de ayuda del Sistema de Alertas Antirrobo</p>
            </div>
          </div>
        </div>

        <!-- System Status -->
        <app-alert class="mb-8 border-green-200 bg-green-50">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <app-alert-description class="text-lg text-green-800">
            <strong>Estado del Sistema: OPERATIVO</strong> - Todos los servicios funcionan normalmente. 
            Tiempo de respuesta promedio: < 2 minutos.
          </app-alert-description>
        </app-alert>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <app-card class="text-center hover:shadow-lg transition-shadow cursor-pointer border-primary/20" (click)="onOpenReport.emit()">
            <app-card-content class="p-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="font-semibold text-lg mb-2">Reportar Incidente</h3>
              <p class="text-sm text-gray-600">Informa inmediatamente cualquier situación de seguridad</p>
            </app-card-content>
          </app-card>

          <app-card class="text-center hover:shadow-lg transition-shadow cursor-pointer" (click)="contactSupport()">
            <app-card-content class="p-6">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 class="font-semibold text-lg mb-2">Contactar Soporte</h3>
              <p class="text-sm text-gray-600">Obtén ayuda técnica o reporta problemas del sistema</p>
            </app-card-content>
          </app-card>

          <app-card class="text-center hover:shadow-lg transition-shadow cursor-pointer" (click)="viewFAQ()">
            <app-card-content class="p-6">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="font-semibold text-lg mb-2">Preguntas Frecuentes</h3>
              <p class="text-sm text-gray-600">Encuentra respuestas a las dudas más comunes</p>
            </app-card-content>
          </app-card>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Contact Information -->
          <app-card>
            <app-card-header>
              <app-card-title class="flex items-center gap-3">
                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Información de Contacto
              </app-card-title>
              <app-card-description>
                Múltiples canales de comunicación disponibles las 24 horas
              </app-card-description>
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <div *ngFor="let contact of contactMethods" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ng-container [innerHTML]="contact.icon"></ng-container>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium">{{ contact.title }}</h4>
                    <p class="text-sm text-gray-600">{{ contact.info }}</p>
                  </div>
                  <app-badge [variant]="contact.available ? 'default' : 'secondary'" 
                            [class]="contact.available ? 'bg-green-100 text-green-800' : ''">
                    {{ contact.available ? 'Disponible' : 'Fuera de línea' }}
                  </app-badge>
                </div>
              </div>
            </app-card-content>
          </app-card>

          <!-- Technical Support -->
          <app-card>
            <app-card-header>
              <app-card-title class="flex items-center gap-3">
                <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Soporte Técnico
              </app-card-title>
              <app-card-description>
                Problemas técnicos y mantenimiento del sistema
              </app-card-description>
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <div *ngFor="let issue of technicalIssues" class="border-l-4 pl-4" [class]="'border-l-' + issue.severity">
                  <h4 class="font-medium">{{ issue.title }}</h4>
                  <p class="text-sm text-gray-600 mb-2">{{ issue.description }}</p>
                  <app-button variant="outline" size="sm" (click)="reportTechnicalIssue(issue)">
                    Reportar Problema
                  </app-button>
                </div>
              </div>
            </app-card-content>
          </app-card>
        </div>

        <!-- FAQ Section -->
        <app-card class="mb-8">
          <app-card-header>
            <app-card-title class="text-center text-2xl">Preguntas Frecuentes</app-card-title>
            <app-card-description class="text-center">
              Respuestas a las consultas más comunes sobre el sistema
            </app-card-description>
          </app-card-header>
          <app-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div *ngFor="let faq of frequentQuestions" class="space-y-3">
                <h4 class="font-semibold text-lg">{{ faq.question }}</h4>
                <p class="text-gray-700 leading-relaxed">{{ faq.answer }}</p>
                <div class="flex flex-wrap gap-2">
                  <app-badge *ngFor="let tag of faq.tags" variant="outline" class="text-xs">
                    {{ tag }}
                  </app-badge>
                </div>
              </div>
            </div>
          </app-card-content>
        </app-card>

        <!-- Emergency Contacts -->
        <app-card class="bg-red-50 border-red-200">
          <app-card-header>
            <app-card-title class="flex items-center gap-3 text-red-700">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Contactos de Emergencia
            </app-card-title>
            <app-card-description class="text-red-600">
              Para situaciones de emergencia inmediata, contacta directamente a las autoridades
            </app-card-description>
          </app-card-header>
          <app-card-content>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div *ngFor="let emergency of emergencyContacts" 
                   class="flex items-center gap-3 p-4 bg-white rounded-lg border border-red-200">
                <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <ng-container [innerHTML]="emergency.icon"></ng-container>
                </div>
                <div>
                  <p class="font-semibold text-red-700">{{ emergency.name }}</p>
                  <p class="text-2xl font-bold text-red-800">{{ emergency.number }}</p>
                </div>
              </div>
            </div>
          </app-card-content>
        </app-card>
      </div>

      <!-- SOS Button -->
      <app-sos-button></app-sos-button>
    </div>
  `
})
export class SoportePageComponent {
  @Output() openReport = new EventEmitter<void>();

  contactMethods = [
    {
      title: 'Email de Soporte',
      info: 'soporte@alertaantirrobo.edu',
      available: true,
      icon: '<svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>'
    },
    {
      title: 'Chat en Línea',
      info: 'Disponible las 24 horas',
      available: true,
      icon: '<svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>'
    },
    {
      title: 'Teléfono de Soporte',
      info: '+1 (800) 123-4567',
      available: true,
      icon: '<svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>'
    },
    {
      title: 'Oficina Presencial',
      info: 'Edificio Admin, Piso 2',
      available: false,
      icon: '<svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>'
    }
  ];

  technicalIssues = [
    {
      title: 'Problemas de Conexión',
      description: 'Dificultades para acceder al sistema o lentitud en la carga',
      severity: 'red-500'
    },
    {
      title: 'Errores en Reportes',
      description: 'Problemas al enviar o visualizar reportes de incidentes',
      severity: 'orange-500'
    },
    {
      title: 'Notificaciones',
      description: 'No recibo alertas o notificaciones del sistema',
      severity: 'yellow-500'
    },
    {
      title: 'Interfaz de Usuario',
      description: 'Problemas de visualización o navegación en la página',
      severity: 'blue-500'
    }
  ];

  frequentQuestions = [
    {
      question: '¿Cómo funciona el sistema de alertas?',
      answer: 'El sistema recibe reportes de la comunidad universitaria y los procesa en tiempo real para alertar inmediatamente a todos los usuarios sobre situaciones de seguridad en el campus.',
      tags: ['Sistema', 'Funcionamiento', 'Alertas']
    },
    {
      question: '¿Es completamente anónimo?',
      answer: 'Sí, el sistema está diseñado para proteger tu privacidad. Puedes reportar incidentes de forma completamente anónima sin revelar tu identidad.',
      tags: ['Privacidad', 'Anonimato', 'Seguridad']
    },
    {
      question: '¿Qué debo hacer en caso de emergencia?',
      answer: 'En emergencias inmediatas, usa el botón SOS o contacta directamente a las autoridades (Policía: 123, Seguridad Universidad: 911). El sistema complementa pero no reemplaza estos servicios.',
      tags: ['Emergencia', 'SOS', 'Protocolo']
    },
    {
      question: '¿Cómo se verifican los reportes?',
      answer: 'Los reportes pasan por un sistema de verificación automática y revisión administrativa para asegurar su veracidad antes de generar alertas masivas.',
      tags: ['Verificación', 'Reportes', 'Calidad']
    },
    {
      question: '¿Puedo hacer reportes desde dispositivos móviles?',
      answer: 'Sí, el sistema está optimizado para funcionar en computadoras, tablets y teléfonos móviles, garantizando acceso desde cualquier dispositivo.',
      tags: ['Móvil', 'Accesibilidad', 'Dispositivos']
    },
    {
      question: '¿Qué información incluir en un reporte?',
      answer: 'Incluye ubicación específica, hora aproximada, descripción detallada del incidente, y si es posible, una fotografía. Mientras más información, mejor será la respuesta.',
      tags: ['Reportes', 'Información', 'Guía']
    }
  ];

  emergencyContacts = [
    {
      name: 'Policía Nacional',
      number: '123',
      icon: '<svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>'
    },
    {
      name: 'Seguridad Universidad',
      number: '911',
      icon: '<svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>'
    },
    {
      name: 'Emergencias Médicas',
      number: '112',
      icon: '<svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>'
    }
  ];

  contactSupport(): void {
    alert('📞 Contactando con Soporte Técnico...\n\n' +
          '• Email: soporte@alertaantirrobo.edu\n' +
          '• Teléfono: +1 (800) 123-4567\n' +
          '• Chat en línea disponible 24/7\n\n' +
          'Tiempo de respuesta promedio: < 2 minutos');
  }

  viewFAQ(): void {
    alert('📚 Sección de Preguntas Frecuentes\n\n' +
          'Aquí encontrarás respuestas a las dudas más comunes sobre:\n\n' +
          '• Funcionamiento del sistema\n' +
          '• Privacidad y anonimato\n' +
          '• Procedimientos de emergencia\n' +
          '• Verificación de reportes\n' +
          '• Compatibilidad con dispositivos');
  }

  reportTechnicalIssue(issue: any): void {
    alert(`🔧 Reportando problema técnico: ${issue.title}\n\n` +
          `Descripción: ${issue.description}\n\n` +
          'Tu reporte ha sido enviado al equipo técnico.\n' +
          'Recibirás una respuesta en las próximas 2 horas.');
  }
}