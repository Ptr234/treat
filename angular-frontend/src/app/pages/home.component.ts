
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero Section -->
    <section class="relative uganda-gradient text-white overflow-hidden min-h-screen flex items-center">
      <div class="absolute inset-0 bg-black/40"></div>
      
      <!-- Background Image -->
      <div 
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style="background-image: url('/images/uganda-kampala-city-view.webp')"
      ></div>
      
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <div class="mb-6">
            <img 
              src="/images/uganda-flag.png" 
              alt="Uganda Flag" 
              class="w-24 h-16 mx-auto mb-4 rounded-lg shadow-lg"
            >
          </div>
          
          <h1 class="font-display text-hero text-white mb-6 animate-pulse-uganda">
            Invest in <span class="text-yellow-300">Uganda</span> - The Pearl of Africa
          </h1>
          
          <p class="text-body-large text-gray-100 mb-8 max-w-4xl mx-auto leading-relaxed">
            Discover lucrative investment opportunities in Africa's fastest-growing economy. 
            From agriculture to technology, manufacturing to renewable energy - access government-backed 
            incentives, tax holidays, and comprehensive investor support through our unified digital platform.
          </p>
          
          <div class="flex flex-col sm:flex-row justify-center gap-6">
            <a 
              routerLink="/investments"
              class="btn-uganda-primary transform hover:scale-105"
            >
              <span class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                </svg>
                Explore Investment Opportunities
              </span>
            </a>
            
            <a 
              routerLink="/roi-calculator"
              class="btn-uganda-secondary transform hover:scale-105"
            >
              <span class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Calculate Returns
              </span>
            </a>
          </div>
          
          <!-- Investment Statistics -->
          <div class="mt-12 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div class="text-center">
              <div class="text-3xl font-bold text-yellow-300 mb-1">USD 2.5B+</div>
              <div class="text-sm text-gray-200">FDI Inflows 2023</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-red-300 mb-1">25-60%</div>
              <div class="text-sm text-gray-200">Annual ROI Range</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-white mb-1">100%</div>
              <div class="text-sm text-gray-200">Tax Holiday Available</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-yellow-300 mb-1">48M+</div>
              <div class="text-sm text-gray-200">Market Population</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section with Bento Grid -->
    <section class="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-section-title text-gray-900 mb-6 font-display">
            Why Invest in <span class="text-yellow-500">Uganda?</span>
          </h2>
          <p class="text-body-large text-gray-600 max-w-4xl mx-auto">
            Uganda offers unparalleled investment opportunities with government-backed incentives, 
            strategic location in East Africa, abundant natural resources, and a young, skilled workforce. 
            Access preferential trade agreements with over 1 billion consumers worldwide.
          </p>
        </div>
        
        <div class="bento-grid md:grid-cols-3 lg:grid-cols-3">
          <div class="card-uganda bento-item group">
            <div class="w-20 h-20 prosperity-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-card-title text-gray-900 mb-4 font-semibold">Lightning-Fast Processing</h3>
            <p class="text-body text-gray-600 leading-relaxed">
              Revolutionary streamlined processes reduce bureaucratic delays, getting your business operational 
              in days instead of months. Experience the future of business registration today.
            </p>
          </div>
          
          <div class="card-uganda bento-item group">
            <div class="w-20 h-20 unity-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-card-title text-gray-900 mb-4 font-semibold">Expert Uganda Guidance</h3>
            <p class="text-body text-gray-600 leading-relaxed">
              Our certified business consultants possess deep understanding of Uganda's regulatory landscape, 
              cultural nuances, and emerging market opportunities to guide your success story.
            </p>
          </div>
          
          <div class="card-uganda bento-item group">
            <div class="w-20 h-20 strength-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-card-title text-gray-900 mb-4 font-semibold">Comprehensive Digital Ecosystem</h3>
            <p class="text-body text-gray-600 leading-relaxed">
              Access every government agency, financial service, and business resource through one 
              unified platform. No more office hopping—your entire business journey, digitized.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-section-title text-gray-900 mb-6 font-display">
            Our <span class="text-red-500">Premium</span> Services
          </h2>
          <p class="text-body-large text-gray-600 max-w-3xl mx-auto">
            Everything you need to launch, scale, and dominate in Uganda's dynamic marketplace
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="card-modern p-8 group hover:shadow-2xl">
            <div class="w-16 h-16 prosperity-gradient rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
              <svg class="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="text-card-title text-gray-900 mb-4 font-semibold">Complete Business Registration</h3>
            <p class="text-body text-gray-600 mb-6 leading-relaxed">
              From company incorporation to trading licenses, we handle every aspect of business registration 
              with precision and speed. Full compliance guaranteed.
            </p>
            <a routerLink="/registration-wizard" class="inline-flex items-center text-black font-semibold group-hover:text-yellow-600 transition-colors">
              Get Started 
              <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          
          <div class="card-modern p-8 group hover:shadow-2xl">
            <div class="w-16 h-16 unity-gradient rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 class="text-card-title text-gray-900 mb-4 font-semibold">Premium Investment Opportunities</h3>
            <p class="text-body text-gray-600 mb-6 leading-relaxed">
              Access exclusive, high-ROI investment opportunities across Uganda's fastest-growing sectors. 
              Vetted projects with proven track records.
            </p>
            <a routerLink="/investments" class="inline-flex items-center text-red-600 font-semibold group-hover:text-red-700 transition-colors">
              Explore Investments
              <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          
          <div class="card-modern p-8 group hover:shadow-2xl">
            <div class="w-16 h-16 strength-gradient rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-card-title text-gray-900 mb-4 font-semibold">AI-Powered Business Tools</h3>
            <p class="text-body text-gray-600 mb-6 leading-relaxed">
              Advanced calculators, document generators, compliance checkers, and analytics tools 
              designed specifically for Uganda's business environment.
            </p>
            <a routerLink="/calculator" class="inline-flex items-center text-yellow-600 font-semibold group-hover:text-yellow-700 transition-colors">
              Use Tools
              <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="py-16 bg-gradient-to-r from-yellow-50 via-red-50 to-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div class="group">
            <div class="text-4xl md:text-5xl font-bold text-black mb-2 group-hover:scale-110 transition-transform duration-300">10K+</div>
            <div class="text-body text-gray-600">Businesses Registered</div>
          </div>
          <div class="group">
            <div class="text-4xl md:text-5xl font-bold text-red-600 mb-2 group-hover:scale-110 transition-transform duration-300">$2.5B</div>
            <div class="text-body text-gray-600">Investment Facilitated</div>
          </div>
          <div class="group">
            <div class="text-4xl md:text-5xl font-bold text-yellow-600 mb-2 group-hover:scale-110 transition-transform duration-300">15</div>
            <div class="text-body text-gray-600">Government Agencies</div>
          </div>
          <div class="group">
            <div class="text-4xl md:text-5xl font-bold text-black mb-2 group-hover:scale-110 transition-transform duration-300">99%</div>
            <div class="text-body text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 strength-gradient text-white relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('/images/uganda-business-bg.jpeg')] bg-cover bg-center opacity-20"></div>
      
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-section-title text-white mb-6 font-display">
          Ready to Build Your <span class="text-yellow-300">Success Story</span> in Uganda?
        </h2>
        <p class="text-body-large text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join the ranks of successful entrepreneurs who've leveraged our platform to establish and scale 
          their businesses in Uganda's rapidly expanding economy. Your journey to prosperity starts here.
        </p>
        
        <div class="flex flex-col sm:flex-row justify-center gap-6">
          <a 
            routerLink="/registration-wizard"
            class="btn-uganda-secondary text-black hover:text-white transform hover:scale-105"
          >
            <span class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Your Registration Journey
            </span>
          </a>
          
          <a 
            routerLink="/support"
            class="bg-transparent border-2 border-yellow-400 text-yellow-300 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-400 hover:text-black transition-all duration-300 transform hover:scale-105"
          >
            <span class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Get Expert Consultation
            </span>
          </a>
        </div>
        
        <!-- Trust Badge -->
        <div class="mt-12 inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
          <img 
            src="/images/uganda-coat-of-arms.png" 
            alt="Uganda Coat of Arms" 
            class="w-8 h-8 mr-3 rounded"
          >
          <span class="text-sm text-gray-200">Proudly serving Uganda's business community since 2020</span>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent {}
