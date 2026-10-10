'use client';

import PageHeader from '@/components/ui/PageHeader';
import { useEffect, useState, FormEvent } from 'react';
import { useAccountEmail } from '@/hooks/useAccountEmail';
import AccountEmailHint from '@/components/ui/AccountEmailHint';
import Link from 'next/link';
import { MessageSquare, Phone, Mail, MapPin } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

const linkClass = 'gov-link';

const inputClass = 'gov-input';

const labelClass = 'gov-label';

// <select> value → the human label sent to the backend as the inquiry's
// service type and subject.
const SUPPORT_CATEGORIES: Record<string, string> = {
  'business-registration': 'Business Registration',
  'investment-licensing': 'Investment Licensing',
  'tax-registration': 'Tax Registration',
  'technical-support': 'Technical Support',
  'general-inquiry': 'General Inquiry',
};

export default function SupportPage() {
  const accountEmail = useAccountEmail((email) => setFormData((prev) => ({ ...prev, email })));
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    category: '',
    message: '',
    agreedToFollowUp: false
  });

  // "Report a problem" links arrive as /support?page=/some/path#contact-form.
  useEffect(() => {
    const page = new URLSearchParams(window.location.search).get('page');
    if (page) {
      setFormData((prev) => ({
        ...prev,
        category: 'technical-support',
        message: prev.message || `Problem on page: ${page}\n\nWhat went wrong:\n`,
      }));
    }
  }, []);

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
      const category = SUPPORT_CATEGORIES[formData.category] ?? 'General Inquiry';
      const res = await apiFetch('/api/contact/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          agencyCode: 'UIA',
          agencyName: 'Uganda Investment Authority',
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          serviceType: category,
          subject: category,
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
          a: 'The minimum investment capital is set by the Minister through statutory instrument, separately for domestic and foreign investors. Confirm the current amounts with the Uganda Investment Authority before you commit capital. Incentives also depend on meeting the minimum for your category.'
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

  const errorList = [
    errors.fullName && { id: 'fullName', text: 'Enter your full name' },
    errors.email && { id: 'email', text: 'Enter your email address' },
    errors.message && { id: 'message', text: 'Enter your message' },
  ].filter(Boolean) as { id: string; text: string }[];

  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Help and contact' }]}
        caption="Help and contact"
        title="Contact the OneStop Centre"
        lead="Get help with registration, licensing, tax and investment questions. Send us a message and we will reply within 24 hours."
        actions={<a href="#contact-form" className="gov-btn gov-btn--start">Send a message</a>}
        aside={
          <div className="gov-panel">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ffd700]">Investor helpline</p>
            <a href="tel:+256414301000" className="mt-2 block font-display text-3xl font-semibold text-white no-underline hover:underline">+256 414 301 000</a>
            <p className="mt-3 text-sm text-white/80">Monday to Friday, 8:00am to 5:00pm EAT</p>
            <a href="mailto:support@onestopcentre.go.ug" className="mt-4 inline-block break-all text-sm font-semibold text-white underline underline-offset-4 hover:text-[#ffd700]">support@onestopcentre.go.ug</a>
          </div>
        }
      />

      {/* Support channels */}
      <section aria-labelledby="channels-heading" className="gov-section">
        <div className="gov-container">
          <h2 id="channels-heading" className="gov-title-l">Ways to reach us</h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {supportChannels.map((channel) => (
              <li key={channel.title} className="gov-card gov-card--link">
                <channel.icon className="h-7 w-7 text-[#ce1126]" aria-hidden="true" />
                <h3 className="gov-card__title mt-4">
                  <Link
                    href={channel.href}
                    target={channel.href.startsWith('http') ? '_blank' : undefined}
                    rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {channel.title}
                  </Link>
                </h3>
                <p className="mt-2 text-[15px] text-[#3b3934]">{channel.description}</p>
                <p className="mt-auto pt-4 text-sm font-bold text-black">{channel.availability}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contact form */}
      <section id="contact-form" aria-labelledby="form-heading" className="gov-section gov-section--paper scroll-mt-4">
        <div className="gov-container grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="max-w-2xl">
            <h2 id="form-heading" className="gov-title-l">Send us a message</h2>
            <p className="gov-body mt-3">Fields marked with * are required. Our team will respond within 24 hours.</p>

            {errorList.length > 0 && (
              <div role="alert" className="mt-6 border-4 border-[#ce1126] bg-white p-5">
                <h3 className="text-lg font-bold">There is a problem</h3>
                <ul className="mt-2 space-y-1">
                  {errorList.map((err) => (
                    <li key={err.id}><a href={`#${err.id}`} className="font-bold text-[#9a0d1c] underline underline-offset-4">{err.text}</a></li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
              <div className={errors.fullName ? 'border-l-4 border-[#ce1126] pl-4' : ''}>
                <label htmlFor="fullName" className={labelClass}>Full name *</label>
                {errors.fullName && <p className="mb-2 text-sm font-bold text-[#9a0d1c]">Enter your full name</p>}
                <input id="fullName" type="text" autoComplete="name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} aria-invalid={errors.fullName} className={`${inputClass} ${errors.fullName ? '!border-[#ce1126]' : ''}`} />
              </div>
              <div className={errors.email ? 'border-l-4 border-[#ce1126] pl-4' : ''}>
                <label htmlFor="email" className={labelClass}>Email address *</label>
                <p className="gov-hint mb-2">We will only use this to reply to your message.</p>
                {errors.email && <p className="mb-2 text-sm font-bold text-[#9a0d1c]">Enter your email address</p>}
                <input id="email" type="email" autoComplete="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} readOnly={Boolean(accountEmail)} aria-describedby={accountEmail ? 'support-email-hint' : undefined} aria-invalid={errors.email} className={`${inputClass} ${accountEmail ? 'bg-neutral-100' : ''} ${errors.email ? '!border-[#ce1126]' : ''}`} />
                {accountEmail && <AccountEmailHint id="support-email-hint" />}
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className={labelClass}>Phone number</label>
                  <input id="phone" type="tel" autoComplete="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} placeholder="+256 700 000 000" />
                </div>
                <div>
                  <label htmlFor="category" className={labelClass}>Subject category</label>
                  <select id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputClass}>
                    <option value="">Select a category</option>
                    <option value="business-registration">Business Registration</option>
                    <option value="investment-licensing">Investment Licensing</option>
                    <option value="tax-registration">Tax Registration</option>
                    <option value="technical-support">Technical Support</option>
                    <option value="general-inquiry">General Inquiry</option>
                  </select>
                </div>
              </div>
              <div className={errors.message ? 'border-l-4 border-[#ce1126] pl-4' : ''}>
                <label htmlFor="message" className={labelClass}>Message *</label>
                <p className="gov-hint mb-2">Do not include passwords or bank details.</p>
                {errors.message && <p className="mb-2 text-sm font-bold text-[#9a0d1c]">Enter your message</p>}
                <textarea id="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={7} aria-invalid={errors.message} className={`${inputClass} ${errors.message ? '!border-[#ce1126]' : ''}`} />
              </div>
              <label className="flex items-start gap-3 text-[15px] font-normal text-[#262522]">
                <input type="checkbox" checked={formData.agreedToFollowUp} onChange={(e) => setFormData({ ...formData, agreedToFollowUp: e.target.checked })} className="mt-0.5 h-6 w-6 shrink-0" />
                <span>I agree to receive follow-up communications about my enquiry</span>
              </label>
              <button type="submit" disabled={isSubmitting} className="gov-btn">
                {isSubmitting ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </div>

          <aside aria-labelledby="urgent-heading" className="lg:self-start">
            <div className="gov-related">
              <h2 id="urgent-heading">Urgent support needed?</h2>
              <p className="text-[15px] leading-6 text-[#3b3934]">
                If you have an urgent issue that requires immediate attention, call our emergency support line. Available 24/7 for critical business matters.
              </p>
              <Link href="tel:+256800911911" className={`${linkClass} mt-3 inline-block`}>+256 800 911 911</Link>
            </div>
          </aside>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="gov-section">
        <div className="gov-container">
          <h2 id="faq-heading" className="gov-title-l">Frequently asked questions</h2>
          <div className="mt-8 grid gap-10 lg:grid-cols-3">
            {faqCategories.map((category) => (
              <div key={category.title}>
                <h3 className="border-b-2 border-black pb-2 text-lg font-bold">{category.title}</h3>
                <div>
                  {category.questions.map((faq) => (
                    <details key={faq.q} className="group border-b border-[#dcd8cf]">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 font-bold text-black hover:text-[#9a0d1c] [&::-webkit-details-marker]:hidden">
                        <span className="underline decoration-1 underline-offset-4">{faq.q}</span>
                        <span aria-hidden="true" className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center border-2 border-current text-sm leading-none group-open:bg-black group-open:text-white">
                          <span className="group-open:hidden">+</span>
                          <span className="hidden group-open:inline">−</span>
                        </span>
                      </summary>
                      <p className="pb-5 text-[15px] leading-7 text-[#3b3934]">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Toast notification */}
      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex max-w-md items-start gap-3 border-l-[6px] bg-black px-5 py-4 text-white shadow-2xl ${toast.type === 'success' ? 'border-[#ffd700]' : 'border-[#ce1126]'}`}
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
