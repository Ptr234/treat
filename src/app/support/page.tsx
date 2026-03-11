import { Metadata } from 'next';
import Link from 'next/link';
import { MessageSquare, Phone, Mail, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with business registration, investment processes, and any questions about OneStopCentre Uganda services.',
};

export default function SupportPage() {
  const supportChannels = [
    {
      title: 'Live Chat Support',
      description: 'Get instant help from our support team',
      icon: <MessageSquare className="w-8 h-8 text-blue-600" />,
      availability: 'Mon-Fri: 8AM-6PM',
      action: 'Start Chat',
      href: '#chat'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our experts',
      icon: <Phone className="w-8 h-8 text-green-600" />,
      availability: '+256 800 123 456',
      action: 'Call Now',
      href: 'tel:+256800123456'
    },
    {
      title: 'Email Support',
      description: 'Send us detailed questions',
      icon: <Mail className="w-8 h-8 text-purple-600" />,
      availability: 'support@onestopcentre.go.ug',
      action: 'Send Email',
      href: 'mailto:support@onestopcentre.go.ug'
    },
    {
      title: 'Office Visits',
      description: 'Visit our physical location',
      icon: <MapPin className="w-8 h-8 text-orange-600" />,
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
    <div className="min-h-screen bg-gray-50">
      <section 
        className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca8849d1?q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1920&h=1080&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)'
        }}
      >
        {/* Professional Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Header Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="block text-white font-light">Dedicated</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 font-black">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    placeholder="+256 700 000 000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Category
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
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