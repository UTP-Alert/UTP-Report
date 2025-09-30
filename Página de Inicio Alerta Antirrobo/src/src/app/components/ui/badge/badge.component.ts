import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getBadgeClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() class = '';

  getBadgeClasses(): string {
    const baseClasses = 'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    
    const variantClasses = {
      default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
      secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
      outline: 'text-foreground'
    };

    return `${baseClasses} ${variantClasses[this.variant]} ${this.class}`;
  }
}