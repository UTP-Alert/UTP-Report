import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sedes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sedes.html',
  styleUrl: './sedes.scss'
})
export class Sedes {
  zonas: any[] = []; // Initialize as an empty array
}
