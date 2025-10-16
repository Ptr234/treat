import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with business registration, investment processes, and any questions about OneStopCentre Uganda services.',
};

export default function SupportPage() {
  const supportChannels = [
    {
      title: 'Live Chat Support',
      description: 'Get instant help from our support team',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      availability: 'Mon-Fri: 8AM-6PM',
      action: 'Start Chat',
      href: '#chat'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our experts',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      availability: '+256 800 123 456',
      action: 'Call Now',
      href: 'tel:+256800123456'
    },
    {
      title: 'Email Support',
      description: 'Send us detailed questions',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      availability: 'support@onestopcentre.go.ug',
      action: 'Send Email',
      href: 'mailto:support@onestopcentre.go.ug'
    },
    {
      title: 'Office Visits',
      description: 'Visit our physical location',
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      availability: 'Kampala, Uganda Investment Authority',
      action: 'Get Directions',
      href: '#directions'
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Support Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get help with business registration, investment processes, and any questions about OneStopCentre Uganda services.
            We&apos;re here to support your business journey.
          </p>
        </div>

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
                href={channel.href as never}
                className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+256 700 000 000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Category
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
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
                    required
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Please describe your question or issue in detail..."
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">
                      I agree to receive follow-up communications regarding my inquiry
                    </span>
                  </label>
                </div>
                <button className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-gray-200">
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
    </div>
  );
}