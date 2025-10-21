// Importa los módulos necesarios de Angular
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para directivas comunes como ngIf, ngFor
import { RouterModule } from '@angular/router'; // Para funcionalidades de enrutamiento
import { FormsModule } from '@angular/forms'; // Importa FormsModule para el enlace de datos bidireccional (ngModel)

// Define la interfaz para una Zona, especificando la estructura de los datos de cada zona.
interface Zone {
  id: number; // Identificador único de la zona
  name: string; // Nombre de la zona
  description: string; // Descripción de seguridad de la zona
  imageUrl: string; // URL de la imagen de la zona
  securityLevel: number; // Nivel de seguridad de la zona (0-100)
  incidents: number; // Número de incidentes reportados en la zona
  students: number; // Número de estudiantes activos en la zona
  status: 'safe' | 'caution' | 'dangerous' | 'info'; // Estado de seguridad de la zona
  trend: 'up' | 'down' | 'stable'; // Tendencia de seguridad de la zona
  timestamp: string; // Marca de tiempo de la última actualización
  isEditing: boolean; // Indica si la zona está en modo de edición
}

// Decorador @Component que define el componente Angular
@Component({
  selector: 'app-admin-zonas-page-complete', // Selector CSS para usar este componente
  standalone: true, // Indica que este es un componente independiente
  imports: [CommonModule, RouterModule, FormsModule], // Módulos que este componente utiliza
  templateUrl: './zonas-page-complete.component.html', // Ruta al archivo de plantilla HTML
  styleUrls: ['./zonas-page-complete.component.scss'] // Rutas a los archivos de estilos SCSS
})
export class AdminZonasPageCompleteComponent implements OnInit {
  zones: Zone[] = []; // Array para almacenar todas las zonas
  selectedSede: string = 'campus-principal'; // Sede seleccionada actualmente, valor por defecto

  showCreateZoneForm: boolean = false; // Propiedad para controlar la visibilidad del formulario de creación de zona

  // Objeto para almacenar los datos de la nueva zona a crear
  newZone = {
    name: '', // Nombre de la nueva zona
    description: '', // Descripción de la nueva zona
    imageUrl: '', // URL de la imagen de la nueva zona
    securityLevel: 50, // Nivel de seguridad por defecto para la nueva zona
  };

  // Constructor del componente
  constructor() { }

  // Método del ciclo de vida que se ejecuta al inicializar el componente
  ngOnInit(): void {
    // Carga datos de ejemplo para demostración. Estos datos serán reemplazados por una llamada a un servicio en el futuro.
    this.zones = [
      {
        id: 1,
        name: 'Campus Principal',
        description: 'Zona central del campus con alta vigilancia y buena iluminación.',
        imageUrl: 'https://via.placeholder.com/300x150/cccccc/000000?text=Campus+Principal',
        securityLevel: 62,
        incidents: 0,
        students: 96,
        status: 'safe',
        trend: 'stable',
        timestamp: 'Hace 4 min',
        isEditing: false,
      },
      {
        id: 2,
        name: 'Biblioteca Central',
        description: 'Biblioteca principal del campus con múltiples salas de estudio.',
        imageUrl: 'https://via.placeholder.com/300x150/cccccc/000000?text=Biblioteca+Central',
        securityLevel: 81,
        incidents: 4,
        students: 58,
        status: 'caution',
        trend: 'down',
        timestamp: 'Hace 9 min',
        isEditing: false,
      }
    ];
  }

  /**
   * Alterna la visibilidad del formulario de creación de zona.
   * Si el formulario se muestra, se reinicia a sus valores por defecto.
   */
  toggleCreateZoneForm() {
    this.showCreateZoneForm = !this.showCreateZoneForm;
    if (this.showCreateZoneForm) {
      this.resetNewZoneForm(); // Reinicia el formulario cuando se muestra
    }
  }

  // Acciones de Administrador

  /**
   * Pone una zona específica en modo de edición.
   * @param zone La zona a editar.
   */
  editZone(zone: Zone) {
    zone.isEditing = true;
    console.log('Editando zona:', zone.name);
  }

