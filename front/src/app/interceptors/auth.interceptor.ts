// Importa los tipos necesarios para crear un interceptor HTTP en Angular.
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

/**
 * Interceptor HTTP para añadir el token JWT a las cabeceras de las peticiones salientes.
 * Si existe un token de autenticación en el localStorage, se añade como cabecera 'Authorization'.
 * @param req La petición HTTP saliente.
 * @param next La función para manejar la siguiente petición en la cadena de interceptores.
 * @returns Un Observable de HttpEvent.
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  // Obtiene el token de autenticación del localStorage.
  const token = localStorage.getItem('auth_token');

  // Si existe un token, clona la petición y añade la cabecera de autorización.
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Formato estándar para tokens JWT.
      }
    });
  }
  // Continúa con la siguiente petición en la cadena.
  return next(req);
};
