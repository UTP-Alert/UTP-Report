import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss'
})
export class Inicio {
  userName: string = 'Super Admin User';
  userRole: string = 'Super Admin';
  isSessionActive: boolean = true; // Simulate session status

  // For demonstration purposes, a method to toggle session status
  toggleSession() {
    this.isSessionActive = !this.isSessionActive;
  }
}
