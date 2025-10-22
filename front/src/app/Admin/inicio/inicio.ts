// Importa el decorador Component de Angular core para definir un componente.
import { Component } from '@angular/core';
// Importa el servicio de autenticación para manejar la lógica de inicio y cierre de sesión.
import { AuthService } from '../../services/auth.service';
// Importa el servicio de perfil para cargar y gestionar la información del perfil del usuario.
import { PerfilService } from '../../services/perfil.service';
// Importa RouterModule para habilitar las funcionalidades de enrutamiento en el componente.
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf, ngFor
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
// Import standalone tab components so they can be used inside the template
import { ReportesRecientes } from './reportes-recientes/reportes-recientes';
import { EnProceso } from './en-proceso/en-proceso';
import { PendAprobacion } from './pend-aprobacion/pend-aprobacion';
import { PendResueltos } from './pend-resueltos/pend-resueltos';
import { Cancelados } from './cancelados/cancelados';

// Decorador @Component que define los metadatos del componente.
@Component({
  selector: 'app-inicio-admin', // El selector CSS que se usa para instanciar este componente en una plantilla.
  standalone: true, // Indica que este es un componente independiente, no requiere un NgModule.
  imports: [RouterModule, CommonModule, ReportesRecientes, EnProceso, PendAprobacion, PendResueltos, Cancelados], // Módulos y componentes que este componente importa y utiliza.
  templateUrl: './inicio.html', // La ruta al archivo de plantilla HTML de este componente.
  styleUrl: './inicio.scss' // La ruta al archivo de estilos SCSS de este componente.
})
export class InicioAdmin {
  nombreAdmin: string = ''; // Propiedad para almacenar el nombre completo del administrador.
  mobileOpen: boolean = false; // Estado booleano para controlar la visibilidad del panel móvil del navbar.
  activeTab: string = 'recent'; // Propiedad para controlar la pestaña activa, por defecto 'recent'.

  // Constructor del componente, inyecta AuthService y PerfilService.
  constructor(public auth: AuthService, private perfil: PerfilService, private router: Router, private route: ActivatedRoute){
    this.perfil.cargarPerfil(); // Carga el perfil del usuario al inicializar el componente.
    // Establece un temporizador para obtener el nombre del administrador después de un breve retraso.
    setTimeout(()=>{
      const p = this.perfil.perfil(); // Obtiene el perfil del servicio.
      if(p) this.nombreAdmin = p.nombreCompleto; // Si el perfil existe, asigna el nombre completo.
    },300);
    // Sincroniza la pestaña inicial con la URL actual
    this.syncTabWithUrl();
    // Escucha cambios de navegación para mantener la pestaña sincronizada si la URL cambia
    this.router.events.subscribe(()=> this.syncTabWithUrl());
  }

  /**
   * Establece la pestaña activa.
   * @param tabName El nombre de la pestaña a activar.
   */
  setActiveTab(tabName: string) {
    this.activeTab = tabName;
    // Navegar a la ruta correspondiente para que la barra de direcciones refleje la pestaña
    const pathMap: Record<string,string> = {
      'recent': '/admin/recientes',
      'in-process': '/admin/en-proceso',
      'pending-approval': '/admin/pend-aprobacion',
      'resolved': '/admin/resueltos',
      'cancelled': '/admin/cancelados'
    };
    const target = pathMap[tabName] || '/admin';
    // Use replaceUrl to avoid stacking history if lo deseas, aquí usamos push
    this.router.navigateByUrl(target, { replaceUrl: false });
  }

  // Sincroniza this.activeTab con la ruta actual
  private syncTabWithUrl(){
    try{
      const url = this.router.url || '';
      if(url.includes('/admin/en-proceso')) this.activeTab = 'in-process';
      else if(url.includes('/admin/pend-aprobacion')) this.activeTab = 'pending-approval';
      else if(url.includes('/admin/resueltos')) this.activeTab = 'resolved';
      else if(url.includes('/admin/cancelados')) this.activeTab = 'cancelled';
      else this.activeTab = 'recent';
    }catch(e){/* noop */}
  }

  /**
   * Cierra la sesión del usuario administrador.
   * Utiliza el método `logout` del `AuthService`.
   */
  logout(){ this.auth.logout(); }

  /**
   * Alterna el estado de visibilidad del panel móvil del navbar.
   */
  toggleMobile(){ this.mobileOpen = !this.mobileOpen; }

  /**
   * Cierra el panel móvil del navbar, estableciendo su estado a `false`.
   */
  closeMobile(){ this.mobileOpen = false; }
}
