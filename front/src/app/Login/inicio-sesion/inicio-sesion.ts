import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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

  // Señal para futura integración (ej: mostrar mensaje de error backend)
  backendError = signal<string | null>(null);

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
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
        // Futuro: decodificar token para rol y redirigir adecuadamente.
        this.router.navigate(['/superadmin/dashboard']);
        if (rememberMe) {
          // Podrías implementar lógica adicional para refresh tokens u otro almacenamiento.
        }
      },
      error: err => {
        this.loading = false;
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
