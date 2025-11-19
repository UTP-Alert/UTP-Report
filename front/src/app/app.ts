import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { NavbarComponent } from './shared/navbar/navbar';
import { LoaderComponent } from './shared/loader/loader';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ScrollLockService } from './services/scroll-lock.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, LoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'front';
  constructor(private router: Router, private scrollLock: ScrollLockService){
    // Failsafe: liberar scroll en cambios de ruta por si quedó bloqueado
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.scrollLock.reset();
      });
  }

  @HostListener('window:resize')
  onResize(){
    // En algunos navegadores, cambios de viewport pueden dejar overflow trabado
    if (document.body.style.overflow === 'hidden') {
      this.scrollLock.reset();
    }
  }
}
