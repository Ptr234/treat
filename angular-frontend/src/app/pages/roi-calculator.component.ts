import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { investments } from '../data/investments';

interface InvestmentData {
  initialInvestment: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  projectPeriod: number; // in months
  taxRate: number; // as percentage
  inflationRate: number; // as percentage
  discountRate: number; // as percentage for NPV calculation
}

interface ROIResults {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  taxAmount: number;
  netProfit: number;
  roi: number;
  paybackPeriod: number;
  npv: number;
  irr: number;
  profitMargin: number;
  annualizedReturn: number;
  breakEvenPoint: number;
}

@Component({
  selector: 'app-roi-calculator',
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
        <h1 class="font-display text-section-title text-gray-900 mb-6">Investment ROI Calculator</h1>
        <p class="text-body-large text-gray-600 max-w-3xl mx-auto mb-8">
          Calculate the return on investment for your Uganda business venture with comprehensive financial analysis 
          including ROI, payback period, NPV, and break-even calculations.
        </p>
        <div class="flex justify-center items-center space-x-4 text-sm text-gray-500">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Comprehensive Analysis
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-black rounded-full mr-2"></div>
            Uganda Tax Rates
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            Investment Templates
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <!-- Input Form -->
        <div class="xl:col-span-2">
          <div class="card-uganda p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="font-display text-card-title text-gray-900">Investment Parameters</h2>
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">Quick Templates:</label>
                <select
                  (change)="loadTemplate($event)"
                  class="text-sm form-input-modern px-3 py-1"
                >
                  <option value="">Select template...</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="technology">Technology</option>
                  <option value="tourism">Tourism</option>
                  <option value="real-estate">Real Estate</option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Initial Investment -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Initial Investment (UGX) *
                </label>
                <input
                  type="number"
                  [(ngModel)]="investmentData.initialInvestment"
                  (input)="calculateROI()"
                  class="form-input-modern"
                  placeholder="Enter initial investment..."
                >
              </div>

              <!-- Monthly Revenue -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Expected Monthly Revenue (UGX) *
                </label>
                <input
                  type="number"
                  [(ngModel)]="investmentData.monthlyRevenue"
                  (input)="calculateROI()"
                  class="form-input-modern"
                  placeholder="Enter monthly revenue..."
                >
              </div>

              <!-- Monthly Expenses -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Operating Expenses (UGX) *
                </label>
                <input
                  type="number"
                  [(ngModel)]="investmentData.monthlyExpenses"
                  (input)="calculateROI()"
                  class="form-input-modern"
                  placeholder="Enter monthly expenses..."
                >
              </div>

              <!-- Project Period -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Investment Period (Months) *
                </label>
                <select
                  [(ngModel)]="investmentData.projectPeriod"
                  (change)="calculateROI()"
                  class="form-input-modern"
                >
                  <option [ngValue]="12">1 Year</option>
                  <option [ngValue]="24">2 Years</option>
                  <option [ngValue]="36">3 Years</option>
                  <option [ngValue]="48">4 Years</option>
                  <option [ngValue]="60">5 Years</option>
                  <option [ngValue]="120">10 Years</option>
                </select>
              </div>

              <!-- Tax Rate -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Corporate Tax Rate (%)
                </label>
                <select
                  [(ngModel)]="investmentData.taxRate"
                  (change)="calculateROI()"
                  class="form-input-modern"
                >
                  <option [ngValue]="30">30% - Standard Rate</option>
                  <option [ngValue]="25">25% - Manufacturing (First 5 years)</option>
                  <option [ngValue]="20">20% - Agriculture</option>
                  <option [ngValue]="1">1% - Small Business (Turnover-based)</option>
                  <option [ngValue]="0">0% - Tax Holiday/Incentives</option>
                </select>
              </div>

              <!-- Inflation Rate -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Expected Inflation Rate (%)
                </label>
                <input
                  type="number"
                  [(ngModel)]="investmentData.inflationRate"
                  (input)="calculateROI()"
                  step="0.1"
                  class="form-input-modern"
                  placeholder="e.g., 5.5"
                >
                <p class="text-xs text-gray-500 mt-1">Uganda's average inflation rate: ~5-7%</p>
              </div>

              <!-- Discount Rate -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Discount Rate (%) for NPV
                </label>
                <input
                  type="number"
                  [(ngModel)]="investmentData.discountRate"
                  (input)="calculateROI()"
                  step="0.1"
                  class="form-input-modern"
                  placeholder="e.g., 12.0"
                >
                <p class="text-xs text-gray-500 mt-1">Central Bank Rate: ~10-15%</p>
              </div>

              <!-- Growth Rate -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Annual Revenue Growth Rate (%)
                </label>
                <input
                  type="number"
                  [(ngModel)]="revenueGrowthRate"
                  (input)="calculateROI()"
                  step="0.1"
                  class="form-input-modern"
                  placeholder="e.g., 10.0"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Results Panel -->
        <div class="xl:col-span-1">
          <div class="card-modern p-6 sticky top-8">
            <h3 class="font-display text-card-title text-gray-900 mb-6">Investment Analysis</h3>
            
            <!-- Key Metrics -->
            <div class="space-y-4">
              <!-- ROI -->
              <div class="unity-gradient text-white p-4 rounded-lg">
                <div class="text-sm font-medium text-gray-100 mb-1">Return on Investment (ROI)</div>
                <div class="text-2xl font-bold text-white">{{ roiResults().roi.toFixed(1) }}%</div>
                <div class="text-xs text-gray-200">{{ getRoiAssessment() }}</div>
              </div>

              <!-- Payback Period -->
              <div class="strength-gradient p-4 rounded-lg">
                <div class="text-sm font-medium text-white mb-1">Payback Period</div>
                <div class="text-xl font-bold text-white">{{ roiResults().paybackPeriod.toFixed(1) }} months</div>
                <div class="text-xs text-gray-300">{{ roiResults().paybackPeriod <= 24 ? 'Fast payback' : 'Long-term investment' }}</div>
              </div>

              <!-- Break-even Point -->
              <div class="prosperity-gradient p-4 rounded-lg">
                <div class="text-sm font-medium text-gray-600 mb-1">Break-even Point</div>
                <div class="text-xl font-bold text-black">{{ roiResults().breakEvenPoint.toFixed(1) }} months</div>
                <div class="text-xs text-gray-700">When monthly cash flow turns positive</div>
              </div>

              <!-- Net Present Value -->
              <div class="uganda-gradient text-white p-4 rounded-lg">
                <div class="text-sm font-medium text-gray-200 mb-1">Net Present Value (NPV)</div>
                <div class="text-lg font-bold text-white">
                  UGX {{ formatNumber(roiResults().npv) }}
                </div>
                <div class="text-xs text-gray-200">{{ roiResults().npv > 0 ? 'Positive NPV - Good investment' : 'Negative NPV - High risk' }}</div>
              </div>
            </div>

            <!-- Detailed Results -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">Detailed Financial Analysis</h4>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Total Revenue:</span>
                  <span class="font-semibold">UGX {{ formatNumber(roiResults().totalRevenue) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Total Expenses:</span>
                  <span class="text-red-600">-UGX {{ formatNumber(roiResults().totalExpenses) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Tax Amount:</span>
                  <span class="text-red-600">-UGX {{ formatNumber(roiResults().taxAmount) }}</span>
                </div>
                <div class="flex justify-between border-t pt-2">
                  <span class="text-gray-600">Net Profit:</span>
                  <span class="font-bold text-red-600">UGX {{ formatNumber(roiResults().netProfit) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Profit Margin:</span>
                  <span class="font-semibold">{{ roiResults().profitMargin.toFixed(1) }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Annualized Return:</span>
                  <span class="font-semibold">{{ roiResults().annualizedReturn.toFixed(1) }}%</span>
                </div>
              </div>
            </div>

            <!-- Investment Risk Assessment -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">Risk Assessment</h4>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Investment Risk:</span>
                  <span [class]="getRiskLevelClass()">{{ getRiskLevel() }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Liquidity:</span>
                  <span class="text-sm font-medium text-yellow-600">{{ getLiquidityLevel() }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Market Position:</span>
                  <span class="text-sm font-medium text-black">{{ getMarketPosition() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Investment Recommendations -->
      <div class="mt-12 strength-gradient rounded-lg p-8">
        <h2 class="font-display text-section-title text-white mb-6">Investment Recommendations</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Optimization Suggestions -->
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-4 4" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Optimization Tips</h3>
            </div>
            <ul class="space-y-2 text-sm text-gray-600">
              <li *ngFor="let tip of getOptimizationTips()" class="flex items-start">
                <span class="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {{ tip }}
              </li>
            </ul>
          </div>

          <!-- Risk Mitigation -->
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Risk Management</h3>
            </div>
            <ul class="space-y-2 text-sm text-gray-600">
              <li *ngFor="let risk of getRiskMitigation()" class="flex items-start">
                <span class="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {{ risk }}
              </li>
            </ul>
          </div>

          <!-- Market Insights -->
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 bg-black rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Market Insights</h3>
            </div>
            <ul class="space-y-2 text-sm text-gray-600">
              <li *ngFor="let insight of getMarketInsights()" class="flex items-start">
                <span class="w-1.5 h-1.5 bg-black rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {{ insight }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Export and Actions -->
      <div class="mt-8 card-modern p-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-display text-card-title text-gray-900">Export & Share Analysis</h3>
            <p class="text-sm text-gray-600">Save or share your investment analysis</p>
          </div>
          <div class="flex space-x-3">
            <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Export PDF
            </button>
            <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Share Analysis
            </button>
            <button class="btn-uganda-primary">
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RoiCalculatorComponent {
  investmentData: InvestmentData = {
    initialInvestment: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    projectPeriod: 36,
    taxRate: 30,
    inflationRate: 6.0,
    discountRate: 12.0
  };

  revenueGrowthRate = signal(8.0);

  roiResults = signal<ROIResults>({
    totalRevenue: 0,
    totalExpenses: 0,
    grossProfit: 0,
    taxAmount: 0,
    netProfit: 0,
    roi: 0,
    paybackPeriod: 0,
    npv: 0,
    irr: 0,
    profitMargin: 0,
    annualizedReturn: 0,
    breakEvenPoint: 0
  });

  loadTemplate(event: any): void {
    const template = event.target.value;
    
    switch (template) {
      case 'agriculture':
        this.investmentData = {
          initialInvestment: 50000000, // 50M UGX
          monthlyRevenue: 8000000,     // 8M UGX
          monthlyExpenses: 4500000,    // 4.5M UGX
          projectPeriod: 36,
          taxRate: 20, // Agriculture rate
          inflationRate: 6.5,
          discountRate: 10.0
        };
        this.revenueGrowthRate.set(12.0);
        break;
      case 'manufacturing':
        this.investmentData = {
          initialInvestment: 200000000, // 200M UGX
          monthlyRevenue: 25000000,     // 25M UGX
          monthlyExpenses: 15000000,    // 15M UGX
          projectPeriod: 60,
          taxRate: 25, // Manufacturing first 5 years
          inflationRate: 5.5,
          discountRate: 12.0
        };
        this.revenueGrowthRate.set(15.0);
        break;
      case 'technology':
        this.investmentData = {
          initialInvestment: 25000000,  // 25M UGX
          monthlyRevenue: 12000000,     // 12M UGX
          monthlyExpenses: 6000000,     // 6M UGX
          projectPeriod: 24,
          taxRate: 30,
          inflationRate: 4.0,
          discountRate: 15.0
        };
        this.revenueGrowthRate.set(25.0);
        break;
      case 'tourism':
        this.investmentData = {
          initialInvestment: 100000000, // 100M UGX
          monthlyRevenue: 18000000,     // 18M UGX
          monthlyExpenses: 8000000,     // 8M UGX
          projectPeriod: 48,
          taxRate: 30,
          inflationRate: 7.0,
          discountRate: 13.0
        };
        this.revenueGrowthRate.set(10.0);
        break;
      case 'real-estate':
        this.investmentData = {
          initialInvestment: 500000000, // 500M UGX
          monthlyRevenue: 35000000,     // 35M UGX
          monthlyExpenses: 12000000,    // 12M UGX
          projectPeriod: 120,
          taxRate: 30,
          inflationRate: 8.0,
          discountRate: 11.0
        };
        this.revenueGrowthRate.set(6.0);
        break;
    }
    
    this.calculateROI();
  }

  calculateROI(): void {
    const { initialInvestment, monthlyRevenue, monthlyExpenses, projectPeriod, taxRate, discountRate } = this.investmentData;
    const growthRate = this.revenueGrowthRate() / 100;
    const monthlyGrowthRate = growthRate / 12;
    
    if (!monthlyRevenue || !initialInvestment) {
      return;
    }

    let totalRevenue = 0;
    let totalExpenses = 0;
    const cashFlows: number[] = [-initialInvestment]; // Initial investment as negative cash flow
    let paybackMonths = 0;
    let cumulativeCashFlow = -initialInvestment;
    let breakEvenMonths = 0;
    let monthlyNetFound = false;

    // Calculate month-by-month values
    for (let month = 1; month <= projectPeriod; month++) {
      const adjustedRevenue = monthlyRevenue * Math.pow(1 + monthlyGrowthRate, month - 1);
      const adjustedExpenses = monthlyExpenses * Math.pow(1 + this.investmentData.inflationRate / 1200, month - 1);
      
      totalRevenue += adjustedRevenue;
      totalExpenses += adjustedExpenses;
      
      const monthlyProfit = adjustedRevenue - adjustedExpenses;
      const monthlyTax = Math.max(0, monthlyProfit * taxRate / 100);
      const monthlyNetCashFlow = monthlyProfit - monthlyTax;
      
      cashFlows.push(monthlyNetCashFlow);
      cumulativeCashFlow += monthlyNetCashFlow;
      
      // Find payback period
      if (paybackMonths === 0 && cumulativeCashFlow > 0) {
        paybackMonths = month;
      }
      
      // Find break-even point (monthly cash flow positive)
      if (!monthlyNetFound && monthlyNetCashFlow > 0) {
        breakEvenMonths = month;
        monthlyNetFound = true;
      }
    }

    const grossProfit = totalRevenue - totalExpenses;
    const taxAmount = Math.max(0, grossProfit * taxRate / 100);
    const netProfit = grossProfit - taxAmount;
    const roi = initialInvestment > 0 ? (netProfit / initialInvestment) * 100 : 0;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const annualizedReturn = roi * (12 / projectPeriod);

    // Calculate NPV
    const npv = this.calculateNPV(cashFlows, discountRate / 100 / 12);
    
    // Simple IRR approximation (more complex calculation needed for precise IRR)
    const irr = this.approximateIRR(cashFlows);

    this.roiResults.set({
      totalRevenue,
      totalExpenses,
      grossProfit,
      taxAmount,
      netProfit,
      roi,
      paybackPeriod: paybackMonths || projectPeriod,
      npv,
      irr,
      profitMargin,
      annualizedReturn,
      breakEvenPoint: breakEvenMonths || projectPeriod
    });
  }

  private calculateNPV(cashFlows: number[], monthlyRate: number): number {
    return cashFlows.reduce((npv, cashFlow, index) => {
      return npv + cashFlow / Math.pow(1 + monthlyRate, index);
    }, 0);
  }

  private approximateIRR(cashFlows: number[]): number {
    // Simplified IRR calculation using bisection method
    let rate = 0.1;
    let npv = this.calculateNPV(cashFlows, rate / 12);
    
    if (npv > 0) {
      while (npv > 1 && rate < 1) {
        rate += 0.01;
        npv = this.calculateNPV(cashFlows, rate / 12);
      }
    } else {
      while (npv < -1 && rate > 0) {
        rate -= 0.01;
        npv = this.calculateNPV(cashFlows, rate / 12);
      }
    }
    
    return rate * 100;
  }

  getRoiAssessment(): string {
    const roi = this.roiResults().roi;
    if (roi > 50) return 'Excellent returns';
    if (roi > 25) return 'Very good returns';
    if (roi > 15) return 'Good returns';
    if (roi > 5) return 'Moderate returns';
    return 'Low returns';
  }

  getRiskLevel(): string {
    const payback = this.roiResults().paybackPeriod;
    const roi = this.roiResults().roi;
    
    if (payback <= 12 && roi > 30) return 'Low Risk';
    if (payback <= 24 && roi > 20) return 'Medium Risk';
    if (payback <= 36 && roi > 10) return 'Medium-High Risk';
    return 'High Risk';
  }

  getRiskLevelClass(): string {
    const risk = this.getRiskLevel();
    switch (risk) {
      case 'Low Risk': return 'text-sm font-medium text-red-600';
      case 'Medium Risk': return 'text-sm font-medium text-yellow-600';
      case 'Medium-High Risk': return 'text-sm font-medium text-orange-600';
      case 'High Risk': return 'text-sm font-medium text-red-600';
      default: return 'text-sm font-medium text-gray-600';
    }
  }

  getLiquidityLevel(): string {
    const payback = this.roiResults().paybackPeriod;
    if (payback <= 18) return 'High';
    if (payback <= 36) return 'Medium';
    return 'Low';
  }

  getMarketPosition(): string {
    const margin = this.roiResults().profitMargin;
    if (margin > 30) return 'Market Leader';
    if (margin > 20) return 'Strong Position';
    if (margin > 10) return 'Competitive';
    return 'Challenging';
  }

  getOptimizationTips(): string[] {
    const tips = [
      'Consider Uganda Investment Authority incentives',
      'Explore tax holidays for priority sectors',
      'Optimize operational efficiency to reduce monthly expenses'
    ];
    
    const roi = this.roiResults().roi;
    if (roi < 15) {
      tips.push('Review pricing strategy to increase revenue');
      tips.push('Consider cost reduction measures');
    }
    
    if (this.roiResults().paybackPeriod > 36) {
      tips.push('Explore faster revenue generation methods');
    }

    return tips;
  }

  getRiskMitigation(): string[] {
    return [
      'Diversify revenue streams across different markets',
      'Maintain adequate cash reserves for operations',
      'Consider comprehensive business insurance',
      'Monitor currency exchange rate fluctuations',
      'Build strong local partnerships'
    ];
  }

  getMarketInsights(): string[] {
    return [
      'Uganda GDP growth: 5.2% annually',
      'East African Community market: 177M people',
      'Business environment improving yearly',
      'Young population driving consumption growth',
      'Infrastructure development creating opportunities'
    ];
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-UG').format(Math.round(num));
  }
}