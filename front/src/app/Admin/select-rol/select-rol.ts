// Importa `Component` de Angular core para definir el componente.
import { Component } from '@angular/core';
// Importa `CommonModule` para tener acceso a directivas comunes de Angular.
import { CommonModule } from '@angular/common';
// Importa `Router` para la navegación programática.
import { Router } from '@angular/router';
// Importa `AuthService` para manejar la lógica de autenticación y roles.
import { AuthService } from '../../services/auth.service';
// Importa `ToastrService` para mostrar notificaciones.
import { ToastrService } from 'ngx-toastr';

/**
 * Componente `RoleSelectorComponent` que permite a un usuario con rol de administrador
 * elegir si desea operar como un usuario regular o como administrador.
 */
@Component({
  selector: 'app-admin-role-selector', // El selector CSS para usar este componente.
  standalone: true, // Indica que este es un componente autónomo.
  imports: [CommonModule], // Módulos que este componente utiliza.
  templateUrl: './select-rol.html', // La ruta al archivo de plantilla HTML.
  styleUrl: './select-rol.scss' // La ruta al archivo de estilos SCSS.
})
export class RoleSelectorComponent {
  /**
   * Constructor del componente.
   * @param router Servicio de enrutamiento para navegar entre vistas.
   * @param auth Servicio de autenticación para gestionar el estado del usuario y roles.
   * @param toastr Servicio para mostrar notificaciones toast.
   */
  constructor(private router: Router, private auth: AuthService, private toastr: ToastrService) {}

  /**
   * Navega al área de usuario, estableciendo el estado de que el administrador
   * está actuando como usuario.
   */
  goAsUser() {
    this.auth.setAdminActingAsUser(true); // Marca que el admin actúa como usuario.
    this.auth.setAdminRoleSelected(true); // Marca que el admin ya seleccionó un rol.
    this.router.navigate(['/usuario'], { replaceUrl: true }); // Redirige al dashboard de usuario.
    this.toastr.success('Login exitoso', 'Éxito'); // Muestra notificación de éxito.
    this.toastr.success('Bienvenido al área de Usuario', 'Éxito'); // Muestra notificación de bienvenida.
  }

  /**
   * Navega al área de administrador, restableciendo el estado de que el administrador
   * no está actuando como usuario.
   */
  goAsAdmin() {
    this.auth.setAdminActingAsUser(false); // Marca que el admin no actúa como usuario.
    this.auth.setAdminRoleSelected(true); // Marca que el admin ya seleccionó un rol.
    this.router.navigate(['/admin'], { replaceUrl: true }); // Redirige al dashboard de administrador.
    this.toastr.success('Login exitoso', 'Éxito'); // Muestra notificación de éxito.
    this.toastr.success('Bienvenido al Dashboard de Administrador', 'Éxito'); // Muestra notificación de bienvenida.
  }

  /**
   * Cierra la sesión del usuario y lo redirige a la página de login.
   */
  backLogin() {
    this.auth.logout(); // Llama al método de logout del servicio de autenticación.
}
}
