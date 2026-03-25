'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { MessageSquare, Phone, Mail, MapPin } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    category: '',
    message: '',
    agreedToFollowUp: false
  });

  const [errors, setErrors] = useState({
    fullName: false,
    email: false,
    message: false
  });

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const validateForm = () => {
    const newErrors = {
      fullName: !formData.fullName.trim(),
      email: !formData.email.trim(),
      message: !formData.message.trim()
    };
    setErrors(newErrors);
    return !newErrors.fullName && !newErrors.email && !newErrors.message;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/contact/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || undefined,
          agency: 'UIA',
          subject: formData.category || 'General Inquiry',
          message: formData.message,
          urgency: 'normal',
        }),
      });

      if (!res.success) throw new Error(res.error || 'Submission failed');

      showToast('Your message has been submitted. Our team will respond within 24 hours.', 'success');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        category: '',
        message: '',
        agreedToFollowUp: false
      });
      setErrors({ fullName: false, email: false, message: false });
    } catch {
      showToast('Failed to submit your message. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportChannels = [
    {
      title: 'Live Chat Support',
      description: 'Get instant help from our support team',
      icon: <MessageSquare className="w-8 h-8 text-yellow-600" />,
      availability: 'Mon-Fri: 8AM-6PM',
      action: 'Start Chat',
      href: '/chatbot'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our experts',
      icon: <Phone className="w-8 h-8 text-yellow-700" />,
      availability: '+256 414 301 000',
      action: 'Call Now',
      href: 'tel:+256414301000'
    },
    {
      title: 'Email Support',
      description: 'Send us detailed questions',
      icon: <Mail className="w-8 h-8 text-neutral-800" />,
      availability: 'support@onestopcentre.go.ug',
      action: 'Send Email',
      href: 'mailto:support@onestopcentre.go.ug'
    },
    {
      title: 'Office Visits',
      description: 'Visit our physical location',
      icon: <MapPin className="w-8 h-8 text-yellow-600" />,
      availability: 'Kampala, Uganda Investment Authority',
      action: 'Get Directions',
      href: 'https://www.google.com/maps/search/Uganda+Investment+Authority+Kampala'
    }
  ];

  const faqCategories = [
    {
      title: 'Business Registration',
      questions: [
        {
          q: 'How long does business registration take?',
          a: 'Standard business registration typically takes 3-5 business days once all required documents are submitted.'
        },
        {
          q: 'What documents do I need for company registration?',
          a: 'You need a valid ID, memorandum of association, articles of association, and proof of physical address. See our document checklist for a complete list.'
        },
        {
          q: 'Can foreign nationals register a business in Uganda?',
          a: 'Yes, foreign nationals can register businesses in Uganda. However, certain sectors may have restrictions or require minimum local partnership.'
        }
      ]
    },
    {
      title: 'Investment Licensing',
      questions: [
        {
          q: 'What is the minimum investment amount required?',
          a: 'The minimum investment varies by sector. For most sectors, the minimum is USD 100,000, but this can be lower for certain priority sectors.'
        },
        {
          q: 'How do I apply for investment incentives?',
          a: 'Investment incentives are applied for through the Uganda Investment Authority (UIA) along with your investment license application.'
        },
        {
          q: 'What sectors offer the best investment opportunities?',
          a: 'Priority sectors include agriculture, tourism, manufacturing, ICT, mining, and energy. Each offers different incentive packages.'
        }
      ]
    },
    {
      title: 'Tax Registration',
      questions: [
        {
          q: 'When should I register for taxes?',
          a: 'You should register for taxes immediately after business registration or before starting operations, whichever comes first.'
        },
        {
          q: 'What tax obligations do I have as a new business?',
          a: 'Common tax obligations include Corporate Income Tax, PAYE (if you have employees), and VAT (if turnover exceeds UGX 150 million annually).'
        },
        {
          q: 'How do I get a Tax Identification Number (TIN)?',
          a: 'Apply for TIN at Uganda Revenue Authority (URA) offices or online through their portal with your business registration certificate.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/uganda-kampala-city-view.webp)'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="block text-white font-light">Dedicated</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 font-black">
              Support Center
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-200 leading-relaxed font-light">
            Your trusted partner for seamless business and investment journeys in Uganda
          </p>
        </div>
      </section>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">

        {/* Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {supportChannels.map((channel, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                {channel.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {channel.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {channel.description}
              </p>
              <p className="text-gray-500 text-xs mb-4">
                {channel.availability}
              </p>
              <Link
                href={channel.href}
                target={channel.href.startsWith('http') ? '_blank' : undefined}
                rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
              >
                {channel.action}
              </Link>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Send Us a Message
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black`}
                      placeholder="Your full name"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">Full name is required</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">Email is required</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black"
                      placeholder="+256 700 000 000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black"
                    >
                      <option value="">Select a category</option>
                      <option value="business-registration">Business Registration</option>
                      <option value="investment-licensing">Investment Licensing</option>
                      <option value="tax-registration">Tax Registration</option>
                      <option value="technical-support">Technical Support</option>
                      <option value="general-inquiry">General Inquiry</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={8}
                      className={`w-full px-3 py-2 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black`}
                      placeholder="Please describe your question or issue in detail..."
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1">Message is required</p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.agreedToFollowUp}
                        onChange={(e) => setFormData({ ...formData, agreedToFollowUp: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">
                        I agree to receive follow-up communications regarding my inquiry
                      </span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-yellow-600 text-black py-3 rounded-lg font-semibold hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {category.questions.map((faq, faqIndex) => (
                      <div key={faqIndex}>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {faq.q}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {faq.a}
                        </p>
                        {faqIndex < category.questions.length - 1 && (
                          <hr className="mt-6 border-gray-200" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Support */}
        <div className="bg-red-50 rounded-xl p-8 border border-red-200 text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-red-900 mb-4">
            Urgent Support Needed?
          </h3>
          <p className="text-red-700 mb-6 max-w-2xl mx-auto">
            If you have an urgent issue that requires immediate attention, please call our emergency support line.
            Available 24/7 for critical business matters.
          </p>
          <Link
            href="tel:+256800911911"
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Emergency Hotline: +256 800 911 911
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === 'success' ? 'bg-yellow-600' : 'bg-red-600'} text-white px-6 py-4 rounded-lg shadow-2xl max-w-md flex items-start gap-3 animate-slide-in`}>
          <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {toast.type === 'success' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          <p className="flex-1 text-sm leading-relaxed">{toast.message}</p>
          <button
            onClick={() => setToast({ show: false, message: '', type: 'success' })}
            className="text-white hover:text-gray-200 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
