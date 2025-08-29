import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-downloads',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">DownloadsComponent</h1>
        <p class="text-xl text-gray-600">This page is under development.</p>
      </div>
    </div>
  `
})
export class DownloadsComponent {}
