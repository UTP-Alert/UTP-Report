import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../ui/card/card.component';
import { InputComponent } from '../../ui/input/input.component';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { AlertComponent, AlertDescriptionComponent } from '../../ui/alert/alert.component';
import { SOSButtonComponent } from '../../sos-button/sos-button.component';
import { UserRole } from '../../../types/app.types';

interface LoginForm {
  username: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    InputComponent,
    BadgeComponent,
    AlertComponent,
    AlertDescriptionComponent,
    SOSButtonComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center gap-4 mb-4">
            <svg class="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <h1 class="text-3xl">ACCESO AL SISTEMA</h1>
              <p class="text-lg text-gray-600">
                Iniciar sesión para funciones avanzadas
              </p>
            </div>
          </div>
        </div>

        <!-- Important Notice -->
        <app-alert class="mb-8 border-blue-200 bg-blue-50">
          <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <app-alert-description class="text-lg text-blue-800">
            <strong>Nota Importante:</strong> El sistema funciona completamente de forma anónima. 
            El login es opcional y solo proporciona funciones adicionales de personalización.
          </app-alert-description>
        </app-alert>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Left Column - Login Form -->
          <div>
            <!-- Role Selector Modal -->
            <app-card *ngIf="showRoleSelector()" class="border-2 border-primary mb-6 bg-primary/5">
              <app-card-header>
                <app-card-title class="text-2xl text-center flex items-center justify-center gap-3">
                  <svg class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Seleccionar Rol de Acceso
                </app-card-title>
                <app-card-description class="text-center text-base">
                  Como administrador, elige el tipo de acceso que deseas utilizar
                </app-card-description>
              </app-card-header>
              
              <app-card-content>
                <div class="space-y-4">
                  <app-alert class="border-blue-200 bg-blue-50">
                    <svg class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <app-alert-description class="text-blue-800">
                      <strong>¡Credenciales de administrador verificadas!</strong> Selecciona el tipo de acceso que necesitas.
                    </app-alert-description>
                  </app-alert>

                  <app-button
                    (click)="handleRoleSelection('user')"
                    class="w-full h-16 flex items-center justify-start gap-4 bg-blue-500 hover:bg-blue-600 text-white transition-all hover:scale-105">
                    <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="text-left">
                      <div class="text-lg font-medium">👤 Acceso como Usuario</div>
                      <div class="text-sm opacity-90">Dashboard personal con estadísticas y reportes</div>
                    </div>
                  </app-button>
                  
                  <app-button
                    (click)="handleRoleSelection('admin')"
                    class="w-full h-16 flex items-center justify-start gap-4 bg-primary hover:bg-primary/90 text-white transition-all hover:scale-105">
                    <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div class="text-left">
                      <div class="text-lg font-medium">🛡️ Acceso como Administrador</div>
                      <div class="text-sm opacity-90">Panel completo con gestión de alertas y sistema</div>
                    </div>
                  </app-button>
                  
                  <app-button
                    (click)="setShowRoleSelector(false)"
                    variant="outline"
                    class="w-full mt-6">
                    ← Volver al Login
                  </app-button>
                </div>
              </app-card-content>
            </app-card>

            <app-card class="border-2">
              <app-card-header>
                <app-card-title class="text-2xl text-center flex items-center justify-center gap-3">
                  <svg class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Iniciar Sesión
                </app-card-title>
                <app-card-description class="text-center text-base">
                  Accede a tu cuenta con usuario y contraseña
                </app-card-description>
              </app-card-header>
              
              <app-card-content>
                <!-- Admin credentials hint -->
                <app-alert class="mb-4 border-orange-200 bg-orange-50">
                  <svg class="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <app-alert-description class="text-orange-800 text-sm">
                    <strong>Para testing:</strong> Usa "admin" / "admin123" para acceso de administrador con selector de roles.
                  </app-alert-description>
                </app-alert>

                <form (ngSubmit)="handleLogin()" class="space-y-4">
                  <div>
                    <label for="username" class="block text-sm mb-2">
                      Usuario
                    </label>
                    <div class="relative">
                      <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <app-input
                        id="username"
                        type="text"
                        [(ngModel)]="loginForm().username"
                        placeholder="Ingresa tu usuario"
                        class="pl-10 h-12"
                        [required]="true"
                        ariaLabel="Ingresa tu nombre de usuario">
                      </app-input>
                    </div>
                  </div>

