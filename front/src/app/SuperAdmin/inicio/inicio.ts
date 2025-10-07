import { Component, OnInit } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common'; // Import CommonModule and KeyValuePipe
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { RegistroAdminDTO, RegistroDTO, RegistroSecurityDTO, UsuarioRolService } from '../../services/usuario-rol.service';
import { Sede, SedeService } from '../../services/sede.service';
import { Zona, ZonaService } from '../../services/zona.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, KeyValuePipe], // Add KeyValuePipe here
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss'
})
export class Inicio implements OnInit {
  // -------------------------------
  // 🔹 1. Variables de datos
  // -------------------------------
  sedes: Sede[] = [];
  zonas: Zona[] = [];

  isSessionActive: boolean = true;

  isCreating: boolean = false;
  editingUser: any = null;
  showPassword = false; // New property for password visibility

  // -------------------------------
  // 🔹 2. Constructor e inicialización
  // -------------------------------
  constructor(
    private usuarioRolService: UsuarioRolService,
    private sedeService: SedeService,
    private zonaService: ZonaService,
    private auth: AuthService,
  ) { }
  ngOnInit(): void {
    
    this.cargarSedes();
    this.cargarZonas();
  }


  cargarSedes(): void {
    this.sedeService.obtenerSedes().subscribe({
      next: (data) => {
        this.sedes = data;
        console.log('Sedes cargadas:', this.sedes);
      },
      error: (err) => console.error('Error al cargar sedes', err)
    });
  }

  cargarZonas(): void {
    this.zonaService.obtenerZonas().subscribe({
      next: (data) => {
        this.zonas = data;
        console.log('Zonas cargadas:', this.zonas);
      },
      error: (err) => console.error('Error al cargar zonas', err)
    });
  }

  // -------------------------------
  // 🔹 3. Formulario de usuario
  // -------------------------------
  formData = {
    name: '',
    username: '',
    correo: '',
    password: '',
    phone: '',
    role: '',
    userType: '',
    campus: '',
    assignedZones: [] as Zona[]
  };

  formErrors = {
    name: '',
    username: '',
    correo: '',
    password: '',
    phone: '',
    role: '',
    userType: '',
    campus: '',
    assignedZones: ''
  };

  resetForm() {
    this.formData = {
      name: '',
      username: '',
      correo: '',
      password: '',
      phone: '',
      role: '',
      userType: '',
      campus: '',
      assignedZones: [] as Zona[]
    };
    this.formErrors = {
      name: '',
      username: '',
      correo: '',
      password: '',
      phone: '',
      role: '',
      userType: '',
      campus: '',
      assignedZones: ''
    };
  }

  validateForm(): boolean {
    let isValid = true;
    // Reset errors
    this.formErrors = {
      name: '',
      username: '',
      correo: '',
      password: '',
      phone: '',
      role: '',
      userType: '',
      campus: '',
      assignedZones: ''
    };

    // Name validation
    if (!this.formData.name.trim()) {
      this.formErrors.name = 'El nombre completo es obligatorio.';
      isValid = false;
    }

    // Username validation
    if (!this.formData.username.trim()) {
      this.formErrors.username = 'El username es obligatorio.';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!this.formData.correo.trim()) {
      this.formErrors.correo = 'El correo es obligatorio.';
      isValid = false;
    } else if (!emailRegex.test(this.formData.correo)) {
      this.formErrors.correo = 'Formato de correo inválido.';
      isValid = false;
    }

    // Password validation
    if (!this.formData.password) {
      this.formErrors.password = 'La contraseña es obligatoria.';
      isValid = false;
    } else if (this.formData.password.length < 6) {
      this.formErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
      isValid = false;
    }

    // Phone validation (exactly 9 digits)
    const phoneRegex = /^\d{9}$/; // Accepts exactly 9 digits
    if (!this.formData.phone.trim()) {
      this.formErrors.phone = 'El teléfono es obligatorio.';
      isValid = false;
    } else if (!phoneRegex.test(this.formData.phone)) {
      this.formErrors.phone = 'Formato de teléfono inválido. Debe ser 9 dígitos numéricos (Ej: 999000000).';
      isValid = false;
    }

    // Role validation
    if (!this.formData.role) {
      this.formErrors.role = 'El rol es obligatorio.';
      isValid = false;
    }

    // Campus validation
    if (!this.formData.campus) {
      this.formErrors.campus = 'La sede es obligatoria.';
      isValid = false;
    }

    // UserType validation (only for 'usuario' role)
    if (this.formData.role === 'usuario' && !this.formData.userType) {
      this.formErrors.userType = 'El tipo de usuario es obligatorio para el rol de Usuario.';
      isValid = false;
    }

    // Assigned Zones validation (only for 'seguridad' role)
    if (this.formData.role === 'seguridad' && this.formData.assignedZones.length === 0) {
      this.formErrors.assignedZones = 'Debe asignar al menos una zona para el rol de Seguridad.';
      isValid = false;
    }

    return isValid;
  }

