import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';
import {
  UserPlusIcon,
  BuildingLibraryIcon,
  MapIcon,
  ChatBubbleLeftRightIcon,
  InboxArrowDownIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  BriefcaseIcon,
  CalculatorIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  LanguageIcon,
  ClockIcon,
  BookmarkSquareIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'How to Use the OneStop Centre — User Guide',
  description:
    'A step-by-step guide to using the Uganda Investment Authority OneStop Centre: services, investments, the AI assistant, inquiries, appointments and business tools.',
};

const STEPS = [
  {
    icon: UserPlusIcon,
    title: 'Create your account',
    body: 'Sign in with Google or an email and password. An account lets you track every inquiry, resume applications across devices, and manage your investor profile in one place.',
    action: { label: 'Get started', href: '/' },
    note: 'You can browse most of the portal without an account — but signing in unlocks tracking and saved progress.',
  },
  {
    icon: BuildingLibraryIcon,
    title: 'Explore services & agencies',
    body: 'The OneStop Centre brings 16+ government agencies — UIA, URSB, URA, NEMA, KCCA and more — into a single portal. Browse what each offers and how they can help your business.',
    action: { label: 'Browse agencies', href: '/agencies' },
    secondary: { label: 'View all services', href: '/services' },
  },
  {
    icon: MapIcon,
    title: 'Discover investment opportunities',
    body: 'Explore priority sectors and bankable projects across Uganda, view licensed projects on the interactive map, and see investment ranges, ROI and timelines.',
    action: { label: 'Explore investments', href: '/investments' },
    secondary: { label: 'Projects map', href: '/projects' },
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Ask the AI assistant',
    body: 'Get instant, multilingual answers about registering a business, tax incentives, sector opportunities and required licenses — available around the clock.',
    action: { label: 'Chat now', href: '/chatbot' },
  },
  {
    icon: InboxArrowDownIcon,
    title: 'Submit an inquiry or request',
    body: 'Raise a service request or inquiry and receive a reference number instantly. Each request is routed to the right agency with a clear response-time (SLA) commitment.',
    action: { label: 'Submit an inquiry', href: '/tickets/create' },
  },
  {
    icon: Squares2X2Icon,
    title: 'Track everything in one place',
    body: 'Your “My Submissions” dashboard shows every ticket, agency inquiry, appointment and your investor application — each with a live status. Track a single ticket any time using its reference and your email.',
    action: { label: 'My Submissions', href: '/account' },
    secondary: { label: 'Track a ticket', href: '/tickets' },
  },
  {
    icon: CalendarDaysIcon,
    title: 'Book appointments & onboard as an investor',
    body: 'Request a meeting with an agency, or complete the guided investor onboarding to receive a dedicated facilitation officer. Long forms save automatically to your account, so you can finish later.',
    action: { label: 'Become an investor', href: '/investments/onboarding' },
    secondary: { label: 'Business registration', href: '/business/registration' },
  },
  {
    icon: BriefcaseIcon,
    title: 'Use the business tools',
    body: 'Plan with confidence using the built-in ROI and tax calculators, generate professional invoices, and check exactly which documents you need — all tailored to the Ugandan context.',
    action: { label: 'Open the tools', href: '/tools' },
  },
];

const TOOLS = [
  { icon: CalculatorIcon, title: 'ROI Calculator', body: 'Model returns with Uganda-specific data.', href: '/tools/roi-calculator' },
  { icon: ReceiptPercentIcon, title: 'Tax Calculator', body: 'Estimate your tax obligations.', href: '/tools/tax-calculator' },
  { icon: DocumentTextIcon, title: 'Invoice Generator', body: 'Create branded, professional invoices.', href: '/tools/invoice-generator' },
  { icon: ClipboardDocumentCheckIcon, title: 'Document Checklist', body: 'Know exactly what to prepare.', href: '/tools/document-checklist' },
];

