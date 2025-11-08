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
import { Notificaciones } from '../../Usuario/notificaciones/notificaciones';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NgIf, NgClass, RouterModule, TourComponent, Notificaciones],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  // Conexión WS/STOMP
  // Nota: NO cacheamos SockJS/Stomp en campos al construir, porque los scripts CDN
  // pueden cargarse después de bootstrap. Mejor leerlos dinámicamente al conectar.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private wsClient: any | null = null;
  private wsConnecting = false;
  private wsConnected = false;
  // Audio de alerta (sonido corto embebido en base64). Se inicializa bajo demanda.
  private alertAudio: HTMLAudioElement | null = null;

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

  // Notificaciones
  showNotifs = signal(false);
  notifications = signal<Array<{ id: number; title: string; body: string; zonaNombre?: string; estado?: string; ts: Date; read: boolean }>>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);
  private storageKey = 'utp_notifications';

  constructor(){
    this.tour = inject(TourService);
    this.auth.loadFromStorage();
    this.perfilSrv.cargarPerfil();

    // Desbloquear audio al primer gesto del usuario (políticas de autoplay)
    try {
      document.addEventListener('click', () => {
        try {
          this.initAlertAudio();
          if (this.alertAudio) {
            const a = this.alertAudio;
            a.muted = true;
            a.play().then(() => {
              a.pause();
              a.currentTime = 0;
              a.muted = false;
            }).catch(() => {/* ignorar */});
          }
        } catch {}
      }, { once: true, passive: true } as any);
    } catch {}

    // Cargar notificaciones persistidas (para no perderlas al refrescar)
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const arr = JSON.parse(raw) as any[];
        const items = (arr || []).map(it => ({
          id: Number(it.id) || Date.now(),
          title: String(it.title || ''),
          body: String(it.body || ''),
          zonaNombre: it.zonaNombre ? String(it.zonaNombre) : undefined,
          estado: it.estado ? String(it.estado) : undefined,
          ts: it.ts ? new Date(it.ts) : new Date(),
          read: Boolean(it.read)
        }));
        this.notifications.set(items.slice(0, 50));
      }
    } catch {}
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

    // Conectar WS para notificaciones cuando el usuario esté autenticado
    effect(() => {
      // Conectar para cualquier usuario autenticado (todos los roles) y así al iniciar sesión cargar histórico.
      const shouldConnect = this.isAuthenticated();
      if (shouldConnect) {
        this.ensureWsConnected();
      }
    });

    // Persistir notificaciones ante cualquier cambio
    effect(() => {
      try {
        const items = this.notifications();
        localStorage.setItem(this.storageKey, JSON.stringify(items));
      } catch {}
    });
  }

  private initAlertAudio() {
    if (this.alertAudio) return;
    try {
      // WAV 8-bit mono ~0.25s beep (generado sintéticamente). Puedes reemplazar por otro.
      const base64 =
        'UklGRvQAAABXQVZFZm10IBAAAAABAAEAIlYAABAAAAACAAACaAgACAAACABkYXRhAAAAAP//AAD/\n' +
        'AAD/AAAA//8AAP//AAD/AAAA//8AAP//AAD/AAAA//8AAP//AAD/AAAA//8AAP//AAD/AAAA//8A\n' +
        'AP//AAD/AAAA//8AAP//AAD/AAAA//8AAAAA';
      this.alertAudio = new Audio('data:audio/wav;base64,' + base64.replace(/\n/g, ''));
      this.alertAudio.volume = 0.55; // volumen moderado
      this.alertAudio.preload = 'auto';
    } catch {}
  }

  private playAlertSound() {
    try {
      this.initAlertAudio();
      if (!this.alertAudio) return;
      // Clonar para permitir reproducción solapada si llegan varias seguidas
      const a = this.alertAudio.cloneNode(true) as HTMLAudioElement;
      void a.play().catch(() => {/* Silenciar fallo (autoplay policies) */});
    } catch {}
  }

  // Intenta establecer la conexión STOMP; reintenta si las librerías aún no están listas
  private ensureWsConnected(attempt = 0) {
    if (this.wsConnected || this.wsConnecting) return;
    const W: any = window as any;
    if (!W || !W.SockJS || !W.Stomp) {
      try { console.debug('[Navbar][WS] Libs not ready, attempt', attempt); } catch {}
      // Esperar a que carguen los scripts CDN
      if (attempt < 20) { // ~10s si el delay es 500ms
        setTimeout(() => this.ensureWsConnected(attempt + 1), 500);
      }
      return;
    }
    try {
      this.wsConnecting = true;
      try { console.debug('[Navbar][WS] Connecting...'); } catch {}
      const socket = new W.SockJS('http://localhost:8080/ws');
      const client = W.Stomp.over(socket);
      client.debug = () => {};
      client.connect({}, () => {
        try { console.info('[Navbar][WS] Connected and subscribed'); } catch {}
        this.wsClient = client;
        this.wsConnected = true;
        this.wsConnecting = false;
        client.subscribe('/topic/zone-status', (msg: any) => {
          try {
            const payload = JSON.parse(msg.body || '{}');
            try { console.info('[Navbar][WS] Message received', payload); } catch {}
            const zona = payload?.zona || {};
            // Ignorar mensajes sin texto (silenciosos) para no saturar
            if (payload?.message) {
              const item = {
                id: Date.now(),
                title: 'Cambio de estado de zona',
                body: payload.message,
                zonaNombre: zona?.nombre,
                estado: zona?.estado,
                ts: new Date(),
                read: false,
              };
              const next = [item, ...this.notifications()].slice(0, 50);
              this.notifications.set(next);
              // Reproducir sonido solo si rol es usuario (para no molestar a admin/seguridad) y hay interacción previa
              if (this.isUsuario() || this.isAdminAsUser()) {
                this.playAlertSound();
              }
            }
            window.dispatchEvent(new CustomEvent('zone-status-update', { detail: zona }));
          } catch {}
        });
      }, () => {
        // onError: reintentar con backoff ligero
        try { console.warn('[Navbar][WS] Connection error, retrying...'); } catch {}
        this.wsConnecting = false;
        this.wsConnected = false;
        setTimeout(() => this.ensureWsConnected(0), 1500);
      });
    } catch {
      try { console.warn('[Navbar][WS] Connect threw, retrying...', attempt); } catch {}
      this.wsConnecting = false;
      this.wsConnected = false;
      setTimeout(() => this.ensureWsConnected(attempt + 1), 1000);
    }
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


  openNotifications(){
    const newVal = !this.showNotifs();
    this.showNotifs.set(newVal);
    if (newVal) {
      // Marcar como leídas al abrir
      const marked = this.notifications().map(n => ({ ...n, read: true }));
      this.notifications.set(marked);
    }
  }
  reportar(){ /* TODO: modal de reporte */ }
  logout(){ this.auth.logout(); }
}
