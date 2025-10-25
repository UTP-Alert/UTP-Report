import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginas.html',
  styleUrl: './paginas.scss'
})
export class Paginas {
  paginas: any[] = []; // Initialize as an empty array
}
