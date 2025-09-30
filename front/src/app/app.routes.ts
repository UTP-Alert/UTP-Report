import { Routes } from '@angular/router';
import { InicioSesion } from './Login/inicio-sesion/inicio-sesion';

export const routes: Routes = [
	{ path: 'login', component: InicioSesion },
	{ path: '', pathMatch: 'full', redirectTo: 'login' },
	{ path: '**', redirectTo: 'login' }
];
