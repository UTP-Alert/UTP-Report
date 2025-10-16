import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PerfilService, PerfilUsuario } from '../../services/perfil.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { timeout } from 'rxjs/operators';
import { TimeService } from '../../services/time.service';

@Component({
  selector: 'app-inicio-sesion',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.scss'
})
export class InicioSesion implements OnInit, OnDestroy {
  form: FormGroup;
  submitted = false;
  loading = false;
  loadingTimeout: any = null; // Para feedback visual si la API tarda
  showPassword = false;
  perfil : PerfilUsuario | null = null;
  // Bloqueo por intentos fallidos
  isLocked = false;
  lockUntilTs: number | null = null;
  lockTimer: any = null;
  // Objetivo de reloj monotónico para el conteo, cuando no hay hora de servidor
  lockPerfTarget: number | null = null;
  lockDisplay = signal<string>('');
  lockedUsername: string | null = null; // username al que aplica el bloqueo actual en UI
  lastAttemptUsername: string | null = null;

  // Señal para futura integración (ej: mostrar mensaje de error backend)
  backendError = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private perfilSrv: PerfilService,
    private toastr: ToastrService, // Inject ToastrService
    public timeService: TimeService
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(19)]],
      password: ['', [Validators.required, Validators.maxLength(12)]],
      rememberMe: [false]
    });
  }
  
  ngOnInit() {
    // Reaccionar al cambio de username para aplicar el bloqueo por-usuario
    this.form.get('username')?.valueChanges.subscribe((val: string) => {
      const uname = (val || '').trim().toLowerCase();
      // Truncado defensivo a 19 caracteres
      if (val && String(val).length > 19) {
        const sliced = String(val).slice(0, 19);
        this.form.get('username')?.setValue(sliced, { emitEvent: false });
      }
      this.updateLockStateForUsername(uname);
    });
    // Inicializar con el valor actual (si lo hay)
    const initialUname = (this.form.get('username')?.value || '').trim().toLowerCase();
    this.updateLockStateForUsername(initialUname);
  }
  
  ngOnDestroy() {
    // Asegurar limpieza del intervalo al destruir el componente
    if (this.lockTimer) {
      try { clearInterval(this.lockTimer); } catch {}
      this.lockTimer = null;
    }
  }
  

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.submitted = true;
    this.backendError.set(null);
    // Truncados defensivos antes de enviar
    const uCtrl = this.form.get('username');
    const pCtrl = this.form.get('password');
    if (uCtrl && typeof uCtrl.value === 'string' && uCtrl.value.length > 19) {
      uCtrl.setValue(uCtrl.value.slice(0, 19));
    }
    if (pCtrl && typeof pCtrl.value === 'string' && pCtrl.value.length > 12) {
      pCtrl.setValue(pCtrl.value.slice(0, 12));
    }
    const currentUname = (this.form.get('username')?.value || '').trim().toLowerCase();
    this.lastAttemptUsername = currentUname;
    // Si el usuario actual está bloqueado según almacenamiento, no enviamos solicitud
    if (this.isLocked) return; // el botón ya estará deshabilitado, redundante
    if (this.form.invalid) return;

    this.loading = true;
    // Si la API tarda más de 3s, mostrar mensaje de espera
    if (this.loadingTimeout) { clearTimeout(this.loadingTimeout); }
    this.loadingTimeout = setTimeout(() => {
      if (this.loading) {
        this.backendError.set('El servidor está tardando en responder...');
      }
    }, 3000);

    const { username, password, rememberMe } = this.form.value;
    this.auth.login(username, password).pipe(
      timeout(10000) // 10 segundos máximo de espera
    ).subscribe({
      next: res => {
        this.loading = false;
        if (this.loadingTimeout) { clearTimeout(this.loadingTimeout); this.loadingTimeout = null; }
        this.backendError.set(null);
        // limpiar bloqueo persistido si existiera para este usuario
        const uname = (this.form.get('username')?.value || '').trim().toLowerCase();
        this.clearLockCountdown(uname);
        const roles = res.roles || [];
        if (roles.includes('ROLE_SUPERADMIN')) {
          this.toastr.success('Login exitoso', 'Éxito');
          this.toastr.success('Bienvenido al Dashboard de Super Administrador', 'Éxito');
          this.router.navigate(['/superadmin/dashboard'], { replaceUrl: true });
        } else if (roles.includes('ROLE_ADMIN')) {
          this.router.navigate(['/select-role'], { replaceUrl: true });
        } else if (roles.includes('ROLE_SEGURIDAD')) {
          this.toastr.success('Login exitoso', 'Éxito');
          this.toastr.success('Bienvenido al Dashboard de Seguridad', 'Éxito');
          this.router.navigate(['/seguridad'], { replaceUrl: true });
        } else if (roles.includes('ROLE_USUARIO')) {
          this.toastr.success('Login exitoso', 'Éxito');
          this.toastr.success('Bienvenido al área de Usuario', 'Éxito');
          this.router.navigate(['/usuario'], { replaceUrl: true });
        } else {
          this.router.navigate(['/login'], { replaceUrl: true });
        }
        this.perfilSrv.cargarPerfil();
        if (rememberMe) {
          // Espacio para refresh token
        }
      },
      error: err => {
        this.loading = false;
        if (this.loadingTimeout) { clearTimeout(this.loadingTimeout); this.loadingTimeout = null; }
        const status = err?.status;
        const body = err?.error;
        if (err.name === 'TimeoutError') {
          this.backendError.set('El servidor no responde. Intenta de nuevo más tarde.');
          this.toastr.error('El servidor no responde', 'Error');
          return;
        }
        // Manejar bloqueo (403 con mensaje de "bloqueada")
        if (status === 403 && typeof body === 'string' && body.toLowerCase().includes('bloqueada')) {
          const uname = this.lastAttemptUsername || (this.form.get('username')?.value || '').trim().toLowerCase();
          this.handleLockFromBackend(body, uname);
        } else {
          // Errores 401 u otros
          const msg = typeof body === 'string' && body ? body : 'Credenciales inválidas o error del servidor';
          this.backendError.set(msg);
          this.toastr.error('Credenciales inválidas', 'Error');
        }
        console.error('Error de login', err);
      }
    });
  }

  onSOS() {
    // Placeholder: Aquí se puede abrir un modal o disparar una acción de emergencia cuando exista backend
    console.log('SOS accionado');
    alert('Señal SOS registrada (demo). Próximamente se conectará con el backend.');
  }

}

