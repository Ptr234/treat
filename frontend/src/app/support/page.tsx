'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Phone, Mail, MapPin } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

const linkClass =
  'font-semibold text-black underline decoration-yellow-400 decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

const inputClass =
  'w-full rounded-md border bg-white px-3 py-2.5 text-sm text-black placeholder-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1';

const labelClass = 'mb-2 block text-sm font-bold text-black';

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
      title: 'Live chat support',
      description: 'Get instant help from our support team',
      icon: MessageSquare,
      availability: 'Mon-Fri: 8AM-6PM',
      action: 'Start chat',
      href: '/chatbot'
    },
    {
      title: 'Phone support',
      description: 'Speak directly with our experts',
      icon: Phone,
      availability: '+256 414 301 000',
      action: 'Call now',
      href: 'tel:+256414301000'
    },
    {
      title: 'Email support',
      description: 'Send us detailed questions',
      icon: Mail,
      availability: 'support@onestopcentre.go.ug',
      action: 'Send email',
      href: 'mailto:support@onestopcentre.go.ug'
    },
    {
      title: 'Office visits',
      description: 'Visit our physical location',
      icon: MapPin,
      availability: 'Kampala, Uganda Investment Authority',
      action: 'Get directions',
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
 <div className="min-h-screen bg-white text-black">
      {/* Breadcrumb band */}
      <div className="border-b border-neutral-200 bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-red-600 hover:underline underline-offset-4">Home</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li className="font-semibold text-black" aria-current="page">Support</li>
          </ol>
        </nav>
      </div>

      {/* Title and intro */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1fr_.6fr] lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Dedicated support centre</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Your trusted partner for business and investment in Uganda
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-700 sm:text-lg">
            Get help with registration, licensing, tax and investment questions from the OneStop Centre team.
          </p>
        </div>
        <div className="relative hidden h-44 lg:block">
          <Image src="/images/uganda-kampala-city-view.webp" alt="Kampala city view" fill className="object-cover" sizes="(min-width: 1024px) 30vw, 0px" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        {/* Support channels */}
        <section aria-labelledby="channels-heading" className="mb-16">
          <h2 id="channels-heading" className="mb-8 border-b-2 border-black pb-3 text-xl font-bold sm:text-2xl">Ways to reach us</h2>
          <ul className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {supportChannels.map((channel) => (
              <li key={channel.title} className="border-t-2 border-yellow-400 pt-5">
                <channel.icon className="h-6 w-6 text-red-600" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-bold">{channel.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-700">{channel.description}</p>
                <p className="mt-2 text-sm font-semibold text-black">{channel.availability}</p>
                <Link
                  href={channel.href}
                  target={channel.href.startsWith('http') ? '_blank' : undefined}
                  rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`${linkClass} mt-4 inline-block text-sm`}
                >
                  {channel.action}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Contact form */}
        <section aria-labelledby="form-heading" className="mb-16 border-t border-neutral-200 pt-12">
          <h2 id="form-heading" className="text-2xl font-bold sm:text-3xl">Send us a message</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-700">
            Fields marked with * are required. Our team will respond within 24 hours.
          </p>
          <form onSubmit={handleSubmit} noValidate className="mt-8 grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div>
                <label htmlFor="fullName" className={labelClass}>Full name *</label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  aria-invalid={errors.fullName}
                  className={`${inputClass} ${errors.fullName ? 'border-red-600' : 'border-neutral-400'}`}
                  placeholder="Your full name"
                />
                {errors.fullName && <p className="mt-1 text-xs font-semibold text-red-600">Full name is required</p>}
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>Email address *</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  aria-invalid={errors.email}
                  className={`${inputClass} ${errors.email ? 'border-red-600' : 'border-neutral-400'}`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="mt-1 text-xs font-semibold text-red-600">Email is required</p>}
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>Phone number</label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`${inputClass} border-neutral-400`}
                  placeholder="+256 700 000 000"
                />
              </div>
              <div>
                <label htmlFor="category" className={labelClass}>Subject category</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`${inputClass} border-neutral-400`}
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

            <div className="space-y-6">
              <div>
                <label htmlFor="message" className={labelClass}>Message *</label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={8}
                  aria-invalid={errors.message}
                  className={`${inputClass} ${errors.message ? 'border-red-600' : 'border-neutral-400'}`}
                  placeholder="Please describe your question or issue in detail..."
                />
                {errors.message && <p className="mt-1 text-xs font-semibold text-red-600">Message is required</p>}
              </div>
              <label className="flex items-start gap-3 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={formData.agreedToFollowUp}
                  onChange={(e) => setFormData({ ...formData, agreedToFollowUp: e.target.checked })}
                  className="mt-1 h-4 w-4 accent-black"
                />
                <span>I agree to receive follow-up communications regarding my inquiry</span>
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-black px-6 py-3 text-sm font-bold text-yellow-400 transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send message'}
              </button>
            </div>
          </form>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="mb-16 border-t border-neutral-200 pt-12">
          <h2 id="faq-heading" className="mb-10 text-2xl font-bold sm:text-3xl">Frequently asked questions</h2>
          <div className="space-y-12">
            {faqCategories.map((category) => (
              <div key={category.title}>
                <h3 className="mb-6 border-l-4 border-yellow-400 pl-4 text-lg font-bold uppercase tracking-wide sm:text-xl">{category.title}</h3>
                <dl className="divide-y divide-neutral-200 border-y border-neutral-200">
                  {category.questions.map((faq) => (
                    <div key={faq.q} className="grid gap-2 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-10">
                      <dt className="font-bold text-black">{faq.q}</dt>
                      <dd className="text-sm leading-7 text-neutral-700">{faq.a}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>

        {/* Urgent support */}
        <section aria-labelledby="urgent-heading" className="border-l-4 border-red-600 bg-neutral-50 p-6 sm:p-8">
          <h2 id="urgent-heading" className="text-xl font-bold text-black sm:text-2xl">Urgent support needed?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-700">
            If you have an urgent issue that requires immediate attention, please call our emergency support line.
            Available 24/7 for critical business matters.
          </p>
          <Link href="tel:+256800911911" className={`${linkClass} mt-5 inline-block text-base`}>
            Emergency hotline: +256 800 911 911
          </Link>
        </section>
      </div>

      {/* Toast notification */}
      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex max-w-md items-start gap-3 border-l-4 bg-black px-5 py-4 text-white shadow-2xl animate-slide-in ${toast.type === 'success' ? 'border-yellow-400' : 'border-red-600'}`}
        >
          <p className="flex-1 text-sm leading-relaxed">{toast.message}</p>
          <button
            type="button"
            onClick={() => setToast({ show: false, message: '', type: 'success' })}
            aria-label="Dismiss notification"
            className="flex-shrink-0 text-white hover:text-yellow-400"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
