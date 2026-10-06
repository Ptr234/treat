import PageBand from '@/components/ui/PageBand';
import { buildMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import Link from 'next/link';
import ROICalculator from '../../../components/tools/ROICalculator';

export const metadata: Metadata = buildMetadata({
  title: 'ROI calculator',
  description: 'Calculate return on investment for Uganda business opportunities with sector multipliers, ATMS tax incentives and location risk.',
  path: '/tools/roi-calculator/',
});

const FEATURES = [
  {
    title: 'Accurate calculations',
    body: 'Comprehensive ROI analysis with Uganda-specific factors.',
  },
  {
    title: 'ATMS incentives',
    body: 'Factor in tax credits and investment incentives.',
  },
  {
    title: 'Sector analysis',
    body: 'Sector-specific multipliers and risk assessments.',
  },
];

const WHY = [
  {
    title: 'Uganda-specific data',
    body: 'Our calculator uses real Uganda market data, tax rates, and sector-specific growth multipliers to provide accurate projections.',
  },
  {
    title: 'ATMS tax benefits',
    body: 'Automatically calculates tax incentives available under Uganda’s Advance Tax Management System (ATMS) for qualified investments.',
  },
  {
    title: 'Risk assessment',
    body: 'Includes risk-adjusted returns based on investment location and sector volatility to give you realistic expectations.',
  },
];

export default function ROICalculatorPage() {
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
              <Link href="/tools" className="text-red-600 hover:underline underline-offset-4">Business tools</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li className="font-semibold text-black" aria-current="page">ROI calculator</li>
          </ol>
        </nav>
      </div>

      {/* Title and features */}
      <PageBand>
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Investment ROI calculator</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700 sm:text-lg">
          Calculate your return on investment for Uganda business opportunities with sector-specific incentives and ATMS tax benefits.
        </p>
        <ul className="mt-10 grid gap-8 border-y border-neutral-200 py-8 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.title} className=" pl-4">
              <h2 className="mt-1 font-bold">{feature.title}</h2>
              <p className="mt-1 text-sm leading-6 text-neutral-700">{feature.body}</p>
            </li>
          ))}
        </ul>
      </section>
      </PageBand>

      {/* Calculator */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8" aria-label="Calculator">
        <ROICalculator />
      </section>

      {/* Why use */}
      <section className="mx-auto max-w-6xl border-t border-neutral-200 px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="why-heading">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Why use this calculator</p>
        <h2 id="why-heading" className="mt-2 text-2xl font-bold sm:text-3xl">Realistic projections for Uganda</h2>
        <ul className="mt-10 grid gap-10 md:grid-cols-3">
          {WHY.map((item) => (
            <li key={item.title} className="border-t border-neutral-200 pt-5">
              <h3 className="text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Understanding ROI */}
      <section className="mx-auto max-w-6xl border-t border-neutral-200 px-4 pb-20 pt-16 sm:px-6 lg:px-8" aria-labelledby="roi-heading">
        <h2 id="roi-heading" className="text-2xl font-bold sm:text-3xl">Understanding ROI</h2>
        <p className="mt-4 max-w-3xl leading-7 text-neutral-700">
          Return on Investment (ROI) is a performance measure used to evaluate the efficiency of an investment.
          It measures the amount of return on an investment relative to the investment&apos;s cost.
        </p>
        <dl className="mt-10 grid gap-8 md:grid-cols-3">
          <div className=" pl-4">
            <dt className="text-sm font-bold uppercase tracking-wider text-neutral-600">Formula</dt>
            <dd className="mt-2 font-semibold">ROI = (Gain − Cost) / Cost × 100%</dd>
          </div>
          <div className="border-l-4 border-red-600 pl-4">
            <dt className="text-sm font-bold uppercase tracking-wider text-neutral-600">Good ROI</dt>
            <dd className="mt-2 font-semibold">15–25% annually in Uganda’s growth sectors</dd>
          </div>
          <div className=" pl-4">
            <dt className="text-sm font-bold uppercase tracking-wider text-neutral-600">Factors</dt>
            <dd className="mt-2 font-semibold">Sector multipliers, tax incentives, location risk</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
