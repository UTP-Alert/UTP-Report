import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../ui/button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../ui/card/card.component';
import { InputComponent } from '../ui/input/input.component';
import { BadgeComponent } from '../ui/badge/badge.component';
import { AlertComponent, AlertDescriptionComponent } from '../ui/alert/alert.component';

interface ReportForm {
  type: string;
  zone: string;
  description: string;
  photo: File | null;
  anonymous: boolean;
}

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    InputComponent,
    BadgeComponent,
    AlertComponent,
    AlertDescriptionComponent
  ],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <app-card class="border-0">
          <app-card-header class="border-b">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <app-card-title class="text-xl">Reportar Incidente</app-card-title>
                  <app-card-description>Informa sobre situaciones sospechosas o robos</app-card-description>
                </div>
              </div>
              <app-button variant="ghost" size="icon" (click)="onClose.emit()">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </app-button>
            </div>
          </app-card-header>

          <app-card-content class="p-6">
            <form (ngSubmit)="handleSubmit()" class="space-y-6">
              <!-- Tipo de Incidente -->
              <div>
                <label class="block text-sm font-medium mb-3">Tipo de Incidente *</label>
                <div class="grid grid-cols-2 gap-3">
                  <div 
                    *ngFor="let type of incidentTypes" 
                    class="cursor-pointer"
                    (click)="selectIncidentType(type.id)">
                    <div [class]="getIncidentTypeClasses(type.id)">
                      <div class="flex items-center justify-center mb-2">
                        <ng-container [innerHTML]="type.icon"></ng-container>
                      </div>
                      <div class="text-sm font-medium text-center">{{ type.label }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Ubicación/Zona -->
              <div>
                <label class="block text-sm font-medium mb-3">Zona Universitaria *</label>
                <div class="grid grid-cols-2 gap-2">
                  <app-button
                    *ngFor="let zone of universityZones"
                    type="button"
                    [variant]="reportForm().zone === zone ? 'default' : 'outline'"
                    (click)="selectZone(zone)"
                    class="text-sm h-10">
                    {{ zone }}
                  </app-button>
                </div>
              </div>

              <!-- Descripción -->
              <div>
                <label for="description" class="block text-sm font-medium mb-2">
                  Descripción del Incidente *
                </label>
                <textarea
                  id="description"
                  [value]="reportForm().description"
                  (input)="updateDescription($event)"
                  placeholder="Describe lo que ocurrió de manera clara y detallada. Incluye hora aproximada si es posible..."
                  class="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required>
                </textarea>
                <p class="text-xs text-gray-500 mt-1">
                  Mínimo 20 caracteres. Sé específico para ayudar a la comunidad.
                </p>
              </div>

              <!-- Subir Foto -->
              <div>
                <label class="block text-sm font-medium mb-2">Subir Foto (Opcional)</label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    (change)="handleFileUpload($event)"
                    accept="image/*"
                    class="hidden"
                    #fileInput />
                  
                  <div *ngIf="!reportForm().photo">
                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p class="text-gray-600 mb-2">Arrastra una imagen aquí o</p>
                    <app-button type="button" variant="outline" (click)="fileInput.click()">
                      Seleccionar Archivo
                    </app-button>
                  </div>

                  <div *ngIf="reportForm().photo" class="space-y-3">
                    <svg class="w-12 h-12 text-green-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-green-600 font-medium">{{ reportForm().photo?.name }}</p>
                    <div class="flex gap-2 justify-center">
                      <app-button type="button" variant="outline" size="sm" (click)="fileInput.click()">
                        Cambiar
                      </app-button>
                      <app-button type="button" variant="outline" size="sm" (click)="removePhoto()">
                        Quitar
                      </app-button>
                    </div>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  Ayuda a la investigación subiendo fotos del área o evidencia (opcional)
                </p>
              </div>

              <!-- Reporte Anónimo -->
              <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [checked]="reportForm().anonymous"
                    (change)="toggleAnonymous()"
                    class="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mt-0.5" />
                  <div>
                    <div class="font-medium text-blue-900 mb-1">
                      🔒 Enviar como denuncia anónima
                    </div>
                    <p class="text-sm text-blue-700">
                      Tu identidad será completamente protegida. El reporte será procesado sin revelar información personal.
                    </p>
                  </div>
                </label>
              </div>

              <!-- Información de Privacidad -->
              <app-alert class="border-green-200 bg-green-50">
                <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <app-alert-description class="text-green-800">
                  <strong>Tu privacidad está protegida:</strong> Todos los reportes son tratados con confidencialidad. 
                  La información solo se usa para alertar a la comunidad y mejorar la seguridad.
                </app-alert-description>
              </app-alert>

              <!-- Botones de acción -->
              <div class="flex gap-4 pt-4 border-t">
                <app-button
                  type="button"
                  variant="outline"
                  (click)="onClose.emit()"
                  class="flex-1">
                  Cancelar
                </app-button>
                <app-button
                  type="submit"
                  [disabled]="!isFormValid()"
                  class="flex-1 bg-primary hover:bg-primary/90">
                  <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar Reporte
                </app-button>
              </div>
            </form>
          </app-card-content>
        </app-card>
      </div>
    </div>
  `
})
export class ReportModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  reportForm = signal<ReportForm>({
    type: '',
    zone: '',
    description: '',
    photo: null,
    anonymous: true
  });

  incidentTypes = [
    {
      id: 'robo',
      label: 'Robo',
      icon: '<svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>'
    },
    {
      id: 'sospechoso',
      label: 'Persona Sospechosa',
      icon: '<svg class="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>'
    },
    {
      id: 'agresion',
      label: 'Agresión',
      icon: '<svg class="w-6 h-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>'
    },
    {
      id: 'acoso',
      label: 'Acoso',
      icon: '<svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
    },
    {
      id: 'vandalismo',
      label: 'Vandalismo',
      icon: '<svg class="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7.5l-2.5 2.5m-11-1l2.5-2.5m11 7l-2.5-2.5m-11 1l2.5 2.5M6 7.5V4.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5z" /></svg>'
    },
    {
      id: 'otro',
      label: 'Otro',
      icon: '<svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
    }
  ];

  universityZones = [
    'Entrada Principal',
    'Biblioteca Central',
    'Cafetería',
    'Estacionamiento Norte',
    'Estacionamiento Sur',
    'Laboratorios',
    'Aulas Bloque A',
    'Aulas Bloque B',
    'Zona Deportiva',
    'Jardines',
    'Auditorio',
    'Otra Zona'
  ];

  selectIncidentType(typeId: string): void {
    this.reportForm.update(form => ({ ...form, type: typeId }));
  }

  selectZone(zone: string): void {
    this.reportForm.update(form => ({ ...form, zone }));
  }

  updateDescription(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.reportForm.update(form => ({ ...form, description: target.value }));
  }

  handleFileUpload(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
    this.reportForm.update(form => ({ ...form, photo: file }));
  }

  removePhoto(): void {
    this.reportForm.update(form => ({ ...form, photo: null }));
  }

  toggleAnonymous(): void {
    this.reportForm.update(form => ({ ...form, anonymous: !form.anonymous }));
  }

  getIncidentTypeClasses(typeId: string): string {
    const isSelected = this.reportForm().type === typeId;
    return `p-4 border-2 rounded-lg transition-all hover:bg-gray-50 ${
      isSelected 
        ? 'border-primary bg-primary/5 text-primary' 
        : 'border-gray-200 hover:border-gray-300'
    }`;
  }

  isFormValid(): boolean {
    const form = this.reportForm();
    return !!(form.type && form.zone && form.description && form.description.length >= 20);
  }

  handleSubmit(): void {
    if (!this.isFormValid()) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    const form = this.reportForm();
    const anonymousText = form.anonymous ? 'anónimo' : 'identificado';
    
    alert(
      `✅ Reporte ${anonymousText} enviado exitosamente\n\n` +
      `📍 Zona: ${form.zone}\n` +
      `🚨 Tipo: ${this.incidentTypes.find(t => t.id === form.type)?.label}\n` +
      `📝 Descripción: ${form.description.substring(0, 50)}...\n\n` +
      `La comunidad universitaria será notificada inmediatamente.`
    );

    // Reset form and close modal
    this.reportForm.set({
      type: '',
      zone: '',
      description: '',
      photo: null,
      anonymous: true
    });
    
    this.close.emit();
  }
}