import { Component, OnInit } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sede, SedeService } from '../../services/sede.service';
import { Zona, ZonaService } from '../../services/zona.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { UsuarioService } from '../../services/usuario.service';
import { PerfilService } from '../../services/perfil.service';
import { firstValueFrom, Subject } from 'rxjs'; // Import Subject
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'; // Import operators
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

  private phoneChanged: Subject<string> = new Subject<string>(); // Subject for phone number changes
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
    private usuarioService: UsuarioService,
    private perfil: PerfilService,
  ) {}

  // Lista de usuarios (cargada desde backend)
  users: Array<any> = [];

  // Filtrado / buscador UI
  searchText: string = '';
  selectedRoleFilter: string = 'all';
  selectedEstadoFilter: string = 'all';

  // Roles disponibles para filtro (key -> label)
  availableRoleFilters: { key: string; label: string }[] = [
    { key: 'all', label: 'Todos los roles' },
    { key: 'usuario', label: 'Usuario' },
    { key: 'admin', label: 'Admin' },
    { key: 'seguridad', label: 'Seguridad' }
  ];

  loadUsers(): void {
    const finish = (myId: number | null, myUsername: string | null) => {
      this.usuarioService.getAll().subscribe({
        next: (lista) => {
          const mapped = (lista || []).map((u: any) => ({
            id: u.id,
            nombreCompleto: u.nombreCompleto || u.name || '',
            username: u.username || '',
            correo: u.correo || u.email || '',
            telefono: u.telefono || '',
            tipoUsuario: (u.tipoUsuario || (u.roles && u.roles[0]) || '').toString(),
            sedeNombre: u.sedeNombre || '',
            zonasNombres: u.zonasNombres || [],
            enabled: typeof u.enabled === 'boolean' ? u.enabled : true,
            roles: u.roles || []
          }));
          // Excluir del listado al propio usuario (superadmin) por id o, si no hay id, por username
          const uname = (myUsername || '').toLowerCase();
          this.users = mapped.filter(u => {
            if (myId != null && u.id === myId) return false;
            if (uname && (u.username || '').toLowerCase() === uname) return false;
            return true;
          });
        },
        error: (err) => { console.error('Error cargando usuarios', err); this.users = []; }
      });
    };

    try {
      const obs: any = (this.perfil as any).obtenerPerfil ? this.perfil.obtenerPerfil() : null;
      if (obs) {
        obs.subscribe({
          next: (p: any) => finish(((p && (p.id || p.usuarioId)) ? Number(p.id || p.usuarioId) : null), (p && p.username) ? String(p.username) : null),
          error: () => finish(null, null)
        });
        return;
      }
      // fallback por señal
      const sig: any = (this.perfil as any).perfil ? (this.perfil as any).perfil() : null;
      finish((sig && (sig.id || sig.usuarioId)) ? Number(sig.id || sig.usuarioId) : null, sig && sig.username ? String(sig.username) : null);
    } catch {
      finish(null, null);
    }
  }

  ngOnInit(): void {
    this.cargarSedes();
    this.cargarZonas();
    // Cargar usuarios al iniciar
    this.loadUsers();

    // Subscribe to phone number changes for debounced validation
    this.phoneChanged.pipe(
      debounceTime(500), // Wait for 500ms after the last event
      distinctUntilChanged(), // Only emit if value is different from previous value
      switchMap(telefono => this.usuarioService.isTelefonoUnique(telefono, this.editingUser ? this.editingUser.id : null))
    ).subscribe(isUnique => {
      // Update formErrors based on uniqueness
      if (!isUnique) {
        this.formErrors.phone = 'El número de teléfono ya está registrado.';
      } else {
        this.formErrors.phone = ''; // Clear error if unique
      }
    });
  }

  // Computed lista filtrada segun buscador y filtros
  get filteredUsers(): any[] {
    const q = (this.searchText || '').trim().toLowerCase();
    return (this.users || []).filter(u => {
      // filtro por rol
      if (this.selectedRoleFilter && this.selectedRoleFilter !== 'all') {
        const roleLower = String(this.selectedRoleFilter || '').toLowerCase();
        const hasRole = (u.roles || []).some((r: any) => String(r).toLowerCase().includes(roleLower));
        if (!hasRole) return false;
      }
      // filtro por estado
      if (this.selectedEstadoFilter && this.selectedEstadoFilter !== 'all') {
        if (this.selectedEstadoFilter === 'activo' && !u.enabled) return false;
        if (this.selectedEstadoFilter === 'inactivo' && u.enabled) return false;
      }
      // buscador por nombre, username o correo
      if (!q) return true;
      const name = (u.nombreCompleto || '').toString().toLowerCase();
      const username = (u.username || '').toString().toLowerCase();
      const correo = (u.correo || '').toString().toLowerCase();
      return name.includes(q) || username.includes(q) || correo.includes(q);
    });
  }

  clearFilters(){
    this.searchText = '';
    this.selectedRoleFilter = 'all';
    this.selectedEstadoFilter = 'all';
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

  // Sanitizar entrada de teléfono para permitir solo números
  onPhoneInput(event: any) {
    const raw = event && event.target ? String(event.target.value) : '';
    this.formData.phone = raw.replace(/\D/g, '');
  }

  // Evitar que se ingresen letras en el campo celular
  onPhoneKeypress(event: KeyboardEvent) {
    const k = event.key;
    // Permitir teclas de control (Backspace, Delete, Arrow keys, Tab)
    if (k === 'Backspace' || k === 'Delete' || k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Tab' || k === 'Home' || k === 'End') return;
    // Permitir solo dígitos
    if (!/^[0-9]$/.test(k)) {
      event.preventDefault();
    }
  }

  // Sanitizar texto pegado en celular: dejar solo dígitos
  onPhonePaste(event: ClipboardEvent) {
    const paste = event.clipboardData ? event.clipboardData.getData('text') : '';
    const sanitized = (paste || '').replace(/\D/g, '');
    if (!sanitized) {
      // si no hay dígitos, impedir el pegado
      event.preventDefault();
      return;
    }
    // Reemplazar el contenido pegado por su versión sanitizada
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    const before = target.value.slice(0, target.selectionStart || 0);
    const after = target.value.slice((target.selectionEnd || 0));
    target.value = before + sanitized + after;
    // actualizar ngModel
    this.formData.phone = target.value.replace(/\D/g, '');
  }

  // Evitar que se ingresen números en el nombre
  onNameKeypress(event: KeyboardEvent) {
    const k = event.key;
    // permitir teclas de control
    if (k === 'Backspace' || k === 'Delete' || k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Tab' || k === 'Home' || k === 'End') return;
    // Si es un solo caracter y es dígito, bloquear
    if (/^[0-9]$/.test(k)) {
      event.preventDefault();
      return;
    }
    // permitir letras y espacios y tildes/ñ (otros caracteres serán validados en submit)
    if (k.length === 1 && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]$/.test(k)) {
      // bloquear símbolos no permitidos (ej: números ya bloqueados, algunos signos)
      event.preventDefault();
    }
  }

  // Sanitizar pegado en nombre: eliminar dígitos
  onNamePaste(event: ClipboardEvent) {
    const paste = event.clipboardData ? event.clipboardData.getData('text') : '';
    if (!paste) { event.preventDefault(); return; }
    const sanitized = (paste || '').replace(/[0-9]/g, '');
    // Si después de quitar números queda vacío, impedir
    if (!sanitized.trim()) { event.preventDefault(); return; }
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    const before = target.value.slice(0, target.selectionStart || 0);
    const after = target.value.slice((target.selectionEnd || 0));
    target.value = before + sanitized + after;
    this.formData.name = target.value;
  }

  resetForm() {
    this.formData = {
      name: '', username: '', correo: '', password: '', phone: '', role: '', userType: '', campus: '', assignedZones: []
    } as any;
    this.formErrors = { name: '', username: '', correo: '', password: '', phone: '', role: '', userType: '', campus: '', assignedZones: '' };
  }

  // Handle phone number input changes for debounced validation
  onPhoneInputChange() {
    this.phoneChanged.next(this.formData.phone);
  }

  async validateForm(): Promise<boolean> { // Make validateForm async
    let isValid = true;
    this.formErrors = { name: '', username: '', correo: '', password: '', phone: '', role: '', userType: '', campus: '', assignedZones: '' };
    // Nombre: obligatorio, solo letras y espacios, máximo 50 caracteres
    const nameVal = (this.formData.name || '').trim();
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!nameVal) { this.formErrors.name = 'El nombre completo es obligatorio.'; isValid = false; }
    else if (nameVal.length > 50) { this.formErrors.name = 'El nombre no puede exceder 50 caracteres.'; isValid = false; }
    else if (!nameRegex.test(nameVal)) { this.formErrors.name = 'El nombre solo puede contener letras y espacios.'; isValid = false; }
    if (!this.isUsernameAuto && !this.formData.username.trim()) { this.formErrors.username = 'El username es obligatorio.'; isValid = false; }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!this.isCorreoAuto && !this.formData.correo.trim()) { this.formErrors.correo = 'El correo es obligatorio.'; isValid = false; }
    else if (!this.isCorreoAuto && !emailRegex.test(this.formData.correo)) { this.formErrors.correo = 'Formato de correo inválido.'; isValid = false; }

    if (!this.formData.password) { this.formErrors.password = 'La contraseña es obligatoria.'; isValid = false; }
    else if (this.formData.password.length < 6) { this.formErrors.password = 'La contraseña debe tener al menos 6 caracteres.'; isValid = false; }

    const phoneRegex = /^\d{9}$/;
    if (!this.formData.phone.trim()) {
      this.formErrors.phone = 'El teléfono es obligatorio.'; isValid = false;
    } else if (!phoneRegex.test(this.formData.phone)) {
      this.formErrors.phone = 'Formato de teléfono inválido. Debe ser 9 dígitos numéricos (Ej: 999000000).'; isValid = false;
    } else {
      // Async validation for phone number uniqueness
      const isUnique = await firstValueFrom(this.usuarioService.isTelefonoUnique(this.formData.phone, this.editingUser ? this.editingUser.id : null));
      if (!isUnique) {
        this.formErrors.phone = 'El número de teléfono ya está registrado.';
        isValid = false;
      }
    }

    if (!this.formData.role) { this.formErrors.role = 'El rol es obligatorio.'; isValid = false; }
    if (!this.formData.campus) { this.formErrors.campus = 'La sede es obligatoria.'; isValid = false; }
    if (this.formData.role === 'usuario' && !this.formData.userType) { this.formErrors.userType = 'El tipo de usuario es obligatorio para el rol de Usuario.'; isValid = false; }
    if (this.formData.role === 'seguridad' && this.formData.assignedZones.length === 0) { this.formErrors.assignedZones = 'Debe asignar al menos una zona para el rol de Seguridad.'; isValid = false; }
    return isValid;
  }

  async handleCreateUser() {
    if (!await this.validateForm()) { alert('Por favor, corrija los errores del formulario.'); return; }
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
          // recargar lista de usuarios
          this.loadUsers();
        },
        error: (err: HttpErrorResponse) => { // Use HttpErrorResponse for type safety
          console.error('❌ Error al registrar:', err);
          let errorMessage = err.error?.message || err.message || 'Error al registrar usuario';
          if (err.status === 409) { // Conflict status for unique constraint violation
            errorMessage = 'El número de teléfono ya está registrado.';
          }
          alert(errorMessage);
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
          this.loadUsers();
        },
        error: (err: HttpErrorResponse) => {
          console.error('❌ Error al registrar:', err);
          let errorMessage = err.error?.message || err.message || 'Error al registrar usuario';
          if (err.status === 409) {
            errorMessage = 'El número de teléfono ya está registrado.';
          }
          alert(errorMessage);
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
          console.log('✅ Seguridad creada:', res);
          alert(res);
          this.resetForm();
          this.isCreating = false;
          this.loadUsers();
        },
        error: (err: HttpErrorResponse) => {
          console.error('❌ Error al registrar:', err);
          let errorMessage = err.error?.message || err.message || 'Error al registrar usuario';
          if (err.status === 409) {
            errorMessage = 'El número de teléfono ya está registrado.';
          }
          alert(errorMessage);
        }
      });
    } else {
      alert('Rol no válido. Por favor, seleccione un rol válido.');
    }
  }

  async handleUpdateUser() { // Make it async to await validation
    if (!this.editingUser || !this.editingUser.id) {
      alert('No hay usuario seleccionado para actualizar.');
      return;
    }

    if (!await this.validateForm()) { // Await the async validation
      alert('Por favor, corrija los errores del formulario.');
      return;
    }

    // Construir payload para enviar al backend.
    const payload: any = {
      nombreCompleto: this.formData.name,
      correo: this.formData.correo,
      telefono: this.formData.phone,
      sedeId: this.formData.campus ? Number(this.formData.campus) : null,
    };
    // incluir password sólo si se ingresó
    if (this.formData.password && this.formData.password.length >= 6) payload.password = this.formData.password;
    // si es seguridad incluir zonas
    if (this.formData.role === 'seguridad') payload.zonaIds = this.formData.assignedZones.map(z => z.id);
    // si es usuario incluir tipoUsuario (ALUMNO/DOCENTE)
    if (this.formData.role === 'usuario' && this.formData.userType) {
      payload.tipoUsuario = String(this.formData.userType).toUpperCase();
    }

    this.usuarioService.updateUser(this.editingUser.id, payload).subscribe({
      next: (res) => {
        if (!res) { alert('No se pudo actualizar el usuario (respuesta vacía).'); return; }
        alert('Usuario actualizado correctamente.');
        // actualizar lista local con respuesta si contiene id
        if (res.id) {
          this.users = this.users.map(x => x.id === res.id ? ({
            id: res.id,
            nombreCompleto: res.nombreCompleto || this.formData.name,
            username: res.username || this.formData.username,
            correo: res.correo || this.formData.correo,
            telefono: res.telefono || this.formData.phone,
            tipoUsuario: res.tipoUsuario || this.formData.userType,
            sedeNombre: res.sedeNombre || '',
            zonasNombres: res.zonasNombres || [],
            enabled: typeof res.enabled === 'boolean' ? res.enabled : true,
            roles: res.roles || []
          }) : x);
        }
        this.editingUser = null;
        this.isCreating = false;
        this.resetForm();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error actualizando usuario', err);
        let errorMessage = err?.error?.message || err?.message || 'Error al actualizar usuario';
        if (err.status === 409) { // Conflict status for unique constraint violation
          errorMessage = 'El número de teléfono ya está registrado.';
        }
        alert(errorMessage);
      }
    });
  }

  // Abrir editor con datos del usuario seleccionado
  editUser(u: any) {
    this.isCreating = true;
    this.editingUser = u;
    // Vaciar contraseña por seguridad (se cambia solo si el admin ingresa nueva)
    this.formData.password = '';

    // Intentamos obtener detalles frescos desde backend (si existe endpoint GET /api/usuarios/:id)
    if (u && u.id) {
      this.usuarioService.getById(Number(u.id)).subscribe({
        next: (res: any) => {
          const data = res || u;
          this.applyUserToForm(data);
        },
        error: (err) => {
          // Si falla, usar los datos que ya tenemos en "u"
          console.warn('No se pudo obtener usuario por id, usando datos locales', err);
          this.applyUserToForm(u);
        }
      });
    } else {
      this.applyUserToForm(u);
    }
  }

  // Helper: mapear la respuesta del backend o el usuario local al formData
  private applyUserToForm(data: any) {
    this.formData.name = data.nombreCompleto || '';
    this.formData.username = data.username || '';
    this.formData.correo = data.correo || data.email || '';
    this.formData.phone = data.telefono || '';

    // Determinar sede: backend solo devuelve nombre de sede, mapear a id si es posible
    const sedeNombre = data.sedeNombre || '';
    const sedeObj = this.sedes.find(s => (s.nombre || '').toString() === sedeNombre);
    this.formData.campus = sedeObj ? String(sedeObj.id) : (data.sedeId ? String(data.sedeId) : '');

    // Roles / tipoUsuario
    if (Array.isArray(data.roles) && data.roles.length) {
      const r = (data.roles[0] || '').toLowerCase();
      if (r.includes('admin')) this.formData.role = 'admin';
      else if (r.includes('seguridad') || r.includes('security')) this.formData.role = 'seguridad';
      else this.formData.role = 'usuario';
    }

    // Manejo robusto de tipoUsuario (puede venir como string, enum o como objeto)
    let tipoVal: string | undefined = undefined;
    if (data && data.tipoUsuario != null) {
      if (typeof data.tipoUsuario === 'string') tipoVal = data.tipoUsuario;
      else if (typeof data.tipoUsuario === 'object') {
        // puede venir como { name: 'ALUMNO' } o similar
        if ((data.tipoUsuario as any).name) tipoVal = (data.tipoUsuario as any).name;
        else tipoVal = String(data.tipoUsuario);
      } else {
        tipoVal = String(data.tipoUsuario);
      }
    }
    if (tipoVal) {
      const t = tipoVal.toLowerCase();
      // si es docente/alumno, estamos en rol usuario
      if (t.includes('docente') || t.includes('alumno') || t.includes('teacher') || t.includes('student')) {
        this.formData.role = 'usuario';
        this.formData.userType = t.includes('docente') || t.includes('teacher') ? 'docente' : 'alumno';
      } else {
        // si no es alumno/docente, solo setear el tipo en userType si coincide
        this.formData.userType = t;
      }
    }

    // Zonas asignadas: backend solo devuelve nombres, intentar mapear a objetos Zona
    this.formData.assignedZones = [];
    if (Array.isArray(data.zonasNombres) && data.zonasNombres.length) {
      data.zonasNombres.forEach((zn: string) => {
        const match = this.zonas.find(z => (z.nombre || '').toString() === zn);
        if (match) this.formData.assignedZones.push(match);
      });
    }

    // Forzar username y correo como solo lectura
    this.isUsernameAuto = true;
    this.isCorreoAuto = true;
  }

  // Devuelve clases para el avatar según roles del usuario
  getAvatarClasses(u: any) {
    const roles = (u && u.roles) ? (u.roles || []).map((r: any) => ('' + r).toLowerCase()) : [];
    const isAdmin = roles.some((r: string) => r.includes('admin'));
    const isSeguridad = roles.some((r: string) => r.includes('segur'));
    return {
      'avatar-admin': isAdmin,
      'avatar-seguridad': isSeguridad,
      'avatar-user': !isAdmin && !isSeguridad
    } as any;
  }

  // Toggle enable/disable locally (backend endpoint not available here)
  deactivateUser(u: any) {
    const action = u.enabled ? 'desactivar' : 'activar';
    if (!confirm(`¿Deseas ${action} al usuario ${u.nombreCompleto || u.username}?`)) return;
    // Llamar al endpoint del backend para actualizar enabled
    this.usuarioService.updateEnabled(u.id, !u.enabled).subscribe({
      next: (res) => {
        if (!res) { alert('No se pudo actualizar el estado del usuario.'); return; }
        // Si backend devuelve el usuario actualizado, usarlo; si no, alternar localmente
        if (res.id) {
          this.users = this.users.map(x => x.id === res.id ? ({
            id: res.id,
            nombreCompleto: res.nombreCompleto || x.nombreCompleto,
            username: res.username || x.username,
            correo: res.correo || x.correo,
            telefono: res.telefono || x.telefono,
            tipoUsuario: res.tipoUsuario || x.tipoUsuario,
            sedeNombre: res.sedeNombre || x.sedeNombre,
            zonasNombres: res.zonasNombres || x.zonasNombres,
            enabled: typeof res.enabled === 'boolean' ? res.enabled : !x.enabled,
            roles: res.roles || x.roles
          }) : x);
        } else {
          u.enabled = !u.enabled;
          this.users = this.users.map(x => x.id === u.id ? u : x);
        }
        alert(`Usuario ${action} correctamente.`);
      },
      error: (err) => { console.error('Error toggling enabled', err); alert('Error al actualizar estado del usuario: ' + (err?.error?.message || err?.message || 'desconocido')); }
    });
  }

  // Eliminar usuario (localmente) - backend no expone endpoint de borrado actualmente
  deleteUser(u: any) {
    if (!confirm(`¿Eliminar usuario ${u.nombreCompleto || u.username}? Esta acción no puede revertirse.`)) return;
    // Si existiera endpoint para borrar, llamarlo aquí. Ahora solo filtrar la lista localmente.
    this.users = this.users.filter(x => x.id !== u.id);
  }
}
