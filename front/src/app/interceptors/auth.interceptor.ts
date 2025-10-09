import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';

// Interceptor que agrega el token JWT si existe en localStorage
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const token = localStorage.getItem('auth_token');
  const isUsuariosMe = req.url.includes('/api/usuarios/me');
  const isPublic = req.url.includes('/api/zonas')
    || req.url.includes('/api/tipoincidentes')
    || req.url.includes('/api/sedes')
    || req.url.includes('/api/reportes'); // ojo: '/api/usuarios/me' no es público

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

  if (token && !isExpired(token) && (!isPublic || isUsuariosMe)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  } else if (token && isExpired(token)) {
    // limpiar token vencido para no causar 401
    localStorage.removeItem('auth_token');
  }
  return next(req);
};
