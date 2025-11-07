import { Component, inject, computed, signal, effect, HostBinding } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { NavbarComponent } from './shared/navbar/navbar';
import { AuthService } from './services/auth.service';
import { DarkModeService } from './services/dark-mode'; // Import DarkModeService
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'front';

  private auth = inject(AuthService);
  private router = inject(Router);
  private darkModeService = inject(DarkModeService); // Inject DarkModeService

  currentUrl = signal<string>('');

  constructor() {
    // Sincronizar la URL actual para reactividad
    this.currentUrl.set(this.router.url || '');
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentUrl.set(e.urlAfterRedirects || e.url || '');
    });

    // Conditionally apply dark mode class to body for "Usuario" routes
    effect(() => {
      const isUsuarioRoute = this.currentUrl().startsWith('/Usuario');
      if (isUsuarioRoute && this.darkModeService.darkMode()) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    });

    // Ensure auth state is loaded early
    this.auth.loadFromStorage();
  }

  isLoginRoute(): boolean {
    const r = this.currentUrl();
    return r.startsWith('/login') || r.startsWith('/select-role');
  }

  showAppNavbar = computed(() => {
    if (this.isLoginRoute()) {
      return false;
    }
    return this.auth.isAuthenticated();
  });
}
