
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { COMPREHENSIVE_SERVICES, serviceCategories, Service } from '../data/services';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <div class="mb-6">
          <img 
            src="https://upload.wikimedia.com/wikipedia/commons/thumb/4/4e/Flag_of_Uganda.svg/1200px-Flag_of_Uganda.svg.png" 
            alt="Uganda Flag" 
            class="w-24 h-16 mx-auto mb-4 rounded-lg shadow-lg"
          >
        </div>
        <h1 class="font-display text-hero text-gray-900 mb-6">Government Services</h1>
        <p class="text-body-large text-gray-600 max-w-4xl mx-auto mb-8">
          Your comprehensive gateway to all Uganda government services. From business registration to investment licenses, 
          access everything you need through our streamlined digital platform.
        </p>
        <div class="flex justify-center items-center space-x-8 text-sm text-gray-500">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            15+ Government Agencies
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            50+ Services Available
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-black rounded-full mr-2"></div>
            Digital Processing
          </div>
        </div>
      </div>

      <!-- Key Benefits Section -->
      <section class="mb-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="card-uganda p-6 text-center">
            <div class="w-16 h-16 prosperity-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="font-display text-card-title text-gray-900 mb-3">Lightning Fast</h3>
            <p class="text-body text-gray-600">
              Reduce processing times by up to 80% with our streamlined digital workflows 
              and direct agency integration.
            </p>
          </div>

          <div class="card-uganda p-6 text-center">
            <div class="w-16 h-16 unity-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.414-4.414L18.586 5H15.414L12.586 2.172a2 2 0 00-2.828 0L6.93 5H3.707l1.414-1.414a2 2 0 000-2.828L2.293.929A1 1 0 00.879 2.343L2.707 4.171H6L8.828 1.343a2 2 0 012.828 0L14.485 4.171H17.707L19.535 2.343A1 1 0 0020.949.929L18.121 3.757z" />
              </svg>
            </div>
            <h3 class="font-display text-card-title text-gray-900 mb-3">Expert Guidance</h3>
            <p class="text-body text-gray-600">
              Get professional support from our certified consultants who understand 
              Uganda's regulatory landscape inside-out.
            </p>
          </div>

          <div class="card-uganda p-6 text-center">
            <div class="w-16 h-16 strength-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="font-display text-card-title text-gray-900 mb-3">100% Compliant</h3>
            <p class="text-body text-gray-600">
              Ensure full regulatory compliance with our up-to-date processes 
              and direct government agency partnerships.
            </p>
          </div>
        </div>
      </section>

      <!-- Filter Categories -->
      <div class="flex flex-wrap justify-center gap-2 mb-8">
        <button
          *ngFor="let category of categories"
          (click)="setActiveCategory(category)"
          [class]="getCategoryButtonClass(category)"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          {{ category }}
        </button>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          *ngFor="let service of filteredServices()" 
          class="card-modern hover:shadow-2xl transition-all duration-300 p-6 group"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <img 
                  *ngIf="service.logo" 
                  [src]="service.logo" 
                  [alt]="service.agency + ' logo'"
                  class="w-8 h-8 mr-3 object-contain"
                  onerror="this.style.display='none'"
                >
                <div>
                  <h3 class="text-card-title font-semibold text-gray-900 group-hover:text-black transition-colors">{{ service.title }}</h3>
                  <p class="text-sm font-medium text-red-600">{{ service.agency }}</p>
                </div>
              </div>
            </div>
            <div class="flex flex-col items-end space-y-1">
              <span 
                class="px-2 py-1 text-xs font-medium rounded"
                [class]="getPriorityClass(service.priority)"
              >
                {{ service.priority | titlecase }}
              </span>
              <span 
                *ngIf="service.required" 
                class="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800"
              >
                Required
              </span>
            </div>
          </div>
          
          <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ service.description }}</p>
          
          <!-- Requirements Preview -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-gray-500">Required Documents:</span>
              <button 
                (click)="toggleRequirements(service.id)"
                class="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                {{ expandedServices.has(service.id) ? 'Hide' : 'Show' }} ({{ service.requirements.length }})
              </button>
            </div>
            <div 
              *ngIf="expandedServices.has(service.id)"
              class="bg-gray-50 rounded-lg p-3 space-y-1 max-h-32 overflow-y-auto"
            >
              <div *ngFor="let req of service.requirements" class="flex items-start text-xs text-gray-700">
                <div class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                <span>{{ req }}</span>
              </div>
            </div>
          </div>
          
          <div class="space-y-2 text-sm mb-4">
            <div class="flex justify-between">
              <span class="text-gray-500">Fee:</span>
              <span class="font-medium text-right">{{ service.fees }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Timeline:</span>
              <span class="font-medium text-right">{{ service.timeline }}</span>
            </div>
            <div *ngIf="service.contact.address" class="flex justify-between">
              <span class="text-gray-500">Address:</span>
              <span class="font-medium text-right text-xs leading-tight max-w-32">{{ service.contact.address }}</span>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="grid grid-cols-3 gap-2">
              <a 
                [href]="'tel:' + service.contact.phone" 
                class="btn-uganda-accent text-xs text-center py-2 group-hover:scale-105 transition-transform flex items-center justify-center"
                title="Call {{ service.contact.phone }}"
              >
                <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call
              </a>
              
              <a 
                [href]="'mailto:' + service.contact.email + '?subject=Inquiry about ' + service.title" 
                class="btn-uganda-secondary text-xs text-center py-2 group-hover:scale-105 transition-transform flex items-center justify-center"
                title="Email {{ service.contact.email }}"
              >
                <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
              
              <a 
                [href]="service.contact.website" 
                target="_blank" 
                rel="noopener noreferrer"
                class="btn-uganda-primary text-xs text-center py-2 group-hover:scale-105 transition-transform flex items-center justify-center"
                title="Visit {{ service.contact.website }}"
              >
                <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Apply
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Call to Action Section -->
      <section class="mt-20 text-center">
        <div class="uganda-gradient rounded-xl p-12 text-white">
          <h2 class="font-display text-section-title text-white mb-6">Need Help With Your Applications?</h2>
          <p class="text-body-large text-gray-100 mb-8 max-w-3xl mx-auto">
            Our expert consultants are ready to guide you through every step of the process. 
            From document preparation to application submission, we ensure your success.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a routerLink="/registration-wizard" class="btn-uganda-secondary text-black hover:text-white">
              Start Registration Wizard
            </a>
            <a routerLink="/support" class="bg-transparent border-2 border-yellow-400 text-yellow-300 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-400 hover:text-black transition-all duration-300">
              Get Expert Consultation
            </a>
          </div>
        </div>
      </section>
    </div>
  `
})
export class ServicesComponent implements OnInit {
  services = COMPREHENSIVE_SERVICES;
  categories = serviceCategories;
  activeCategory = signal('All');
  filteredServices = signal<Service[]>([]);
  expandedServices = new Set<string>();

  ngOnInit(): void {
    this.filteredServices.set(this.services);
  }

  setActiveCategory(category: string): void {
    this.activeCategory.set(category);
    if (category === 'All') {
      this.filteredServices.set(this.services);
    } else {
      this.filteredServices.set(
        this.services.filter(service => service.category === category)
      );
    }
  }

  getCategoryButtonClass(category: string): string {
    const isActive = this.activeCategory() === category;
    if (isActive) {
      return 'btn-uganda-primary';
    } else {
      return 'btn-uganda-secondary hover:bg-yellow-400 hover:text-black';
    }
  }

  getPriorityClass(priority: string): string {
    const classes = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return classes[priority as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  toggleRequirements(serviceId: string): void {
    if (this.expandedServices.has(serviceId)) {
      this.expandedServices.delete(serviceId);
    } else {
      this.expandedServices.add(serviceId);
    }
  }
}
