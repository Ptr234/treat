import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface InvestmentProfile {
  investorType: string;
  nationality: string;
  investmentAmount: string;
  sector: string;
  timeline: string;
  experience: string;
  objectives: string[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
}

interface InvestmentStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  current: boolean;
}

@Component({
  selector: 'app-investment-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Investment Onboarding Wizard</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Get personalized guidance for your investment journey in Uganda. Complete this wizard to receive 
          tailored recommendations and fast-track support from our investment experts.
        </p>
      </div>

      <!-- Progress Steps -->
      <div class="mb-12">
        <div class="flex items-center justify-center">
          <div class="flex items-center space-x-4">
            <div *ngFor="let step of steps; let i = index" class="flex items-center">
              <div class="flex flex-col items-center">
                <div 
                  class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300"
                  [class]="getStepClass(step)"
                >
                  <span *ngIf="step.completed" innerHTML="✓"></span>
                  <span *ngIf="!step.completed">{{step.id}}</span>
                </div>
                <div class="text-xs text-gray-600 mt-2 text-center max-w-20">{{step.title}}</div>
              </div>
              <div 
                *ngIf="i < steps.length - 1" 
                class="w-16 h-1 mx-4 transition-all duration-300"
                [class]="i < currentStep ? 'bg-green-500' : 'bg-gray-300'"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <div class="max-w-4xl mx-auto">
        <!-- Step 1: Investor Profile -->
        <div *ngIf="currentStep === 0" class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Tell us about yourself</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Investor Type</label>
              <select [(ngModel)]="profile.investorType" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select investor type</option>
                <option value="individual">Individual Investor</option>
                <option value="institutional">Institutional Investor</option>
                <option value="corporate">Corporate Entity</option>
                <option value="government">Government/Sovereign Fund</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
              <select [(ngModel)]="profile.nationality" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select nationality</option>
                <option value="ugandan">Ugandan</option>
                <option value="kenyan">Kenyan</option>
                <option value="tanzanian">Tanzanian</option>
                <option value="rwandan">Rwandan</option>
                <option value="other-african">Other African</option>
                <option value="european">European</option>
                <option value="american">American</option>
                <option value="asian">Asian</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Investment Amount Range</label>
              <select [(ngModel)]="profile.investmentAmount" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select investment range</option>
                <option value="50k-200k">USD 50,000 - 200,000</option>
                <option value="200k-1m">USD 200,000 - 1,000,000</option>
                <option value="1m-5m">USD 1,000,000 - 5,000,000</option>
                <option value="5m-25m">USD 5,000,000 - 25,000,000</option>
                <option value="25m+">USD 25,000,000+</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Investment Experience</label>
              <select [(ngModel)]="profile.experience" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select experience level</option>
                <option value="first-time">First-time investor in Africa</option>
                <option value="experienced-africa">Experienced in Africa</option>
                <option value="experienced-uganda">Previously invested in Uganda</option>
                <option value="institutional">Institutional/Professional</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Step 2: Investment Preferences -->
        <div *ngIf="currentStep === 1" class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Investment Preferences</h2>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">Preferred Investment Sector</label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div *ngFor="let sector of investmentSectors" class="relative">
                <input 
                  type="radio" 
                  [(ngModel)]="profile.sector" 
                  [value]="sector.value"
                  [id]="sector.value"
                  class="sr-only"
                >
                <label 
                  [for]="sector.value" 
                  class="block p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                  [class]="profile.sector === sector.value ? 'border-blue-500 bg-blue-50' : ''"
                >
                  <div class="text-center">
                    <div class="text-2xl mb-2">{{sector.icon}}</div>
                    <div class="font-medium">{{sector.label}}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Investment Timeline</label>
            <select [(ngModel)]="profile.timeline" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select timeline</option>
              <option value="immediate">Ready to invest immediately</option>
              <option value="3-months">Within 3 months</option>
              <option value="6-months">Within 6 months</option>
              <option value="12-months">Within 12 months</option>
              <option value="exploring">Still exploring options</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Investment Objectives (select all that apply)</label>
            <div class="space-y-2">
              <div *ngFor="let objective of investmentObjectives" class="flex items-center">
                <input 
                  type="checkbox" 
                  [value]="objective.value"
                  (change)="toggleObjective(objective.value)"
                  [id]="objective.value"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <label [for]="objective.value" class="ml-2 text-sm text-gray-700">{{objective.label}}</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Contact Information -->
        <div *ngIf="currentStep === 2" class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input 
                type="text" 
                [(ngModel)]="profile.contactInfo.name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input 
                type="email" 
                [(ngModel)]="profile.contactInfo.email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input 
                type="tel" 
                [(ngModel)]="profile.contactInfo.phone"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+256 XXX XXX XXX"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Company/Organization</label>
              <input 
                type="text" 
                [(ngModel)]="profile.contactInfo.company"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company name (optional)"
              >
            </div>
          </div>
          
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 class="font-medium text-blue-900 mb-2">What happens next?</h3>
            <ul class="text-sm text-blue-800 space-y-1">
              <li>• Dedicated investment advisor assigned within 24 hours</li>
              <li>• Customized investment package and incentive summary</li>
              <li>• Priority access to exclusive investment opportunities</li>
              <li>• Fast-track licensing and regulatory support</li>
            </ul>
          </div>
        </div>

        <!-- Step 4: Confirmation -->
        <div *ngIf="currentStep === 3" class="bg-white rounded-lg shadow-lg p-8">
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Registration Complete!</h2>
            <p class="text-gray-600 mb-6">Thank you for your interest in investing in Uganda. Your investment profile has been submitted successfully.</p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 class="font-semibold text-gray-900 mb-4">Your Investment Profile Summary:</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span class="font-medium">Investor Type:</span> {{getDisplayValue(profile.investorType)}}</div>
              <div><span class="font-medium">Investment Amount:</span> {{getDisplayValue(profile.investmentAmount)}}</div>
              <div><span class="font-medium">Preferred Sector:</span> {{getDisplayValue(profile.sector)}}</div>
              <div><span class="font-medium">Timeline:</span> {{getDisplayValue(profile.timeline)}}</div>
            </div>
          </div>
          
          <div class="flex justify-center space-x-4">
            <a routerLink="/investments" class="btn-uganda-primary">
              Explore Investment Opportunities
            </a>
            <a routerLink="/services" class="btn-uganda-secondary">
              View Required Services
            </a>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div *ngIf="currentStep < 3" class="flex justify-between mt-8">
          <button 
            *ngIf="currentStep > 0"
            (click)="previousStep()"
            class="btn-uganda-secondary"
          >
            Previous
          </button>
          
          <div class="ml-auto">
            <button 
              (click)="nextStep()"
              [disabled]="!canProceed()"
              class="btn-uganda-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{currentStep === 2 ? 'Complete Registration' : 'Next'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InvestmentOnboardingComponent implements OnInit {
  currentStep = 0;
  
  steps: InvestmentStep[] = [
    { id: 1, title: 'Profile', description: 'Basic information', icon: '👤', completed: false, current: true },
    { id: 2, title: 'Preferences', description: 'Investment details', icon: '🎯', completed: false, current: false },
    { id: 3, title: 'Contact', description: 'Contact information', icon: '📧', completed: false, current: false },
    { id: 4, title: 'Complete', description: 'Confirmation', icon: '✅', completed: false, current: false }
  ];

  profile: InvestmentProfile = {
    investorType: '',
    nationality: '',
    investmentAmount: '',
    sector: '',
    timeline: '',
    experience: '',
    objectives: [],
    contactInfo: {
      name: '',
      email: '',
      phone: '',
      company: ''
    }
  };

  investmentSectors = [
    { value: 'agriculture', label: 'Agriculture', icon: '🌾' },
    { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
    { value: 'technology', label: 'Technology', icon: '💻' },
    { value: 'energy', label: 'Energy', icon: '⚡' },
    { value: 'tourism', label: 'Tourism', icon: '🏖️' },
    { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
    { value: 'real-estate', label: 'Real Estate', icon: '🏢' },
    { value: 'mining', label: 'Mining', icon: '⛏️' }
  ];

  investmentObjectives = [
    { value: 'high-returns', label: 'High financial returns' },
    { value: 'diversification', label: 'Portfolio diversification' },
    { value: 'market-access', label: 'Access to East African markets' },
    { value: 'social-impact', label: 'Social and environmental impact' },
    { value: 'technology-transfer', label: 'Technology transfer opportunities' },
    { value: 'strategic-partnership', label: 'Strategic partnerships' }
  ];

  ngOnInit() {
    this.updateSteps();
  }

  nextStep() {
    if (this.canProceed() && this.currentStep < this.steps.length - 1) {
      this.steps[this.currentStep].completed = true;
      this.currentStep++;
      this.updateSteps();
      
      if (this.currentStep === 3) {
        // Submit the profile (in real app, this would be an API call)
        console.log('Investment profile submitted:', this.profile);
      }
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.steps[this.currentStep].completed = false;
      this.updateSteps();
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 0:
        return !!(this.profile.investorType && this.profile.nationality && 
                 this.profile.investmentAmount && this.profile.experience);
      case 1:
        return !!(this.profile.sector && this.profile.timeline);
      case 2:
        return !!(this.profile.contactInfo.name && this.profile.contactInfo.email && 
                 this.profile.contactInfo.phone);
      default:
        return true;
    }
  }

  updateSteps() {
    this.steps.forEach((step, index) => {
      step.current = index === this.currentStep;
    });
  }

  getStepClass(step: InvestmentStep): string {
    if (step.completed) {
      return 'bg-green-500';
    } else if (step.current) {
      return 'bg-blue-500';
    } else {
      return 'bg-gray-300';
    }
  }

  toggleObjective(objective: string) {
    const index = this.profile.objectives.indexOf(objective);
    if (index > -1) {
      this.profile.objectives.splice(index, 1);
    } else {
      this.profile.objectives.push(objective);
    }
  }

  getDisplayValue(value: string): string {
    if (!value) return 'Not specified';
    
    const mappings: Record<string, string> = {
      'individual': 'Individual Investor',
      'institutional': 'Institutional Investor',
      'corporate': 'Corporate Entity',
      'government': 'Government/Sovereign Fund',
      'agriculture': 'Agriculture & Food Processing',
      'manufacturing': 'Manufacturing & Industry',
      'technology': 'Technology & Innovation',
      '50k-200k': 'USD 50,000 - 200,000',
      '200k-1m': 'USD 200,000 - 1,000,000',
      '1m-5m': 'USD 1,000,000 - 5,000,000',
      'immediate': 'Ready to invest immediately',
      '3-months': 'Within 3 months'
    };
    
    return mappings[value] || value;
  }
}
