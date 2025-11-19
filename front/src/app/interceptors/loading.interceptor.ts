import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const loader = inject(LoadingService);
  // Mostrar loader para todas las peticiones HTTP
  loader.show();
  return next(req).pipe(finalize(() => loader.hide()));
};
