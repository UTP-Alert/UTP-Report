import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../ui/card/card.component';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { AlertComponent, AlertDescriptionComponent } from '../../ui/alert/alert.component';
import { SOSButtonComponent } from '../../sos-button/sos-button.component';

@Component({
  selector: 'app-zonas-page',
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
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center gap-4 mb-4">
            <div class="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 class="text-4xl font-bold text-gray-900 mb-2">ESTADO DE ZONAS UNIVERSITARIAS</h1>
              <p class="text-xl text-gray-600">Monitoreo en tiempo real de la seguridad en el campus</p>
            </div>
          </div>
        </div>

        <!-- Overall Status -->
        <app-alert class="mb-8 border-green-200 bg-green-50">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <app-alert-description class="text-lg text-green-800">
            <strong>Estado General: SEGURO</strong> - Todas las zonas universitarias están en condiciones normales. 
            No hay reportes activos de incidentes de seguridad.
          </app-alert-description>
        </app-alert>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <app-card class="text-center border-l-4 border-l-green-500">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-green-600 mb-2">0</div>
              <p class="text-sm text-gray-600">Zonas Seguras</p>
              <p class="text-xs text-green-600 mt-1">Sistema limpio</p>
            </app-card-content>
          </app-card>

          <app-card class="text-center border-l-4 border-l-yellow-500">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-yellow-600 mb-2">0</div>
              <p class="text-sm text-gray-600">Zonas en Alerta</p>
              <p class="text-xs text-gray-500 mt-1">Sin alertas</p>
            </app-card-content>
          </app-card>

          <app-card class="text-center border-l-4 border-l-red-500">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-red-500 mb-2">0</div>
              <p class="text-sm text-gray-600">Zonas Peligrosas</p>
              <p class="text-xs text-gray-500 mt-1">Sin incidentes</p>
            </app-card-content>
          </app-card>

          <app-card class="text-center border-l-4 border-l-blue-500">
            <app-card-content class="p-6">
              <div class="text-3xl font-bold text-blue-600 mb-2">12</div>
              <p class="text-sm text-gray-600">Zonas Monitoreadas</p>
              <p class="text-xs text-blue-600 mt-1">24/7 activo</p>
            </app-card-content>
          </app-card>
        </div>

        <!-- Zone Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <app-card *ngFor="let zone of universityZones" class="hover:shadow-lg transition-shadow">
            <app-card-header>
              <div class="flex items-center justify-between">
                <app-card-title class="flex items-center gap-3">
                  <ng-container [innerHTML]="zone.icon"></ng-container>
                  {{ zone.name }}
                </app-card-title>
                <app-badge [variant]="zone.status === 'safe' ? 'default' : zone.status === 'warning' ? 'secondary' : 'destructive'" 
                          [class]="getStatusColor(zone.status)">
                  {{ getStatusText(zone.status) }}
                </app-badge>
              </div>
              <app-card-description>
                {{ zone.description }}
              </app-card-description>
            </app-card-header>
            <app-card-content>
              <div class="space-y-3">
                <!-- Status Info -->
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Último reporte:</span>
                  <span class="text-gray-500">{{ zone.lastReport }}</span>
                </div>
                
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Incidentes (30 días):</span>
                  <span [class]="zone.incidentCount === 0 ? 'text-green-600' : 'text-orange-600'">
                    {{ zone.incidentCount }}
                  </span>
                </div>

                <!-- Zone Actions -->
                <div class="flex gap-2 pt-3 border-t">
                  <app-button 
                    variant="outline" 
                    size="sm" 
                    class="flex-1"
                    (click)="viewZoneDetails(zone)">
                    <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver
                  </app-button>
                  <app-button 
                    variant="outline" 
                    size="sm" 
                    class="flex-1 text-primary border-primary hover:bg-primary/10"
                    (click)="reportInZone(zone)">
                    <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reportar
                  </app-button>
                </div>
              </div>
            </app-card-content>
          </app-card>
        </div>

        <!-- Sistema Limpio Message -->
        <app-card class="mb-8 bg-green-50 border-green-200">
          <app-card-header class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <app-card-title class="text-green-700 text-2xl">¡Sistema Completamente Limpio!</app-card-title>
            <app-card-description class="text-green-600 text-lg">
              No hay reportes activos en ninguna zona universitaria. Todas las áreas están seguras para el tránsito estudiantil.
            </app-card-description>
          </app-card-header>
          <app-card-content class="text-center">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="flex items-center justify-center gap-2 text-green-700">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Monitoreo 24/7 Activo</span>
              </div>
              <div class="flex items-center justify-center gap-2 text-green-700">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                <span>Sistema de Alertas Listo</span>
              </div>
              <div class="flex items-center justify-center gap-2 text-green-700">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Comunidad Protegida</span>
              </div>
            </div>
          </app-card-content>
        </app-card>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <app-card class="border-primary/20">
            <app-card-header>
              <app-card-title class="flex items-center gap-3 text-primary">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ¿Viste algo sospechoso?
              </app-card-title>
              <app-card-description>
                Reporta inmediatamente cualquier situación que comprometa la seguridad
              </app-card-description>
            </app-card-header>
            <app-card-content>
              <app-button 
                class="w-full bg-primary hover:bg-primary/90 text-white h-12"
                (click)="onOpenReport.emit()">
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                REPORTAR INCIDENTE
              </app-button>
            </app-card-content>
          </app-card>

          <app-card>
            <app-card-header>
              <app-card-title class="flex items-center gap-3">
                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recomendaciones de Seguridad
              </app-card-title>
              <app-card-description>
                Consejos para mantenerte seguro en el campus universitario
              </app-card-description>
            </app-card-header>
            <app-card-content>
              <div class="space-y-2 text-sm text-gray-700">
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 mt-0.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Mantén tus pertenencias siempre contigo</span>
                </div>
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 mt-0.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Evita caminar solo en horas nocturnas</span>
                </div>
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 mt-0.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Reporta comportamientos sospechosos</span>
                </div>
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 mt-0.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Mantén contacto con amigos y familiares</span>
                </div>
              </div>
            </app-card-content>
          </app-card>
        </div>
      </div>

      <!-- SOS Button -->
      <app-sos-button></app-sos-button>
    </div>
  `
})
export class ZonasPageComponent {
  @Output() openReport = new EventEmitter<void>();

  universityZones = [
    {
      id: 'entrada-principal',
      name: 'Entrada Principal',
      description: 'Acceso principal del campus universitario',
      status: 'safe' as const,
      incidentCount: 0,
      lastReport: 'Sin reportes',
      icon: '<svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
    },
    {
      id: 'biblioteca',
      name: 'Biblioteca Central',
      description: 'Área de estudio y consulta bibliográfica',
      status: 'safe' as const,
      incidentCount: 0,
      lastReport: 'Sin reportes',
      icon: '<svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>'
    },
    {
      id: 'cafeteria',
      name: 'Cafetería',
      description: 'Zona de comidas y descanso estudiantil',
      status: 'safe' as const,
      incidentCount: 0,
      lastReport: 'Sin reportes',
      icon: '<svg class="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" /></svg>'
    },
    {
      id: 'estacionamiento-norte',
      name: 'Estacionamiento Norte',
      description: 'Área de parqueo vehicular sector norte',
      status: 'safe' as const,
      incidentCount: 0,
      lastReport: 'Sin reportes',
      icon: '<svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>'
    },
    {
      id: 'estacionamiento-sur',
      name: 'Estacionamiento Sur',
      description: 'Área de parqueo vehicular sector sur',
      status: 'safe' as const,
      incidentCount: 0,
      lastReport: 'Sin reportes',
      icon: '<svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>'
    },
    {
      id: 'laboratorios',
      name: 'Laboratorios',
      description: 'Área de laboratorios y equipos especializados',
      status: 'safe' as const,
      incidentCount: 0,
      lastReport: 'Sin reportes',
      icon: '<svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>'
    },
    {
      id: 'aulas-a',
      name: 'Aulas Bloque A',
      description: 'Edificio de aulas sector A',
      status: 'safe' as const,
      incidentCount: 0,
      lastReport: 'Sin reportes',
      icon: '<svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>'
    },
    {
      id: 'aulas-b',
      name: 'Aulas Bloque B',
      description: 'Edificio de aulas sector B',
      status: 'safe' as const,
      incidentCount: 0,
      lastReport: 'Sin reportes',
      icon: '<svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>'
    },
    {
      id: 'zona-deportiva',
      name: 'Zona Deportiva',
      description: 'Instalaciones deportivas y recreativas',
      status: 'safe' as const,
      incidentCount: 0,
      lastReport: 'Sin reportes',
      icon: '<svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>'
    },
    {
      id: 'jardines',
      name: 'Jardines',
      description: 'Áreas verdes y espacios de descanso',
      status: 'safe' as const,
      incidentCount: 0,
      lastReport: 'Sin reportes',
      icon: '<svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>'
    },
    {
      id: 'auditorio',
      name: 'Auditorio',
      description: 'Salón de eventos y conferencias principales',
      status: 'safe' as const,
      incidentCount: 0,
      lastReport: 'Sin reportes',
      icon: '<svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10M7 4l1 16h8l1-16M7 4H5a2 2 0 00-2 2v2c0 1.1.9 2 2 2h2M17 4h2a2 2 0 012 2v2c0 1.1-.9 2-2 2h-2" /></svg>'
    },
    {
      id: 'otras-zonas',
      name: 'Otras Zonas',
      description: 'Áreas adicionales del campus universitario',
      status: 'safe' as const,
      incidentCount: 0,
      lastReport: 'Sin reportes',
      icon: '<svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>'
    }
  ];

  getStatusColor(status: string): string {
    switch (status) {
      case 'safe':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'safe':
        return 'SEGURO';
      case 'warning':
        return 'ALERTA';
      case 'danger':
        return 'PELIGRO';
      default:
        return 'DESCONOCIDO';
    }
  }

  viewZoneDetails(zone: any): void {
    alert(`Detalles de ${zone.name}:\n\nEstado: ${this.getStatusText(zone.status)}\nIncidentes: ${zone.incidentCount}\nÚltimo reporte: ${zone.lastReport}\n\n${zone.description}`);
  }

  reportInZone(zone: any): void {
    // This would typically pre-fill the report modal with the zone
    alert(`Preparando reporte para: ${zone.name}`);
    this.onOpenReport.emit();
  }
}