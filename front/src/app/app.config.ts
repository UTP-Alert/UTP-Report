// Importa ApplicationConfig para la configuración de la aplicación y funciones de Angular core.
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
// Importa provideRouter para configurar el enrutamiento de la aplicación.
import { provideRouter } from '@angular/router';
// Importa provideHttpClient y withInterceptors para configurar el cliente HTTP y los interceptores.
import { provideHttpClient, withInterceptors } from '@angular/common/http';
// Importa el interceptor de autenticación personalizado.
import { authInterceptor } from './interceptors/auth.interceptor';
// Importa provideAnimations para habilitar animaciones, requerido por NgxToastr.
import { provideAnimations } from '@angular/platform-browser/animations';
// Importa provideToastr para configurar el servicio de notificaciones NgxToastr.
import { provideToastr } from 'ngx-toastr';

// Importa las definiciones de rutas de la aplicación.
import { routes } from './app.routes';

// Configuración principal de la aplicación Angular.
export const appConfig: ApplicationConfig = {
  providers: [
    // Provee escuchadores globales de errores del navegador.
    provideBrowserGlobalErrorListeners(),
    // Provee detección de cambios de zona con coalescencia de eventos para optimizar el rendimiento.
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Provee el enrutador con las rutas definidas en `app.routes.ts`.
    provideRouter(routes),
    // Provee el cliente HTTP con el interceptor de autenticación.
    provideHttpClient(withInterceptors([authInterceptor])),
    // Habilita el módulo de animaciones.
    provideAnimations(),
    // Configura el servicio NgxToastr con opciones específicas.
    provideToastr({
      timeOut: 3000, // Duración de la notificación en milisegundos.
      positionClass: 'toast-bottom-right', // Posición de las notificaciones en la pantalla.
      preventDuplicates: true, // Evita mostrar notificaciones duplicadas.
    })
  ]
};
