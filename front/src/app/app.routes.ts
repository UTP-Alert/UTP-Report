import { Routes } from '@angular/router';
import { InicioSesion } from './Login/inicio-sesion/inicio-sesion';
import { Inicio as SuperAdminInicio } from './SuperAdmin/inicio/inicio';

export const routes: Routes = [
	{ path: 'login', component: InicioSesion },
	{ path: 'superadmin/dashboard', component: SuperAdminInicio },
	{ path: '', pathMatch: 'full', redirectTo: 'superadmin/dashboard' },
	{ path: '**', redirectTo: 'superadmin/dashboard' }
];
