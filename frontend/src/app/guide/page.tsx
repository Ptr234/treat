import PageHeader from '@/components/ui/PageHeader';
import SectionHeading from '@/components/ui/SectionHeading';
import { buildMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
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
  description: 'A step-by-step guide to using the OneStop Centre: services, investments, the AI assistant, inquiries, appointments and business tools.',
  path: '/guide/',
});

const STEPS = [
  {
    icon: UserPlusIcon,
    title: 'Create your account',
    body: 'Sign in with Google or an email and password. An account lets you track every inquiry, resume applications across devices, and manage your investor profile in one place.',
    action: { label: 'Go to your account', href: '/account' },
    note: 'You can browse most of the portal without an account — but signing in unlocks tracking and saved progress.',
  },
  {
    icon: BuildingLibraryIcon,
    title: 'Explore services & agencies',
    body: 'The OneStop Centre connects investors with public agencies such as UIA, URSB, URA, NEMA and KCCA. Browse agency services and find the right place to begin.',
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
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'User guide' }]}
        caption="Guidance"
        title="How to use the OneStop Centre"
        lead="Everything you need — from your first visit to a fully facilitated investment — in eight steps."
        actions={
          <>
            <Link href="/investments/onboarding" className="gov-btn gov-btn--start">Start your investment journey</Link>
            <Link href="/chatbot" className="gov-link">Ask the investment assistant</Link>
          </>
        }
      />

      {/* Journey */}
      <section className="gov-section" aria-labelledby="journey-heading">
        <div className="gov-container grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <SectionHeading id="journey-heading" kicker="Step by step" title="From first visit to facilitated investment" />
            <ol className="gov-steps max-w-3xl">
              {STEPS.map((step) => (
                <li key={step.title} className="!pb-10">
                  <h3 className="flex items-center gap-2.5 text-xl font-bold">
                    {step.title}
                    <step.icon className="h-5 w-5 shrink-0 text-[#ce1126]" aria-hidden="true" />
                  </h3>
                  <p className="gov-body mt-2 text-[17px]">{step.body}</p>
                  {step.note && <p className="gov-inset mt-4 text-[15px]">{step.note}</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px]">
                    <Link href={step.action.href} className="gov-arrow-link">{step.action.label}</Link>
                    {step.secondary && <Link href={step.secondary.href} className="gov-link font-normal">{step.secondary.label}</Link>}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="gov-related">
              <h2>Good to know</h2>
              <ul className="!gap-5">
                {TIPS.map((tip) => (
                  <li key={tip.title} className="flex gap-3">
                    <tip.icon className="mt-0.5 h-5 w-5 shrink-0 text-black" aria-hidden="true" />
                    <span>
                      <span className="block font-bold">{tip.title}</span>
                      <span className="text-[15px] text-[#3b3934]">{tip.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Business tools */}
      <section className="gov-section gov-section--paper" aria-labelledby="guide-tools-heading">
        <div className="gov-container">
          <SectionHeading id="guide-tools-heading" kicker="Plan with confidence" title="Free business tools" link={{ label: 'All tools', href: '/tools' }} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool) => (
              <article key={tool.title} className="gov-card gov-card--link">
                <tool.icon className="h-7 w-7 text-[#ce1126]" aria-hidden="true" />
                <h3 className="gov-card__title mt-4"><Link href={tool.href}>{tool.title}</Link></h3>
                <p className="mt-2 text-[15px] text-[#3b3934]">{tool.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="gov-section gov-section--dark" aria-labelledby="begin-heading">
        <div className="gov-container grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <h2 id="begin-heading" className="gov-title-l text-white">Ready to begin?</h2>
            <p className="mt-3 text-[17px] text-white/80">Start your investor profile, or contact the OneStop Centre and we will guide you the rest of the way.</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/investments/onboarding" className="gov-btn gov-btn--gold">Start your investment journey</Link>
            <Link href="/support" className="gov-btn gov-btn--outline-inverse">Contact support</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
