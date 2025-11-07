import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  darkMode = signal<boolean>(false);

  constructor() {
    // Initialize dark mode from localStorage or system preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      this.darkMode.set(savedDarkMode === 'true');
    } else {
      this.darkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    // Persist dark mode state to localStorage
    effect(() => {
      localStorage.setItem('darkMode', this.darkMode().toString());
    });
  }

  toggleDarkMode() {
    this.darkMode.update(val => !val);
  }
}
