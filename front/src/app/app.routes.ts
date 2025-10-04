import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { InicioSesion } from './Login/inicio-sesion/inicio-sesion';
import { Inicio as SuperAdminInicio } from './SuperAdmin/inicio/inicio';
import { roleGuard } from './guards/role.guard';
import { guestGuard } from './guards/guest.guard';
import { RoleSelectorComponent } from './Admin/role-selector/select-rol';
import { UserLayoutComponent } from './Usuario/user-layout/user-layout.component';
import { InicioUsuario } from './Usuario/inicio/inicio';
import { InicioAdmin } from './Admin/inicio/inicio';
import { InicioSeguridad } from './Seguridad/inicio/inicio';
import { AuthService } from './services/auth.service';

export const routes: Routes = [
	{ path: 'login', component: InicioSesion, canActivate: [guestGuard] },
	{ path: 'superadmin/dashboard', component: SuperAdminInicio, canActivate: [roleGuard], data: { roles: ['ROLE_SUPERADMIN'] } },
	{ path: 'select-role', component: RoleSelectorComponent, canActivate: [roleGuard, () => {
		const auth = inject(AuthService);
		const router = inject(Router);
		auth.loadFromStorage();
		if (auth.isAuthenticated() && auth.hasRole('ROLE_ADMIN') && auth.isAdminRoleSelected()) {
			// Ya eligió rol: llevarlo a su área actual
			if (auth.isAdminAsUser()) router.navigate(['/usuario'], { replaceUrl: true });
			else router.navigate(['/admin'], { replaceUrl: true });
			return false;
		}
		return true;
	}] },
	{ path: 'usuario', component: UserLayoutComponent, canActivate: [roleGuard], data: { roles: ['ROLE_USUARIO','ROLE_ADMIN'] }, children: [
		{ path: '', component: InicioUsuario }
	]},
	{ path: 'admin', component: InicioAdmin, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] } },
	{ path: 'seguridad', component: InicioSeguridad, canActivate: [roleGuard], data: { roles: ['ROLE_SEGURIDAD'] } },
	{ path: '', pathMatch: 'full', redirectTo: 'superadmin/dashboard' },
	{ path: '**', redirectTo: 'superadmin/dashboard' }
];
