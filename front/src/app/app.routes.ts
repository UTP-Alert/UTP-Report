import { Routes } from '@angular/router';
import { InicioSesion } from './Login/inicio-sesion/inicio-sesion';
import { Inicio as SuperAdminInicio } from './SuperAdmin/inicio/inicio';
import { roleGuard } from './guards/role.guard';
import { RoleSelectorComponent } from './Admin/role-selector/role-selector.component';
import { UserLayoutComponent } from './Usuario/user-layout/user-layout.component';
import { InicioUsuario } from './Usuario/inicio/inicio';
import { InicioAdmin } from './Admin/inicio/inicio';
import { InicioSeguridad } from './Seguridad/inicio/inicio';

export const routes: Routes = [
	{ path: 'login', component: InicioSesion },
	{ path: 'superadmin/dashboard', component: SuperAdminInicio, canActivate: [roleGuard], data: { roles: ['ROLE_SUPERADMIN'] } },
	{ path: 'select-role', component: RoleSelectorComponent, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] } },
	{ path: 'usuario', component: UserLayoutComponent, canActivate: [roleGuard], data: { roles: ['ROLE_USUARIO','ROLE_ADMIN'] }, children: [
		{ path: '', component: InicioUsuario }
	]},
	{ path: 'admin', component: InicioAdmin, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] } },
	{ path: 'seguridad', component: InicioSeguridad, canActivate: [roleGuard], data: { roles: ['ROLE_SEGURIDAD'] } },
	{ path: '', pathMatch: 'full', redirectTo: 'superadmin/dashboard' },
	{ path: '**', redirectTo: 'superadmin/dashboard' }
];
