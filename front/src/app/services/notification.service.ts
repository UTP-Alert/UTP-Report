import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private audio: HTMLAudioElement;
  private audioPath = '/audio_notificacion/iphone-notificacion-.mp3'; // Usar ruta absoluta desde la raíz del servidor

  constructor() {
    this.audio = new Audio(this.audioPath);
    this.audio.load(); // Cargar el audio al inicializar el servicio
    console.log('NotificationService: Audio object created with path:', this.audioPath);
  }

  playNotificationSound(): void {
    console.log('NotificationService: Attempting to play sound...');
    this.audio.currentTime = 0; // Reiniciar el audio si ya se está reproduciendo o se reprodujo antes
    this.audio.play()
      .then(() => console.log('NotificationService: Audio played successfully.'))
      .catch(err => console.warn('NotificationService: Error playing notification sound:', err));
  }
}
