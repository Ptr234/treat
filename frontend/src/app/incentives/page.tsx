import PageBand from '@/components/ui/PageBand';
import Link from 'next/link';

const linkClass =
  'font-semibold text-black underline decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

interface Incentive {
  title: string;
  who: string;
  benefit: string;
  duration?: string;
  conditions: string[];
  law: string;
  source: { label: string; href: string };
}

const INCENTIVES: Incentive[] = [
  {
    title: 'Income tax holiday for large foreign investments',
    who: 'Foreign investors committing USD 50 million or more.',
    benefit: 'Income tax holiday.',
    duration: '10 years',
    conditions: [
      'The investment must meet the qualification rules of the Investment Code Act 2019.',
      'Incentives are approved through the Uganda Investment Authority (UIA).',
    ],
    law: 'Investment Code Act 2019',
    source: { label: 'US State Department, 2024 Investment Climate Statement', href: 'https://www.state.gov/reports/2024-investment-climate-statements/uganda' },
  },
  {
    title: 'Agro-processing',
    who: 'Investors whose income comes from agro-processing.',
    benefit: 'Full exemption from income tax on agro-processing income.',
    conditions: ['Confirm eligibility for the agro-processing category with UIA before investing.'],
    law: 'Investment Code Act 2019',
    source: { label: 'US State Department, 2024 Investment Climate Statement', href: 'https://www.state.gov/reports/2024-investment-climate-statements/uganda' },
  },
  {
    title: 'Export tax holiday',
    who: 'Exporters of finished goods.',
    benefit: 'Income tax holiday.',
    duration: '10 years',
    conditions: ['The business must export at least 80% of its finished goods, subject to further conditions.'],
    law: 'Income Tax Act',
    source: { label: 'PwC Tax Summaries: Uganda, tax credits and incentives', href: 'https://taxsummaries.pwc.com/uganda/corporate/tax-credits-and-incentives' },
  },
  {
    title: 'Industrial park and free zone operations',
    who: 'Operators in approved industrial parks and free zones. The qualifying amounts depend on whether the investor is a foreign or a Ugandan citizen.',
    benefit: 'Exemption from income tax on operations.',
    duration: 'Ongoing while conditions are met',
    conditions: [
      'Foreign investors: at least USD 10 million. Ugandan citizens: at least USD 300,000 (USD 150,000 for up-country investment).',
      'Locally source at least 75% of raw materials.',
      'Employ at least 75% Ugandan citizens.',
      'Eligible activities include agricultural processing, pharmaceuticals, building materials, automobiles, furniture, IT, commercial farming, chemicals, textiles, leather and machinery.',
    ],
    law: 'Income Tax Act (free zones provisions)',
    source: { label: 'PwC Tax Summaries: Uganda, tax credits and incentives', href: 'https://taxsummaries.pwc.com/uganda/corporate/tax-credits-and-incentives' },
  },
  {
    title: 'Industrial park development',
    who: 'Developers of industrial parks.',
    benefit: 'Exemption from income tax on income from letting or leasing facilities.',
    duration: '10 years',
    conditions: ['Foreign investors: at least USD 50 million. Ugandan citizens: at least USD 10 million.'],
    law: 'Income Tax Act (free zones provisions)',
    source: { label: 'PwC Tax Summaries: Uganda, tax credits and incentives', href: 'https://taxsummaries.pwc.com/uganda/corporate/tax-credits-and-incentives' },
  },
  {
    title: 'Plant and machinery imports',
    who: 'Investors importing plant and machinery.',
    benefit: 'Customs duty exemption, and VAT on the import is deferred and then waived once approved.',
    conditions: ['The VAT waiver is granted on approval.'],
    law: 'Income Tax Act',
    source: { label: 'PwC Tax Summaries: Uganda, tax credits and incentives', href: 'https://taxsummaries.pwc.com/uganda/corporate/tax-credits-and-incentives' },
  },
  {
    title: 'Research, training and mineral exploration',
    who: 'Businesses spending on scientific research, staff training or mineral exploration.',
    benefit: '100% deduction (allowance) in the year the expenditure is incurred.',
    conditions: ['Applies to scientific research, training and mineral exploration expenditure.'],
    law: 'Income Tax Act',
    source: { label: 'PwC Tax Summaries: Uganda, tax credits and incentives', href: 'https://taxsummaries.pwc.com/uganda/corporate/tax-credits-and-incentives' },
  },
  {
    title: 'Employing people with disabilities',
    who: 'Employers where at least 5% of full-time staff are people with disabilities.',
    benefit: 'A deduction of 2% of income tax payable.',
    conditions: ['The 5% threshold applies to full-time employees.'],
    law: 'Income Tax Act',
    source: { label: 'PwC Tax Summaries: Uganda, tax credits and incentives', href: 'https://taxsummaries.pwc.com/uganda/corporate/tax-credits-and-incentives' },
  },
  {
    title: 'Sector-specific exemptions (2024 amendments)',
    who: 'Electric vehicle and battery manufacturers, specialised hospital operators, private equity and venture capital funds, and sales of government securities.',
    benefit: 'Income tax exemption for the qualifying activity.',
    conditions: ['Each exemption applies only to the activity named in the 2024 Income Tax (Amendment) Act.'],
    law: 'Income Tax (Amendment) Act 2024',
    source: { label: 'PwC Tax Summaries: Uganda, tax credits and incentives', href: 'https://taxsummaries.pwc.com/uganda/corporate/tax-credits-and-incentives' },
  },
];

