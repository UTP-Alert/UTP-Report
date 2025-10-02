import { Component } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common'; // Import CommonModule and KeyValuePipe
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { RegistroDTO, UsuarioRolService } from '../../services/usuario-rol.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, KeyValuePipe], // Add KeyValuePipe here
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss'
})
export class Inicio {



  constructor(private usuarioRolService: UsuarioRolService) { }



  userName: string = 'Super Admin User';
  userRole: string = 'Super Admin';
  isSessionActive: boolean = true; // Simulate session status

  isCreating: boolean = false;
  editingUser: any = null; // Will hold user object if editing
  isMobileMenuOpen: boolean = false; // For mobile navigation

  formData = {
    name: '',
    username: '',
    correo: '',
    password: '',
    phone: '',
    role: 'user', // Default role
    userType: '', // Default user type for 'user' role
     campus: '',
    assignedZones: [] as string[]
  };




  roleConfig: { [key: string]: { label: string; icon: string } } = {
    user: { label: 'Usuario', icon: 'fas fa-user' },
    admin: { label: 'Administrador', icon: 'fas fa-user-shield' },
    security: { label: 'Seguridad', icon: 'fas fa-user-tie' }
  };

  availableSedes = [
    { id: '1', name: 'UTP Campus Principal' },
    { id: '2', name: 'UTP Sede Lima Centro' },
    { id: '3', name: 'UTP Sede Arequipa' }
  ];

  availableZones = [
    'Zona A - Edificio Principal',
    'Zona B - Biblioteca',
    'Zona C - Laboratorios',
    'Zona D - Cafetería',
    'Zona E - Estacionamiento'
  ];

  // Getter for filtered available zones
  get filteredAvailableZones(): string[] {
    return this.availableZones.filter(zone => !this.formData.assignedZones.includes(zone));
  }

  // For demonstration purposes, a method to toggle session status
  toggleSession() {
    this.isSessionActive = !this.isSessionActive;
  }

  resetForm() {
    //this.isCreating = false;
    //this.editingUser = null;
    this.formData = {
      name: '',
      username: '',
      correo: '',
      password: '',
      phone: '',
      role: 'user',
      userType: '',
      campus: '',
      assignedZones: []
    };
  }

  onRoleChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    this.formData.role = value;
    if (value !== 'security') {
      this.formData.assignedZones = [];
    }
  }

handleCreateUser() {
  console.log('Creating user:', this.formData);

  const dto: RegistroDTO = {
    username: this.formData.username,
    correo: this.formData.correo,
    password: this.formData.password,
    tipoUsuario: this.formData.userType.toUpperCase() // alumno -> ALUMNO, docente -> DOCENTE
  };

  this.usuarioRolService.registrarUsuario(dto).subscribe({
    next: (res: string) => { // Expect a string response
      console.log('✅ Usuario creado:', res);
      alert(res); // Display the success message from the backend
      this.resetForm(); // Limpia el formulario
      this.isCreating = false; // Cierra el formulario de creación
    },
    error: (err) => {
      console.error('❌ Error al registrar:', err);
      // If the error is a string (e.g., from a non-200 response with responseType: 'text'), display it directly.
      // Otherwise, try to access err.error.message or use a generic message.
      alert(err.error?.message || err.message || 'Error al registrar usuario');
    }
  });
}

  

handleUpdateUser() {
  console.log('Updating user:', this.formData);
  // Here you would typically send data to a backend service
  this.resetForm();
}

handleRemoveZone(zoneToRemove: string) {
  this.formData.assignedZones = this.formData.assignedZones.filter(zone => zone !== zoneToRemove);
}

handleAddZone(zoneToAdd: string) {
  if (zoneToAdd && !this.formData.assignedZones.includes(zoneToAdd)) {
    this.formData.assignedZones = [...this.formData.assignedZones, zoneToAdd];
  }
}

onAddZoneChange(event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  const zoneToAdd = selectElement.value;
  this.handleAddZone(zoneToAdd);
  selectElement.value = ''; // Reset the select field
}

toggleMobileMenu() {
  this.isMobileMenuOpen = !this.isMobileMenuOpen;
}
//despues


/*formData: RegistroDTO = {
 username: '',
 correo: '',
 password: '',
 tipoUsuario: 'ALUMNO' // Valor por defecto
};*/
/* resetForm() {
   this.formData = {
     username: '',
     correo: '',
     password: '',
     tipoUsuario: 'ALUMNO' // Reiniciar al valor por defecto
   };
 }

*/

/*
handleCreateUser() {
  const dto: RegistroDTO = {
    username: this.formData.username,
    correo: this.formData.correo,
    password: this.formData.password,
    tipoUsuario: this.formData.tipoUsuario
  };

  this.usuarioRolService.registrarUsuario(dto).subscribe({
    next: (res) => {
      console.log('✅ Usuario creado:', res);
      alert(res); // el backend devuelve un String: "Usuario registrado exitosamente"
      this.resetForm();
    },
    error: (err) => {
      console.error('❌ Error al registrar:', err);
      alert(err.error.message || 'Error al registrar usuario');
    }
  });
}*/
}
