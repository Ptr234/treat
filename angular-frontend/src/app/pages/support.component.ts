import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  serviceType: string;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <div class="mb-6">
          <img 
            src="/images/uganda-flag.png" 
            alt="Uganda Flag" 
            class="w-24 h-16 mx-auto mb-4 rounded-lg shadow-lg"
          >
        </div>
        <h1 class="font-display text-hero text-gray-900 mb-6">Expert Support & Consultation</h1>
        <p class="text-body-large text-gray-600 max-w-4xl mx-auto mb-8">
          Get professional guidance from our certified business consultants and investment experts. 
          We're here to ensure your success in Uganda's thriving business environment.
        </p>
        <div class="flex justify-center items-center space-x-8 text-sm text-gray-500">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            24/7 Support Available
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            Expert Consultants
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-black rounded-full mr-2"></div>
            99% Client Satisfaction
          </div>
        </div>
      </div>

      <!-- Contact Methods -->
      <section class="mb-20">
        <div class="text-center mb-12">
          <h2 class="font-display text-section-title text-gray-900 mb-4">Get In Touch</h2>
          <p class="text-body-large text-gray-600 max-w-3xl mx-auto">
            Multiple ways to reach our expert team for personalized assistance
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div class="card-uganda p-8 text-center group hover:scale-105 transition-transform">
            <div class="w-16 h-16 prosperity-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 class="font-display text-card-title text-gray-900 mb-4">Phone Support</h3>
            <div class="space-y-2 text-body text-gray-600 mb-6">
              <div class="font-semibold text-black">+256 414 346 123</div>
              <div class="font-semibold text-black">+256 701 234 567</div>
              <div class="text-sm">Monday - Friday: 8AM - 6PM</div>
              <div class="text-sm">Saturday: 9AM - 2PM</div>
            </div>
            <button class="btn-uganda-accent group-hover:scale-110 transition-transform">
              Call Now
            </button>
          </div>

          <div class="card-uganda p-8 text-center group hover:scale-105 transition-transform">
            <div class="w-16 h-16 unity-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="font-display text-card-title text-gray-900 mb-4">Email Support</h3>
            <div class="space-y-2 text-body text-gray-600 mb-6">
              <div class="font-semibold text-red-600">info@onestopeuganda.com</div>
              <div class="font-semibold text-red-600">support@onestopeuganda.com</div>
              <div class="text-sm">Response within 2 hours</div>
              <div class="text-sm">Available 24/7</div>
            </div>
            <button class="btn-uganda-accent group-hover:scale-110 transition-transform">
              Send Email
            </button>
          </div>

          <div class="card-uganda p-8 text-center group hover:scale-105 transition-transform">
            <div class="w-16 h-16 strength-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="font-display text-card-title text-gray-900 mb-4">Visit Our Office</h3>
            <div class="space-y-2 text-body text-gray-600 mb-6">
              <div class="font-semibold text-black">Kampala Business Hub</div>
              <div>Plot 15, Kimathi Avenue</div>
              <div>Nakasero, Kampala</div>
              <div class="text-sm">Monday - Friday: 8AM - 6PM</div>
            </div>
            <button class="btn-uganda-accent group-hover:scale-110 transition-transform">
              Get Directions
            </button>
          </div>
        </div>
      </section>

      <!-- Support Services -->
      <section class="mb-20">
        <div class="text-center mb-12">
          <h2 class="font-display text-section-title text-gray-900 mb-4">Our Support Services</h2>
          <p class="text-body-large text-gray-600 max-w-3xl mx-auto">
            Comprehensive assistance across all aspects of business and investment in Uganda
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="card-modern p-6">
            <div class="w-12 h-12 prosperity-gradient rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-3">Business Registration</h3>
            <p class="text-sm text-gray-600 mb-4">
              Complete guidance through business registration, from name reservation to certificate issuance.
            </p>
            <ul class="text-xs text-gray-500 space-y-1">
              <li>• Company formation assistance</li>
              <li>• Document preparation</li>
              <li>• Timeline management</li>
            </ul>
          </div>

          <div class="card-modern p-6">
            <div class="w-12 h-12 unity-gradient rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-3">Investment Advisory</h3>
            <p class="text-sm text-gray-600 mb-4">
              Expert investment guidance, market analysis, and opportunity identification.
            </p>
            <ul class="text-xs text-gray-500 space-y-1">
              <li>• Due diligence support</li>
              <li>• Risk assessment</li>
              <li>• ROI calculations</li>
            </ul>
          </div>

          <div class="card-modern p-6">
            <div class="w-12 h-12 strength-gradient rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.414-4.414L18.586 5H15.414L12.586 2.172a2 2 0 00-2.828 0L6.93 5H3.707l1.414-1.414a2 2 0 000-2.828L2.293.929A1 1 0 00.879 2.343L2.707 4.171H6L8.828 1.343a2 2 0 012.828 0L14.485 4.171H17.707L19.535 2.343A1 1 0 0020.949.929L18.121 3.757z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-3">Compliance Management</h3>
            <p class="text-sm text-gray-600 mb-4">
              Ensure full regulatory compliance with ongoing monitoring and updates.
            </p>
            <ul class="text-xs text-gray-500 space-y-1">
              <li>• Regulatory monitoring</li>
              <li>• Compliance audits</li>
              <li>• Legal updates</li>
            </ul>
          </div>

          <div class="card-modern p-6">
            <div class="w-12 h-12 uganda-gradient rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-3">Technical Support</h3>
            <p class="text-sm text-gray-600 mb-4">
              Platform navigation, tool usage, and technical troubleshooting assistance.
            </p>
            <ul class="text-xs text-gray-500 space-y-1">
              <li>• Platform training</li>
              <li>• Tool guidance</li>
              <li>• Technical troubleshooting</li>
            </ul>
          </div>

          <div class="card-modern p-6">
            <div class="w-12 h-12 prosperity-gradient rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-3">Strategic Consulting</h3>
            <p class="text-sm text-gray-600 mb-4">
              High-level business strategy, market entry planning, and growth advisory.
            </p>
            <ul class="text-xs text-gray-500 space-y-1">
              <li>• Business strategy</li>
              <li>• Market analysis</li>
              <li>• Growth planning</li>
            </ul>
          </div>

          <div class="card-modern p-6">
            <div class="w-12 h-12 unity-gradient rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-3">Client Success</h3>
            <p class="text-sm text-gray-600 mb-4">
              Dedicated account management and ongoing relationship support.
            </p>
            <ul class="text-xs text-gray-500 space-y-1">
              <li>• Account management</li>
              <li>• Success tracking</li>
              <li>• Relationship building</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Contact Form -->
      <section class="mb-20">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 class="font-display text-section-title text-gray-900 mb-6">Send Us a Message</h2>
            <p class="text-body-large text-gray-600 mb-8">
              Have a specific question or need personalized assistance? Fill out the form 
              and our expert consultants will get back to you within 2 hours.
            </p>
            
            <div class="space-y-6">
              <div class="flex items-start space-x-4">
                <div class="w-8 h-8 prosperity-gradient rounded-full flex items-center justify-center mt-1">
                  <svg class="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Fast Response</h3>
                  <p class="text-sm text-gray-600">We respond to all inquiries within 2 hours during business hours</p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div class="w-8 h-8 unity-gradient rounded-full flex items-center justify-center mt-1">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Expert Guidance</h3>
                  <p class="text-sm text-gray-600">Connect directly with certified business and investment consultants</p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div class="w-8 h-8 strength-gradient rounded-full flex items-center justify-center mt-1">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Personalized Solutions</h3>
                  <p class="text-sm text-gray-600">Customized advice tailored to your specific business needs</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card-uganda p-8">
            <form (ngSubmit)="submitForm()" #contactFormRef="ngForm">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="contactForm.name" 
                    name="name" 
                    required 
                    class="form-input-modern" 
                    placeholder="Enter your full name"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input 
                    type="email" 
                    [(ngModel)]="contactForm.email" 
                    name="email" 
                    required 
                    class="form-input-modern" 
                    placeholder="Enter your email"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    [(ngModel)]="contactForm.phone" 
                    name="phone" 
                    class="form-input-modern" 
                    placeholder="+256 xxx xxx xxx"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
                  <select 
                    [(ngModel)]="contactForm.serviceType" 
                    name="serviceType" 
                    required 
                    class="form-input-modern"
                  >
                    <option value="">Select a service...</option>
                    <option value="business-registration">Business Registration</option>
                    <option value="investment-advisory">Investment Advisory</option>
                    <option value="compliance">Compliance Management</option>
                    <option value="technical-support">Technical Support</option>
                    <option value="strategic-consulting">Strategic Consulting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <input 
                  type="text" 
                  [(ngModel)]="contactForm.subject" 
                  name="subject" 
                  required 
                  class="form-input-modern" 
                  placeholder="Brief subject line"
                >
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea 
                  [(ngModel)]="contactForm.message" 
                  name="message" 
                  required 
                  rows="4" 
                  class="form-input-modern" 
                  placeholder="Please describe how we can help you..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                [disabled]="!contactFormRef.form.valid" 
                class="btn-uganda-primary w-full disabled:opacity-50"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="mb-20">
        <div class="text-center mb-12">
          <h2 class="font-display text-section-title text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p class="text-body-large text-gray-600 max-w-3xl mx-auto">
            Quick answers to common questions about our services
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="card-modern p-6">
            <h3 class="font-semibold text-gray-900 mb-3">How long does business registration take?</h3>
            <p class="text-sm text-gray-600">
              Typically 5-10 business days for company registration, depending on the business type and completeness of documentation. We provide timeline updates throughout the process.
            </p>
          </div>

          <div class="card-modern p-6">
            <h3 class="font-semibold text-gray-900 mb-3">What are your consultation fees?</h3>
            <p class="text-sm text-gray-600">
              Initial consultation is free for up to 30 minutes. Extended consulting services are charged based on project scope and complexity. Contact us for a customized quote.
            </p>
          </div>

          <div class="card-modern p-6">
            <h3 class="font-semibold text-gray-900 mb-3">Do you assist foreign investors?</h3>
            <p class="text-sm text-gray-600">
              Yes, we specialize in helping foreign investors navigate Uganda's investment landscape, including UIA registration, work permits, and compliance requirements.
            </p>
          </div>

          <div class="card-modern p-6">
            <h3 class="font-semibold text-gray-900 mb-3">What documents do I need for registration?</h3>
            <p class="text-sm text-gray-600">
              Required documents vary by business type. We provide a comprehensive document checklist and can assist with document preparation to ensure completeness.
            </p>
          </div>
        </div>
      </section>

      <!-- Emergency Contact -->
      <section class="text-center">
        <div class="uganda-gradient rounded-xl p-12 text-white">
          <h2 class="font-display text-section-title text-white mb-6">Need Urgent Assistance?</h2>
          <p class="text-body-large text-gray-100 mb-8 max-w-3xl mx-auto">
            For time-sensitive matters or emergency support, contact our dedicated urgent assistance line. 
            Available 24/7 for critical business and investment issues.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <button class="btn-uganda-secondary text-black hover:text-white">
              <svg class="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Emergency Line
            </button>
            <a routerLink="/registration-wizard" class="bg-transparent border-2 border-yellow-400 text-yellow-300 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-400 hover:text-black transition-all duration-300">
              Start Registration Now
            </a>
          </div>
        </div>
      </section>
    </div>
  `
})
export class SupportComponent {
  contactForm: ContactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    serviceType: ''
  };

  submitForm(): void {
    if (this.isFormValid()) {
      // Here you would typically send the form data to your backend
      console.log('Form submitted:', this.contactForm);
      
      // Show success message (you could use a notification service)
      alert('Thank you for your message! We will get back to you within 2 hours.');
      
      // Reset form
      this.resetForm();
    }
  }

  private isFormValid(): boolean {
    return !!(
      this.contactForm.name &&
      this.contactForm.email &&
      this.contactForm.subject &&
      this.contactForm.message &&
      this.contactForm.serviceType
    );
  }

  private resetForm(): void {
    this.contactForm = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      serviceType: ''
    };
  }
}