// Métodos de bloqueo
export interface CountdownParts { mm: string; ss: string; }

export class CountdownUtil {
  static formatMMSS(totalSeconds: number): CountdownParts {
    const sec = Math.max(0, Math.floor(totalSeconds));
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    return { mm, ss };
  }
}

// Extiende la clase con helpers (dentro del mismo archivo por simplicidad)
export interface InicioSesion {
  startLockCountdown(untilTs: number, username: string): void;
  clearLockCountdown(username?: string): void;
  handleLockFromBackend(message: string, username: string): void;
  updateLockStateForUsername(username: string): void;
  syncServerTime(): Promise<void>;
  getServerNow(): number;
}

InicioSesion.prototype.handleLockFromBackend = function(message: string, username: string) {
  // Buscar "después de X minutos"
  const regex = /(despu[eé]s de\s+)(\d+)(\s+minutos?)/i;
  const m = message.match(regex);
  const minutes = m ? Number(m[2]) : 15;
  const mins = isFinite(minutes) ? minutes : 15;
  // Obtener hora real del servidor para calcular el "until"
  this.syncServerTime().then(() => {
    // Alinear al siguiente segundo para que el contador arranque en mm:00
    const now = this.getServerNow();
    const nextSecondBoundary = Math.ceil(now / 1000) * 1000;
    const until = nextSecondBoundary + mins * 60 * 1000;
    const key = `ur_lock_until_server:${username}`;
    try { localStorage.setItem(key, String(until)); } catch {}
    this.startLockCountdown(until, username);
    this.backendError.set(null);
  }).catch(() => {
    // Fallback: si no se pudo obtener del servidor, usar reloj local (backend igual protege)
    const nowLocal = Date.now();
    const nextSecondBoundary = Math.ceil(nowLocal / 1000) * 1000;
    const until = nextSecondBoundary + mins * 60 * 1000;
    const key = `ur_lock_until_server:${username}`;
    try { localStorage.setItem(key, String(until)); } catch {}
    this.startLockCountdown(until, username);
    this.backendError.set(null);
  });
};

InicioSesion.prototype.startLockCountdown = function(untilTs: number, username: string) {
  this.isLocked = true;
  this.lockUntilTs = untilTs;
  this.lockedUsername = username;
  // Inicializar objetivo monotónico como respaldo contra cambios del reloj del sistema
  try {
    const pnow = (typeof performance !== 'undefined' && performance.now) ? performance.now() : null;
    if (pnow !== null) {
      const nowSrv = this.getServerNow();
      const duration = Math.max(0, untilTs - nowSrv);
      this.lockPerfTarget = pnow + duration;
    } else {
      this.lockPerfTarget = null;
    }
  } catch { this.lockPerfTarget = null; }
  const key = `ur_lock_until_server:${username}`;
  try { localStorage.setItem(key, String(untilTs)); } catch {}
  const tick = () => {
    if (!this.lockUntilTs) return;
    // Preferir hora de servidor (monotónica). Como respaldo, usar objetivo basado en performance.now.
    let remainingMs: number;
    if (__hasServerBase) {
      const nowSrv = this.getServerNow();
      remainingMs = this.lockUntilTs - nowSrv;
    } else if (this.lockPerfTarget !== null && typeof performance !== 'undefined' && performance.now) {
      remainingMs = this.lockPerfTarget - performance.now();
    } else {
      // último recurso
      remainingMs = this.lockUntilTs - Date.now();
    }
    // Usar ceil para que arranque en 15:00, no en 14:59
    const remainingSec = Math.ceil(remainingMs / 1000);
    if (remainingSec <= 0) {
      this.clearLockCountdown();
      this.backendError.set(null);
      return;
    }
    const { mm, ss } = CountdownUtil.formatMMSS(remainingSec);
    this.lockDisplay.set(`Tu cuenta está bloqueada. Podrás intentar de nuevo en ${mm}:${ss}.`);
  };
  if (this.lockTimer) { try { clearInterval(this.lockTimer); } catch {}}
  tick();
  this.lockTimer = setInterval(tick, 1000);
};

