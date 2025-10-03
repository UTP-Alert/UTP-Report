import { Component, OnInit } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common'; // Import CommonModule and KeyValuePipe
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { RegistroAdminDTO, RegistroDTO, RegistroSecurityDTO, UsuarioRolService } from '../../services/usuario-rol.service';
import { Sede, SedeService } from '../../services/sede.service';
import { Zona, ZonaService } from '../../services/zona.service';

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

  userName: string = 'Super Admin User';
  userRole: string = 'Super Admin';
  isSessionActive: boolean = true;

  isCreating: boolean = false;
  editingUser: any = null;
  isMobileMenuOpen: boolean = false;

  // -------------------------------
  // 🔹 2. Constructor e inicialización
  // -------------------------------
  constructor(
    private usuarioRolService: UsuarioRolService,
    private sedeService: SedeService,
    private zonaService: ZonaService
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

  // -------------------------------
  // 🔹 8. Utilidades generales
  // -------------------------------
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleSession() {
    this.isSessionActive = !this.isSessionActive;
  }
}
