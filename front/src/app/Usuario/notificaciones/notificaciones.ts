import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.scss'
})
export class Notificaciones {
  @Input() items: Array<{ title?: string; body?: string; zonaNombre?: string; estado?: string; ts?: Date; read?: boolean }>|null = [];
}
