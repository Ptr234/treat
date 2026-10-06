import { buildMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import Link from 'next/link';
import InvestmentOnboardingWizard from '../../../components/interactive/InvestmentOnboardingWizard';

export const metadata: Metadata = buildMetadata({
  title: 'Investment onboarding',
  description: 'Complete your investment profile to get matched with opportunities in Uganda and connect with the agencies that can guide your application.',
  path: '/investments/onboarding/',
});

const BENEFITS = [
  {
    title: 'Personalized matching',
    body: 'Get matched with investments that align with your goals, risk tolerance, and capacity.',
  },
  {
    title: 'Fast-track process',
    body: 'Streamlined application process with direct connection to relevant government agencies.',
  },
  {
    title: 'Expert support',
    body: 'Access to investment advisors and sector specialists throughout your journey.',
  },
];

const TRUST = [
  {
    title: 'Encrypted data',
    body: 'All information is encrypted and stored securely.',
  },
  {
    title: 'Government verified',
    body: 'Official OneStopCentre Uganda platform.',
  },
  {
    title: 'Confidential process',
    body: 'Your investment details remain confidential.',
  },
];

export default function InvestmentOnboardingPage() {
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
            <li>
              <Link href="/investments" className="text-red-600 hover:underline underline-offset-4">Investments</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li className="font-semibold text-black" aria-current="page">Onboarding</li>
          </ol>
        </nav>
      </div>

      {/* Title */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Investor onboarding</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Investment onboarding</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700 sm:text-lg">
          Complete your investment profile to get personalized recommendations and connect with
          the right opportunities across Uganda&apos;s growing economy.
        </p>
      </section>

      {/* Benefits */}
      <section className="mx-auto mt-12 max-w-6xl border-y border-neutral-200 px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" className="sr-only">Benefits of onboarding</h2>
        <ul className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {BENEFITS.map((benefit, index) => (
            <li key={benefit.title} className="border-t-2 border-yellow-400 pt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">{String(index + 1).padStart(2, '0')}</p>
              <h3 className="mt-2 text-lg font-bold">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{benefit.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Wizard */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8" aria-label="Onboarding form">
        <InvestmentOnboardingWizard />
      </section>

      {/* Trust */}
      <section className="border-t border-neutral-200 bg-neutral-50" aria-labelledby="trust-heading">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 id="trust-heading" className="text-2xl font-bold sm:text-3xl">Your information is secure</h2>
          <p className="mt-3 max-w-2xl text-neutral-700">
            We protect your privacy and ensure secure handling of your investment information.
          </p>
          <ul className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
            {TRUST.map((item) => (
              <li key={item.title} className="border-l-4 border-black pl-5">
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-700">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
