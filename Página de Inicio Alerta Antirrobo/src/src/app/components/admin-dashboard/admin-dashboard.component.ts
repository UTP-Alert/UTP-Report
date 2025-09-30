import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../ui/button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../ui/card/card.component';
import { BadgeComponent } from '../ui/badge/badge.component';
import { AlertComponent, AlertDescriptionComponent } from '../ui/alert/alert.component';
import { SOSButtonComponent } from '../sos-button/sos-button.component';

@Component({
  selector: 'app-admin-dashboard',
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
        <!-- Admin Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
              <p class="text-lg text-gray-600">Gestión completa del Sistema de Alertas Antirrobo</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">Admin García</p>
                <p class="text-sm text-gray-600">Administrador del Sistema</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <app-card class="text-center border-l-4 border-l-primary">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-primary mb-2">0</div>
              <p class="text-sm text-gray-600">Reportes Totales</p>
              <p class="text-xs text-gray-500 mt-1">Sistema limpio</p>
            </app-card-content>
          </app-card>

          <app-card class="text-center border-l-4 border-l-red-500">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-red-500 mb-2">0</div>
              <p class="text-sm text-gray-600">Alertas Activas</p>
              <p class="text-xs text-gray-500 mt-1">Sin incidentes</p>
            </app-card-content>
          </app-card>

          <app-card class="text-center border-l-4 border-l-green-500">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-green-500 mb-2">0</div>
              <p class="text-sm text-gray-600">Zonas Seguras</p>
              <p class="text-xs text-gray-500 mt-1">En monitoreo</p>
            </app-card-content>
          </app-card>

          <app-card class="text-center border-l-4 border-l-blue-500">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-blue-500 mb-2">0</div>
              <p class="text-sm text-gray-600">Usuarios Activos</p>
              <p class="text-xs text-gray-500 mt-1">Sistema nuevo</p>
            </app-card-content>
          </app-card>
        </div>

        <!-- System Status - Admin View -->
        <app-alert class="mb-8 border-green-200 bg-green-50">
          <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <app-alert-description class="text-green-800">
            <strong>Sistema Operativo:</strong> Todos los servicios funcionan correctamente. Base de datos limpia, listo para recibir reportes.
          </app-alert-description>
        </app-alert>

        <!-- Admin Action Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Quick Admin Report -->
          <app-card class="border-2 border-primary/20">
            <app-card-header>
              <app-card-title class="flex items-center gap-3 text-primary">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Crear Reporte Administrativo
              </app-card-title>
              <app-card-description>
                Los reportes de administrador tienen prioridad máxima y alertan inmediatamente
              </app-card-description>
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <div class="flex flex-wrap gap-2 mb-4">
                  <app-badge variant="default" class="bg-primary">
                    🛡️ Admin Priority
                  </app-badge>
                  <app-badge variant="outline" class="text-red-600 border-red-300">
                    🚨 Alerta Inmediata
                  </app-badge>
                  <app-badge variant="outline" class="text-green-600 border-green-300">
                    ✅ Auto-verificado
                  </app-badge>
                </div>

                <app-button 
                  class="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg"
                  (click)="onOpenReport.emit()">
                  <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  CREAR REPORTE ADMIN
                </app-button>
              </div>
            </app-card-content>
          </app-card>

          <!-- System Overview -->
          <app-card>
            <app-card-header>
              <app-card-title class="flex items-center gap-3">
                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Resumen del Sistema
              </app-card-title>
              <app-card-description>
                Estado general de la plataforma y métricas de seguridad
              </app-card-description>
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span class="text-sm font-medium">Base de Datos</span>
                  </div>
                  <app-badge variant="outline" class="text-green-700 border-green-300">Operativa</app-badge>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span class="text-sm font-medium">Notificaciones</span>
                  </div>
                  <app-badge variant="outline" class="text-green-700 border-green-300">Activas</app-badge>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span class="text-sm font-medium">Monitoreo 24/7</span>
                  </div>
                  <app-badge variant="outline" class="text-green-700 border-green-300">Funcionando</app-badge>
                </div>
              </div>
            </app-card-content>
          </app-card>
        </div>

        <!-- Admin Navigation Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Alertas Management -->
          <app-card class="hover:shadow-lg transition-shadow cursor-pointer border-orange-200" (click)="navigateToAlertas()">
            <app-card-header class="text-center">
              <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <app-card-title class="text-lg">Gestión de Alertas</app-card-title>
              <app-card-description class="text-sm">
                Administrar alertas activas y historial completo
              </app-card-description>
            </app-card-header>
          </app-card>

          <!-- Zones Management -->
          <app-card class="hover:shadow-lg transition-shadow cursor-pointer border-green-200" (click)="navigateToZonas()">
            <app-card-header class="text-center">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <app-card-title class="text-lg">Control de Zonas</app-card-title>
              <app-card-description class="text-sm">
                Monitorear y gestionar el estado de todas las zonas
              </app-card-description>
            </app-card-header>
          </app-card>

          <!-- Reports Management -->
          <app-card class="hover:shadow-lg transition-shadow cursor-pointer border-blue-200" (click)="navigateToReportes()">
            <app-card-header class="text-center">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <app-card-title class="text-lg">Reportes y Analytics</app-card-title>
              <app-card-description class="text-sm">
                Análisis detallado de incidentes y estadísticas
              </app-card-description>
            </app-card-header>
          </app-card>

          <!-- System Support -->
          <app-card class="hover:shadow-lg transition-shadow cursor-pointer border-purple-200" (click)="navigateToSoporte()">
            <app-card-header class="text-center">
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <app-card-title class="text-lg">Soporte Técnico</app-card-title>
              <app-card-description class="text-sm">
                Gestionar soporte y mantenimiento del sistema
              </app-card-description>
            </app-card-header>
          </app-card>
        </div>

        <!-- Admin Tools -->
        <app-card class="mt-8 bg-red-50 border-red-200">
          <app-card-header>
            <app-card-title class="text-red-700">Herramientas de Administración</app-card-title>
            <app-card-description class="text-red-600">
              Funciones avanzadas para gestión del sistema (usar con precaución)
            </app-card-description>
          </app-card-header>
          <app-card-content>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <app-button variant="outline" class="text-red-600 border-red-300 hover:bg-red-50">
                🗑️ Limpiar Datos del Sistema
              </app-button>
              <app-button variant="outline" class="text-orange-600 border-orange-300 hover:bg-orange-50">
                📊 Exportar Reportes
              </app-button>
              <app-button variant="outline" class="text-blue-600 border-blue-300 hover:bg-blue-50">
                ⚙️ Configuración Avanzada
              </app-button>
            </div>
          </app-card-content>
        </app-card>
      </div>

      <!-- SOS Button -->
      <app-sos-button></app-sos-button>
    </div>
  `
})
export class AdminDashboardComponent {
  @Output() openReport = new EventEmitter<void>();

  navigateToAlertas(): void {
    // Navigate to alerts page - this would be handled by the parent component
    alert('Navegando a Gestión de Alertas...');
  }

  navigateToZonas(): void {
    alert('Navegando a Control de Zonas...');
  }

  navigateToReportes(): void {
    alert('Navegando a Reportes y Analytics...');
  }

  navigateToSoporte(): void {
    alert('Navegando a Soporte Técnico...');
  }
}