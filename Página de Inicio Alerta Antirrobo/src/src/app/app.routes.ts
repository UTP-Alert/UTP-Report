import { Routes } from '@angular/router';

export const routes: Routes = [
  // Las rutas se manejarán internamente en el componente principal
  { path: '**', redirectTo: '' }
];