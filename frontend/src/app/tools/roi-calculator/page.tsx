import PageHeader from '@/components/ui/PageHeader';
import { buildMetadata } from '@/lib/seo';
import { Metadata } from 'next';
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
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Business tools', href: '/tools' }, { label: 'ROI calculator' }]}
        caption="Business tools"
        title="Investment ROI calculator"
        lead="Estimate the return on an investment in Uganda with sector multipliers, tax incentives and location risk."
      >
        <ul className="grid gap-6 border-t-2 border-black pt-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              <h2 className="font-bold">{feature.title}</h2>
              <p className="mt-1 text-[15px] leading-6 text-[#3b3934]">{feature.body}</p>
            </li>
          ))}
        </ul>
      </PageHeader>

      {/* Calculator */}
      <section className="gov-container py-12 lg:py-16" aria-label="Calculator">
        <ROICalculator />
      </section>

      {/* Why use */}
      <section className="gov-section gov-section--paper" aria-labelledby="why-heading">
        <div className="gov-container">
        <p className="gov-kicker">Why use this calculator</p>
        <h2 id="why-heading" className="gov-title-l mt-3">Realistic projections for Uganda</h2>
        <ul className="mt-10 grid gap-10 md:grid-cols-3">
          {WHY.map((item) => (
            <li key={item.title} className="gov-card">
              <h3 className="text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-6 text-[#3b3934]">{item.body}</p>
            </li>
          ))}
        </ul>
        </div>
      </section>

      {/* Understanding ROI */}
      <section className="gov-container gov-section" aria-labelledby="roi-heading">
        <h2 id="roi-heading" className="gov-title-l">Understanding ROI</h2>
        <p className="mt-4 max-w-3xl leading-7 text-neutral-700">
          Return on Investment (ROI) is a performance measure used to evaluate the efficiency of an investment.
          It measures the amount of return on an investment relative to the investment&apos;s cost.
        </p>
        <dl className="mt-8 grid border-t-2 border-black md:grid-cols-3">
          <div className="border-b border-[#dcd8cf] py-5 md:border-b-0 md:pr-6">
            <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Formula</dt>
            <dd className="mt-2 text-lg font-bold">ROI = (Gain − Cost) / Cost × 100%</dd>
          </div>
          <div className="border-b border-[#dcd8cf] py-5 md:border-b-0 md:border-l md:px-6">
            <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Good ROI</dt>
            <dd className="mt-2 text-lg font-bold">15–25% annually in Uganda’s growth sectors</dd>
          </div>
          <div className="border-b border-[#dcd8cf] py-5 md:border-b-0 md:pr-6">
            <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Factors</dt>
            <dd className="mt-2 text-lg font-bold">Sector multipliers, tax incentives, location risk</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
