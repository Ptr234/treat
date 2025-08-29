import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <!-- Company Info -->
          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <img 
                src="/images/oneStopCenter-logo.jpeg" 
                alt="OneStop Centre Uganda"
                class="h-8 w-auto"
              >
              <span class="font-bold text-lg">OneStop Centre</span>
            </div>
            <p class="text-gray-300 text-sm">
              Simplifying business registration and investment processes in Uganda. 
              Your gateway to business success.
            </p>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <span class="sr-only">Facebook</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clip-rule="evenodd"></path>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <span class="sr-only">Twitter</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <span class="sr-only">LinkedIn</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Quick Links</h3>
            <ul class="space-y-2">
              <li><a routerLink="/about" class="text-gray-300 hover:text-white transition-colors">About Us</a></li>
              <li><a routerLink="/services" class="text-gray-300 hover:text-white transition-colors">Services</a></li>
              <li><a routerLink="/investments" class="text-gray-300 hover:text-white transition-colors">Investments</a></li>
              <li><a routerLink="/agencies" class="text-gray-300 hover:text-white transition-colors">Government Agencies</a></li>
              <li><a routerLink="/support" class="text-gray-300 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>

          <!-- Tools & Resources -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Tools & Resources</h3>
            <ul class="space-y-2">
              <li><a routerLink="/calculator" class="text-gray-300 hover:text-white transition-colors">Tax Calculator</a></li>
              <li><a routerLink="/roi-calculator" class="text-gray-300 hover:text-white transition-colors">ROI Calculator</a></li>
              <li><a routerLink="/document-checklist" class="text-gray-300 hover:text-white transition-colors">Document Checklist</a></li>
              <li><a routerLink="/registration-wizard" class="text-gray-300 hover:text-white transition-colors">Business Registration</a></li>
              <li><a routerLink="/downloads" class="text-gray-300 hover:text-white transition-colors">Downloads</a></li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Contact Us</h3>
            <div class="text-gray-300 space-y-2">
              <p class="flex items-center space-x-2">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>Kampala, Uganda</span>
              </p>
              <p class="flex items-center space-x-2">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span>+256 (0) 123 456 789</span>
              </p>
              <p class="flex items-center space-x-2">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>support@onestopcentre.ug</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p class="text-gray-400 text-sm">
            © {{ currentYear }} OneStop Centre Uganda. All rights reserved.
          </p>
          <div class="flex space-x-6 mt-4 md:mt-0">
            <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
            <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}