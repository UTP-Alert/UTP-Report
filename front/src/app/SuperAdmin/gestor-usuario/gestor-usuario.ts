import { Component, OnInit } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sede, SedeService } from '../../services/sede.service';
import { Zona, ZonaService } from '../../services/zona.service';
import { RegistroAdminDTO, RegistroDTO, RegistroSecurityDTO, UsuarioRolService } from '../../services/usuario-rol.service';

@Component({
  selector: 'app-gestor-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, KeyValuePipe],
  templateUrl: './gestor-usuario.html',
  styleUrl: './gestor-usuario.scss'
})
export class GestorUsuario implements OnInit {
  // Datos de apoyo
  sedes: Sede[] = [];
  zonas: Zona[] = [];

  // Estado UI
  isCreating = false;
  editingUser: any = null;
  showPassword = false;

  // Formulario
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

  // Configuración de roles para el select
  roleConfig: { [key: string]: { label: string; icon: string } } = {
    usuario: { label: 'Usuario', icon: 'fas fa-user' },
    admin: { label: 'Admin', icon: 'fas fa-user-shield' },
    seguridad: { label: 'Seguridad', icon: 'fas fa-user-tie' }
  };

  constructor(
    private sedeService: SedeService,
    private zonaService: ZonaService,
    private usuarioRolService: UsuarioRolService,
  ) {}

  ngOnInit(): void {
    this.cargarSedes();
    this.cargarZonas();
  }

  cargarSedes(): void {
    this.sedeService.obtenerSedes().subscribe({
      next: (data) => this.sedes = data,
      error: (err) => console.error('Error al cargar sedes', err)
    });
  }

  cargarZonas(): void {
    this.zonaService.obtenerZonas().subscribe({
      next: (data) => this.zonas = data,
      error: (err) => console.error('Error al cargar zonas', err)
    });
  }

  get filteredAvailableZones(): Zona[] {
    return this.zonas.filter(
      zone => !this.formData.assignedZones.some(z => z.id === zone.id)
    );
  }

  onRoleChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    this.formData.role = value;
    if (value !== 'seguridad') {
      this.formData.assignedZones = [];
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  handleAddZone(zoneId: string) {
    const zoneToAdd = this.zonas.find(z => z.id === Number(zoneId));
    if (zoneToAdd && !this.formData.assignedZones.some(z => z.id === zoneToAdd.id)) {
      this.formData.assignedZones.push(zoneToAdd);
    } else {
      alert('La zona ya está asignada o no es válida.');
    }
  }

  handleRemoveZone(zoneToRemove: Zona) {
    this.formData.assignedZones = this.formData.assignedZones.filter(
      z => z.id !== zoneToRemove.id
    );
  }

  onAddZoneChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const zoneToAddId = selectElement.value;
    this.handleAddZone(zoneToAddId);
    selectElement.value = '';
  }

  resetForm() {
    this.formData = {
      name: '', username: '', correo: '', password: '', phone: '', role: '', userType: '', campus: '', assignedZones: []
    } as any;
    this.formErrors = { name: '', username: '', correo: '', password: '', phone: '', role: '', userType: '', campus: '', assignedZones: '' };
  }

  validateForm(): boolean {
    let isValid = true;
    this.formErrors = { name: '', username: '', correo: '', password: '', phone: '', role: '', userType: '', campus: '', assignedZones: '' };

    if (!this.formData.name.trim()) { this.formErrors.name = 'El nombre completo es obligatorio.'; isValid = false; }
    if (!this.formData.username.trim()) { this.formErrors.username = 'El username es obligatorio.'; isValid = false; }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!this.formData.correo.trim()) { this.formErrors.correo = 'El correo es obligatorio.'; isValid = false; }
    else if (!emailRegex.test(this.formData.correo)) { this.formErrors.correo = 'Formato de correo inválido.'; isValid = false; }

    if (!this.formData.password) { this.formErrors.password = 'La contraseña es obligatoria.'; isValid = false; }
    else if (this.formData.password.length < 6) { this.formErrors.password = 'La contraseña debe tener al menos 6 caracteres.'; isValid = false; }

    const phoneRegex = /^\d{9}$/;
    if (!this.formData.phone.trim()) { this.formErrors.phone = 'El teléfono es obligatorio.'; isValid = false; }
    else if (!phoneRegex.test(this.formData.phone)) { this.formErrors.phone = 'Formato de teléfono inválido. Debe ser 9 dígitos numéricos (Ej: 999000000).'; isValid = false; }

    if (!this.formData.role) { this.formErrors.role = 'El rol es obligatorio.'; isValid = false; }
    if (!this.formData.campus) { this.formErrors.campus = 'La sede es obligatoria.'; isValid = false; }
    if (this.formData.role === 'usuario' && !this.formData.userType) { this.formErrors.userType = 'El tipo de usuario es obligatorio para el rol de Usuario.'; isValid = false; }
    if (this.formData.role === 'seguridad' && this.formData.assignedZones.length === 0) { this.formErrors.assignedZones = 'Debe asignar al menos una zona para el rol de Seguridad.'; isValid = false; }
    return isValid;
  }

  handleCreateUser() {
    if (!this.validateForm()) { alert('Por favor, corrija los errores del formulario.'); return; }
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
        next: (res: string) => { console.log('✅ Usuario creado:', res); alert(res); this.resetForm(); this.isCreating = false; },
        error: (err) => { console.error('❌ Error al registrar:', err); alert(err.error?.message || err.message || 'Error al registrar usuario'); }
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
        next: (res: string) => { console.log('✅ Admin creado:', res); alert(res); this.resetForm(); this.isCreating = false; },
        error: (err) => { console.error('❌ Error al registrar:', err); alert(err.error?.message || err.message || 'Error al registrar usuario'); }
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
        next: (res: string) => { console.log('✅ Seguridad creada:', res); alert(res); this.resetForm(); this.isCreating = false; },
        error: (err) => { console.error('❌ Error al registrar:', err); alert(err.error?.message || err.message || 'Error al registrar usuario'); }
      });
    } else {
      alert('Rol no válido. Por favor, seleccione un rol válido.');
    }
  }

  handleUpdateUser() {
    console.log('Updating user:', this.editingUser);
    this.editingUser = null;
    this.isCreating = false;
    this.resetForm();
  }
}