                  <div>
                    <label for="password" class="block text-sm mb-2">
                      Contraseña
                    </label>
                    <div class="relative">
                      <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <app-input
                        id="password"
                        [type]="showPassword() ? 'text' : 'password'"
                        [(ngModel)]="loginForm().password"
                        placeholder="Ingresa tu contraseña"
                        class="pl-10 pr-10 h-12"
                        [required]="true"
                        ariaLabel="Ingresa tu contraseña">
                      </app-input>
                      <app-button
                        type="button"
                        variant="ghost"
                        size="sm"
                        (click)="toggleShowPassword()"
                        class="absolute right-1 top-1/2 transform -translate-y-1/2 p-2"
                        [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                        <svg *ngIf="showPassword()" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.12 3.12M12 12L3 3m9 9l6.878 6.878" />
                        </svg>
                        <svg *ngIf="!showPassword()" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </app-button>
                    </div>
                  </div>

                  <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        [(ngModel)]="loginForm().rememberMe"
                        class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        aria-label="Recordar mi sesión" />
                      <span class="text-sm">Recordarme</span>
                    </label>
                    <app-button 
                      type="button"
                      variant="link" 
                      size="sm" 
                      class="text-primary"
                      aria-label="Recuperar contraseña olvidada">
                      ¿Olvidaste tu contraseña?
                    </app-button>
                  </div>

                  <app-button 
                    type="submit" 
                    class="w-full h-12 bg-primary hover:bg-primary/90"
                    aria-label="Iniciar sesión en el sistema">
                    <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Iniciar Sesión
                  </app-button>
                </form>

                <!-- Alternative Access -->
                <div class="mt-6 pt-6 border-t">
                  <app-button 
                    type="button"
                    variant="outline" 
                    class="w-full h-12"
                    (click)="continueAnonymous()"
                    aria-label="Continuar usando el sistema de forma anónima">
                    <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Continuar como Usuario Anónimo
                  </app-button>
                </div>
              </app-card-content>
            </app-card>
          </div>

          <!-- Right Column - Benefits -->
          <div class="space-y-6">
            <!-- Benefits -->
            <app-card>
              <app-card-header>
                <app-card-title class="flex items-center gap-3">
                  <svg class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Beneficios de Tener Cuenta
                </app-card-title>
                <app-card-description>
                  Funciones adicionales para usuarios registrados
                </app-card-description>
              </app-card-header>
              <app-card-content>
                <div class="space-y-4">
                  <div *ngFor="let benefit of benefits" class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div class="bg-primary/10 p-2 rounded-lg">
                      <ng-container [innerHTML]="benefit.icon"></ng-container>
                    </div>
                    <div>
                      <h4 class="font-medium mb-1">{{ benefit.title }}</h4>
                      <p class="text-sm text-gray-600">{{ benefit.description }}</p>
                    </div>
                  </div>
                </div>
              </app-card-content>
            </app-card>

            <!-- Privacy Info -->
            <app-card class="bg-green-50 border-green-200">
              <app-card-header>
                <app-card-title class="flex items-center gap-3 text-green-700">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Tu Privacidad es Prioritaria
                </app-card-title>
              </app-card-header>
              <app-card-content>
                <div class="space-y-3 text-green-700">
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Nunca compartimos tu información personal</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Los reportes siguen siendo anónimos</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Puedes eliminar tu cuenta en cualquier momento</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Encriptación de extremo a extremo</span>
                  </div>
                </div>
              </app-card-content>
            </app-card>

            <!-- System Access -->
            <app-card class="bg-blue-50 border-blue-200">
              <app-card-header>
                <app-card-title class="text-blue-700">¿Prefieres Mantenerte Anónimo?</app-card-title>
              </app-card-header>
              <app-card-content>
                <p class="text-blue-700 mb-4">
                  El sistema funciona perfectamente sin cuenta. Todas las funciones principales 
                  están disponibles de forma anónima para proteger tu privacidad.
                </p>
                <div class="flex flex-wrap gap-2">
                  <app-badge variant="outline" class="text-blue-700 border-blue-300">
                    🔒 100% Anónimo
                  </app-badge>
                  <app-badge variant="outline" class="text-blue-700 border-blue-300">
                    ⚡ Acceso Inmediato
                  </app-badge>
                  <app-badge variant="outline" class="text-blue-700 border-blue-300">
                    🛡️ Máxima Privacidad
                  </app-badge>
                </div>
              </app-card-content>
            </app-card>
          </div>
        </div>
      </div>
      
      <!-- Botón SOS -->
      <app-sos-button></app-sos-button>
    </div>
  `
})
export class LoginPageComponent {
  @Input() currentUserRole?: UserRole;
  @Output() roleSelect = new EventEmitter<UserRole>();

  showPassword = signal(false);
  showRoleSelector = signal(false);
  selectedRole = signal<UserRole | null>(null);
  loginForm = signal<LoginForm>({
    username: '',
    password: '',
    rememberMe: false
  });

  benefits = [
    {
      icon: '<svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>',
      title: "Reportes Verificados",
      description: "Tus reportes tendrán mayor credibilidad en la comunidad"
    },
    {
      icon: '<svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>',
      title: "Perfil Personalizado",
      description: "Configura notificaciones y preferencias de zona"
    },
    {
      icon: '<svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
      title: "Historial Seguro",
      description: "Accede al historial de tus reportes y confirmaciones"
    },
    {
      icon: '<svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>',
      title: "Alertas Prioritarias",
      description: "Recibe notificaciones inmediatas de tu zona de interés"
    }
  ];

  toggleShowPassword(): void {
    this.showPassword.update(show => !show);
  }

  setShowRoleSelector(show: boolean): void {
    this.showRoleSelector.set(show);
  }

  handleLogin(): void {
    const form = this.loginForm();
    
    // Verificar si es admin con credenciales específicas
    if (form.username === 'admin' && form.password === 'admin123') {
      this.showRoleSelector.set(true);
      return;
    }
    
    // Para otros usuarios normales
    this.roleSelect.emit('user');
  }

  handleRoleSelection(role: UserRole): void {
    this.selectedRole.set(role);
    this.roleSelect.emit(role);
    this.showRoleSelector.set(false);
    
    // Reset form after successful role selection
    this.loginForm.set({ username: '', password: '', rememberMe: false });
    
    // Show confirmation message
    const roleText = role === 'admin' ? 'Administrador' : 'Usuario';
    setTimeout(() => {
      alert(`¡Acceso exitoso como ${roleText}!`);
    }, 100);
  }

  continueAnonymous(): void {
    alert('Continuando como usuario anónimo');
  }
}