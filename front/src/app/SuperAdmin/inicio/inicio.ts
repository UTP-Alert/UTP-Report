import { Component } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common'; // Import CommonModule and KeyValuePipe
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, KeyValuePipe], // Add KeyValuePipe here
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss'
})
export class Inicio {
  userName: string = 'Super Admin User';
  userRole: string = 'Super Admin';
  isSessionActive: boolean = true; // Simulate session status

  isCreating: boolean = false;
  editingUser: any = null; // Will hold user object if editing
  isMobileMenuOpen: boolean = false; // For mobile navigation

  formData = {
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user', // Default role
    userType: 'estudiante', // Default user type for 'user' role
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
    this.isCreating = false;
    this.editingUser = null;
    this.formData = {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'user',
      userType: 'estudiante',
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
    // Here you would typically send data to a backend service
    this.resetForm();
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
}
