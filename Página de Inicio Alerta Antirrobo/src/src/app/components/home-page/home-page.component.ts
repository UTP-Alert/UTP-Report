import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../ui/button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../ui/card/card.component';
import { BadgeComponent } from '../ui/badge/badge.component';
import { AlertComponent, AlertDescriptionComponent } from '../ui/alert/alert.component';
import { SOSButtonComponent } from '../sos-button/sos-button.component';

@Component({
  selector: 'app-home-page',
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
      <div class="max-w-7xl mx-auto">
        <!-- Hero Section -->
        <div class="text-center mb-12">
          <div class="flex items-center justify-center gap-4 mb-6">
            <div class="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 class="text-4xl font-bold text-gray-900 mb-2">SISTEMA DE ALERTAS ANTIRROBO</h1>
              <p class="text-xl text-gray-600">Protegiendo la comunidad universitaria las 24 horas</p>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <app-card class="text-center">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-primary mb-2">0</div>
              <p class="text-sm text-gray-600">Reportes Activos</p>
            </app-card-content>
          </app-card>

          <app-card class="text-center">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-green-600 mb-2">0</div>
              <p class="text-sm text-gray-600">Zonas Seguras</p>
            </app-card-content>
          </app-card>

          <app-card class="text-center">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-orange-600 mb-2">0</div>
              <p class="text-sm text-gray-600">Alertas Hoy</p>
            </app-card-content>
          </app-card>

          <app-card class="text-center">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <p class="text-sm text-gray-600">Monitoreo Activo</p>
            </app-card-content>
          </app-card>
        </div>

        <!-- System Status -->
        <app-alert class="mb-8 border-green-200 bg-green-50">
          <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <app-alert-description class="text-green-800">
            <strong>Sistema Operativo:</strong> Todos los servicios funcionan normalmente. Los reportes se procesan en tiempo real.
          </app-alert-description>
        </app-alert>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <!-- Quick Report Section -->
          <app-card class="border-2 border-primary/20">
            <app-card-header>
              <app-card-title class="flex items-center gap-3 text-primary">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Reportar Incidente
              </app-card-title>
              <app-card-description>
                Informa inmediatamente cualquier situación sospechosa o incidente de seguridad
              </app-card-description>
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <p class="text-gray-700">
                  Si presencias o eres víctima de un robo, situación sospechosa o incidente de seguridad, 
                  reporta inmediatamente para alertar a la comunidad universitaria.
                </p>
                
                <div class="flex flex-wrap gap-2 mb-4">
                  <app-badge variant="outline" class="text-primary border-primary/30">
                    🚨 Tiempo Real
                  </app-badge>
                  <app-badge variant="outline" class="text-primary border-primary/30">
                    🔒 100% Anónimo
                  </app-badge>
                  <app-badge variant="outline" class="text-primary border-primary/30">
                    📍 Geolocalización
                  </app-badge>
                </div>

                <app-button 
                  class="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg"
                  (click)="onOpenReport.emit()">
                  <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  REPORTAR AHORA
                </app-button>
              </div>
            </app-card-content>
          </app-card>

          <!-- Zone Status -->
          <app-card>
            <app-card-header>
              <app-card-title class="flex items-center gap-3">
                <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Estado de Zonas Universitarias
              </app-card-title>
              <app-card-description>
                Monitoreo en tiempo real de la seguridad en diferentes áreas del campus
              </app-card-description>
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <!-- Sistema limpio - mostrar mensaje informativo -->
                <div class="text-center py-8 text-gray-500">
                  <svg class="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-lg font-medium mb-2">Sistema Limpio</p>
                  <p class="text-sm">No hay reportes activos. Todas las zonas están seguras.</p>
                </div>

                <app-button 
                  variant="outline" 
                  class="w-full"
                  (click)="onPageChange.emit('zonas')">
                  <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver Todas las Zonas
                </app-button>
              </div>
            </app-card-content>
          </app-card>
        </div>

        <!-- How it Works -->
        <app-card class="mb-12">
          <app-card-header>
            <app-card-title class="text-center text-2xl">¿Cómo Funciona el Sistema?</app-card-title>
            <app-card-description class="text-center">
              Proceso simple y rápido para mantener segura nuestra comunidad universitaria
            </app-card-description>
          </app-card-header>
          <app-card-content>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <!-- Step 1 -->
              <div class="text-center">
                <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 class="text-lg font-semibold mb-2">Reporta</h3>
                <p class="text-gray-600">
                  Informa cualquier incidente sospechoso o robo de manera rápida y anónima
                </p>
              </div>

              <!-- Step 2 -->
              <div class="text-center">
                <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 class="text-lg font-semibold mb-2">Alertamos</h3>
                <p class="text-gray-600">
                  El sistema notifica inmediatamente a toda la comunidad universitaria
                </p>
              </div>

              <!-- Step 3 -->
              <div class="text-center">
                <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 class="text-lg font-semibold mb-2">Protegemos</h3>
                <p class="text-gray-600">
                  Todos permanecen informados y pueden tomar precauciones necesarias
                </p>
              </div>
            </div>
          </app-card-content>
        </app-card>

        <!-- Emergency Contact -->
        <app-card class="bg-red-50 border-red-200">
          <app-card-header>
            <app-card-title class="flex items-center gap-3 text-red-700">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Contactos de Emergencia
            </app-card-title>
            <app-card-description class="text-red-600">
              En caso de emergencia inmediata, contacta directamente a las autoridades
            </app-card-description>
          </app-card-header>
          <app-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-4 bg-white rounded-lg border border-red-200">
                <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-red-700">Policía Nacional</p>
                  <p class="text-2xl font-bold text-red-800">123</p>
                </div>
              </div>

              <div class="flex items-center gap-3 p-4 bg-white rounded-lg border border-red-200">
                <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0v-5a2 2 0 00-2-2h-2a2 2 0 00-2 2v5m0 0H9m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5" />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-red-700">Seguridad Universidad</p>
                  <p class="text-2xl font-bold text-red-800">911</p>
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
export class HomePageComponent {
  @Output() openReport = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<string>();
}