import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef, Renderer2, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para directivas como *ngIf, *ngFor
import { TourService } from '../../shared/tour/tour.service'; // Import TourService

// Declare bootstrap global object to avoid TypeScript errors
declare var bootstrap: any;

@Component({
  selector: 'app-guia-page',
  standalone: true, // Asegúrate de que sea standalone
  imports: [
    CommonModule,
  ],
  templateUrl: './guia-page.html',
  styleUrl: './guia-page.scss'
})
export class GuiaPage implements AfterViewInit {
  @ViewChildren('accordionContent') accordionContents!: QueryList<ElementRef>;

  faqs = [
    { question: '¿Cómo reporto un incidente de seguridad?', answer: 'Puedes reportar un incidente usando el botón \'REPORTAR AHORA\' en la página principal, o navegando a la sección de Alertas. Todos los reportes son anónimos y seguros. Si es una emergencia inmediata, llama al 911 primero.', height: '0px' },
    { question: '¿Los reportes son realmente anónimos?', answer: 'Sí, completamente. Nuestro sistema está diseñado para proteger tu identidad. No recopilamos información personal identificable y todos los datos están encriptados. Tu seguridad y privacidad son nuestra prioridad.', height: '0px' },
    { question: '¿Qué hago si presencio un robo en curso?', answer: 'Si presencias un crimen en progreso: 1) Llama inmediatamente al 911, 2) No intervengas directamente, 3) Mantente a distancia segura, 4) Reporta en nuestra plataforma después para ayudar a otros estudiantes.', height: '0px' },
    { question: '¿Cómo funcionan las alertas en tiempo real?', answer: 'Las alertas se actualizan cada 30 segundos con información verificada de la comunidad. Los reportes pasan por un filtro automático y son confirmados por múltiples usuarios antes de mostrarse públicamente.', height: '0px' },
    { question: '¿Puedo editar o eliminar un reporte que hice?', answer: 'Como los reportes son anónimos, no es posible editarlos después de enviarlos. Sin embargo, puedes agregar información adicional creando un nuevo reporte relacionado o contactando a soporte.', height: '0px' },
    { question: '¿Qué información debo incluir en un reporte?', answer: 'Incluye: ubicación específica, hora aproximada, descripción detallada de lo ocurrido, descripción del perpetrador (si es seguro), y cualquier objeto sustraído. Más detalles ayudan a la comunidad.', height: '0px' },
    { question: '¿La universidad tiene acceso a mi información?', answer: 'No recopilamos datos personales. La universidad recibe estadísticas generales y reportes anónimos para mejorar la seguridad del campus, pero nunca información que pueda identificarte.', height: '0px' },
    { question: '¿Puedo reportar actividad sospechosa?', answer: '¡Absolutamente! Es mejor reportar actividad sospechosa que esperar a que ocurra un incidente. Usa la categoría \'Actividad Sospechosa\' en el formulario de reporte.', height: '0px' }
  ];

  activeAccordionIndex: number | null = null;
  Math = Math; // Make Math object available in the template

  // Tutorial Modal Logic
  currentStep: number = 0;
  tutorialSteps: string[] = [
    'Bienvenida',
    'Tipo de Incidente',
    'Ubicación',
    'Descripción',
    'Evidencia',
    'Privacidad',
    'Finalización'
  ];
  progress: number = 0;

  private bsModal: any; // Bootstrap modal instance
  private tourService = inject(TourService); // Inject TourService

  darkMode = signal<boolean>(false);
  private storageKey = 'guia_dark_mode';

