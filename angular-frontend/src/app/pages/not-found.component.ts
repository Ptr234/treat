import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <h1 class="text-9xl font-bold text-gray-200">404</h1>
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p class="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div class="space-x-4">
          <button 
            routerLink="/"
            class="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
          >
            Go Home
          </button>
          <button 
            (click)="goBack()"
            class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}