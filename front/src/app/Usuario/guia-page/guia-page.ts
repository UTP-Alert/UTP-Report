import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para directivas como *ngIf, *ngFor

@Component({
  selector: 'app-guia-page',
  standalone: true, // Asegúrate de que sea standalone
  imports: [CommonModule], // Importa CommonModule
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

  ngAfterViewInit(): void {
    // Calculate initial heights after view is initialized
    this.updateAccordionHeights();
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
}