export default function IncentivesPage() {
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
              <Link href="/investments/" className="text-red-600 hover:underline underline-offset-4">Investments</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li className="font-semibold text-black" aria-current="page">Incentives</li>
          </ol>
        </nav>
      </div>

      {/* Title */}
      <PageBand>
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Investment incentives</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Tax holidays, exemptions and allowances</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700 sm:text-lg">
          Uganda offers incentives under three laws: the Investment Code Act 2019, the Income Tax Act and the free zones provisions.
          Each incentive has its own qualifying amount, sector and conditions, so read the rule that applies to your project.
        </p>
      </section>
      </PageBand>

      {/* Eligibility */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="eligibility-heading">
        <h2 id="eligibility-heading" className="border-b border-neutral-200 pb-3 text-xl font-bold sm:text-2xl">Who qualifies</h2>
        <ol className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
          <li className=" pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-red-600">01</p>
            <h3 className="mt-2 font-bold">Started after the Act took effect</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-700">The investment must commence after the Investment Code Act 2019 came into force on 29 March 2019.</p>
          </li>
          <li className=" pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-red-600">02</p>
            <h3 className="mt-2 font-bold">Meets the minimum capital</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-700">The minimum investment capital is set by the Minister through statutory instrument, separately for domestic and foreign investors. Confirm the current amount with UIA.</p>
          </li>
          <li className=" pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-red-600">03</p>
            <h3 className="mt-2 font-bold">Works in a priority area</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-700">The activity must fall within the priority areas listed in Schedule 2 of the Investment Code Act 2019.</p>
          </li>
        </ol>
      </section>

      {/* Incentive list */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="list-heading">
        <h2 id="list-heading" className="border-b border-neutral-200 pb-3 text-xl font-bold sm:text-2xl">Incentives</h2>
        <ul className="mt-2 divide-y divide-neutral-200">
          {INCENTIVES.map((item) => (
            <li key={item.title} className="grid gap-6 py-8 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <h3 className="text-lg font-bold leading-snug">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-700">{item.who}</p>
              </div>
              <dl className="space-y-3 bg-neutral-50 py-4 pl-5 pr-4 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Benefit</dt>
                  <dd className="mt-1 font-semibold text-black">{item.benefit}</dd>
                </div>
                {item.duration && (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Duration</dt>
                    <dd className="mt-1 text-neutral-800">{item.duration}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Conditions</dt>
                  <dd className="mt-1">
                    <ul className="list-disc space-y-1 pl-5 text-neutral-800">
                      {item.conditions.map((condition) => (
                        <li key={condition}>{condition}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Law</dt>
                  <dd className="mt-1 text-neutral-800">{item.law}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Source</dt>
                  <dd className="mt-1">
                    <a href={item.source.href} target="_blank" rel="noopener noreferrer" className={linkClass}>{item.source.label}</a>
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </section>

      {/* Next steps and disclaimer */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8" aria-labelledby="next-heading">
        <div className="grid gap-10 pt-10 lg:grid-cols-2">
          <div>
            <h2 id="next-heading" className="text-xl font-bold sm:text-2xl">How to apply</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              Incentives are granted through the Uganda Investment Authority as part of the investment licence. Start with the investment onboarding form or read the licence steps.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link href="/investments/onboarding/" className={linkClass}>Start investment onboarding</Link>
              <Link href="/tools/roi-calculator/" className={linkClass}>Estimate returns with ATMS incentives</Link>
              <Link href="/support/" className={linkClass}>Ask a question</Link>
            </div>
          </div>
          <div className="border-l-4 border-red-600 pl-6">
            <h2 className="text-lg font-bold">Important</h2>
            <p className="mt-3 text-sm leading-7 text-neutral-700">
              This page summarises published information for general guidance. It is not tax or legal advice. Incentives depend on eligibility, approval and the law in force when you invest, and the thresholds above change through statutory instruments and tax amendments.
              Confirm your position with the Uganda Investment Authority and the Uganda Revenue Authority before you commit capital.
            </p>
            <h3 className="mt-6 font-bold">Sources</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="https://www.state.gov/reports/2024-investment-climate-statements/uganda" target="_blank" rel="noopener noreferrer" className={linkClass}>US State Department, 2024 Investment Climate Statement: Uganda</a></li>
              <li><a href="https://investmentpolicy.unctad.org/investment-policy-monitor/measures/3397/adoption-of-new-investment-code" target="_blank" rel="noopener noreferrer" className={linkClass}>UNCTAD, adoption of the new Investment Code</a></li>
              <li><a href="https://taxsummaries.pwc.com/uganda/corporate/tax-credits-and-incentives" target="_blank" rel="noopener noreferrer" className={linkClass}>PwC Tax Summaries: Uganda, tax credits and incentives</a></li>
              <li><a href="https://www.pwc.com/ug/en/assets/pdf/legal-alert-investment-code-act-2019.pdf" target="_blank" rel="noopener noreferrer" className={linkClass}>PwC Uganda, legal alert on the Investment Code Act 2019</a></li>
              <li><a href="https://ugandainvest.go.ug/investing-in-uganda-how-to-apply-for-an-investment-license-certificate/" target="_blank" rel="noopener noreferrer" className={linkClass}>Uganda Investment Authority, how to apply for an investment licence</a></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
