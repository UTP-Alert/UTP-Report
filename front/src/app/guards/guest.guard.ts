// Importa la función `inject` de Angular core para inyectar dependencias.
import { inject } from '@angular/core';
// Importa `CanActivateFn` para definir un guard de ruta y `Router` para la navegación.
import { CanActivateFn, Router } from '@angular/router';
// Importa el servicio de autenticación.
import { AuthService } from '../services/auth.service';
// Importa las constantes de roles de la aplicación.
import { ROLES } from '../constants/roles';

/**
 * `guestGuard` es un guard de ruta que evita que usuarios autenticados accedan a rutas
 * destinadas solo para invitados (por ejemplo, la página de inicio de sesión).
 * Si un usuario autenticado intenta acceder a una ruta de invitado, será redirigido
 * a su dashboard correspondiente según su rol.
 *
 * @returns `true` si el usuario no está autenticado y puede acceder a la ruta de invitado,
 *          `false` si el usuario está autenticado y es redirigido.
 */
export const guestGuard: CanActivateFn = () => {
  // Inyecta el servicio de autenticación.
  const auth = inject(AuthService);
  // Inyecta el servicio de enrutamiento.
  const router = inject(Router);

  // Carga el estado de autenticación y los roles desde el almacenamiento local.
  auth.loadFromStorage();

  // Si el usuario está autenticado, no se le permite acceder a la ruta de invitado.
  if (auth.isAuthenticated()) {
    // Redirige al usuario a la página de inicio (dashboard) según su rol.
    if (auth.hasRole(ROLES.SUPERADMIN)) {
      router.navigate(['/superadmin/dashboard'], { replaceUrl: true });
    } else if (auth.hasRole(ROLES.ADMIN)) {
      // Si el admin está actuando como usuario, lo redirige a la vista de usuario.
      if (auth.isAdminAsUser()) router.navigate(['/usuario'], { replaceUrl: true });
      // De lo contrario, lo redirige a la vista de administrador.
      else router.navigate(['/admin'], { replaceUrl: true });
    } else if (auth.hasRole(ROLES.SEGURIDAD)) {
      router.navigate(['/seguridad'], { replaceUrl: true });
    } else if (auth.hasRole(ROLES.USUARIO)) {
      router.navigate(['/usuario'], { replaceUrl: true });
    } else {
      // En caso de un rol no reconocido o por defecto, redirige a la vista de usuario.
      router.navigate(['/usuario'], { replaceUrl: true });
    }
    return false; // Impide el acceso a la ruta de invitado.
  }
  // Si el usuario no está autenticado, permite el acceso a la ruta de invitado.
  return true;
};
