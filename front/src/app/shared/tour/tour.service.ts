import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TourService {

  steps: any[] = [];
  currentStepIndex: number = -1;
  tourStepChanged = new EventEmitter<any>(); // Emite el paso actual para que el componente lo posicione

  constructor() { }

  init(steps: any[]) {
    this.steps = steps;
    this.currentStepIndex = -1;
  }

  open(startIndex: number = 0) {
    if (this.steps.length === 0) {
      console.warn('TourService: No steps defined for the tour.');
      return;
    }
    this.currentStepIndex = startIndex;
    this.showStep(this.currentStepIndex);
  }

  next() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.showStep(this.currentStepIndex);
    } else {
      this.completeTour();
    }
  }

  prev() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.showStep(this.currentStepIndex);
    }
  }

  showStep(index: number) {
    if (index >= 0 && index < this.steps.length) {
      const step = this.steps[index];
      console.log(`Tour Step ${index + 1}: ${step.title} - ${step.content}`);
      this.tourStepChanged.emit({
        step: step,
        index: index,
        isFirst: index === 0,
        isLast: index === this.steps.length - 1
      });
    }
  }

  completeTour() {
    console.log('Tour completado.');
    this.currentStepIndex = -1;
    this.tourStepChanged.emit(null); // Emitir null para ocultar el tour
  }
}
