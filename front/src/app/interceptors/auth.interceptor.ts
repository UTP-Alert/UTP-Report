import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

// Interceptor que agrega el token JWT si existe en localStorage
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req);
};
