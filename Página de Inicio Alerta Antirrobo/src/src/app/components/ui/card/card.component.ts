import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getCardClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
  @Input() class = '';

  getCardClasses(): string {
    return `rounded-xl border bg-card text-card-foreground shadow ${this.class}`;
  }
}

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getHeaderClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class CardHeaderComponent {
  @Input() class = '';

  getHeaderClasses(): string {
    return `flex flex-col space-y-1.5 p-6 ${this.class}`;
  }
}

@Component({
  selector: 'app-card-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3 [class]="getTitleClasses()">
      <ng-content></ng-content>
    </h3>
  `
})
export class CardTitleComponent {
  @Input() class = '';

  getTitleClasses(): string {
    return `font-semibold leading-none tracking-tight ${this.class}`;
  }
}

@Component({
  selector: 'app-card-description',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p [class]="getDescriptionClasses()">
      <ng-content></ng-content>
    </p>
  `
})
export class CardDescriptionComponent {
  @Input() class = '';

  getDescriptionClasses(): string {
    return `text-sm text-muted-foreground ${this.class}`;
  }
}

@Component({
  selector: 'app-card-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getContentClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class CardContentComponent {
  @Input() class = '';

  getContentClasses(): string {
    return `p-6 pt-0 ${this.class}`;
  }
}