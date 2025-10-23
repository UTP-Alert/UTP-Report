import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { InicioSesion } from './Login/inicio-sesion/inicio-sesion';
import { Inicio as SuperAdminInicio } from './SuperAdmin/inicio/inicio';
import { roleGuard } from './guards/role.guard';
import { guestGuard } from './guards/guest.guard';
import { RoleSelectorComponent } from './Admin/select-rol/select-rol';
import { InicioUsuario } from './Usuario/inicio/inicio';
import { InicioAdmin } from './Admin/inicio/inicio';
import { ReportesComponent } from './Admin/reportes/reportes'; // Import the new component
import { InicioSeguridad } from './Seguridad/inicio/inicio';
import { AuthService } from './services/auth.service';
import { ZonasPageCompleteComponent } from './Usuario/Estado_zonas/zonas-page-complete.component';
import { AdminZonasPageCompleteComponent } from './Admin/Estado_zonas/zonas-page-complete.component'; // Import the new admin component
import { EstadoZonasComponent } from './Seguridad/estado-zonas/estado-zonas'; // Import the new seguridad component
import { GuiaPage } from './Usuario/guia-page/guia-page'; // Importa el nuevo componente

export const routes: Routes = [
	{ path: 'login', component: InicioSesion, canActivate: [guestGuard] },
	{ path: 'superadmin/dashboard/:tab', component: SuperAdminInicio, canActivate: [roleGuard], data: { roles: ['ROLE_SUPERADMIN'] } },
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
	{ path: 'usuario', component: InicioUsuario, canActivate: [roleGuard], data: { roles: ['ROLE_USUARIO','ROLE_ADMIN'] } },
	// Rutas específicas para las pestañas del área Admin que reutilizan el componente InicioAdmin
	{ path: 'admin/recientes', component: InicioAdmin, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] } },
	{ path: 'admin/en-proceso', component: InicioAdmin, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] } },
	{ path: 'admin/pend-aprobacion', component: InicioAdmin, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] } },
	{ path: 'admin/resueltos', component: InicioAdmin, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] } },
	{ path: 'admin/cancelados', component: InicioAdmin, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] } },
	{ path: 'admin', component: InicioAdmin, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] } },
	{ path: 'admin/reportes', component: ReportesComponent, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] } },
	{ path: 'admin/estado-zonas', component: AdminZonasPageCompleteComponent, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] } },
	{ path: 'seguridad', component: InicioSeguridad, canActivate: [roleGuard], data: { roles: ['ROLE_SEGURIDAD'] } },
	{ path: 'usuario/estado-zonas', component: ZonasPageCompleteComponent, canActivate: [roleGuard], data: { roles: ['ROLE_USUARIO', 'ROLE_ADMIN'] } },
{ 
  path: 'usuario/guia-page', 
  component: GuiaPage, 
  canActivate: [roleGuard], 
  data: { roles: ['ROLE_USUARIO', 'ROLE_ADMIN'] } 
},
	{ path: 'seguridad/estado-zonas', component: EstadoZonasComponent, canActivate: [roleGuard], data: { roles: ['ROLE_SEGURIDAD'] } },
	{ path: '', pathMatch: 'full', redirectTo: 'superadmin/dashboard' },
	{ path: '**', redirectTo: 'superadmin/dashboard' }
];
