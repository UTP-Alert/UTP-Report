import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './components/navigation/navigation.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ZonasPageComponent } from './components/pages/zonas-page/zonas-page.component';
import { SoportePageComponent } from './components/pages/soporte-page/soporte-page.component';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { ReportModalComponent } from './components/report-modal/report-modal.component';
import { ButtonComponent } from './components/ui/button/button.component';
import { CardComponent, CardContentComponent } from './components/ui/card/card.component';
import { BadgeComponent } from './components/ui/badge/badge.component';
import { UserRole } from './types/app.types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavigationComponent,
    HomePageComponent,
    UserDashboardComponent,
    AdminDashboardComponent,
    ZonasPageComponent,
    SoportePageComponent,
    LoginPageComponent,
    ReportModalComponent,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    BadgeComponent
  ],
  template: `
    <div class="size-full">
      <app-navigation 
        [currentPage]="currentPage()" 
        [userRole]="userRole()"
        (pageChange)="setCurrentPage($event)"
        (openReport)="openReportModal()">
      </app-navigation>
      
      <ng-container [ngSwitch]="getCurrentPageComponent()">
        <!-- Admin Dashboard -->
        <app-admin-dashboard 
          *ngSwitchCase="'admin-dashboard'"
          (openReport)="openReportModal()">
        </app-admin-dashboard>
        
        <!-- User Dashboard -->
        <app-user-dashboard 
          *ngSwitchCase="'user-dashboard'"
          (openReport)="openReportModal()"
          (pageChange)="setCurrentPage($event)">
        </app-user-dashboard>
        
        <!-- Home Page -->
        <app-home-page 
          *ngSwitchCase="'home-page'"
          (openReport)="openReportModal()"
          (pageChange)="setCurrentPage($event)">
        </app-home-page>
        
        <!-- Zonas Page -->
        <app-zonas-page 
          *ngSwitchCase="'zonas'"
          (openReport)="openReportModal()">
        </app-zonas-page>
        
        <!-- Soporte Page -->
        <app-soporte-page 
          *ngSwitchCase="'soporte'"
          (openReport)="openReportModal()">
        </app-soporte-page>
        
        <!-- Login Page -->
        <app-login-page 
          *ngSwitchCase="'login'"
          [currentUserRole]="userRole()"
          (roleSelect)="handleRoleChange($event)">
        </app-login-page>
      </ng-container>
      
      <app-report-modal 
        [isOpen]="isReportModalOpen()" 
        (close)="closeReportModal()">
      </app-report-modal>
      
      <!-- Beta Role Switcher -->
      <app-card class="fixed bottom-4 left-4 z-50 shadow-lg">
        <div class="p-4">
          <div class="flex flex-col gap-2">
            <app-badge variant="outline" class="text-xs mb-2">BETA - Cambio Rápido</app-badge>
            <div class="flex flex-col gap-2">
              <app-button
                size="sm"
                [variant]="userRole() === 'public' ? 'default' : 'outline'"
                (click)="handleRoleChange('public')"
                class="flex items-center gap-2 text-xs">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Público
              </app-button>
              <app-button
                size="sm"
                [variant]="userRole() === 'user' ? 'default' : 'outline'"
                (click)="handleRoleChange('user')"
                class="flex items-center gap-2 text-xs">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Usuario
              </app-button>
              <app-button
                size="sm"
                [variant]="userRole() === 'admin' ? 'default' : 'outline'"
                (click)="handleRoleChange('admin')"
                class="flex items-center gap-2 text-xs">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin
              </app-button>
            </div>
          </div>
        </div>
      </app-card>
    </div>
  `
})
export class AppComponent {
  currentPage = signal('inicio');
  userRole = signal<UserRole>('public');
  isReportModalOpen = signal(false);

  openReportModal(): void {
    this.isReportModalOpen.set(true);
  }

  closeReportModal(): void {
    this.isReportModalOpen.set(false);
  }

  handleRoleChange(newRole: UserRole): void {
    this.userRole.set(newRole);
    this.currentPage.set('inicio'); // Reset to inicio when changing roles
  }

  setCurrentPage(page: string): void {
    this.currentPage.set(page);
  }

  getCurrentPageComponent(): string {
    const role = this.userRole();
    const page = this.currentPage();

    // For admin role, show admin dashboard
    if (role === 'admin') {
      switch (page) {
        case 'inicio':
          return 'admin-dashboard';
        case 'zonas':
          return 'zonas';
        case 'soporte':
          return 'soporte';
        case 'login':
          return 'login';
        default:
          return 'admin-dashboard';
      }
    }

    // For user role, show user dashboard
    if (role === 'user') {
      switch (page) {
        case 'inicio':
          return 'user-dashboard';
        case 'zonas':
          return 'zonas';
        case 'soporte':
          return 'soporte';
        case 'login':
          return 'login';
        default:
          return 'user-dashboard';
      }
    }

    // For public role, show simplified pages
    switch (page) {
      case 'inicio':
        return 'home-page';
      case 'zonas':
        return 'zonas';
      case 'soporte':
        return 'soporte';
      case 'login':
        return 'login';
      default:
        return 'home-page';
    }
  }
}