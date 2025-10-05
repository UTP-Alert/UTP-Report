// Importa los tipos Routes y Router de Angular para definir y navegar rutas.
import { Routes, Router } from '@angular/router';
// Importa la función inject de Angular core para inyectar dependencias.
import { inject } from '@angular/core';
// Importa el componente de inicio de sesión.
import { InicioSesion } from './Login/inicio-sesion/inicio-sesion';
// Importa el componente de inicio para el rol de SuperAdmin.
import { Inicio as SuperAdminInicio } from './SuperAdmin/inicio/inicio';
// Importa el guard de rol para proteger rutas basadas en los roles del usuario.
import { roleGuard } from './guards/role.guard';
// Importa el guard de invitado para proteger rutas de usuarios no autenticados.
import { guestGuard } from './guards/guest.guard';
// Importa el componente para seleccionar el rol de administrador.
import { RoleSelectorComponent } from './Admin/select-rol/select-rol';
// Importa el componente de layout para usuarios normales.
import { UserLayoutComponent } from './Usuario/layout-usuario/usuario-layout';
// Importa el componente de inicio para el rol de Usuario.
import { InicioUsuario } from './Usuario/inicio/inicio';
// Importa el componente de inicio para el rol de Admin.
import { InicioAdmin } from './Admin/inicio/inicio';
// Importa el componente de inicio para el rol de Seguridad.
import { InicioSeguridad } from './Seguridad/inicio/inicio';
// Importa el servicio de autenticación.
import { AuthService } from './services/auth.service';

// Definición de las rutas de la aplicación.
export const routes: Routes = [
	// Ruta para el inicio de sesión, accesible solo para invitados.
	{ path: 'login', component: InicioSesion, canActivate: [guestGuard] },
	// Ruta para el dashboard de SuperAdmin, protegida por el guard de rol.
	{ path: 'superadmin/dashboard', component: SuperAdminInicio, canActivate: [roleGuard], data: { roles: ['ROLE_SUPERADMIN'] } },
	// Ruta para la selección de rol, protegida por el guard de rol y una lógica personalizada.
	{ path: 'select-role', component: RoleSelectorComponent, canActivate: [roleGuard, () => {
		const auth = inject(AuthService); // Inyecta el servicio de autenticación.
		const router = inject(Router); // Inyecta el enrutador.
		auth.loadFromStorage(); // Carga la información de autenticación del almacenamiento.
		// Si el usuario está autenticado, tiene el rol de ADMIN y ya seleccionó un rol de administrador.
		if (auth.isAuthenticated() && auth.hasRole('ROLE_ADMIN') && auth.isAdminRoleSelected()) {
			// Redirige al usuario a su área actual (usuario o admin) y evita la activación de esta ruta.
			if (auth.isAdminAsUser()) router.navigate(['/usuario'], { replaceUrl: true });
			else router.navigate(['/admin'], { replaceUrl: true });
			return false; // No activa la ruta 'select-role'.
		}
		return true; // Activa la ruta 'select-role'.
	}] },
	// Ruta para el layout de usuario, protegida por el guard de rol y con rutas hijas.
	{ path: 'usuario', component: UserLayoutComponent, canActivate: [roleGuard], data: { roles: ['ROLE_USUARIO','ROLE_ADMIN'] }, children: [
		{ path: '', component: InicioUsuario } // Ruta hija por defecto para el inicio de usuario.
	]},
	// Ruta para el inicio de Admin, protegida por el guard de rol.
	{ path: 'admin', component: InicioAdmin, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] } },
	// Ruta para el inicio de Seguridad, protegida por el guard de rol.
	{ path: 'seguridad', component: InicioSeguridad, canActivate: [roleGuard], data: { roles: ['ROLE_SEGURIDAD'] } },
	// Ruta por defecto, redirige al dashboard de SuperAdmin.
	{ path: '', pathMatch: 'full', redirectTo: 'superadmin/dashboard' },
	// Ruta comodín para cualquier otra ruta no definida, redirige al dashboard de SuperAdmin.
	{ path: '**', redirectTo: 'superadmin/dashboard' }
];
