import { buildMetadata } from '@/lib/seo';
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
  ShieldCheckIcon,
  LanguageIcon,
  ClockIcon,
  BookmarkSquareIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = buildMetadata({
  title: 'User guide',
  description: 'A step-by-step guide to using the OneStopCentre: services, investments, the AI assistant, inquiries, appointments and business tools.',
  path: '/guide/',
});

const linkClass =
  'font-semibold text-black underline decoration-yellow-400 decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

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
 <div className="min-h-screen bg-white text-black">
      {/* Breadcrumb band */}
      <div className="border-b border-neutral-200 bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-red-600 hover:underline underline-offset-4">Home</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li className="font-semibold text-black" aria-current="page">User guide</li>
          </ol>
        </nav>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">User guide</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">How to use the OneStop Centre</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700 sm:text-lg">
          Everything you need — from your first visit to a fully facilitated investment — in eight simple steps.
        </p>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link href="/" className={linkClass}>Go to the homepage</Link>
          <Link href="/chatbot" className={linkClass}>Ask the AI assistant</Link>
        </div>
      </section>

      {/* Journey */}
      <section className="mx-auto max-w-6xl border-t border-neutral-200 px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Your journey</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">From first visit to facilitated investment</h2>
        </Reveal>

        <ol className="divide-y divide-neutral-200 border-y border-neutral-200">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.04}>
              <li className="grid gap-4 py-8 md:grid-cols-[4rem_1fr] md:gap-8">
                <span className="text-3xl font-bold leading-none text-yellow-500" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2.5 text-lg font-bold sm:text-xl">
                    <step.icon className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-7 text-neutral-700">{step.body}</p>
                  {step.note && <p className="mt-2 text-sm italic text-neutral-600">{step.note}</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <Link href={step.action.href} className={linkClass}>{step.action.label}</Link>
                    {step.secondary && (
                      <Link href={step.secondary.href} className="font-medium text-neutral-700 underline underline-offset-4 hover:text-red-600">
                        {step.secondary.label}
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Business tools */}
      <section className="mx-auto max-w-6xl border-t border-neutral-200 px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Plan with confidence</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Free business tools</h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((tool, i) => (
            <Reveal key={tool.title} delay={i * 0.05} className="h-full">
              <div className="h-full border-t-2 border-black pt-5">
                <tool.icon className="h-6 w-6 text-red-600" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-bold">
                  <Link href={tool.href} className={linkClass}>{tool.title}</Link>
                </h3>
                <p className="mt-2 text-sm leading-6 text-neutral-700">{tool.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Good to know */}
      <section className="mx-auto max-w-6xl border-t border-neutral-200 px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Good to know</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Little things that make it easier</h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {TIPS.map((tip, i) => (
            <Reveal key={tip.title} delay={i * 0.05} className="h-full">
              <div className="h-full border-l-4 border-yellow-400 pl-5">
                <tip.icon className="h-5 w-5 text-black" aria-hidden="true" />
                <h3 className="mt-3 font-bold">{tip.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-700">{tip.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t-4 border-yellow-400 bg-neutral-50">
        <Reveal className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to begin?</h2>
          <p className="mt-3 max-w-2xl text-neutral-700">
            Start on the homepage, or ask the assistant anything — we&apos;ll guide you the rest of the way.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/investments/onboarding"
              className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3 text-sm font-bold text-yellow-400 hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Start your investment journey
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center justify-center rounded-md border-2 border-black px-6 py-3 text-sm font-bold text-black hover:bg-black hover:text-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Contact support
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
