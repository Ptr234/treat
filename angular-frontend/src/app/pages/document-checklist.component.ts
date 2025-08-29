import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { COMPREHENSIVE_SERVICES, Service, serviceCategories } from '../data/services';

interface DocumentItem {
  name: string;
  required: boolean;
  services: string[];
  category: string;
  checked: boolean;
}

@Component({
  selector: 'app-document-checklist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Document Checklist</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Comprehensive checklist of documents required for business registration and licensing in Uganda. 
          Select your business needs to get a personalized checklist.
        </p>
      </div>

      <!-- Filters -->
      <div class="mb-8 bg-white rounded-lg shadow-md p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
            <select [(ngModel)]="selectedCategory" (change)="filterDocuments()" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option *ngFor="let category of categories" [value]="category">{{category}}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
            <select [(ngModel)]="selectedPriority" (change)="filterDocuments()"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <select [(ngModel)]="selectedType" (change)="filterDocuments()"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Documents</option>
              <option value="required">Required Only</option>
              <option value="optional">Optional Only</option>
            </select>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
          <button (click)="selectAll()" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Select All
          </button>
          <button (click)="clearAll()" 
                  class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
            Clear All
          </button>
          <button (click)="printChecklist()" 
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            Print Checklist
          </button>
          <div class="ml-auto text-sm text-gray-600">
            {{checkedCount}} of {{filteredDocuments.length}} documents selected
          </div>
        </div>
      </div>

      <!-- Document Categories -->
      <div class="space-y-8">
        <div *ngFor="let category of getDocumentsByCategory()" class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">{{category.name}}</h2>
            <p class="text-sm text-gray-600 mt-1">{{category.documents.length}} documents</p>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 gap-4">
              <div *ngFor="let doc of category.documents" 
                   class="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <input type="checkbox" 
                       [(ngModel)]="doc.checked"
                       (change)="updateCheckedCount()"
                       class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <h3 class="font-medium text-gray-900">{{doc.name}}</h3>
                    <span *ngIf="doc.required" 
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Required
                    </span>
                    <span *ngIf="!doc.required" 
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Optional
                    </span>
                  </div>
                  
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 mb-2">Used for:</p>
                    <div class="flex flex-wrap gap-2">
                      <span *ngFor="let service of doc.services.slice(0, 3)" 
                            class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                        {{service}}
                      </span>
                      <span *ngIf="doc.services.length > 3" 
                            class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-600">
                        +{{doc.services.length - 3}} more
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Summary -->
      <div class="mt-12 bg-blue-50 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Preparation Progress</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{checkedCount}}</div>
            <div class="text-sm text-gray-600">Documents Ready</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-orange-600">{{pendingCount}}</div>
            <div class="text-sm text-gray-600">Documents Pending</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{completionPercentage}}%</div>
            <div class="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
        
        <div class="mt-4">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                 [style.width.%]="completionPercentage"></div>
          </div>
        </div>
      </div>

      <!-- Quick Tips -->
      <div class="mt-8 bg-yellow-50 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">📋 Document Preparation Tips</h3>
        <ul class="space-y-2 text-sm text-gray-700">
          <li>• Ensure all documents are recent (issued within the last 6 months unless otherwise specified)</li>
          <li>• Keep both original and certified copies of all documents</li>
          <li>• Have passport-size photographs ready (typically 6-8 copies needed)</li>
          <li>• Verify that all forms are completely filled out and signed</li>
          <li>• Check that all supporting documents are properly notarized where required</li>
          <li>• Organize documents by service category for easier submission</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    @media print {
      .no-print { display: none !important; }
      .print-only { display: block !important; }
    }
  `]
})
export class DocumentChecklistComponent implements OnInit {
  services: Service[] = COMPREHENSIVE_SERVICES;
  categories: string[] = [];
  documents: DocumentItem[] = [];
  filteredDocuments: DocumentItem[] = [];
  
  selectedCategory = '';
  selectedPriority = '';
  selectedType = '';
  
  checkedCount = 0;
  pendingCount = 0;
  completionPercentage = 0;

  ngOnInit() {
    this.categories = serviceCategories.filter(cat => cat !== 'All');
    this.generateDocumentList();
    this.filterDocuments();
  }

  generateDocumentList() {
    const documentMap = new Map<string, DocumentItem>();
    
    this.services.forEach(service => {
      service.requirements.forEach(requirement => {
        const key = requirement.toLowerCase();
        
        if (documentMap.has(key)) {
          const doc = documentMap.get(key)!;
          doc.services.push(service.title);
          if (service.required) {
            doc.required = true;
          }
        } else {
          documentMap.set(key, {
            name: requirement,
            required: service.required,
            services: [service.title],
            category: service.category,
            checked: false
          });
        }
      });
    });
    
    this.documents = Array.from(documentMap.values()).sort((a, b) => {
      if (a.required !== b.required) {
        return a.required ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  filterDocuments() {
    this.filteredDocuments = this.documents.filter(doc => {
      if (this.selectedCategory && doc.category !== this.selectedCategory) {
        return false;
      }
      
      if (this.selectedType) {
        if (this.selectedType === 'required' && !doc.required) return false;
        if (this.selectedType === 'optional' && doc.required) return false;
      }
      
      if (this.selectedPriority) {
        const hasHighPriorityService = doc.services.some(serviceName => {
          const service = this.services.find(s => s.title === serviceName);
          return service && service.priority === this.selectedPriority;
        });
        if (!hasHighPriorityService) return false;
      }
      
      return true;
    });
    
    this.updateCheckedCount();
  }

  getDocumentsByCategory() {
    const categorizedDocs = new Map<string, DocumentItem[]>();
    
    this.filteredDocuments.forEach(doc => {
      if (!categorizedDocs.has(doc.category)) {
        categorizedDocs.set(doc.category, []);
      }
      categorizedDocs.get(doc.category)!.push(doc);
    });
    
    return Array.from(categorizedDocs.entries())
      .map(([name, documents]) => ({ name, documents }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  selectAll() {
    this.filteredDocuments.forEach(doc => doc.checked = true);
    this.updateCheckedCount();
  }

  clearAll() {
    this.filteredDocuments.forEach(doc => doc.checked = false);
    this.updateCheckedCount();
  }

  updateCheckedCount() {
    this.checkedCount = this.filteredDocuments.filter(doc => doc.checked).length;
    this.pendingCount = this.filteredDocuments.length - this.checkedCount;
    this.completionPercentage = this.filteredDocuments.length > 0 
      ? Math.round((this.checkedCount / this.filteredDocuments.length) * 100)
      : 0;
  }

  printChecklist() {
    const selectedDocs = this.filteredDocuments.filter(doc => doc.checked);
    if (selectedDocs.length === 0) {
      alert('Please select at least one document to print.');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(this.generatePrintableChecklist(selectedDocs));
      printWindow.document.close();
      printWindow.print();
    }
  }

  private generatePrintableChecklist(docs: DocumentItem[]): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Uganda Business Registration - Document Checklist</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 25px; }
          .document { margin: 10px 0; padding: 8px; border-left: 3px solid #e5e7eb; }
          .required { border-left-color: #ef4444; }
          .checkbox { width: 20px; height: 20px; margin-right: 10px; }
          .services { font-size: 12px; color: #6b7280; margin-top: 5px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>📋 Uganda Business Registration - Document Checklist</h1>
        <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Total Documents:</strong> ${docs.length}</p>
        
        ${this.getDocumentsByCategory()
          .filter(cat => cat.documents.some(doc => docs.includes(doc)))
          .map(category => `
            <h2>${category.name}</h2>
            ${category.documents
              .filter(doc => docs.includes(doc))
              .map(doc => `
                <div class="document ${doc.required ? 'required' : ''}">
                  <input type="checkbox" class="checkbox"> 
                  <strong>${doc.name}</strong>
                  ${doc.required ? '<span style="color: #ef4444;">(Required)</span>' : '<span style="color: #3b82f6;">(Optional)</span>'}
                  <div class="services">Used for: ${doc.services.join(', ')}</div>
                </div>
              `).join('')}
          `).join('')}
          
        <div class="footer">
          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>Ensure all documents are recent (within 6 months unless specified)</li>
            <li>Keep both original and certified copies</li>
            <li>Verify all forms are completely filled and signed</li>
            <li>Check notarization requirements for each document</li>
          </ul>
          <p>Generated by Uganda One-Stop Centre Platform</p>
        </div>
      </body>
      </html>
    `;
  }
}
