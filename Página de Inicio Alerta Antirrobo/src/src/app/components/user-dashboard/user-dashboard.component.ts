import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../ui/button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../ui/card/card.component';
import { BadgeComponent } from '../ui/badge/badge.component';
import { AlertComponent, AlertDescriptionComponent } from '../ui/alert/alert.component';
import { SOSButtonComponent } from '../sos-button/sos-button.component';

@Component({
  selector: 'app-user-dashboard',
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
        <!-- Welcome Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido, Juan Pérez!</h1>
              <p class="text-lg text-gray-600">Dashboard de Usuario - Sistema de Alertas Antirrobo</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">Cuenta de Usuario</p>
                <p class="text-sm text-gray-600">Miembro verificado</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <app-card class="text-center">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-primary mb-2">0</div>
              <p class="text-sm text-gray-600">Mis Reportes</p>
            </app-card-content>
          </app-card>

          <app-card class="text-center">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-green-600 mb-2">0</div>
              <p class="text-sm text-gray-600">Alertas Seguidas</p>
            </app-card-content>
          </app-card>

          <app-card class="text-center">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-orange-600 mb-2">0</div>
              <p class="text-sm text-gray-600">Notificaciones</p>
            </app-card-content>
          </app-card>

          <app-card class="text-center">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <p class="text-sm text-gray-600">Privacidad</p>
            </app-card-content>
          </app-card>
        </div>

        <!-- System Status -->
        <app-alert class="mb-8 border-green-200 bg-green-50">
          <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <app-alert-description class="text-green-800">
            <strong>Sistema Limpio:</strong> No hay reportes activos en tu área de interés. Todas las zonas están seguras.
          </app-alert-description>
        </app-alert>

        <!-- Main Dashboard Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Quick Report -->
          <app-card class="border-2 border-primary/20">
            <app-card-header>
              <app-card-title class="flex items-center gap-3 text-primary">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Reportar Incidente
              </app-card-title>
              <app-card-description>
                Como usuario verificado, tus reportes tienen mayor credibilidad
              </app-card-description>
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <div class="flex flex-wrap gap-2 mb-4">
                  <app-badge variant="outline" class="text-primary border-primary/30">
                    ✅ Usuario Verificado
                  </app-badge>
                  <app-badge variant="outline" class="text-primary border-primary/30">
                    📊 Reporte Rastreado
                  </app-badge>
                  <app-badge variant="outline" class="text-primary border-primary/30">
                    🔔 Notificaciones Activas
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

          <!-- Personal Activity -->
          <app-card>
            <app-card-header>
              <app-card-title class="flex items-center gap-3">
                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Mi Actividad Reciente
              </app-card-title>
              <app-card-description>
                Historial de tus reportes y participación en el sistema
              </app-card-description>
            </app-card-header>
            <app-card-content>
              <div class="text-center py-8 text-gray-500">
                <svg class="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="text-lg font-medium mb-2">Sin Actividad Registrada</p>
                <p class="text-sm">Haz tu primer reporte para comenzar a contribuir a la seguridad</p>
              </div>
            </app-card-content>
          </app-card>
        </div>

        <!-- Navigation Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Zones -->
          <app-card class="hover:shadow-lg transition-shadow cursor-pointer" (click)="onPageChange.emit('zonas')">
            <app-card-header>
              <app-card-title class="flex items-center gap-3">
                <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Estado de Zonas
                <svg class="h-4 w-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </app-card-title>
              <app-card-description>
                Consulta el estado de seguridad en tiempo real de las diferentes zonas universitarias
              </app-card-description>
            </app-card-header>
          </app-card>

          <!-- Support -->
          <app-card class="hover:shadow-lg transition-shadow cursor-pointer" (click)="onPageChange.emit('soporte')">
            <app-card-header>
              <app-card-title class="flex items-center gap-3">
                <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
                Soporte y Ayuda
                <svg class="h-4 w-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </app-card-title>
              <app-card-description>
                Obtén ayuda técnica, reporta problemas del sistema o contacta con soporte
              </app-card-description>
            </app-card-header>
          </app-card>
        </div>

        <!-- User Benefits -->
        <app-card class="mt-8 bg-blue-50 border-blue-200">
          <app-card-header>
            <app-card-title class="text-blue-700">Beneficios de Usuario Verificado</app-card-title>
          </app-card-header>
          <app-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span class="text-blue-800">Reportes con mayor credibilidad</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z" />
                  </svg>
                </div>
                <span class="text-blue-800">Notificaciones personalizadas</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                </div>
                <span class="text-blue-800">Historial de actividad seguro</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>
                <span class="text-blue-800">Privacidad completamente protegida</span>
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
export class UserDashboardComponent {
  @Output() openReport = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<string>();
}