import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';

// Interceptor que agrega el token JWT si existe en localStorage
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const token = localStorage.getItem('auth_token');
  const isAuthEndpoint = req.url.includes('/api/auth/');
  const isUsuariosMe = req.url.includes('/api/usuarios/me');
  // Endpoints que consideramos públicos (no requieren token)
  // NOTA: las llamadas a '/api/reportes' deben llevar token para acciones de seguridad,
  // por eso NO se incluyen aquí.
  const isPublic = isAuthEndpoint
    || req.url.includes('/api/zonas')
    || req.url.includes('/api/tipoincidentes')
    || req.url.includes('/api/sedes');

  const isExpired = (tok?: string): boolean => {
    if (!tok) return true;
    try {
      const payload = tok.split('.')[1];
      const json = atob(payload.replace(/-/g,'+').replace(/_/g,'/'));
      const decoded = JSON.parse(json);
      if (!decoded?.exp) return false;
      return Date.now() >= decoded.exp * 1000;
    } catch { return true; }
  };

  // No adjuntar token en endpoints de autenticación
  if (!isAuthEndpoint && token && !isExpired(token) && (!isPublic || isUsuariosMe)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  } else if (token && isExpired(token)) {
    // limpiar token vencido para no causar 401
    localStorage.removeItem('auth_token');
  }
  return next(req);
};