  // -------------------------------
  // 🔹 4. Configuración de roles
  // -------------------------------
  roleConfig: { [key: string]: { label: string; icon: string } } = {
    usuario: { label: 'Usuario', icon: 'fas fa-user' },
    admin: { label: 'Admin', icon: 'fas fa-user-shield' },
    seguridad: { label: 'Seguridad', icon: 'fas fa-user-tie' }
  };

  onRoleChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    this.formData.role = value;
    if (value !== 'seguridad') {
      this.formData.assignedZones = [];
    }
  }

  // -------------------------------
  // 🔹 5. Gestión de zonas
  // -------------------------------

  // Nueva variable para mantener el valor seleccionado en el select
  zonasDisponibles: Zona[] = [];
  //selectedZoneId: string = '';

  // Método para agregar zona
  handleAddZone(zoneId: string) {
    const zoneToAdd = this.zonas.find(z => z.id === Number(zoneId));
    if (zoneToAdd && !this.formData.assignedZones.some(z => z.id === zoneToAdd.id)) {
      this.formData.assignedZones.push(zoneToAdd);
      // ❌ REMOVER: this.selectedZoneId = ''; // Resetear el valor seleccionado en el select
    } else {
      alert('La zona ya está asignada o no es válida.');
    }
  }




  // Método para remover zona
  handleRemoveZone(zoneToRemove: Zona) {
    this.formData.assignedZones = this.formData.assignedZones.filter(
      z => z.id !== zoneToRemove.id
    );
  }



  // Evento de select para agregar zona
  onAddZoneChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const zoneToAddId = selectElement.value;

    // 1. Llama a la lógica de agregar zona con el valor obtenido del select
    this.handleAddZone(zoneToAddId);

    // 2. 🔑 SOLUCIÓN: Resetear el valor seleccionado en el elemento <select>
    // Esto obliga al select a mostrar el <option value="" disabled selected> nuevamente
    selectElement.value = '';
  }





  // Zonas disponibles filtradas que no están asignadas
  get filteredAvailableZones(): Zona[] {
    return this.zonas.filter(
      zone => !this.formData.assignedZones.some(z => z.id === zone.id)
    );
  }


  // -------------------------------
  // 🔹 6. Crear usuario
  // -------------------------------
  handleCreateUser() {
    if (!this.validateForm()) {
      alert('Por favor, corrija los errores del formulario.');
      return;
    }

    const { role } = this.formData;

    if (role === 'usuario') {
      const dto: RegistroDTO = {
        nombreCompleto: this.formData.name,
        username: this.formData.username,
        correo: this.formData.correo,
        password: this.formData.password,
        tipoUsuario: this.formData.userType.toUpperCase(),
        telefono: this.formData.phone,
        sedeId: Number(this.formData.campus)
      };

      this.usuarioRolService.registrarUsuario(dto).subscribe({
        next: (res: string) => {
          console.log('✅ Usuario creado:', res);
          alert(res);
          this.resetForm();
          this.isCreating = false;
        },
        error: (err) => {
          console.error('❌ Error al registrar:', err);
          alert(err.error?.message || err.message || 'Error al registrar usuario');
        }
      });

    } else if (role === 'admin') {
      const dto: RegistroAdminDTO = {
        nombreCompleto: this.formData.name,
        username: this.formData.username,
        correo: this.formData.correo,
        password: this.formData.password,
        telefono: this.formData.phone,
        sedeId: Number(this.formData.campus)
      };

      this.usuarioRolService.registrarAdmin(dto).subscribe({
        next: (res: string) => {
          console.log('✅ Admin creado:', res);
          alert(res);
          this.resetForm();
          this.isCreating = false;
        },
        error: (err) => {
          console.error('❌ Error al registrar:', err);
          alert(err.error?.message || err.message || 'Error al registrar usuario');
        }
      });

    } else if (role === 'seguridad') {
      const dto: RegistroSecurityDTO = {
        nombreCompleto: this.formData.name,
        username: this.formData.username,
        correo: this.formData.correo,
        password: this.formData.password,
        telefono: this.formData.phone,
        sedeId: Number(this.formData.campus),
        zonaIds: this.formData.assignedZones.map(z => z.id)
      };
      this.usuarioRolService.registrarSecurity(dto).subscribe({
        next: (res: string) => {
          //quiero formdata
          console.log('Form Data:', this.formData);



          console.log('✅ Seguridad creada:', res);
          alert(res);
          this.resetForm();
          this.isCreating = false;
        }
        , error: (err) => {
          console.error('❌ Error al registrar:', err);
          alert(err.error?.message || err.message || 'Error al registrar usuario');
        }
      });


    } else {
      alert('Rol no válido. Por favor, seleccione un rol válido.');
    }
  }

  // -------------------------------
  // 🔹 7. update user
  // -------------------------------

  handleUpdateUser() {
    console.log('Updating user:', this.editingUser);
    this.editingUser = null;
    this.isCreating = false;
    this.resetForm();
  }


  //logout
  logout(){ this.auth.logout(); }

  // -------------------------------
  // 🔹 8. Utilidades generales
  // -------------------------------
  toggleSession() {
    this.isSessionActive = !this.isSessionActive;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


}