const TIPS = [
  { icon: LanguageIcon, title: 'Speak your language', body: 'The AI assistant responds in English, French, Arabic, Chinese and Swahili.' },
  { icon: ClockIcon, title: 'Clear response times', body: 'Every inquiry carries an SLA, so you always know when to expect a reply.' },
  { icon: BookmarkSquareIcon, title: 'Never lose progress', body: 'Multi-step forms auto-save to your account and resume across devices.' },
  { icon: ShieldCheckIcon, title: 'Secure by design', body: 'Your session is protected and you only ever see your own submissions.' },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-black text-white">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #FFD700 0%, transparent 35%), radial-gradient(circle at 85% 75%, #CE1126 0%, transparent 35%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <span className="inline-block text-yellow-400 font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            User Guide
          </span>
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-5"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            How to use the OneStop Centre
          </h1>
          <p className="text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Everything you need — from your first visit to a fully facilitated investment — in eight simple steps.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
              Go to the homepage
            </Link>
            <Link href="/chatbot" className="px-6 py-3 border border-white/40 text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-colors">
              Ask the AI assistant
            </Link>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400" />
      </section>

      {/* ── Journey stepper ──────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <span className="inline-block text-yellow-600 font-semibold text-sm uppercase tracking-[0.18em] mb-3">
              Your journey
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-neutral-900">From first visit to facilitated investment</h2>
          </Reveal>

          <ol className="relative border-l-2 border-neutral-200 ml-4 sm:ml-6 space-y-10">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.05}>
                <li className="relative pl-8 sm:pl-12">
                  {/* Number badge on the line */}
                  <span className="absolute -left-[1.15rem] sm:-left-[1.4rem] top-0 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black text-yellow-400 font-bold ring-4 ring-white shadow-md">
                    {i + 1}
                  </span>
                  <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                        <step.icon className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1.5">{step.title}</h3>
                        <p className="text-neutral-600 leading-relaxed">{step.body}</p>
                        {step.note && (
                          <p className="text-sm text-neutral-400 mt-2 italic">{step.note}</p>
                        )}
                        <div className="mt-4 flex flex-wrap items-center gap-4">
                          <Link
                            href={step.action.href}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-yellow-700 hover:text-yellow-800"
                          >
                            {step.action.label}
                            <ArrowRightIcon className="w-4 h-4" />
                          </Link>
                          {step.secondary && (
                            <Link href={step.secondary.href} className="text-sm font-medium text-neutral-500 hover:text-neutral-800">
                              {step.secondary.label}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Business tools ───────────────────────────────────────── */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <span className="inline-block text-yellow-600 font-semibold text-sm uppercase tracking-[0.18em] mb-3">Plan with confidence</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-neutral-900">Free business tools</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOOLS.map((tool, i) => (
              <Reveal key={tool.title} delay={i * 0.06} className="h-full">
                <Link
                  href={tool.href}
                  className="group block h-full bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-lg hover:border-yellow-400/60 hover:-translate-y-1 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center mb-4 group-hover:bg-yellow-100 transition-colors">
                    <tool.icon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">{tool.title}</h3>
                  <p className="text-sm text-neutral-600">{tool.body}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Good to know ─────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <span className="inline-block text-yellow-600 font-semibold text-sm uppercase tracking-[0.18em] mb-3">Good to know</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-neutral-900">Little things that make it easier</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIPS.map((tip, i) => (
              <Reveal key={tip.title} delay={i * 0.06} className="h-full">
                <div className="h-full bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center mb-4">
                    <tip.icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-1">{tip.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{tip.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section className="py-20 bg-black text-white">
        <Reveal className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to begin?</h2>
          <p className="text-lg text-neutral-300 mb-8">
            Start on the homepage, or ask the assistant anything — we&apos;ll guide you the rest of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/investments/onboarding" className="px-7 py-3.5 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
              Start your investment journey
            </Link>
            <Link href="/support" className="px-7 py-3.5 border border-white/40 text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-colors">
              Contact support
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
