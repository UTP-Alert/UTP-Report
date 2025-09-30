import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../ui/button/button.component';
import { UserRole } from '../../types/app.types';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <nav class="w-full bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <!-- Logo y Título -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">ALERTA ANTIRROBO</h1>
              <p class="text-sm text-gray-600">Sistema Universitario de Seguridad</p>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="hidden md:flex items-center space-x-1">
          <app-button
            *ngFor="let item of getNavigationItems()"
            [variant]="currentPage === item.id ? 'default' : 'ghost'"
            (click)="onPageChange.emit(item.id)"
            class="flex items-center gap-2 px-4 py-2">
            <ng-container [innerHTML]="item.icon"></ng-container>
            {{ item.label }}
          </app-button>
        </div>

        <!-- User Info / Login -->
        <div class="flex items-center gap-4">
          <!-- Reportar Ahora Button -->
          <app-button
            variant="destructive"
            (click)="onOpenReport.emit()"
            class="bg-primary hover:bg-primary/90 text-white px-6 py-2 font-medium shadow-lg hover:shadow-xl transition-all">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            REPORTAR AHORA
          </app-button>

          <!-- User Profile / Login -->
          <div class="flex items-center gap-3">
            <ng-container [ngSwitch]="userRole">
              <!-- Public User -->
              <app-button
                *ngSwitchCase="'public'"
                variant="outline"
                (click)="onPageChange.emit('login')"
                class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                INICIAR SESIÓN
              </app-button>

              <!-- Logged in User -->
              <div *ngSwitchCase="'user'" class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Juan Pérez</p>
                  <p class="text-xs text-gray-600">Usuario</p>
                </div>
              </div>

              <!-- Admin User -->
              <div *ngSwitchCase="'admin'" class="flex items-center gap-3">
                <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Admin García</p>
                  <p class="text-xs text-gray-600">Administrador</p>
                </div>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <app-button
            variant="ghost"
            size="icon"
            (click)="toggleMobileMenu()">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </app-button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div *ngIf="isMobileMenuOpen" class="md:hidden mt-4 border-t pt-4">
        <div class="space-y-2">
          <app-button
            *ngFor="let item of getNavigationItems()"
            [variant]="currentPage === item.id ? 'default' : 'ghost'"
            (click)="onMobileItemClick(item.id)"
            class="w-full justify-start flex items-center gap-2">
            <ng-container [innerHTML]="item.icon"></ng-container>
            {{ item.label }}
          </app-button>
        </div>
      </div>
    </nav>
  `
})
export class NavigationComponent {
  @Input() currentPage = 'inicio';
  @Input() userRole: UserRole = 'public';
  @Output() pageChange = new EventEmitter<string>();
  @Output() openReport = new EventEmitter<void>();

  isMobileMenuOpen = false;

  getNavigationItems() {
    const baseItems = [
      {
        id: 'inicio',
        label: 'INICIO',
        icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>'
      }
    ];

    if (this.userRole === 'admin') {
      return [
        ...baseItems,
        {
          id: 'alertas',
          label: 'ALERTAS',
          icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>'
        },
        {
          id: 'zonas',
          label: 'ESTADO DE ZONAS',
          icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
        },
        {
          id: 'reportes',
          label: 'REPORTES',
          icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
        },
        {
          id: 'soporte',
          label: 'SOPORTE',
          icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" /></svg>'
        }
      ];
    }

    return [
      ...baseItems,
      {
        id: 'zonas',
        label: 'ESTADO DE ZONAS',
        icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
      },
      {
        id: 'soporte',
        label: 'SOPORTE',
        icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" /></svg>'
      }
    ];
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onMobileItemClick(pageId: string): void {
    this.pageChange.emit(pageId);
    this.isMobileMenuOpen = false;
  }
}