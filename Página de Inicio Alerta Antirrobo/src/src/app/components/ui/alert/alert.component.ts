import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertVariant = 'default' | 'destructive';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getAlertClasses()" role="alert">
      <ng-content></ng-content>
    </div>
  `
})
export class AlertComponent {
  @Input() variant: AlertVariant = 'default';
  @Input() class = '';

  getAlertClasses(): string {
    const baseClasses = 'relative w-full rounded-lg border px-4 py-3 text-sm';
    
    const variantClasses = {
      default: 'bg-background text-foreground',
      destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
    };

    return `${baseClasses} ${variantClasses[this.variant]} ${this.class}`;
  }
}

@Component({
  selector: 'app-alert-description',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getDescriptionClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class AlertDescriptionComponent {
  @Input() class = '';

  getDescriptionClasses(): string {
    return `text-sm [&_p]:leading-relaxed ${this.class}`;
  }
}