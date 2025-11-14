import { Injectable, effect, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  darkMode = signal<boolean>(false);
  private storageKey = 'utp_dark_mode';

  constructor() {
    // Load dark mode preference from local storage
    try {
      const storedPreference = localStorage.getItem(this.storageKey);
      if (storedPreference !== null) {
        this.darkMode.set(JSON.parse(storedPreference));
      } else {
        // Check system preference if no stored preference
        this.darkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    } catch (e) {
      console.error('Error reading dark mode preference from localStorage', e);
      // Fallback to system preference if localStorage fails
      this.darkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    // Apply or remove dark mode class to body
    effect(() => {
      const isDarkMode = this.darkMode();
      const body = document.body;
      if (isDarkMode) {
        body.classList.add('dark-mode');
      } else {
        body.classList.remove('dark-mode');
      }
      // Persist preference to local storage
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(isDarkMode));
      } catch (e) {
        console.error('Error writing dark mode preference to localStorage', e);
      }
    });
  }

  toggleDarkMode() {
    this.darkMode.update(value => !value);
  }
}
