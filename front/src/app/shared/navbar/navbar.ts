import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { PerfilService } from '../../services/perfil.service';
import { ROLES } from '../../constants/roles';
import { PageConfigService, PageKey } from '../../services/page-config.service';
import { TourService } from '../tour/tour.service';
import { TourComponent } from '../tour/tour.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NgIf, NgClass, RouterModule, TourComponent],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  private router = inject(Router);
  auth = inject(AuthService);
  perfilSrv = inject(PerfilService);
  pageCfg = inject(PageConfigService);
  // Tour service inyectado como campo
  tour = inject(TourService);

  // Estado público requerido
  userRole = signal<string>('');
  userName = signal<string>('');
  currentUrl = signal<string>('');

  // Derivados
  isAuthenticated = computed(() => this.auth.isAuthenticated());
  isSuperAdmin = computed(() => this.auth.hasRole(ROLES.SUPERADMIN));
  isAdminAsUser = computed(() => this.auth.isAdminAsUser());
  isAdmin = computed(() => this.auth.hasRole(ROLES.ADMIN) && !this.auth.isAdminAsUser());
  // Usuario 'puro': tiene rol USUARIO y NO tiene roles de mayor privilegio (ADMIN/SUPERADMIN/SEGURIDAD),
  // a menos que sea Admin actuando como Usuario (ese caso se maneja con isAdminAsUser por separado en la vista).
  isUsuario = computed(() =>
    this.auth.hasRole(ROLES.USUARIO) &&
    !this.auth.hasRole(ROLES.ADMIN) &&
    !this.auth.hasRole(ROLES.SUPERADMIN) &&
    !this.auth.hasRole(ROLES.SEGURIDAD)
  );
  isSeguridad = computed(() => this.auth.hasRole(ROLES.SEGURIDAD));
  
  canSeeZonas = computed(() => this.isUsuario() || this.isAdminAsUser() || this.isAdmin() || this.isSuperAdmin() || this.isSeguridad());
  roleClass = computed(() => {
    if (this.auth.hasRole(ROLES.SUPERADMIN)) return 'superadmin';
    if (this.auth.isAdminAsUser()) return 'adminUser';
    if (this.auth.hasRole(ROLES.ADMIN)) return 'adminUser';
    if (this.auth.hasRole(ROLES.SEGURIDAD)) return 'seguridad';
    // Usuario: decidir por tipoUsuario (alumno/docente)
    const p = this.perfilSrv.perfil();
    if (p && p.tipoUsuario) {
      const t = p.tipoUsuario.toUpperCase();
      if (t === 'ALUMNO') return 'alumno';
      if (t === 'DOCENTE') return 'docente';
    }
    return '';
  });

  rolePrefix = computed(() => {
    if (this.auth.hasRole(ROLES.SUPERADMIN)) return 'superadmin. ';
    if (this.auth.isAdminAsUser()) return 'Admin. ';
    if (this.auth.hasRole(ROLES.ADMIN)) return 'Admin. ';
    if (this.auth.hasRole(ROLES.SEGURIDAD)) return 'seg. ';
    const p = this.perfilSrv.perfil();
    if (p && p.tipoUsuario) {
      const t = p.tipoUsuario.toUpperCase();
      if (t === 'ALUMNO') return 'alum. ';
      if (t === 'DOCENTE') return 'doc. ';
    }
    return '';
  });

  roleIcon = computed(() => {
    if (this.auth.hasRole(ROLES.SUPERADMIN)) return 'bi-shield-fill-plus';
    if (this.auth.isAdminAsUser() || this.auth.hasRole(ROLES.ADMIN)) return 'bi-shield-check';
    if (this.auth.hasRole(ROLES.SEGURIDAD)) return 'bi-shield-lock';
    const p = this.perfilSrv.perfil();
    if (p && p.tipoUsuario) {
      const t = p.tipoUsuario.toUpperCase();
      if (t === 'ALUMNO') return 'bi-mortarboard';
      if (t === 'DOCENTE') return 'bi-person-vcard';
    }
    return 'bi-person-badge';
  });

  // Mostrar navbar solo si está autenticado
  showNavbar = computed(() => this.isAuthenticated() && !this.isLoginRoute());

  constructor(){
    this.tour = inject(TourService);
    this.auth.loadFromStorage();
    this.perfilSrv.cargarPerfil();
    // Sincronizar la URL actual para reactividad
    this.currentUrl.set(this.router.url || '');
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentUrl.set(e.urlAfterRedirects || e.url || '');
    });
    // Rellenar nombre + rol en cuanto haya perfil o roles
    effect(() => {
      const p = this.perfilSrv.perfil();
      const roles = this.auth.roles();
      void roles; // para reactividad
      let nombre = p?.nombreCompleto || '';
      if (!nombre) nombre = 'Usuario';
      this.userRole.set(this.primaryRole());
      // Build con prefijo exacto visible vía CSS + contenido simple en texto
      this.userName.set(nombre);
    });

    // Marcar el body cuando el navbar está visible para aplicar padding-top
    effect(() => {
      const visible = this.showNavbar();
      const body = document?.body;
      if (!body) return;
      if (visible) body.classList.add('with-fixed-navbar');
      else body.classList.remove('with-fixed-navbar');
    });
  }

  openTour(){
    // Inicializar pasos básicos (pueden ampliarse o cargarse dinámicamente)
    const steps = [
      { title: '¡Bienvenido a UTP+Report!', content: 'Te guiaremos paso a paso para que conozcas todas las funciones de seguridad disponibles.', icon: 'bi-shield-fill', tip: 'Puedes cerrar este tutorial en cualquier momento y continuar explorando.' },
      { title: 'Reportar Incidentes', content: 'Botón principal para reportar cualquier incidente de seguridad. Totalmente anónimo y seguro.', icon: 'bi-megaphone-fill', tip: 'Haz clic aquí cuando necesites reportar algo urgente.', targetSelector: '.report-main-button button[aria-label="Botón para reportar un incidente"]' },
      { title: 'Estado de Zonas', content: 'Monitoreo en tiempo real. Verde = Seguro | Amarillo = Precaución | Rojo = Peligroso.', icon: 'bi-geo-alt-fill', tip: 'Revisa esto antes de dirigirte a una zona del campus.', targetSelector: '.zones-status-section' },
      { title: 'Acciones Rápidas', content: 'Herramientas útiles: tus reportes, consejos de seguridad y contacto directo.', icon: 'bi-send-fill', tip: 'Estas acciones están siempre disponibles para ti.', targetSelector: '.quick-actions-section' },
      { title: 'Notificaciones', content: 'Alertas importantes: zonas peligrosas, actualizaciones de reportes y resoluciones.', icon: 'bi-bell-fill', tip: 'Mantente informado de todo lo importante.', targetSelector: '.nav-link.icon-only[title="Notificaciones"]' },
      { title: 'Mis Reportes', content: 'Sigue el progreso de tus reportes desde "En Investigación" hasta "Resuelto".', icon: 'bi-file-earmark-text-fill', tip: 'Recibirás notificaciones automáticas de cada progreso.', targetSelector: '.quick-actions-section button[aria-label="Ver mis reportes anteriores"]' },
      { title: '¡Listo!', content: 'Ya conoces el sistema. Cada reporte ayuda a mantener segura toda la comunidad UTP.', icon: 'bi-check-circle-fill', tip: '¡No dudes en usar el sistema cuando lo necesites!', targetSelector: 'button[title="Tour del sistema"]' }
    ];
    this.tour.init(steps);
    this.tour.open(0);
  }

  getHomePath(): string[] {
    if (this.isSuperAdmin()) return ['/superadmin','dashboard'];
    if (this.isAdminAsUser()) return ['/usuario'];
    if (this.isAdmin()) return ['/admin'];
    if (this.isSeguridad()) return ['/seguridad'];
    if (this.isUsuario()) return ['/usuario'];
    return ['/login'];
  }

  private primaryRole(): string {
    if (this.auth.hasRole(ROLES.SUPERADMIN)) return ROLES.SUPERADMIN;
    if (this.auth.isAdminAsUser()) return 'ADMIN_AS_USER';
    if (this.auth.hasRole(ROLES.ADMIN)) return ROLES.ADMIN;
    if (this.auth.hasRole(ROLES.SEGURIDAD)) return ROLES.SEGURIDAD;
    if (this.auth.hasRole(ROLES.USUARIO)) return ROLES.USUARIO;
    return '';
  }

  // Chequeo de página habilitada para el rol actual
  canShow(page: PageKey): boolean {
    // Si el admin está actuando como usuario, usar la configuración de páginas del rol USUARIO
    const role = this.auth.isAdminAsUser() ? ROLES.USUARIO : this.primaryRole();
    return this.pageCfg.isEnabled(role as any, page);
  }

  isActive(key: 'home'|'zonas'|'reportes'|'usuarios'|'sensibles'|'guia'): boolean {
    const url = this.currentUrl();
    switch (key) {
      case 'home': {
        const home = this.getHomePath().join('/');
        return url.startsWith(home) && (url === home || url === home + '/' || url.split('/').length <= home.split('/').length + 1);
      }
      case 'zonas': {
        const p = this.getZonasPath().join('/');
        return url.startsWith(p);
      }
      case 'reportes':
        return url.startsWith('/admin/reportes');
      case 'usuarios':
        return url.startsWith('/superadmin/usuarios');
      case 'sensibles':
        return url.startsWith('/superadmin/reportes-sensibles');
      case 'guia':
        return url.startsWith('/usuario/guia-page');
    }
  }

  isLoginRoute(): boolean {
    const r = this.currentUrl();
    return r.startsWith('/login') || r.startsWith('/select-role');
  }

  goHome(){
    this.router.navigate(this.getHomePath());
  }

  getZonasPath(): string[] {
    if (this.isSuperAdmin()) return ['/superadmin','zonas'];
    if (this.isAdmin()) return ['/admin','zonas'];
    if (this.isSeguridad()) return ['/seguridad','zonas'];
    // Usuario puro o admin como usuario
    return ['/usuario','estado-zonas'];
  }

  goZonas(){
    if (this.canSeeZonas()) this.router.navigate(this.getZonasPath());
  }

  goReportes(){
    // Por ahora solo Admin tiene este ítem en el menú
    if (this.isAdmin()) this.router.navigate(['/admin','reportes']);
  }

  goGestionUsuarios(){
    if (this.isSuperAdmin()) this.router.navigate(['/superadmin','usuarios']);
  }

  goReportesSensibles(){
    if (this.isSuperAdmin()) this.router.navigate(['/superadmin','reportes-sensibles']);
  }

openGuide(){
  if (this.isUsuario() || this.isAdminAsUser()) {
    this.router.navigate(['/usuario', 'guia-page']);
  }
}


  openNotifications(){ /* TODO: panel de notificaciones */ }
  reportar(){ /* TODO: modal de reporte */ }
  logout(){ this.auth.logout(); }
}