  /**
   * Guarda los cambios de una zona editada.
   * @param zone La zona cuyos cambios se van a guardar.
   */
  saveZone(zone: Zone) {
    zone.isEditing = false;
    console.log('Guardando zona:', zone.name, zone);
    // Aquí se llamaría a un servicio para actualizar la zona en el backend
  }

  /**
   * Cancela el modo de edición de una zona.
   * @param zone La zona para la que se cancela la edición.
   */
  cancelEdit(zone: Zone) {
    zone.isEditing = false;
    console.log('Cancelando edición para la zona:', zone.name);
    // Aquí se revertirían los cambios de una copia temporal de los datos de la zona
  }

  /**
   * Elimina una zona del array de zonas.
   * @param zone La zona a eliminar.
   */
  deleteZone(zone: Zone) {
    if (confirm(`¿Estás seguro de que quieres eliminar la zona "${zone.name}"?`)) {
      this.zones = this.zones.filter(z => z.id !== zone.id);
      console.log('Zona eliminada:', zone.name);
      // Aquí se llamaría a un servicio para eliminar la zona del backend
    }
  }

  /**
   * Añade una nueva zona al array de zonas.
   */
  addZone() {
    console.log('Añadiendo nueva zona:', this.newZone);
    // Aquí se llamaría a un servicio para añadir la nueva zona al backend
    const newId = Math.max(...this.zones.map(z => z.id)) + 1; // Genera un nuevo ID
    const newZoneData: Zone = {
      id: newId,
      name: this.newZone.name,
      description: this.newZone.description,
      imageUrl: this.newZone.imageUrl,
      securityLevel: this.newZone.securityLevel,
      incidents: 0,
      students: 0,
      status: 'info', // Estado por defecto para nuevas zonas
      trend: 'stable',
      timestamp: 'Ahora',
      isEditing: false,
    };
    this.zones.push(newZoneData); // Añade la nueva zona al array
    this.resetNewZoneForm(); // Reinicia el formulario
    this.showCreateZoneForm = false; // Oculta el formulario después de añadir la zona
  }

  /**
   * Reinicia los campos del formulario de creación de nueva zona a sus valores por defecto.
   */
  resetNewZoneForm() {
    this.newZone = {
      name: '',
      description: '',
      imageUrl: '',
      securityLevel: 50,
    };
  }

  // Métodos auxiliares para la vista

  /**
   * Devuelve la clase CSS correspondiente al estado de seguridad de una zona.
   * @param status El estado de seguridad de la zona.
   * @returns La clase CSS para el estado.
   */
  getZoneStatusClass(status: string) {
    switch (status) {
      case 'safe': return 'zone-status-safe';
      case 'caution': return 'zone-status-caution';
      case 'dangerous': return 'zone-status-dangerous';
      case 'info': return 'zone-status-info'; // Para previsualización/nuevas zonas
      default: return '';
    }
  }

  /**
   * Devuelve la clase CSS para el color de la barra de progreso según el nivel de seguridad.
   * @param level El nivel de seguridad de la zona.
   * @returns La clase CSS para el color de la barra de progreso.
   */
  getProgressBarColor(level: number) {
    if (level > 70) return 'progress-bar-fill-safe';
    if (level > 40) return 'progress-bar-fill-caution';
    return 'progress-bar-fill-dangerous';
  }

  /**
   * Calcula y devuelve el número de zonas con estado 'safe'.
   * @returns El número de zonas seguras.
   */
  getSafeZonesCount(): number {
    return this.zones.filter(z => z.status === 'safe').length;
  }

  /**
   * Calcula y devuelve el número de zonas con estado 'caution'.
   * @returns El número de zonas en precaución.
   */
  getCautionZonesCount(): number {
    return this.zones.filter(z => z.status === 'caution').length;
  }

  /**
   * Calcula y devuelve el número de zonas con estado 'dangerous'.
   * @returns El número de zonas peligrosas.
   */
  getDangerousZonesCount(): number {
    return this.zones.filter(z => z.status === 'dangerous').length;
  }

  /**
   * Calcula y devuelve el número total de estudiantes en todas las zonas.
   * @returns El número total de estudiantes.
   */
  getTotalStudentsCount(): number {
    return this.zones.reduce((sum, z) => sum + z.students, 0);
  }
}
