import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROLES } from '../constants/roles';

// Uso: data: { roles: ['ROLE_ADMIN'] }
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const expected: string[] = route.data?.['roles'] || [];
  auth.loadFromStorage();
  if (!auth.isAuthenticated()) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
  if (expected.length && !expected.some(r => auth.hasRole(r))) {
    // Redirigir a página genérica según primer rol
    if (auth.hasRole(ROLES.SUPERADMIN)) router.navigate(['/superadmin/dashboard'], { replaceUrl: true });
    else if (auth.hasRole(ROLES.ADMIN)) {
      if (auth.isAdminAsUser()) router.navigate(['/usuario'], { replaceUrl: true });
      else router.navigate(['/admin'], { replaceUrl: true });
    }
    else if (auth.hasRole(ROLES.SEGURIDAD)) router.navigate(['/seguridad'], { replaceUrl: true });
    else router.navigate(['/usuario'], { replaceUrl: true });
    return false;
  }
  return true;
};
