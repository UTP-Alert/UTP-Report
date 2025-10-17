import { Component, Input, Output, EventEmitter, ElementRef, Renderer2, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-tour',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.scss']
})
export class TourComponent implements OnChanges {
  @Input() step: any;
  @Input() isFirstStep: boolean = false;
  @Input() isLastStep: boolean = false;
  @Input() currentStepIndex: number = 0;
  @Input() totalSteps: number = 0;
  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();
  @Output() closeTour = new EventEmitter<void>();

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['step'] && this.step && this.step.targetSelector) {
      setTimeout(() => this.positionTour(), 0); // Pequeño retraso para asegurar que el DOM esté renderizado
    } else if (changes['step'] && !this.step) {
      this.resetPosition();
    }
  }

  onNext() {
    this.nextStep.emit();
  }

  onPrev() {
    this.prevStep.emit();
  }

  onClose() {
    this.closeTour.emit();
  }

  private positionTour() {
    const targetElement = document.querySelector(this.step.targetSelector);
    const tourCard = this.el.nativeElement.querySelector('.tour-card');
    const tourArrow = this.el.nativeElement.querySelector('.tour-arrow');

    if (!targetElement || !tourCard || !tourArrow) {
      this.resetPosition();
      return;
    }

    const isNavbarElement = targetElement.closest('.utp-navbar');

    // 1. Asegurar que el elemento esté en la vista (solo para elementos no fijos)
    if (!isNavbarElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Pequeño retraso para que el scroll termine antes de calcular las posiciones
    setTimeout(() => {
      const targetRect = targetElement.getBoundingClientRect();
      const tourCardRect = tourCard.getBoundingClientRect();
      const arrowSize = 20; // Ancho/alto del rombo
      const margin = 10; // Margen entre el target y el tour-card

      let top: number;
      let left: number;
      let arrowTop: number;
      let arrowLeft: number;
      let arrowTransform: string;
      let borderTop: string;
      let borderLeft: string;
      let borderBottom: string;
      let borderRight: string;
      let positionType: 'absolute' | 'fixed' = 'absolute';

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calcular espacio disponible alrededor del target
      const spaceAbove = targetRect.top;
      const spaceBelow = viewportHeight - targetRect.bottom;
      const spaceLeft = targetRect.left;
      const spaceRight = viewportWidth - targetRect.right;

      // Prioridad de posicionamiento: Abajo, Arriba, Derecha, Izquierda
      let preferredPosition: 'below' | 'above' | 'right' | 'left' | 'center' = 'below';

      if (spaceBelow < tourCardRect.height + margin && spaceAbove >= tourCardRect.height + margin) {
        preferredPosition = 'above';
      } else if (spaceBelow < tourCardRect.height + margin && spaceAbove < tourCardRect.height + margin) {
        // No hay espacio vertical suficiente, intentar horizontalmente
        if (spaceRight >= tourCardRect.width + margin) {
          preferredPosition = 'right';
        } else if (spaceLeft >= tourCardRect.width + margin) {
          preferredPosition = 'left';
        } else {
          // No hay espacio suficiente, centrar y ocultar flecha
          preferredPosition = 'center';
        }
      }

      if (isNavbarElement) {
        positionType = 'fixed';
        // Para elementos del navbar, siempre intentar debajo o encima
        if (targetRect.bottom + tourCardRect.height + margin <= viewportHeight) {
          preferredPosition = 'below';
        } else if (targetRect.top - tourCardRect.height - margin >= 0) {
          preferredPosition = 'above';
        } else {
          preferredPosition = 'center'; // Si no hay espacio ni arriba ni abajo en el viewport
        }
      }

      switch (preferredPosition) {
        case 'below':
          // Usar coordenadas relativas al viewport (targetRect ya está en viewport)
          top = targetRect.bottom + margin;
          left = targetRect.left + (targetRect.width / 2) - (tourCardRect.width / 2);
          arrowTop = -(arrowSize / 2);
          arrowLeft = (tourCardRect.width / 2) - (arrowSize / 2);
          arrowTransform = 'rotate(45deg)';
          borderTop = `2px solid var(--primary)`;
          borderLeft = `2px solid var(--primary)`;
          borderBottom = `none`;
          borderRight = `none`;
          break;
        case 'above':
          top = targetRect.top - tourCardRect.height - margin;
          left = targetRect.left + (targetRect.width / 2) - (tourCardRect.width / 2);
          arrowTop = tourCardRect.height - (arrowSize / 2);
          arrowLeft = (tourCardRect.width / 2) - (arrowSize / 2);
          arrowTransform = 'rotate(-135deg)';
          borderTop = `none`;
          borderLeft = `none`;
          borderBottom = `2px solid var(--primary)`;
          borderRight = `2px solid var(--primary)`;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tourCardRect.height / 2);
          left = targetRect.right + margin;
          arrowTop = (tourCardRect.height / 2) - (arrowSize / 2);
          arrowLeft = -(arrowSize / 2);
          arrowTransform = 'rotate(135deg)';
          borderTop = `none`;
          borderLeft = `2px solid var(--primary)`;
          borderBottom = `2px solid var(--primary)`;
          borderRight = `none`;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tourCardRect.height / 2);
          left = targetRect.left - tourCardRect.width - margin;
          arrowTop = (tourCardRect.height / 2) - (arrowSize / 2);
          arrowLeft = tourCardRect.width - (arrowSize / 2);
          arrowTransform = 'rotate(-45deg)';
          borderTop = `2px solid var(--primary)`;
          borderLeft = `none`;
          borderBottom = `none`;
          borderRight = `2px solid var(--primary)`;
          break;
        case 'center':
        default:
          top = (viewportHeight / 2) - (tourCardRect.height / 2);
          left = (viewportWidth / 2) - (tourCardRect.width / 2);
          arrowTop = 0;
          arrowLeft = 0;
          arrowTransform = '';
          borderTop = 'none';
          borderLeft = 'none';
          borderBottom = 'none';
          borderRight = 'none';
          this.renderer.setStyle(tourArrow, 'display', 'none');
          break;
      }

      // Ajustes finales para asegurar que el tour-card no se salga de la pantalla
      if (positionType === 'fixed') {
        if (left + tourCardRect.width > viewportWidth - margin) {
          left = viewportWidth - tourCardRect.width - margin;
        }
        if (left < margin) {
          left = margin;
        }
        if (top + tourCardRect.height > viewportHeight - margin) {
          top = viewportHeight - tourCardRect.height - margin;
        }
        if (top < margin) {
          top = margin;
        }
      } else { // positionType === 'absolute'
        // El overlay es fixed y targetRect está en coordenadas del viewport, por lo que
        // los límites también deben compararse con el viewport directamente (sin scroll)
        if (left + tourCardRect.width > viewportWidth - margin) {
          left = viewportWidth - tourCardRect.width - margin;
        }
        if (left < margin) {
          left = margin;
        }
        if (top + tourCardRect.height > viewportHeight - margin) {
          top = viewportHeight - tourCardRect.height - margin;
        }
        if (top < margin) {
          top = margin;
        }
      }

      this.renderer.setStyle(tourArrow, 'top', `${arrowTop}px`);
      this.renderer.setStyle(tourArrow, 'left', `${arrowLeft}px`);
      this.renderer.setStyle(tourArrow, 'transform', arrowTransform);
      this.renderer.setStyle(tourArrow, 'border-top', borderTop);
      this.renderer.setStyle(tourArrow, 'border-left', borderLeft);
      this.renderer.setStyle(tourArrow, 'border-bottom', borderBottom);
      this.renderer.setStyle(tourArrow, 'border-right', borderRight);
      this.renderer.setStyle(tourArrow, 'display', 'block');

      this.renderer.setStyle(tourCard, 'position', positionType);
      this.renderer.setStyle(tourCard, 'top', `${top}px`);
      this.renderer.setStyle(tourCard, 'left', `${left}px`);
      this.renderer.setStyle(tourCard, 'transform', 'none'); // Eliminar cualquier transformación de centrado
    }, 300); // Retraso aumentado para que el scroll tenga tiempo de ejecutarse
  }

  private resetPosition() {
    const tourCard = this.el.nativeElement.querySelector('.tour-card');
    const tourArrow = this.el.nativeElement.querySelector('.tour-arrow');
    if (tourCard) {
      this.renderer.setStyle(tourCard, 'position', 'fixed');
      this.renderer.setStyle(tourCard, 'top', '50%');
      this.renderer.setStyle(tourCard, 'left', '50%');
      this.renderer.setStyle(tourCard, 'transform', 'translate(-50%, -50%)');
    }
    if (tourArrow) {
      this.renderer.setStyle(tourArrow, 'display', 'none');
    }
  }
}
