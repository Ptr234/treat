import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { COMPREHENSIVE_SERVICES } from '../data/services';

interface BusinessDetails {
  businessName: string;
  businessType: 'company' | 'partnership' | 'sole-proprietorship';
  sector: string;
  location: string;
  capitalAmount: number;
  numberOfEmployees: number;
  hasInternationalOperations: boolean;
  needsSpecialLicenses: boolean;
}

interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  services: string[];
  estimatedCost: number;
  estimatedTime: string;
  priority: 'critical' | 'important' | 'optional';
}

@Component({
  selector: 'app-registration-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <div class="mb-6">
          <img 
            src="/images/uganda-flag.png" 
            alt="Uganda Flag" 
            class="w-20 h-12 mx-auto mb-4 rounded-lg shadow-lg"
          >
        </div>
        <h1 class="font-display text-section-title text-gray-900 mb-6">Business Registration Wizard</h1>
        <p class="text-body-large text-gray-600 max-w-3xl mx-auto mb-8">
          Get a personalized roadmap for registering your business in Uganda with step-by-step guidance, 
          cost estimates, and timeline projections.
        </p>
        <div class="flex justify-center items-center space-x-4 text-sm text-gray-500">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Complete Legal Compliance
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-black rounded-full mr-2"></div>
            Cost & Time Estimates
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            Personalized Guidance
          </div>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div class="mb-12">
        <div class="flex items-center justify-center space-x-4">
          <div class="flex items-center">
            <div [class]="getStepIndicatorClass(1)">1</div>
            <span class="ml-2 text-sm font-medium" [class]="currentStep() >= 1 ? 'text-black' : 'text-gray-500'">
              Business Details
            </span>
          </div>
          <div class="w-16 h-1 bg-gray-200 rounded">
            <div class="h-full bg-black rounded transition-all duration-300" 
                 [style.width]="currentStep() > 1 ? '100%' : '0%'"></div>
          </div>
          <div class="flex items-center">
            <div [class]="getStepIndicatorClass(2)">2</div>
            <span class="ml-2 text-sm font-medium" [class]="currentStep() >= 2 ? 'text-black' : 'text-gray-500'">
              Registration Plan
            </span>
          </div>
          <div class="w-16 h-1 bg-gray-200 rounded">
            <div class="h-full bg-black rounded transition-all duration-300" 
                 [style.width]="currentStep() > 2 ? '100%' : '0%'"></div>
          </div>
          <div class="flex items-center">
            <div [class]="getStepIndicatorClass(3)">3</div>
            <span class="ml-2 text-sm font-medium" [class]="currentStep() >= 3 ? 'text-black' : 'text-gray-500'">
              Action Plan
            </span>
          </div>
        </div>
      </div>

      <!-- Step 1: Business Details -->
      <div *ngIf="currentStep() === 1" class="max-w-4xl mx-auto">
        <div class="card-uganda p-8">
          <h2 class="font-display text-card-title text-gray-900 mb-6">Tell Us About Your Business</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Business Name -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                [(ngModel)]="businessDetails.businessName"
                class="form-input-modern"
                placeholder="Enter your business name..."
              >
              <p class="text-xs text-gray-500 mt-1">
                This will be checked for availability during the registration process
              </p>
            </div>

            <!-- Business Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                [(ngModel)]="businessDetails.businessType"
                class="form-input-modern"
              >
                <option value="company">Private Limited Company</option>
                <option value="partnership">Partnership</option>
                <option value="sole-proprietorship">Sole Proprietorship</option>
              </select>
            </div>

            <!-- Business Sector -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Primary Business Sector *
              </label>
              <select
                [(ngModel)]="businessDetails.sector"
                class="form-input-modern"
              >
                <option value="">Select sector...</option>
                <option value="agriculture">Agriculture & Agribusiness</option>
                <option value="manufacturing">Manufacturing & Industry</option>
                <option value="technology">Technology & Innovation</option>
                <option value="healthcare">Healthcare & Pharmaceuticals</option>
                <option value="tourism">Tourism & Hospitality</option>
                <option value="education">Education & Training</option>
                <option value="construction">Construction & Real Estate</option>
                <option value="energy">Energy & Utilities</option>
                <option value="finance">Financial Services</option>
                <option value="retail">Retail & Trade</option>
                <option value="transport">Transport & Logistics</option>
                <option value="other">Other</option>
              </select>
            </div>

            <!-- Location -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Primary Business Location *
              </label>
              <select
                [(ngModel)]="businessDetails.location"
                class="form-input-modern"
              >
                <option value="">Select location...</option>
                <option value="kampala">Kampala</option>
                <option value="wakiso">Wakiso</option>
                <option value="mukono">Mukono</option>
                <option value="jinja">Jinja</option>
                <option value="entebbe">Entebbe</option>
                <option value="mbarara">Mbarara</option>
                <option value="gulu">Gulu</option>
                <option value="lira">Lira</option>
                <option value="mbale">Mbale</option>
                <option value="kasese">Kasese</option>
                <option value="other">Other District</option>
              </select>
            </div>

            <!-- Capital Amount -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Initial Capital Amount (UGX)
              </label>
              <input
                type="number"
                [(ngModel)]="businessDetails.capitalAmount"
                class="form-input-modern"
                placeholder="Enter amount in UGX..."
              >
              <p class="text-xs text-gray-500 mt-1">
                This affects registration fees and compliance requirements
              </p>
            </div>

            <!-- Number of Employees -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Expected Number of Employees
              </label>
              <select
                [(ngModel)]="businessDetails.numberOfEmployees"
                class="form-input-modern"
              >
                <option [ngValue]="0">Just me (sole proprietor)</option>
                <option [ngValue]="2">2-5 employees</option>
                <option [ngValue]="10">6-20 employees</option>
                <option [ngValue]="50">21-100 employees</option>
                <option [ngValue]="200">Over 100 employees</option>
              </select>
            </div>

            <!-- International Operations -->
            <div class="md:col-span-2">
              <div class="flex items-start">
                <input
                  type="checkbox"
                  [(ngModel)]="businessDetails.hasInternationalOperations"
                  class="mt-1 h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                >
                <div class="ml-3">
                  <label class="text-sm font-medium text-gray-700">
                    International Operations
                  </label>
                  <p class="text-sm text-gray-500">
                    My business will import/export goods or services internationally
                  </p>
                </div>
              </div>
            </div>

            <!-- Special Licenses -->
            <div class="md:col-span-2">
              <div class="flex items-start">
                <input
                  type="checkbox"
                  [(ngModel)]="businessDetails.needsSpecialLicenses"
                  class="mt-1 h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                >
                <div class="ml-3">
                  <label class="text-sm font-medium text-gray-700">
                    Special Industry Licenses
                  </label>
                  <p class="text-sm text-gray-500">
                    My business requires special licenses (healthcare, financial services, telecommunications, etc.)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-end">
            <button
              (click)="generateRegistrationPlan()"
              [disabled]="!canProceed()"
              class="btn-uganda-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Registration Plan
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Registration Plan -->
      <div *ngIf="currentStep() === 2" class="max-w-6xl mx-auto">
        <div class="card-modern p-8">
          <div class="flex items-center justify-between mb-8">
            <h2 class="font-display text-card-title text-gray-900">Your Personalized Registration Plan</h2>
            <button
              (click)="currentStep.set(1)"
              class="text-black hover:text-gray-700 text-sm font-medium"
            >
              ← Edit Business Details
            </button>
          </div>

          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div class="prosperity-gradient p-4 rounded-lg">
              <div class="text-2xl font-bold text-black">{{ registrationSteps().length }}</div>
              <div class="text-sm text-black">Total Steps</div>
            </div>
            <div class="unity-gradient text-white p-4 rounded-lg">
              <div class="text-2xl font-bold text-white">UGX {{ formatNumber(totalCost()) }}</div>
              <div class="text-sm text-gray-100">Estimated Total Cost</div>
            </div>
            <div class="prosperity-gradient p-4 rounded-lg">
              <div class="text-2xl font-bold text-black">{{ estimatedTimeline() }}</div>
              <div class="text-sm text-black">Estimated Timeline</div>
            </div>
            <div class="prosperity-gradient p-4 rounded-lg">
              <div class="text-2xl font-bold text-black">{{ criticalSteps() }}</div>
              <div class="text-sm text-black">Critical Steps</div>
            </div>
          </div>

          <!-- Registration Steps -->
          <div class="space-y-6">
            <div *ngFor="let step of registrationSteps(); let i = index" 
                 class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              
              <!-- Step Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-start">
                  <div class="flex-shrink-0 mr-4">
                    <div [class]="getStepPriorityClass(step.priority)">
                      {{ i + 1 }}
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ step.title }}</h3>
                    <p class="text-gray-600 mb-3">{{ step.description }}</p>
                    
                    <!-- Step Details -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span class="font-medium text-gray-700">Estimated Cost:</span>
                        <div class="text-red-600 font-semibold">UGX {{ formatNumber(step.estimatedCost) }}</div>
                      </div>
                      <div>
                        <span class="font-medium text-gray-700">Timeline:</span>
                        <div class="text-black font-semibold">{{ step.estimatedTime }}</div>
                      </div>
                      <div>
                        <span class="font-medium text-gray-700">Priority:</span>
                        <div [class]="getPriorityTextClass(step.priority)">
                          {{ step.priority.charAt(0).toUpperCase() + step.priority.slice(1) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex-shrink-0">
                  <button
                    (click)="toggleStepDetails(i)"
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg class="w-5 h-5 transform transition-transform" 
                         [class.rotate-180]="expandedSteps().has(i)"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Expanded Step Details -->
              <div *ngIf="expandedSteps().has(i)" class="mt-4 pt-4 border-t border-gray-100">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Required Services -->
                  <div>
                    <h4 class="font-semibold text-gray-900 mb-3">Required Services & Licenses</h4>
                    <div class="space-y-2">
                      <div *ngFor="let serviceId of step.services">
                        <div class="bg-gray-50 p-3 rounded-lg">
                          <div class="font-medium text-gray-900">{{ getServiceTitle(serviceId) }}</div>
                          <div class="text-sm text-gray-600">{{ getServiceAgency(serviceId) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Action Items -->
                  <div>
                    <h4 class="font-semibold text-gray-900 mb-3">Key Action Items</h4>
                    <div class="space-y-2">
                      <div *ngFor="let serviceId of step.services" class="flex items-center">
                        <input type="checkbox" class="h-4 w-4 text-black border-gray-300 rounded focus:ring-black">
                        <label class="ml-2 text-sm text-gray-700">
                          Apply for {{ getServiceTitle(serviceId) }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-between">
            <button
              (click)="currentStep.set(1)"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              ← Back to Details
            </button>
            <button
              (click)="generateActionPlan()"
              class="btn-uganda-primary"
            >
              Create Action Plan →
            </button>
          </div>
        </div>
      </div>

      <!-- Step 3: Action Plan -->
      <div *ngIf="currentStep() === 3" class="max-w-4xl mx-auto">
        <div class="card-modern p-8">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="font-display text-card-title text-gray-900 mb-2">Your Business Registration Action Plan</h2>
            <p class="text-gray-600">
              Your personalized roadmap for {{ businessDetails.businessName }} is ready!
            </p>
          </div>

          <!-- Quick Actions -->
          <div class="uganda-gradient rounded-lg p-6 mb-8">
            <h3 class="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">Download PDF Guide</div>
                    <div class="text-sm text-gray-600">Complete step-by-step guide</div>
                  </div>
                </div>
              </button>

              <button class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m0 0V7a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h8z" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">Schedule Consultation</div>
                    <div class="text-sm text-gray-600">Get expert guidance</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Summary -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Registration Summary</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-medium text-gray-700 mb-2">Business Information</h4>
                <div class="space-y-1 text-sm text-gray-600">
                  <div><strong>Name:</strong> {{ businessDetails.businessName }}</div>
                  <div><strong>Type:</strong> {{ getBusinessTypeLabel() }}</div>
                  <div><strong>Sector:</strong> {{ getSectorLabel() }}</div>
                  <div><strong>Location:</strong> {{ getLocationLabel() }}</div>
                </div>
              </div>
              
              <div>
                <h4 class="font-medium text-gray-700 mb-2">Cost & Timeline</h4>
                <div class="space-y-1 text-sm text-gray-600">
                  <div><strong>Total Steps:</strong> {{ registrationSteps().length }}</div>
                  <div><strong>Estimated Cost:</strong> UGX {{ formatNumber(totalCost()) }}</div>
                  <div><strong>Timeline:</strong> {{ estimatedTimeline() }}</div>
                  <div><strong>Critical Steps:</strong> {{ criticalSteps() }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-center space-x-4">
            <button
              (click)="currentStep.set(2)"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              ← Back to Plan
            </button>
            <button
              (click)="startOver()"
              class="btn-uganda-primary"
            >
              Start New Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegistrationWizardComponent {
  currentStep = signal(1);
  expandedSteps = signal(new Set<number>());

  businessDetails: BusinessDetails = {
    businessName: '',
    businessType: 'company',
    sector: '',
    location: '',
    capitalAmount: 0,
    numberOfEmployees: 0,
    hasInternationalOperations: false,
    needsSpecialLicenses: false
  };

  registrationSteps = signal<RegistrationStep[]>([]);

  totalCost = computed(() => 
    this.registrationSteps().reduce((sum, step) => sum + step.estimatedCost, 0)
  );

  criticalSteps = computed(() => 
    this.registrationSteps().filter(step => step.priority === 'critical').length
  );

  estimatedTimeline = computed(() => {
    const steps = this.registrationSteps();
    if (steps.length === 0) return '0 days';
    
    // Calculate maximum timeline (considering parallel processing)
    const timelineInDays = Math.max(...steps.map(step => {
      const match = step.estimatedTime.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }));
    
    return `${timelineInDays}-${timelineInDays + 14} days`;
  });

  canProceed(): boolean {
    return !!(this.businessDetails.businessName && 
              this.businessDetails.sector && 
              this.businessDetails.location);
  }

  getStepIndicatorClass(stepNumber: number): string {
    const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium';
    const activeClasses = 'bg-black text-white';
    const completedClasses = 'bg-red-600 text-white';
    const inactiveClasses = 'bg-gray-200 text-gray-600';

    if (this.currentStep() > stepNumber) return `${baseClasses} ${completedClasses}`;
    if (this.currentStep() === stepNumber) return `${baseClasses} ${activeClasses}`;
    return `${baseClasses} ${inactiveClasses}`;
  }

  getStepPriorityClass(priority: 'critical' | 'important' | 'optional'): string {
    const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold';
    switch (priority) {
      case 'critical': return `${baseClasses} bg-red-100 text-red-700 border-2 border-red-200`;
      case 'important': return `${baseClasses} bg-yellow-100 text-yellow-700 border-2 border-yellow-200`;
      case 'optional': return `${baseClasses} bg-gray-100 text-gray-700 border-2 border-gray-200`;
    }
  }

  getPriorityTextClass(priority: 'critical' | 'important' | 'optional'): string {
    switch (priority) {
      case 'critical': return 'text-red-600 font-semibold';
      case 'important': return 'text-yellow-600 font-semibold';
      case 'optional': return 'text-gray-600 font-semibold';
    }
  }

  generateRegistrationPlan(): void {
    const steps: RegistrationStep[] = [];

    // Core registration steps (always required)
    steps.push({
      id: 'core-registration',
      title: 'Core Business Registration',
      description: 'Register your business with the appropriate government agencies',
      services: ['ursb-company-reg', 'ura-tin-registration'],
      estimatedCost: this.businessDetails.businessType === 'company' ? 200000 : 50000,
      estimatedTime: '5-10 days',
      priority: 'critical'
    });

    // Trading license
    if (this.businessDetails.location === 'kampala') {
      steps.push({
        id: 'trading-license',
        title: 'Municipal Trading License',
        description: 'Obtain trading license from KCCA for Kampala operations',
        services: ['kcca-trading-license'],
        estimatedCost: 100000,
        estimatedTime: '7-10 days',
        priority: 'critical'
      });
    }

    // VAT registration for larger businesses
    if (this.businessDetails.capitalAmount > 150000000) {
      steps.push({
        id: 'vat-registration',
        title: 'VAT Registration',
        description: 'Register for Value Added Tax (mandatory for businesses over UGX 150M turnover)',
        services: ['ura-vat-registration'],
        estimatedCost: 0,
        estimatedTime: '5-7 days',
        priority: 'critical'
      });
    }

    // NSSF registration for businesses with employees
    if (this.businessDetails.numberOfEmployees > 0) {
      steps.push({
        id: 'social-security',
        title: 'Social Security Registration',
        description: 'Register with NSSF for employee benefits and contributions',
        services: ['nssf-registration'],
        estimatedCost: 0,
        estimatedTime: '3-5 days',
        priority: 'critical'
      });
    }

    // Investment license for significant investments
    if (this.businessDetails.capitalAmount > 50000000) {
      steps.push({
        id: 'investment-license',
        title: 'Investment License',
        description: 'Obtain UIA investment license for tax incentives and support',
        services: ['uia-investment-license'],
        estimatedCost: 300,
        estimatedTime: '14-21 days',
        priority: 'important'
      });
    }

    // Environmental clearance for certain sectors
    if (['manufacturing', 'agriculture', 'construction', 'energy'].includes(this.businessDetails.sector)) {
      steps.push({
        id: 'environmental-clearance',
        title: 'Environmental Impact Assessment',
        description: 'Obtain environmental clearance for your business operations',
        services: ['nema-eia-approval'],
        estimatedCost: 1500000,
        estimatedTime: '60-90 days',
        priority: 'important'
      });
    }

    // Sector-specific licenses
    if (this.businessDetails.needsSpecialLicenses) {
      switch (this.businessDetails.sector) {
        case 'healthcare':
          steps.push({
            id: 'healthcare-license',
            title: 'Healthcare License',
            description: 'Specialized licensing for healthcare operations',
            services: ['nda-drug-license'],
            estimatedCost: 300000,
            estimatedTime: '14-21 days',
            priority: 'critical'
          });
          break;
        case 'finance':
          steps.push({
            id: 'financial-license',
            title: 'Financial Services License',
            description: 'Banking and financial services regulatory approval',
            services: ['bou-bank-license'],
            estimatedCost: 200000,
            estimatedTime: '90-180 days',
            priority: 'critical'
          });
          break;
        case 'technology':
          steps.push({
            id: 'telecom-license',
            title: 'Telecommunications License',
            description: 'UCC license for telecommunications operations',
            services: ['ucc-operator-license'],
            estimatedCost: 500000,
            estimatedTime: '45-60 days',
            priority: 'important'
          });
          break;
      }
    }

    // Quality certification for manufacturing/food
    if (['manufacturing', 'agriculture'].includes(this.businessDetails.sector)) {
      steps.push({
        id: 'quality-certification',
        title: 'Product Quality Certification',
        description: 'UNBS certification for product quality and standards compliance',
        services: ['unbs-certification'],
        estimatedCost: 800000,
        estimatedTime: '30-45 days',
        priority: 'important'
      });
    }

    // International operations support
    if (this.businessDetails.hasInternationalOperations) {
      steps.push({
        id: 'export-support',
        title: 'Export/Import Registration',
        description: 'Additional registrations for international trade operations',
        services: ['ura-vat-registration'],
        estimatedCost: 150000,
        estimatedTime: '10-15 days',
        priority: 'important'
      });
    }

    this.registrationSteps.set(steps);
    this.currentStep.set(2);
  }

  generateActionPlan(): void {
    this.currentStep.set(3);
  }

  startOver(): void {
    this.currentStep.set(1);
    this.businessDetails = {
      businessName: '',
      businessType: 'company',
      sector: '',
      location: '',
      capitalAmount: 0,
      numberOfEmployees: 0,
      hasInternationalOperations: false,
      needsSpecialLicenses: false
    };
    this.registrationSteps.set([]);
    this.expandedSteps.set(new Set());
  }

  toggleStepDetails(stepIndex: number): void {
    const expanded = new Set(this.expandedSteps());
    if (expanded.has(stepIndex)) {
      expanded.delete(stepIndex);
    } else {
      expanded.add(stepIndex);
    }
    this.expandedSteps.set(expanded);
  }

  getServiceTitle(serviceId: string): string {
    const service = COMPREHENSIVE_SERVICES.find(s => s.id === serviceId);
    return service?.title || serviceId;
  }

  getServiceAgency(serviceId: string): string {
    const service = COMPREHENSIVE_SERVICES.find(s => s.id === serviceId);
    return service?.agency || 'Government Agency';
  }

  getBusinessTypeLabel(): string {
    switch (this.businessDetails.businessType) {
      case 'company': return 'Private Limited Company';
      case 'partnership': return 'Partnership';
      case 'sole-proprietorship': return 'Sole Proprietorship';
      default: return this.businessDetails.businessType;
    }
  }

  getSectorLabel(): string {
    return this.businessDetails.sector.charAt(0).toUpperCase() + 
           this.businessDetails.sector.slice(1).replace('-', ' ');
  }

  getLocationLabel(): string {
    return this.businessDetails.location.charAt(0).toUpperCase() + 
           this.businessDetails.location.slice(1);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-UG').format(num);
  }
}