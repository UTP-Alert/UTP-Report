// Importa la función `inject` de Angular core para inyectar dependencias.
import { inject } from '@angular/core';
// Importa `CanActivateFn` para definir un guard de ruta y `Router` para la navegación.
import { CanActivateFn, Router } from '@angular/router';
// Importa el servicio de autenticación.
import { AuthService } from '../services/auth.service';
// Importa las constantes de roles de la aplicación.
import { ROLES } from '../constants/roles';

/**
 * `roleGuard` es un guard de ruta que protege rutas basándose en los roles del usuario.
 * Se utiliza en la configuración de rutas con `data: { roles: ['ROLE_ESPERADO'] }`.
 *
 * @param route La ruta actual que se intenta activar.
 * @returns `true` si el usuario está autenticado y tiene al menos uno de los roles esperados,
 *          `false` si no está autenticado (redirige a login) o no tiene los roles requeridos
 *          (redirige a su dashboard por defecto).
 */
export const roleGuard: CanActivateFn = (route) => {
  // Inyecta el servicio de autenticación.
  const auth = inject(AuthService);
  // Inyecta el servicio de enrutamiento.
  const router = inject(Router);

  // Obtiene los roles esperados de los datos de la ruta. Si no hay, se asume un array vacío.
  const expected: string[] = route.data?.['roles'] || [];

  // Carga el estado de autenticación y los roles desde el almacenamiento local.
  auth.loadFromStorage();

  // Si el usuario no está autenticado, lo redirige a la página de inicio de sesión.
  if (!auth.isAuthenticated()) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  // Si hay roles esperados y el usuario no tiene ninguno de ellos.
  if (expected.length && !expected.some(r => auth.hasRole(r))) {
    // Redirige al usuario a una página genérica (su dashboard) según el primer rol que tenga.
    if (auth.hasRole(ROLES.SUPERADMIN)) router.navigate(['/superadmin/dashboard'], { replaceUrl: true });
    else if (auth.hasRole(ROLES.ADMIN)) {
      // Si el admin está actuando como usuario, lo redirige a la vista de usuario.
      if (auth.isAdminAsUser()) router.navigate(['/usuario'], { replaceUrl: true });
      // De lo contrario, lo redirige a la vista de administrador.
      else router.navigate(['/admin'], { replaceUrl: true });
    }
    else if (auth.hasRole(ROLES.SEGURIDAD)) router.navigate(['/seguridad'], { replaceUrl: true });
    else router.navigate(['/usuario'], { replaceUrl: true }); // Por defecto, redirige a usuario.
    return false; // Impide el acceso a la ruta actual.
  }

  // Si el usuario está autenticado y tiene los roles requeridos, permite el acceso a la ruta.
  return true;
};
