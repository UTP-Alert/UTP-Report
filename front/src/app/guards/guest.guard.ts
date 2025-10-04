import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROLES } from '../constants/roles';

// Evita que usuarios autenticados ingresen a rutas de invitado (ej: /login)
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  auth.loadFromStorage();
  if (auth.isAuthenticated()) {
    // Redirige a la landing según rol
    if (auth.hasRole(ROLES.SUPERADMIN)) {
      router.navigate(['/superadmin/dashboard'], { replaceUrl: true });
    } else if (auth.hasRole(ROLES.ADMIN)) {
      if (auth.isAdminAsUser()) router.navigate(['/usuario'], { replaceUrl: true });
      else router.navigate(['/admin'], { replaceUrl: true });
    } else if (auth.hasRole(ROLES.SEGURIDAD)) {
      router.navigate(['/seguridad'], { replaceUrl: true });
    } else if (auth.hasRole(ROLES.USUARIO)) {
      router.navigate(['/usuario'], { replaceUrl: true });
    } else {
      router.navigate(['/usuario'], { replaceUrl: true });
    }
    return false;
  }
  return true;
};
