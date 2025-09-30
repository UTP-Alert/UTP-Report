import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor(private fb: FormBuilder) {
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
    // Placeholder: Aquí se integrará con el backend (Spring Boot) cuando existan endpoints
    console.log('Login attempt', { username, password: '***', rememberMe });
    // Simulación de retardo
    setTimeout(() => {
      this.loading = false;
      // TODO: Reemplazar por navegación según rol cuando backend devuelva datos
    }, 800);
  }

  onSOS() {
    // Placeholder: Aquí se puede abrir un modal o disparar una acción de emergencia cuando exista backend
    console.log('SOS accionado');
    alert('Señal SOS registrada (demo). Próximamente se conectará con el backend.');
  }

}
