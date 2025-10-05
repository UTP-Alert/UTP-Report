// Importa el decorador Component de Angular core para definir un componente.
import { Component } from '@angular/core';
// Importa RouterOutlet para habilitar el enrutamiento en la aplicación.
import { RouterOutlet } from '@angular/router';
// Importa CommonModule para tener acceso a directivas comunes de Angular como ngIf y ngFor.
import { CommonModule } from '@angular/common';

// Decorador @Component que define las propiedades de este componente.
@Component({
  selector: 'app-root', // El selector CSS que se usa para instanciar este componente en una plantilla.
  standalone: true, // Indica que este es un componente autónomo, no requiere un NgModule.
  imports: [RouterOutlet, CommonModule], // Módulos y componentes que este componente utiliza.
  templateUrl: './app.html', // La ruta al archivo de plantilla HTML de este componente.
  styleUrl: './app.scss' // La ruta al archivo de estilos SCSS de este componente.
})
// Clase principal del componente de la aplicación.
export class App {
  // Propiedad protegida que almacena el título de la aplicación.
  protected title = 'front';
}
