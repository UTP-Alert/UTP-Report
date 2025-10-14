import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PerfilService, PerfilUsuario } from '../../services/perfil.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TimeService } from '../../services/time.service';

@Component({
  selector: 'app-inicio-sesion',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.scss'
})
export class InicioSesion {
  form: FormGroup;
  submitted = false;
  loading = false;
  showPassword = false;
  perfil : PerfilUsuario | null = null;
  // Bloqueo por intentos fallidos
  isLocked = false;
  lockUntilTs: number | null = null;
  lockTimer: any = null;
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
    const { username, password, rememberMe } = this.form.value;
    this.auth.login(username, password).subscribe({
      next: res => {
        this.loading = false;
  // limpiar bloqueo persistido si existiera para este usuario
  const uname = (this.form.get('username')?.value || '').trim().toLowerCase();
  this.clearLockCountdown(uname);
        
        const roles = res.roles || [];
        if (roles.includes('ROLE_SUPERADMIN')) {
                  this.toastr.success('Login exitoso', 'Éxito'); // Success toast

          this.toastr.success('Bienvenido al Dashboard de Super Administrador', 'Éxito'); // Dashboard entry toast



         
          this.router.navigate(['/superadmin/dashboard'], { replaceUrl: true });
        } else if (roles.includes('ROLE_ADMIN')) {
          // Administrador: primero elige rol
          
          this.router.navigate(['/select-role'], { replaceUrl: true });
        } else if (roles.includes('ROLE_SEGURIDAD')) {
          this.toastr.success('Login exitoso', 'Éxito'); // Success toast

          this.toastr.success('Bienvenido al Dashboard de Seguridad', 'Éxito'); // Dashboard entry toast
          this.router.navigate(['/seguridad'], { replaceUrl: true });
        } else if (roles.includes('ROLE_USUARIO')) {
          this.toastr.success('Login exitoso', 'Éxito'); // Success toast

          this.toastr.success('Bienvenido al área de Usuario', 'Éxito'); // Dashboard entry toast
          this.router.navigate(['/usuario'], { replaceUrl: true });
        } else {
          // fallback
          this.router.navigate(['/login'], { replaceUrl: true });
        }
        // Intentar cargar perfil (si el backend permite inmediatamente)
        this.perfilSrv.cargarPerfil();
        if (rememberMe) {
          // Espacio para refresh token
        }
      },
      error: err => {
        this.loading = false;
        const status = err?.status;
        const body = err?.error;
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
    const until = this.getServerNow() + mins * 60 * 1000;
    const key = `ur_lock_until_server:${username}`;
    try { localStorage.setItem(key, String(until)); } catch {}
    this.startLockCountdown(until, username);
    this.backendError.set(null);
  }).catch(() => {
    // Fallback: si no se pudo obtener del servidor, usar reloj local (backend igual protege)
    const until = Date.now() + mins * 60 * 1000;
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
  const key = `ur_lock_until_server:${username}`;
  try { localStorage.setItem(key, String(untilTs)); } catch {}
  const tick = () => {
    if (!this.lockUntilTs) return;
    const nowSrv = this.getServerNow();
    const remainingMs = this.lockUntilTs - nowSrv;
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
  this.lockDisplay.set('');
  const uname = (username || this.lockedUsername || '').trim().toLowerCase();
  if (uname) { try { localStorage.removeItem(`ur_lock_until_server:${uname}`); } catch {} }
  if (this.lockTimer) { try { clearInterval(this.lockTimer); } catch {} }
  this.lockTimer = null;
  this.lockedUsername = null;
};

// Sync con hora del servidor y cálculo de offset
let __serverOffsetMs = 0; // serverNow - Date.now()
InicioSesion.prototype.syncServerTime = function(): Promise<void> {
  return new Promise((resolve, reject) => {
    this.timeService.getServerDateTime().subscribe({
      next: (date) => {
        const serverMs = date.getTime();
        __serverOffsetMs = serverMs - Date.now();
        resolve();
      },
      error: _ => reject()
    });
  });
};

InicioSesion.prototype.getServerNow = function(): number {
  // Re-sync ligero cada ~20 segundos para evitar manipulación del reloj local
  const lastSync = Number(localStorage.getItem('ur_lock_last_sync') || '0');
  const now = Date.now();
  if (!lastSync || now - lastSync > 20000) {
    localStorage.setItem('ur_lock_last_sync', String(now));
    // Best-effort (no bloqueante)
    this.timeService.getServerDateTime().subscribe({
      next: (date) => { __serverOffsetMs = date.getTime() - Date.now(); },
      error: _ => {}
    });
  }
  return Date.now() + __serverOffsetMs;
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
    if (until > nowSrv) {
      this.startLockCountdown(until, uname);
    } else {
      try { localStorage.removeItem(key); } catch {}
    }
  }).catch(() => {
    // Si falla el sync, intentar con reloj local (fallback)
    if (until > Date.now()) this.startLockCountdown(until, uname);
    else { try { localStorage.removeItem(key); } catch {} }
  });
};