  constructor(private renderer: Renderer2) {
    // Load dark mode preference from local storage
    try {
      const storedPreference = localStorage.getItem(this.storageKey);
      if (storedPreference !== null) {
        this.darkMode.set(JSON.parse(storedPreference));
      } else {
        this.darkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    } catch (e) {
      console.error('Error reading dark mode preference from localStorage', e);
      this.darkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    effect(() => {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.darkMode()));
      } catch (e) {
        console.error('Error writing dark mode preference to localStorage', e);
      }
    });
  }

  ngAfterViewInit(): void {
    // Calculate initial heights after view is initialized
    this.updateAccordionHeights();

    // Initialize Bootstrap modal after view is initialized
    const modalElement = document.getElementById('reportTutorialModal');
    if (modalElement) {
      this.bsModal = new bootstrap.Modal(modalElement, {
        backdrop: 'static', // Prevent closing by clicking outside
        keyboard: false // Prevent closing by pressing escape key
      });

      // Listen for modal hide event
      modalElement.addEventListener('hidden.bs.modal', () => {
        // No need to set isOpen, as it's removed
      });
    }
  }

  toggleAccordion(index: number): void {
    if (this.activeAccordionIndex === index) {
      this.activeAccordionIndex = null; // Close if already open
    } else {
      this.activeAccordionIndex = index; // Open new item
    }
    setTimeout(() => this.updateAccordionHeights(), 0);
  }

  updateAccordionHeights(): void {
    this.accordionContents.forEach((contentRef, index) => {
      if (this.faqs[index]) {
        this.faqs[index].height = `${contentRef.nativeElement.scrollHeight}px`;
      }
    });
  }

  openTutorial(): void {
    this.currentStep = 0;
    this.updateProgress();
    if (this.bsModal) {
      this.bsModal.show();
    }
  }

  onClose(): void {
    if (this.bsModal) {
      this.bsModal.hide();
    }
  }

  handleNext(): void {
    if (this.currentStep < this.tutorialSteps.length - 1) {
      this.currentStep++;
      this.updateProgress();
    }
  }

  handlePrevious(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateProgress();
    }
  }

  handleComplete(): void {
    localStorage.setItem('firstReportTutorialCompleted', 'true');
    this.onClose();
  }

  skipTutorial(): void {
    localStorage.setItem('firstReportTutorialCompleted', 'true');
    this.onClose();
  }

  updateProgress(): void {
    this.progress = ((this.currentStep + 1) / this.tutorialSteps.length) * 100;
  }

  getStepIconClass(): string {
    switch (this.currentStep) {
      case 0: return 'fas fa-shield-alt';
      case 1: return 'fas fa-exclamation-triangle';
      case 2: return 'fas fa-map-marker-alt';
      case 3: return 'fas fa-file-alt';
      case 4: return 'fas fa-camera';
      case 5: return 'fas fa-shield-alt'; // Privacy step also uses shield
      case 6: return 'fas fa-check-circle';
      default: return '';
    }
  }

  startSystemTour(): void {
    const steps = [
      { title: '¡Bienvenido a UTP+Report!', content: 'Te guiaremos paso a paso para que conozcas todas las funciones de seguridad disponibles.', icon: 'bi-shield-fill', tip: 'Puedes cerrar este tutorial en cualquier momento y continuar explorando.' },
      { title: 'Reportar Incidentes', content: 'Botón principal para reportar cualquier incidente de seguridad. Totalmente anónimo y seguro.', icon: 'bi-megaphone-fill', tip: 'Haz clic aquí cuando necesites reportar algo urgente.', targetSelector: '.report-main-button button[aria-label="Botón para reportar un incidente"]' },
      { title: 'Estado de Zonas', content: 'Monitoreo en tiempo real. Verde = Seguro | Amarillo = Precaución | Rojo = Peligroso.', icon: 'bi-geo-alt-fill', tip: 'Revisa esto antes de dirigirte a una zona del campus.', targetSelector: '.zones-status-section' },
      { title: 'Acciones Rápidas', content: 'Herramientas útiles: tus reportes, consejos de seguridad y contacto directo.', icon: 'bi-send-fill', tip: 'Estas acciones están siempre disponibles para ti.', targetSelector: '.quick-actions-section' },
      { title: 'Notificaciones', content: 'Alertas importantes: zonas peligrosas, actualizaciones de reportes y resoluciones.', icon: 'bi-bell-fill', tip: 'Mantente informado de todo lo importante.', targetSelector: '.nav-link.icon-only[title="Notificaciones"]' },
      { title: 'Mis Reportes', content: 'Sigue el progreso de tus reportes desde "En Investigación" hasta "Resuelto".', icon: 'bi-file-earmark-text-fill', tip: 'Recibirás notificaciones automáticas de cada progreso.', targetSelector: '.quick-actions-section button[aria-label="Ver mis reportes anteriores"]' },
      { title: '¡Listo!', content: 'Ya conoces el sistema. Cada reporte ayuda a mantener segura toda la comunidad UTP.', icon: 'bi-check-circle-fill', tip: '¡No dudes en usar el sistema cuando lo necesites!', targetSelector: 'button[title="Tour del sistema"]' }
    ];
    this.tourService.init(steps);
    this.tourService.open(0);
  }

  toggleDarkMode() {
    this.darkMode.update(value => !value);
  }
}
