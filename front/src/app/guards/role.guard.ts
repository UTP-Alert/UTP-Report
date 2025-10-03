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
    router.navigate(['/login']);
    return false;
  }
  if (expected.length && !expected.some(r => auth.hasRole(r))) {
    // Redirigir a página genérica según primer rol
    if (auth.hasRole(ROLES.SUPERADMIN)) router.navigate(['/superadmin/dashboard']);
    else if (auth.hasRole(ROLES.ADMIN)) {
      if (auth.isAdminAsUser()) router.navigate(['/usuario']);
      else router.navigate(['/admin']);
    }
    else if (auth.hasRole(ROLES.SEGURIDAD)) router.navigate(['/seguridad']);
    else router.navigate(['/usuario']);
    return false;
  }
  return true;
};
