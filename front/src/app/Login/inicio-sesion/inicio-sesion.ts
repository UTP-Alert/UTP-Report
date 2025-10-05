// Importa Component y signal de Angular core para definir el componente y manejar estados reactivos.
import { Component, signal } from '@angular/core';
// Importa FormBuilder, FormGroup, Validators y ReactiveFormsModule para trabajar con formularios reactivos.
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// Importa CommonModule para tener acceso a directivas comunes de Angular.
import { CommonModule } from '@angular/common';
// Importa AuthService para manejar la lógica de autenticación.
import { AuthService } from '../../services/auth.service';
// Importa PerfilService y PerfilUsuario para gestionar el perfil del usuario.
import { PerfilService, PerfilUsuario } from '../../services/perfil.service';
// Importa Router para la navegación programática.
import { Router } from '@angular/router';
// Importa ToastrService para mostrar notificaciones.
import { ToastrService } from 'ngx-toastr';

// Decorador @Component que define las propiedades de este componente.
@Component({
  selector: 'app-inicio-sesion', // El selector CSS para usar este componente.
  standalone: true, // Indica que este es un componente autónomo.
  imports: [CommonModule, ReactiveFormsModule], // Módulos que este componente utiliza.
  templateUrl: './inicio-sesion.html', // La ruta al archivo de plantilla HTML.
  styleUrl: './inicio-sesion.scss' // La ruta al archivo de estilos SCSS.
})
// Clase del componente de inicio de sesión.
export class InicioSesion {
  form: FormGroup; // Formulario reactivo para las credenciales de inicio de sesión.
  submitted = false; // Bandera para indicar si el formulario ha sido enviado.
  loading = false; // Bandera para indicar si la petición de login está en curso.
  showPassword = false; // Bandera para controlar la visibilidad de la contraseña.
  perfil: PerfilUsuario | null = null; // Almacena el perfil del usuario autenticado.

  // Señal para mostrar mensajes de error provenientes del backend.
  backendError = signal<string | null>(null);

  // Constructor del componente, inyecta los servicios necesarios.
  constructor(
    private fb: FormBuilder, // Servicio para construir formularios.
    private auth: AuthService, // Servicio de autenticación.
    private router: Router, // Servicio de enrutamiento.
    private perfilSrv: PerfilService, // Servicio para gestionar el perfil.
    private toastr: ToastrService // Servicio para mostrar notificaciones toast.
  ) {
    // Inicializa el formulario con campos de usuario, contraseña y "recordarme".
    this.form = this.fb.group({
      username: ['', [Validators.required]], // Campo de usuario, requerido.
      password: ['', [Validators.required]], // Campo de contraseña, requerido.
      rememberMe: [false] // Campo para recordar sesión, por defecto falso.
    });
  }

  /**
   * Alterna la visibilidad de la contraseña en el campo de entrada.
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Maneja el envío del formulario de inicio de sesión.
   */
  onSubmit() {
    this.submitted = true; // Marca el formulario como enviado.
    this.backendError.set(null); // Limpia cualquier error previo del backend.
    if (this.form.invalid) return; // Si el formulario es inválido, no procede.

    this.loading = true; // Activa el estado de carga.
    const { username, password, rememberMe } = this.form.value; // Obtiene los valores del formulario.

    // Llama al servicio de autenticación para iniciar sesión.
    this.auth.login(username, password).subscribe({
      next: res => {
        this.loading = false; // Desactiva el estado de carga.

        const roles = res.roles || []; // Obtiene los roles del usuario.
        // Redirige según el rol del usuario.
        if (roles.includes('ROLE_SUPERADMIN')) {
          this.toastr.success('Login exitoso', 'Éxito');
          this.toastr.success('Bienvenido al Dashboard de Super Administrador', 'Éxito');
          this.router.navigate(['/superadmin/dashboard'], { replaceUrl: true });
        } else if (roles.includes('ROLE_ADMIN')) {
          // Si es administrador, primero se le lleva a la página de selección de rol.
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
          // Redirección por defecto si el rol no es reconocido.
          this.router.navigate(['/login'], { replaceUrl: true });
        }
        // Intenta cargar el perfil del usuario.
        this.perfilSrv.cargarPerfil();
        if (rememberMe) {
          // Lógica para manejar el "recordarme" (ej. refresh token).
        }
      },
      error: err => {
        this.loading = false; // Desactiva el estado de carga.
        this.toastr.error('Credenciales inválidas', 'Error'); // Muestra notificación de error.
        console.error('Error de login', err); // Log del error en consola.
        // Extrae el mensaje de error del backend o usa un mensaje genérico.
        const msg = err?.error?.message || 'Credenciales inválidas o error del servidor';
        this.backendError.set(msg); // Establece el mensaje de error para mostrar en la UI.
      }
    });
  }

  /**
   * Maneja la acción de "SOS" (placeholder para funcionalidad de emergencia).
   */
  onSOS() {
    console.log('SOS accionado');
    alert('Señal SOS registrada (demo). Próximamente se conectará con el backend.');
  }
}
