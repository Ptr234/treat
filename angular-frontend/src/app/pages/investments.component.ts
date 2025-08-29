
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { investments, investmentCategories, Investment } from '../data/investments';

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <div class="mb-6">
          <img 
            src="/images/Investment-Opportunities-in-Uganda.webp" 
            alt="Uganda Investment Opportunities" 
            class="w-32 h-20 mx-auto mb-4 rounded-lg shadow-lg object-cover"
          >
        </div>
        <h1 class="font-display text-hero text-gray-900 mb-6">Investment Opportunities</h1>
        <p class="text-body-large text-gray-600 max-w-4xl mx-auto mb-8">
          Discover high-return investment opportunities across Uganda's rapidly expanding economy. 
          From agriculture to technology, find vetted projects with proven track records and strong growth potential.
        </p>
        <div class="flex justify-center items-center space-x-8 text-sm text-gray-500">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            $2.5B+ Opportunities
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            15-35% Average Returns
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-black rounded-full mr-2"></div>
            Vetted Projects Only
          </div>
        </div>
      </div>

      <!-- Investment Statistics -->
      <section class="mb-16">
        <div class="uganda-gradient rounded-xl p-8 text-white text-center">
          <h2 class="font-display text-card-title text-white mb-8">Uganda Investment Landscape</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div class="text-3xl font-bold mb-2">6.2%</div>
              <div class="text-sm text-gray-200">GDP Growth Rate</div>
            </div>
            <div>
              <div class="text-3xl font-bold mb-2">47M</div>
              <div class="text-sm text-gray-200">Population</div>
            </div>
            <div>
              <div class="text-3xl font-bold mb-2">177M</div>
              <div class="text-sm text-gray-200">EAC Market Access</div>
            </div>
            <div>
              <div class="text-3xl font-bold mb-2">$4.2B</div>
              <div class="text-sm text-gray-200">FDI Inflows 2023</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Key Investment Sectors -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="font-display text-section-title text-gray-900 mb-4">High-Growth Sectors</h2>
          <p class="text-body-large text-gray-600 max-w-3xl mx-auto">
            Uganda's economy offers diverse investment opportunities across multiple thriving sectors
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div class="card-uganda p-6 text-center group hover:scale-105 transition-transform">
            <div class="w-16 h-16 prosperity-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Agriculture</h3>
            <p class="text-sm text-gray-600 mb-3">Coffee, cocoa, vanilla, and food processing opportunities</p>
            <div class="text-lg font-bold text-red-600">25-40% ROI</div>
          </div>

          <div class="card-uganda p-6 text-center group hover:scale-105 transition-transform">
            <div class="w-16 h-16 unity-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Manufacturing</h3>
            <p class="text-sm text-gray-600 mb-3">Textiles, steel, pharmaceuticals, and consumer goods</p>
            <div class="text-lg font-bold text-red-600">20-35% ROI</div>
          </div>

          <div class="card-uganda p-6 text-center group hover:scale-105 transition-transform">
            <div class="w-16 h-16 strength-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Technology</h3>
            <p class="text-sm text-gray-600 mb-3">Fintech, e-commerce, mobile apps, and digital services</p>
            <div class="text-lg font-bold text-red-600">30-60% ROI</div>
          </div>

          <div class="card-uganda p-6 text-center group hover:scale-105 transition-transform">
            <div class="w-16 h-16 uganda-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Real Estate</h3>
            <p class="text-sm text-gray-600 mb-3">Commercial, residential, and hospitality developments</p>
            <div class="text-lg font-bold text-red-600">15-25% ROI</div>
          </div>
        </div>
      </section>

      <!-- Filter Categories -->
      <div class="flex flex-wrap justify-center gap-2 mb-8">
        <button
          *ngFor="let category of categories"
          (click)="setActiveCategory(category)"
          [class]="getCategoryButtonClass(category)"
        >
          {{ category }}
        </button>
      </div>

      <!-- Investments Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div 
          *ngFor="let investment of filteredInvestments()" 
          class="card-modern hover:shadow-2xl transition-all duration-300 overflow-hidden group"
        >
          <div class="h-48 bg-cover bg-center" [style.background-image]="'url(' + investment.image + ')'">
            <div class="h-full bg-black bg-opacity-40 flex items-end p-6">
              <h3 class="text-2xl font-bold text-white">{{ investment.title }}</h3>
            </div>
          </div>
          
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                {{ investment.category }}
              </span>
              <span class="px-3 py-1 text-sm font-medium rounded-full"
                    [class]="getRiskClass(investment.risk)">
                {{ investment.risk }} Risk
              </span>
            </div>
            
            <p class="text-gray-600 mb-6">{{ investment.description }}</p>
            
            <div class="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <span class="text-gray-500 block">Investment Range</span>
                <span class="font-semibold">{{ investment.investment }}</span>
              </div>
              <div>
                <span class="text-gray-500 block">Expected Returns</span>
                <span class="font-semibold text-red-600">{{ investment.returns }}</span>
              </div>
              <div>
                <span class="text-gray-500 block">Timeline</span>
                <span class="font-semibold">{{ investment.timeline }}</span>
              </div>
              <div>
                <span class="text-gray-500 block">Location</span>
                <span class="font-semibold">{{ investment.location }}</span>
              </div>
            </div>
            
            <div class="mb-6">
              <h4 class="font-semibold text-gray-900 mb-2">Key Benefits</h4>
              <div class="flex flex-wrap gap-2">
                <span 
                  *ngFor="let benefit of investment.benefits.slice(0, 3)" 
                  class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                >
                  {{ benefit }}
                </span>
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-2 mb-4">
              <a 
                [href]="'tel:' + investment.contact.phone" 
                class="btn-uganda-accent text-xs text-center py-2 group-hover:scale-105 transition-transform flex items-center justify-center"
              >
                <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call
              </a>
              
              <a 
                [href]="'mailto:' + investment.contact.email + '?subject=Investment Inquiry: ' + investment.title" 
                class="btn-uganda-secondary text-xs text-center py-2 group-hover:scale-105 transition-transform flex items-center justify-center"
              >
                <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
              
              <a 
                [href]="investment.contact.website" 
                target="_blank" 
                rel="noopener noreferrer"
                class="btn-uganda-primary text-xs text-center py-2 group-hover:scale-105 transition-transform flex items-center justify-center"
              >
                <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Apply
              </a>
            </div>
            
            <div class="flex gap-3">
              <button class="flex-1 btn-uganda-secondary group-hover:scale-105 transition-transform">
                Learn More
              </button>
              <a routerLink="/roi-calculator" class="flex-1 btn-uganda-primary text-center group-hover:scale-105 transition-transform">
                Calculate ROI
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Investment Support Section -->
      <section class="mt-20">
        <div class="text-center mb-12">
          <h2 class="font-display text-section-title text-gray-900 mb-4">Investment Support Services</h2>
          <p class="text-body-large text-gray-600 max-w-3xl mx-auto">
            Comprehensive support to ensure your investment success in Uganda
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div class="card-modern p-6 text-center">
            <div class="w-16 h-16 prosperity-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2V7a2 2 0 012-2z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2" />
              </svg>
            </div>
            <h3 class="text-card-title font-semibold text-gray-900 mb-3">Due Diligence</h3>
            <p class="text-body text-gray-600">
              Comprehensive investment analysis, risk assessment, and project validation 
              by our expert financial analysts.
            </p>
          </div>

          <div class="card-modern p-6 text-center">
            <div class="w-16 h-16 unity-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="text-card-title font-semibold text-gray-900 mb-3">Legal Framework</h3>
            <p class="text-body text-gray-600">
              Complete legal structuring, documentation, and compliance management 
              for your Uganda investments.
            </p>
          </div>

          <div class="card-modern p-6 text-center">
            <div class="w-16 h-16 strength-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-4 4" />
              </svg>
            </div>
            <h3 class="text-card-title font-semibold text-gray-900 mb-3">Ongoing Support</h3>
            <p class="text-body text-gray-600">
              Continuous monitoring, performance tracking, and strategic guidance 
              throughout your investment journey.
            </p>
          </div>
        </div>
      </section>

      <!-- Call to Action Section -->
      <section class="mt-16 text-center">
        <div class="strength-gradient rounded-xl p-12 text-white">
          <h2 class="font-display text-section-title text-white mb-6">Ready to Invest in Uganda's Future?</h2>
          <p class="text-body-large text-gray-100 mb-8 max-w-3xl mx-auto">
            Join successful investors who've already discovered the incredible opportunities 
            in Uganda's growing economy. Let our experts guide you to profitable investments.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a routerLink="/roi-calculator" class="btn-uganda-secondary text-black hover:text-white">
              Calculate Investment Returns
            </a>
            <a routerLink="/support" class="bg-transparent border-2 border-yellow-400 text-yellow-300 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-400 hover:text-black transition-all duration-300">
              Schedule Consultation
            </a>
          </div>
        </div>
      </section>
    </div>
  `
})
export class InvestmentsComponent implements OnInit {
  investments = investments;
  categories = investmentCategories;
  activeCategory = signal('All');
  filteredInvestments = signal<Investment[]>([]);

  ngOnInit(): void {
    this.filteredInvestments.set(this.investments);
  }

  setActiveCategory(category: string): void {
    this.activeCategory.set(category);
    if (category === 'All') {
      this.filteredInvestments.set(this.investments);
    } else {
      this.filteredInvestments.set(
        this.investments.filter(investment => investment.category === category)
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

  getRiskClass(risk: string): string {
    const classes = {
      'Low': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Medium-High': 'bg-orange-100 text-orange-800',
      'High': 'bg-red-100 text-red-800'
    };
    return classes[risk as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }
}