InicioSesion.prototype.clearLockCountdown = function(username?: string) {
  this.isLocked = false;
  this.lockUntilTs = null;
  this.lockPerfTarget = null;
  this.lockDisplay.set('');
  const uname = (username || this.lockedUsername || '').trim().toLowerCase();
  if (uname) { try { localStorage.removeItem(`ur_lock_until_server:${uname}`); } catch {} }
  if (this.lockTimer) { try { clearInterval(this.lockTimer); } catch {} }
  this.lockTimer = null;
  this.lockedUsername = null;
};

// Sync con hora del servidor utilizando reloj monotónico (performance.now)
// para ser robustos ante cambios del reloj del sistema del cliente.
let __serverBaseMs = 0;       // Marca de tiempo del servidor en el último sync
let __serverBasePerf = 0;     // performance.now() en el momento del último sync
let __hasServerBase = false;  // Indica si ya tenemos una referencia válida
let __lastSyncPerf = 0;       // Para resincronizar cada cierto tiempo
const __MAX_LOCK_MS = 16 * 60 * 1000; // 16 minutos como cota de seguridad

InicioSesion.prototype.syncServerTime = function(): Promise<void> {
  return new Promise((resolve, reject) => {
    this.timeService.getServerDateTime().subscribe({
      next: (date) => {
        const serverMs = date.getTime();
        const pnow = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        __serverBaseMs = serverMs;
        __serverBasePerf = pnow;
        __lastSyncPerf = pnow;
        __hasServerBase = true;
        resolve();
      },
      error: _ => reject()
    });
  });
};

InicioSesion.prototype.getServerNow = function(): number {
  // Si no hay base aún, usar Date.now() como aproximación inicial
  const pnow = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  if (!__hasServerBase) return Date.now();

  // Estimar ahora del servidor con reloj monotónico
  const estimate = __serverBaseMs + (pnow - __serverBasePerf);

  // Re-sync ligero cada ~20s según reloj monotónico (no afectado por cambios de fecha)
  if (!__lastSyncPerf || (pnow - __lastSyncPerf) > 20000) {
    __lastSyncPerf = pnow;
    // Best-effort (no bloqueante)
    this.timeService.getServerDateTime().subscribe({
      next: (date) => {
        const sMs = date.getTime();
        const pn = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        __serverBaseMs = sMs;
        __serverBasePerf = pn;
        __lastSyncPerf = pn;
        __hasServerBase = true;
      },
      error: _ => {}
    });
  }
  return estimate;
};

InicioSesion.prototype.updateLockStateForUsername = function(username: string) {
  const uname = (username || '').trim().toLowerCase();
  // Limpiar cualquier contador previo
  if (this.lockTimer) { try { clearInterval(this.lockTimer); } catch {} }
  this.lockTimer = null;
  this.isLocked = false;
  this.lockDisplay.set('');
  this.lockedUsername = null;
  this.lockUntilTs = null;
  if (!uname) return;
  const key = `ur_lock_until_server:${uname}`;
  const stored = localStorage.getItem(key);
  if (!stored) return;
  const until = Number(stored);
  if (Number.isNaN(until)) return;
  this.syncServerTime().then(() => {
    const nowSrv = this.getServerNow();
    const remaining = until - nowSrv;
    if (remaining <= 0) { try { localStorage.removeItem(key); } catch {} ; return; }
    // Sanitizar valores fuera de rango (probablemente creados cuando el reloj local se cambió)
    if (remaining > __MAX_LOCK_MS) { try { localStorage.removeItem(key); } catch {} ; return; }
    this.startLockCountdown(until, uname);
  }).catch(() => {
    // Si falla el sync, intentar con reloj local (fallback)
    const remainingLocal = until - Date.now();
    if (remainingLocal <= 0) { try { localStorage.removeItem(key); } catch {} ; return; }
    if (remainingLocal > __MAX_LOCK_MS) { try { localStorage.removeItem(key); } catch {} ; return; }
    this.startLockCountdown(until, uname);
  });
};
