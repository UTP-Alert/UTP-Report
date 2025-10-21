// Importa el decorador Component de Angular core para definir un componente.
import { Component } from '@angular/core';
// Importa el servicio de autenticación para manejar la lógica de inicio y cierre de sesión.
import { AuthService } from '../../services/auth.service';
// Importa el servicio de perfil para cargar y gestionar la información del perfil del usuario.
import { PerfilService } from '../../services/perfil.service';
// Importa RouterModule para habilitar las funcionalidades de enrutamiento en el componente.
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf, ngFor
import { RouterModule } from '@angular/router';

// Decorador @Component que define los metadatos del componente.
@Component({
  selector: 'app-inicio-admin', // El selector CSS que se usa para instanciar este componente en una plantilla.
  standalone: true, // Indica que este es un componente independiente, no requiere un NgModule.
  imports: [RouterModule, CommonModule], // Módulos que este componente importa y utiliza.
  templateUrl: './inicio.html', // La ruta al archivo de plantilla HTML de este componente.
  styleUrl: './inicio.scss' // La ruta al archivo de estilos SCSS de este componente.
})
export class InicioAdmin {
  nombreAdmin: string = ''; // Propiedad para almacenar el nombre completo del administrador.
  mobileOpen: boolean = false; // Estado booleano para controlar la visibilidad del panel móvil del navbar.
  activeTab: string = 'recent'; // Propiedad para controlar la pestaña activa, por defecto 'recent'.

  // Constructor del componente, inyecta AuthService y PerfilService.
  constructor(public auth: AuthService, private perfil: PerfilService){
    this.perfil.cargarPerfil(); // Carga el perfil del usuario al inicializar el componente.
    // Establece un temporizador para obtener el nombre del administrador después de un breve retraso.
    setTimeout(()=>{
      const p = this.perfil.perfil(); // Obtiene el perfil del servicio.
      if(p) this.nombreAdmin = p.nombreCompleto; // Si el perfil existe, asigna el nombre completo.
    },300);
  }

  /**
   * Establece la pestaña activa.
   * @param tabName El nombre de la pestaña a activar.
   */
  setActiveTab(tabName: string) {
    this.activeTab = tabName;
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
