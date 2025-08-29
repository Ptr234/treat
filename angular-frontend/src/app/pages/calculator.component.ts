import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TaxCalculation {
  grossSalary: number;
  taxableIncome: number;
  payeTax: number;
  nssfContribution: number;
  netSalary: number;
  totalDeductions: number;
}

interface CorporateTaxCalculation {
  revenue: number;
  expenses: number;
  taxableProfit: number;
  corporateTax: number;
  netProfit: number;
  effectiveRate: number;
}

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Uganda Tax Calculator</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Calculate your PAYE tax, corporate tax, and other tax obligations in Uganda with our comprehensive tax calculator.
        </p>
      </div>

      <!-- Calculator Tabs -->
      <div class="mb-8">
        <nav class="flex space-x-8 justify-center">
          <button
            (click)="activeTab.set('paye')"
            [class]="getTabClass('paye')"
          >
            PAYE Calculator
          </button>
          <button
            (click)="activeTab.set('corporate')"
            [class]="getTabClass('corporate')"
          >
            Corporate Tax
          </button>
          <button
            (click)="activeTab.set('vat')"
            [class]="getTabClass('vat')"
          >
            VAT Calculator
          </button>
        </nav>
      </div>

      <!-- PAYE Calculator -->
      <div *ngIf="activeTab() === 'paye'" class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">PAYE Tax Calculator</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Input Section -->
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Monthly Gross Salary (UGX)
              </label>
              <input
                type="number"
                [(ngModel)]="grossSalary"
                (input)="calculatePAYE()"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter gross salary..."
              >
            </div>

            <div class="bg-yellow-50 p-4 rounded-lg">
              <h3 class="font-semibold text-black mb-2">Uganda PAYE Rates (2024)</h3>
              <div class="space-y-1 text-sm text-black">
                <p>• First UGX 235,000: 0% (Tax-free threshold)</p>
                <p>• Next UGX 135,000: 10%</p>
                <p>• Next UGX 130,000: 20%</p>
                <p>• Above UGX 500,000: 30%</p>
              </div>
            </div>

            <div class="bg-red-50 p-4 rounded-lg">
              <h3 class="font-semibold text-red-900 mb-2">NSSF Contribution</h3>
              <p class="text-sm text-red-800">
                15% of gross salary (Employee: 5%, Employer: 10%)
              </p>
            </div>
          </div>

          <!-- Results Section -->
          <div class="space-y-4">
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Tax Calculation Results</h3>
              
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Gross Salary:</span>
                  <span class="font-semibold">UGX {{ formatNumber(payeCalculation().grossSalary) }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">NSSF (5%):</span>
                  <span class="text-red-600">-UGX {{ formatNumber(payeCalculation().nssfContribution) }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Taxable Income:</span>
                  <span class="font-semibold">UGX {{ formatNumber(payeCalculation().taxableIncome) }}</span>
                </div>
                
                <div class="flex justify-between border-t pt-2">
                  <span class="text-gray-600">PAYE Tax:</span>
                  <span class="text-red-600">-UGX {{ formatNumber(payeCalculation().payeTax) }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Total Deductions:</span>
                  <span class="text-red-600">-UGX {{ formatNumber(payeCalculation().totalDeductions) }}</span>
                </div>
                
                <div class="flex justify-between border-t pt-2 text-lg font-bold">
                  <span class="text-red-600">Net Salary:</span>
                  <span class="text-red-600">UGX {{ formatNumber(payeCalculation().netSalary) }}</span>
                </div>
              </div>
            </div>

            <div class="bg-yellow-50 p-4 rounded-lg">
              <h4 class="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
              <ul class="text-sm text-yellow-700 space-y-1">
                <li>• Calculations based on current Uganda tax rates</li>
                <li>• NSSF contributions are capped at UGX 200,000 monthly</li>
                <li>• Results are estimates for guidance only</li>
                <li>• Consult URA for official tax calculations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Corporate Tax Calculator -->
      <div *ngIf="activeTab() === 'corporate'" class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Corporate Tax Calculator</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Input Section -->
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Annual Revenue (UGX)
              </label>
              <input
                type="number"
                [(ngModel)]="revenue"
                (input)="calculateCorporateTax()"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter annual revenue..."
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Deductible Expenses (UGX)
              </label>
              <input
                type="number"
                [(ngModel)]="expenses"
                (input)="calculateCorporateTax()"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter total expenses..."
              >
            </div>

            <div class="bg-yellow-50 p-4 rounded-lg">
              <h3 class="font-semibold text-black mb-2">Uganda Corporate Tax Rates</h3>
              <div class="space-y-1 text-sm text-black">
                <p>• Standard rate: 30%</p>
                <p>• Small businesses (under UGX 150M): 1% on turnover</p>
                <p>• Manufacturing: 25% (first 5 years)</p>
                <p>• Agriculture: 20%</p>
              </div>
            </div>
          </div>

          <!-- Results Section -->
          <div class="space-y-4">
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Corporate Tax Results</h3>
              
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Annual Revenue:</span>
                  <span class="font-semibold">UGX {{ formatNumber(corporateCalculation().revenue) }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Deductible Expenses:</span>
                  <span class="text-red-600">-UGX {{ formatNumber(corporateCalculation().expenses) }}</span>
                </div>
                
                <div class="flex justify-between border-t pt-2">
                  <span class="text-gray-600">Taxable Profit:</span>
                  <span class="font-semibold">UGX {{ formatNumber(corporateCalculation().taxableProfit) }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Corporate Tax (30%):</span>
                  <span class="text-red-600">-UGX {{ formatNumber(corporateCalculation().corporateTax) }}</span>
                </div>
                
                <div class="flex justify-between border-t pt-2 text-lg font-bold">
                  <span class="text-red-600">Net Profit After Tax:</span>
                  <span class="text-red-600">UGX {{ formatNumber(corporateCalculation().netProfit) }}</span>
                </div>
                
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Effective Tax Rate:</span>
                  <span class="text-black">{{ corporateCalculation().effectiveRate.toFixed(2) }}%</span>
                </div>
              </div>
            </div>

            <div class="bg-red-50 p-4 rounded-lg">
              <h4 class="font-semibold text-red-800 mb-2">Tax Incentives Available:</h4>
              <ul class="text-sm text-red-700 space-y-1">
                <li>• Investment allowance: 50% of qualifying expenditure</li>
                <li>• Depreciation allowances for equipment</li>
                <li>• Export promotion incentives</li>
                <li>• Manufacturing sector benefits</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- VAT Calculator -->
      <div *ngIf="activeTab() === 'vat'" class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">VAT Calculator</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Amount (UGX)
              </label>
              <input
                type="number"
                [(ngModel)]="vatAmount"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter amount..."
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Calculation Type
              </label>
              <select
                [(ngModel)]="vatType"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="exclusive">Add VAT (Exclusive)</option>
                <option value="inclusive">Extract VAT (Inclusive)</option>
              </select>
            </div>

            <div class="bg-yellow-50 p-4 rounded-lg">
              <h3 class="font-semibold text-black mb-2">Uganda VAT Information</h3>
              <div class="space-y-1 text-sm text-black">
                <p>• Standard VAT rate: 18%</p>
                <p>• Registration threshold: UGX 150 million annually</p>
                <p>• Some items are zero-rated or exempt</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 p-6 rounded-lg">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">VAT Calculation</h3>
            
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Amount {{ vatType() === 'exclusive' ? '(before VAT)' : '(including VAT)' }}:</span>
                <span class="font-semibold">UGX {{ formatNumber(vatAmount()) }}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-gray-600">VAT (18%):</span>
                <span class="text-black">UGX {{ formatNumber(calculateVAT()) }}</span>
              </div>
              
              <div class="flex justify-between border-t pt-2 text-lg font-bold">
                <span class="text-red-600">Total {{ vatType() === 'exclusive' ? '(including VAT)' : '(excluding VAT)' }}:</span>
                <span class="text-red-600">UGX {{ formatNumber(calculateVATTotal()) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="mt-12 bg-gray-50 rounded-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Important Tax Information</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">URA Compliance</h3>
            <p class="text-gray-600">All calculations are based on current Uganda Revenue Authority guidelines and tax rates.</p>
          </div>
          
          <div class="text-center">
            <div class="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Professional Advice</h3>
            <p class="text-gray-600">For complex tax situations, consult with qualified tax professionals or URA directly.</p>
          </div>
          
          <div class="text-center">
            <div class="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Estimates Only</h3>
            <p class="text-gray-600">These calculations provide estimates for planning purposes. Actual tax may vary based on specific circumstances.</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CalculatorComponent {
  activeTab = signal<'paye' | 'corporate' | 'vat'>('paye');
  
  // PAYE Calculator
  grossSalary = signal(0);
  
  // Corporate Tax Calculator  
  revenue = signal(0);
  expenses = signal(0);
  
  // VAT Calculator
  vatAmount = signal(0);
  vatType = signal<'exclusive' | 'inclusive'>('exclusive');

  payeCalculation = computed(() => this.calculatePAYEInternal());
  corporateCalculation = computed(() => this.calculateCorporateTaxInternal());

  getTabClass(tab: string): string {
    const baseClasses = 'px-6 py-3 text-sm font-medium rounded-lg transition-colors duration-200';
    const activeClasses = 'bg-black text-white';
    const inactiveClasses = 'text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200';
    
    return `${baseClasses} ${this.activeTab() === tab ? activeClasses : inactiveClasses}`;
  }

  calculatePAYE(): void {
    // Trigger recalculation by updating signal
    this.grossSalary.update(val => val);
  }

  private calculatePAYEInternal(): TaxCalculation {
    const gross = this.grossSalary();
    let payeTax = 0;
    const taxableIncome = gross;
    
    // Apply PAYE tax brackets
    if (taxableIncome > 235000) {
      const excess1 = Math.min(taxableIncome - 235000, 135000);
      payeTax += excess1 * 0.10;
      
      if (taxableIncome > 370000) {
        const excess2 = Math.min(taxableIncome - 370000, 130000);
        payeTax += excess2 * 0.20;
        
        if (taxableIncome > 500000) {
          const excess3 = taxableIncome - 500000;
          payeTax += excess3 * 0.30;
        }
      }
    }

    const nssfContribution = Math.min(gross * 0.05, 10000); // Capped at 10,000 for employee
    const totalDeductions = payeTax + nssfContribution;
    const netSalary = gross - totalDeductions;

    return {
      grossSalary: gross,
      taxableIncome,
      payeTax,
      nssfContribution,
      netSalary,
      totalDeductions
    };
  }

  calculateCorporateTax(): void {
    // Trigger recalculation
    this.revenue.update(val => val);
    this.expenses.update(val => val);
  }

  private calculateCorporateTaxInternal(): CorporateTaxCalculation {
    const rev = this.revenue();
    const exp = this.expenses();
    const taxableProfit = Math.max(0, rev - exp);
    
    // Standard corporate tax rate of 30%
    const corporateTax = taxableProfit * 0.30;
    const netProfit = taxableProfit - corporateTax;
    const effectiveRate = rev > 0 ? (corporateTax / rev) * 100 : 0;

    return {
      revenue: rev,
      expenses: exp,
      taxableProfit,
      corporateTax,
      netProfit,
      effectiveRate
    };
  }

  calculateVAT(): number {
    const amount = this.vatAmount();
    if (this.vatType() === 'exclusive') {
      return amount * 0.18;
    } else {
      // VAT inclusive - extract VAT
      return amount - (amount / 1.18);
    }
  }

  calculateVATTotal(): number {
    const amount = this.vatAmount();
    if (this.vatType() === 'exclusive') {
      return amount * 1.18;
    } else {
      // VAT inclusive - show amount without VAT
      return amount / 1.18;
    }
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-UG').format(Math.round(num));
  }
}