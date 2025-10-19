import { Component, OnInit } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sede, SedeService } from '../../services/sede.service';
import { Zona, ZonaService } from '../../services/zona.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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

  // Flags para controlar autogeneración y bloqueo de edición
  isUsernameAuto = false;
  isCorreoAuto = false;

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
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.cargarSedes();
    this.cargarZonas();
  }

  // Abrir formulario de creación: limpiar y generar código según rol seleccionado
  async openCreate() {
    this.resetForm();
    // Por defecto asumimos que se va a crear un 'usuario' (alumno) si el admin no selecciona rol
    this.formData.role = 'usuario';
    this.isCreating = true;
    await this.generateCodeForRole();
  }

  // Genera código y correo según rol y actualiza flags
  async generateCodeForRole() {
    const role = this.formData.role || 'usuario';
    // Normalizamos el prefijo por rol
    let prefix = 'U';
    if (role === 'usuario') {
      // si es usuario, distinguir por userType (alumno/ docente)
      if (this.formData.userType === 'docente') prefix = 'C'; else prefix = 'U';
    } else if (role === 'admin') prefix = 'D';
    else if (role === 'seguridad') prefix = 'S';

    // Calcular siguiente secuencia a partir de usuarios existentes
    try {
      const year = new Date().getFullYear();
      const usuarios: any[] | undefined = await firstValueFrom(this.http.get<any[]>('http://localhost:8080/api/usuarios'));
      const list = (usuarios || []).map(u => (u.username || '').toUpperCase());

      let code = '';

      if (role === 'seguridad') {
        // Seguridad: formato SNNN (sin año), secuencia padded 3
        const keyPrefix = 'S';
        const existing = list.filter(u => u.startsWith(keyPrefix));
        const seqs = existing.map(u => {
          const rest = u.slice(keyPrefix.length);
          const num = Number(rest);
          return Number.isFinite(num) ? num : 0;
        });
        const max = seqs.length ? Math.max(...seqs) : 0;
        const next = max + 1;
        const seqStr = String(next).padStart(3, '0');
        code = `${keyPrefix}${seqStr}`; // e.g. S001
      } else if (role === 'usuario' && this.formData.userType === 'docente') {
        // Docente: formato C{YEAR}{seq} sin padding (ej C20251)
        const keyPrefix = `C${year}`;
        const existing = list.filter(u => u.startsWith(keyPrefix));
        const seqs = existing.map(u => {
          const rest = u.slice(keyPrefix.length);
          const num = Number(rest);
          return Number.isFinite(num) ? num : 0;
        });
        const max = seqs.length ? Math.max(...seqs) : 0;
        const next = max + 1;
        code = `${keyPrefix}${next}`; // no padding
      } else if (role === 'admin') {
        // Admin: D{YEAR}{NNN}
        const keyPrefix = `D${year}`;
        const existing = list.filter(u => u.startsWith(keyPrefix));
        const seqs = existing.map(u => {
          const rest = u.slice(keyPrefix.length);
          const num = Number(rest);
          return Number.isFinite(num) ? num : 0;
        });
        const max = seqs.length ? Math.max(...seqs) : 0;
        const next = max + 1;
        const seqStr = String(next).padStart(3, '0');
        code = `${keyPrefix}${seqStr}`;
      } else {
        // Default: Usuario (alumno) U{YEAR}{NNN}
        const keyPrefix = `U${year}`;
        const existing = list.filter(u => u.startsWith(keyPrefix));
        const seqs = existing.map(u => {
          const rest = u.slice(keyPrefix.length);
          const num = Number(rest);
          return Number.isFinite(num) ? num : 0;
        });
        const max = seqs.length ? Math.max(...seqs) : 0;
        const next = max + 1;
        const seqStr = String(next).padStart(3, '0');
        code = `${keyPrefix}${seqStr}`;
      }

      this.formData.username = code;
      this.formData.correo = `${code.toLowerCase()}@utp.edu.pe`;
      this.isUsernameAuto = true;
      this.isCorreoAuto = true;
    } catch (err) {
      console.error('Error generando código por rol', err);
      const year = new Date().getFullYear();
      let fallback = '';
      if (role === 'seguridad') fallback = `S001`;
      else if (role === 'usuario' && this.formData.userType === 'docente') fallback = `C${year}1`;
      else if (role === 'admin') fallback = `D${year}001`;
      else fallback = `U${year}001`;
      this.formData.username = fallback;
      this.formData.correo = `${fallback.toLowerCase()}@utp.edu.pe`;
      this.isUsernameAuto = true;
      this.isCorreoAuto = true;
    }
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

  onSedeChange(event: Event) {
    const sel = event.target as HTMLSelectElement;
    const sedeId = sel.value ? Number(sel.value) : null;
    // Limpiar zonas asignadas al cambiar de sede
    this.formData.assignedZones = [];
    if (!sedeId) {
      // fallback: cargar todas
      this.cargarZonas();
      return;
    }
    this.zonaService.obtenerZonasPorSede(sedeId).subscribe({
      next: (data) => this.zonas = data,
      error: (err) => {
        console.error('Error al cargar zonas por sede', err);
        this.cargarZonas();
      }
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
    // Si cambió a 'usuario' limpiar autogeneración previa
    if (value !== 'usuario') {
      this.isUsernameAuto = false;
      this.isCorreoAuto = false;
    }
    // Intentar autocompletar si ya seleccionó tipo alumno o estamos creando
    setTimeout(() => {
      if (this.isCreating) this.generateCodeForRole().catch(() => {});
      else this.tryAutofillCodigoYCorreo().catch(() => {});
    }, 0);
  }

  async ensureNextCodigoUTP() {
    // Consulta backend para obtener usuarios actuales y calcular siguiente secuencia
    try {
      const usuarios: any[] | undefined = await firstValueFrom(this.http.get<any[]>('http://localhost:8080/api/usuarios'));
      // Filtrar usuarios que comienzan con 'U' seguido del año actual
      const year = new Date().getFullYear();
      const prefix = `U${year}`;
      const existing = (usuarios || []).map(u => (u.username || '').toUpperCase()).filter(u => u.startsWith(prefix));
      // Extraer secuencias numéricas
      const seqs = existing.map(u => {
        const rest = u.slice(prefix.length);
        const num = Number(rest);
        return Number.isFinite(num) ? num : 0;
      });
      const max = seqs.length ? Math.max(...seqs) : 0;
      const next = max + 1;
      const seqStr = String(next).padStart(3, '0');
      const code = `${prefix}${seqStr}`; // ej U2025001
      return code;
    } catch (err) {
      console.error('No se pudo consultar usuarios para generar código UTP', err);
      // Fallback: crear código simple con 001
      const year = new Date().getFullYear();
      return `U${year}001`;
    }
  }

  // Llamar esto cuando se selecciona role = 'usuario' y userType = 'alumno'
  async tryAutofillCodigoYCorreo() {
    if (this.formData.role !== 'usuario') return;
    if (this.formData.userType !== 'alumno') return;
    // Generar siguiente código
    const code = await this.ensureNextCodigoUTP();
    this.formData.username = code;
    this.formData.correo = `${code.toLowerCase()}@utp.edu.pe`;
    this.isUsernameAuto = true;
    this.isCorreoAuto = true;
  }

  onUserTypeChange(event?: Event) {
    // Se llama desde el select de tipo de usuario. Si estamos creando, regenerar el código
    if (this.isCreating) {
      setTimeout(() => { this.generateCodeForRole().catch(() => {}); }, 0);
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
  if (!this.isUsernameAuto && !this.formData.username.trim()) { this.formErrors.username = 'El username es obligatorio.'; isValid = false; }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!this.isCorreoAuto && !this.formData.correo.trim()) { this.formErrors.correo = 'El correo es obligatorio.'; isValid = false; }
  else if (!this.isCorreoAuto && !emailRegex.test(this.formData.correo)) { this.formErrors.correo = 'Formato de correo inválido.'; isValid = false; }

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
