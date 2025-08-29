import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ThemeState {
  isDarkMode: boolean;
  primaryColor: string;
  accentColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly initialTheme: ThemeState = {
    isDarkMode: false,
    primaryColor: '#3b82f6',
    accentColor: '#10b981'
  };

  private themeSubject = new BehaviorSubject<ThemeState>(this.initialTheme);
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.loadSavedTheme();
    this.applyThemeToDocument();
  }

  get currentTheme(): ThemeState {
    return this.themeSubject.value;
  }

  toggleDarkMode(): void {
    const currentTheme = this.currentTheme;
    const newTheme = { ...currentTheme, isDarkMode: !currentTheme.isDarkMode };
    this.updateTheme(newTheme);
  }

  updateTheme(theme: Partial<ThemeState>): void {
    const currentTheme = this.currentTheme;
    const newTheme = { ...currentTheme, ...theme };
    this.themeSubject.next(newTheme);
    this.saveTheme(newTheme);
    this.applyThemeToDocument();
  }

  private loadSavedTheme(): void {
    try {
      const savedTheme = localStorage.getItem('app-theme');
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme);
        this.themeSubject.next({ ...this.initialTheme, ...parsedTheme });
      }
    } catch (error) {
      console.warn('Failed to load saved theme:', error);
    }
  }

  private saveTheme(theme: ThemeState): void {
    try {
      localStorage.setItem('app-theme', JSON.stringify(theme));
    } catch (error) {
      console.warn('Failed to save theme:', error);
    }
  }

  private applyThemeToDocument(): void {
    const theme = this.currentTheme;
    const root = document.documentElement;
    
    if (theme.isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
  }
}