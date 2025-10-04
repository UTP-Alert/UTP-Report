import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PerfilService, PerfilUsuario } from '../../services/perfil.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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

  // Señal para futura integración (ej: mostrar mensaje de error backend)
  backendError = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private perfilSrv: PerfilService,
    private toastr: ToastrService // Inject ToastrService
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }
  

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.submitted = true;
    this.backendError.set(null);
    if (this.form.invalid) return;

    this.loading = true;
    const { username, password, rememberMe } = this.form.value;
    this.auth.login(username, password).subscribe({
      next: res => {
        this.loading = false;
        
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
                this.toastr.error('Credenciales inválidas', 'Error'); // Error toast
        console.error('Error de login', err);
        const msg = err?.error?.message || 'Credenciales inválidas o error del servidor';
        this.backendError.set(msg);
      }
    });
  }

  onSOS() {
    // Placeholder: Aquí se puede abrir un modal o disparar una acción de emergencia cuando exista backend
    console.log('SOS accionado');
    alert('Señal SOS registrada (demo). Próximamente se conectará con el backend.');
  }

}
