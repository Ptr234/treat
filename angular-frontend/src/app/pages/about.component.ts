import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Hero Section -->
      <div class="text-center mb-16 relative">
        <div class="absolute inset-0 bg-[url('/images/uganda-pearl-africa.jpg')] bg-cover bg-center opacity-5 rounded-xl"></div>
        <div class="relative z-10">
        <div class="mb-6">
          <img 
            src="/images/uganda-flag.png" 
            alt="Uganda Flag" 
            class="w-24 h-16 mx-auto mb-4 rounded-lg shadow-lg"
          >
        </div>
        <h1 class="font-display text-hero text-gray-900 mb-6">About OneStop Centre Uganda</h1>
        <p class="text-body-large text-gray-600 max-w-4xl mx-auto mb-8">
          Your premier gateway to business success in the Pearl of Africa. We bridge the gap between ambitious entrepreneurs 
          and Uganda's thriving business ecosystem, combining traditional excellence with cutting-edge digital innovation.
        </p>
        <div class="flex justify-center items-center space-x-8 text-sm text-gray-500">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Since 2020
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            10,000+ Businesses Served
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-black rounded-full mr-2"></div>
            Government Approved
          </div>
        </div>
        </div>
      </div>

      <!-- Mission & Vision Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 class="font-display text-section-title text-gray-900 mb-6">Our Mission</h2>
          <p class="text-body-large text-gray-600 mb-6">
            To revolutionize business registration and investment processes in Uganda by providing 
            a unified digital platform that seamlessly connects entrepreneurs with government services, 
            investment opportunities, and expert guidance.
          </p>
          
          <div class="space-y-4 mb-8">
            <div class="flex items-start space-x-3">
              <div class="w-6 h-6 prosperity-gradient rounded-full flex items-center justify-center mt-1">
                <svg class="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-gray-700">Streamlined government service access across 15+ agencies</span>
            </div>
            <div class="flex items-start space-x-3">
              <div class="w-6 h-6 unity-gradient rounded-full flex items-center justify-center mt-1">
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-gray-700">Expert guidance from certified business consultants</span>
            </div>
            <div class="flex items-start space-x-3">
              <div class="w-6 h-6 strength-gradient rounded-full flex items-center justify-center mt-1">
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-gray-700">Curated investment opportunities worth $2.5B+</span>
            </div>
            <div class="flex items-start space-x-3">
              <div class="w-6 h-6 uganda-gradient rounded-full flex items-center justify-center mt-1">
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-gray-700">AI-powered business tools and calculators</span>
            </div>
          </div>
          
          <a routerLink="/services" class="btn-uganda-primary">
            Explore Our Services →
          </a>
        </div>
        <div>
          <div class="relative">
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop" 
              alt="Uganda Business Growth"
              class="rounded-xl shadow-lg w-full"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
            <div class="absolute bottom-4 left-4 text-white">
              <div class="text-sm font-medium">Kampala Business District</div>
              <div class="text-xs text-gray-200">Heart of Uganda's Economy</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Our Story Section -->
      <section class="mb-20">
        <div class="text-center mb-12">
          <h2 class="font-display text-section-title text-gray-900 mb-4">Our Story</h2>
          <p class="text-body-large text-gray-600 max-w-3xl mx-auto">
            Born from the vision of simplifying business processes in Uganda's dynamic economy
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div class="card-uganda p-8 text-center">
            <div class="w-16 h-16 prosperity-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="text-card-title font-semibold text-gray-900 mb-3">2020 - Foundation</h3>
            <p class="text-body text-gray-600">
              Established with the mission to digitize and streamline Uganda's business registration processes, 
              reducing bureaucracy and empowering entrepreneurs.
            </p>
          </div>

          <div class="card-uganda p-8 text-center">
            <div class="w-16 h-16 unity-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-card-title font-semibold text-gray-900 mb-3">2021-2022 - Growth</h3>
            <p class="text-body text-gray-600">
              Rapid expansion across Uganda, partnering with key government agencies and serving over 
              5,000 businesses in agriculture, manufacturing, and technology sectors.
            </p>
          </div>

          <div class="card-uganda p-8 text-center">
            <div class="w-16 h-16 strength-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 class="text-card-title font-semibold text-gray-900 mb-3">2023-Present - Excellence</h3>
            <p class="text-body text-gray-600">
              Achieved market leadership with 10,000+ businesses served, $2.5B in facilitated investments, 
              and recognition as Uganda's premier business services platform.
            </p>
          </div>
        </div>
      </section>

      <!-- Team & Leadership Section -->
      <section class="mb-20">
        <div class="text-center mb-12">
          <h2 class="font-display text-section-title text-gray-900 mb-4">Leadership Team</h2>
          <p class="text-body-large text-gray-600 max-w-3xl mx-auto">
            Experienced professionals dedicated to transforming Uganda's business landscape
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="card-modern p-6 text-center">
            <div class="w-24 h-24 strength-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-white">JM</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">James Mukasa</h3>
            <p class="text-sm text-gray-600 mb-3">Chief Executive Officer</p>
            <p class="text-sm text-gray-500">
              Former URSB executive with 15+ years experience in business registration and 
              regulatory compliance across East Africa.
            </p>
          </div>

          <div class="card-modern p-6 text-center">
            <div class="w-24 h-24 prosperity-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-black">SK</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Sarah Kisakye</h3>
            <p class="text-sm text-gray-600 mb-3">Chief Technology Officer</p>
            <p class="text-sm text-gray-500">
              Technology innovator and former Microsoft engineer, specializing in digital 
              transformation and AI-powered business solutions.
            </p>
          </div>

          <div class="card-modern p-6 text-center">
            <div class="w-24 h-24 unity-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-white">DN</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">David Nsubuga</h3>
            <p class="text-sm text-gray-600 mb-3">Head of Investments</p>
            <p class="text-sm text-gray-500">
              Investment banking veteran with deep expertise in Uganda's agriculture, 
              manufacturing, and technology sectors.
            </p>
          </div>
        </div>
      </section>

      <!-- Impact Statistics -->
      <section class="mb-20 uganda-gradient rounded-xl p-12 text-white text-center">
        <h2 class="font-display text-section-title text-white mb-8">Our Impact</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div class="text-4xl md:text-5xl font-bold mb-2">10,000+</div>
            <div class="text-sm text-gray-200">Businesses Registered</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-bold mb-2">$2.5B</div>
            <div class="text-sm text-gray-200">Investment Facilitated</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-bold mb-2">15</div>
            <div class="text-sm text-gray-200">Government Agencies</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-bold mb-2">99%</div>
            <div class="text-sm text-gray-200">Client Satisfaction</div>
          </div>
        </div>
      </section>

      <!-- Values Section -->
      <section class="mb-20">
        <div class="text-center mb-12">
          <h2 class="font-display text-section-title text-gray-900 mb-4">Our Values</h2>
          <p class="text-body-large text-gray-600 max-w-3xl mx-auto">
            The principles that guide everything we do
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="card-uganda p-6 text-center">
            <div class="w-12 h-12 prosperity-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Excellence</h3>
            <p class="text-sm text-gray-600">Delivering exceptional service and results in everything we do</p>
          </div>

          <div class="card-uganda p-6 text-center">
            <div class="w-12 h-12 unity-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Integrity</h3>
            <p class="text-sm text-gray-600">Building trust through transparency and ethical business practices</p>
          </div>

          <div class="card-uganda p-6 text-center">
            <div class="w-12 h-12 strength-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Innovation</h3>
            <p class="text-sm text-gray-600">Embracing technology to create better solutions for our clients</p>
          </div>

          <div class="card-uganda p-6 text-center">
            <div class="w-12 h-12 uganda-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Community</h3>
            <p class="text-sm text-gray-600">Committed to Uganda's economic growth and community development</p>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="text-center">
        <div class="card-modern p-12">
          <h2 class="font-display text-card-title text-gray-900 mb-6">Ready to Start Your Business Journey?</h2>
          <p class="text-body-large text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of successful entrepreneurs who've trusted OneStop Centre Uganda 
            to launch and scale their businesses in the Pearl of Africa.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a routerLink="/registration-wizard" class="btn-uganda-primary">
              Start Business Registration
            </a>
            <a routerLink="/support" class="btn-uganda-secondary">
              Contact Our Team
            </a>
          </div>
        </div>
      </section>
    </div>
  `
})
export class AboutComponent {}