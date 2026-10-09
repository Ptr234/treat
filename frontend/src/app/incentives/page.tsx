import PageHeader from '@/components/ui/PageHeader';
import Link from 'next/link';

const linkClass = 'gov-link';

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
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Investments', href: '/investments/' }, { label: 'Tax incentives' }]}
        caption="Invest"
        title="Tax holidays, exemptions and allowances"
        lead="Uganda offers incentives under three laws: the Investment Code Act 2019, the Income Tax Act and the free zones provisions. Each incentive has its own qualifying amount, sector and conditions."
      />

      {/* Eligibility */}
      <section className="gov-section" aria-labelledby="eligibility-heading">
        <div className="gov-container">
          <h2 id="eligibility-heading" className="gov-title-l">Who qualifies</h2>
          <p className="gov-body mt-2">Your project must meet all three conditions.</p>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { title: 'Started after the Act took effect', body: 'The investment must commence after the Investment Code Act 2019 came into force on 29 March 2019.' },
              { title: 'Meets the minimum capital', body: 'The minimum investment capital is set by the Minister through statutory instrument, separately for domestic and foreign investors. Confirm the current amount with UIA.' },
              { title: 'Works in a priority area', body: 'The activity must fall within the priority areas listed in Schedule 2 of the Investment Code Act 2019.' },
            ].map((item, i) => (
              <li key={item.title} className="gov-card gov-card--gold">
                <span className="font-display text-4xl font-semibold text-[#ce1126]">{i + 1}</span>
                <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-6 text-[#3b3934]">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Incentive list */}
      <section className="gov-section gov-section--paper" aria-labelledby="list-heading">
        <div className="gov-container">
          <h2 id="list-heading" className="gov-title-l">Incentives</h2>
          <div className="mt-8 space-y-6">
            {INCENTIVES.map((item) => (
              <article key={item.title} className="grid border border-[#dcd8cf] bg-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                <div className="border-b-4 border-black p-6 lg:border-b-0 lg:border-r-4 lg:border-r-black">
                  <h3 className="text-xl font-bold leading-snug">{item.title}</h3>
                  <p className="mt-2 text-[15px] text-[#3b3934]">{item.who}</p>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[#5c5850]">Benefit</p>
                  <p className="mt-1 font-display text-2xl font-semibold leading-tight text-black">{item.benefit}</p>
                  {item.duration && <p className="mt-3"><span className="gov-tag gov-tag--gold">{item.duration}</span></p>}
                </div>
                <dl className="gov-summary m-6 text-[15px]">
                  <div>
                    <dt>Conditions</dt>
                    <dd>
                      <ul className="list-disc space-y-1 pl-5">
                        {item.conditions.map((condition) => <li key={condition}>{condition}</li>)}
                      </ul>
                    </dd>
                  </div>
                  <div><dt>Law</dt><dd>{item.law}</dd></div>
                  <div>
                    <dt>Source</dt>
                    <dd><a href={item.source.href} target="_blank" rel="noopener noreferrer" className={linkClass}>{item.source.label}</a></dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Next steps and disclaimer */}
      <section className="gov-section" aria-labelledby="next-heading">
        <div className="gov-container grid gap-12 lg:grid-cols-2">
          <div>
            <h2 id="next-heading" className="gov-title-l">How to apply</h2>
            <p className="gov-body mt-3 text-[17px]">
              Incentives are granted through the Uganda Investment Authority as part of the investment licence. Start with investor onboarding or read the licence steps.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="/investments/onboarding/" className="gov-btn gov-btn--start">Start investor onboarding</Link>
              <Link href="/investments/process/" className={linkClass}>Read the investment process</Link>
            </div>
            <ul className="mt-6 space-y-2 text-[15px]">
              <li><Link href="/tools/roi-calculator/" className={linkClass}>Estimate returns with ATMS incentives</Link></li>
              <li><Link href="/support/" className={linkClass}>Ask a question</Link></li>
            </ul>
          </div>
          <div>
            <div className="gov-warning text-[15px]">
              <p>
                This page summarises published information for general guidance. It is not tax or legal advice. Confirm your position with the Uganda Investment Authority and the Uganda Revenue Authority before you commit capital.
              </p>
            </div>
            <p className="gov-body mt-4 text-[15px]">
              Incentives depend on eligibility, approval and the law in force when you invest, and thresholds change through statutory instruments and tax amendments.
            </p>
            <div className="gov-related mt-8">
              <h2>Sources</h2>
              <ul className="text-[15px]">
                <li><a href="https://www.state.gov/reports/2024-investment-climate-statements/uganda" target="_blank" rel="noopener noreferrer" className={linkClass}>US State Department, 2024 Investment Climate Statement: Uganda</a></li>
                <li><a href="https://investmentpolicy.unctad.org/investment-policy-monitor/measures/3397/adoption-of-new-investment-code" target="_blank" rel="noopener noreferrer" className={linkClass}>UNCTAD, adoption of the new Investment Code</a></li>
                <li><a href="https://taxsummaries.pwc.com/uganda/corporate/tax-credits-and-incentives" target="_blank" rel="noopener noreferrer" className={linkClass}>PwC Tax Summaries: Uganda, tax credits and incentives</a></li>
                <li><a href="https://www.pwc.com/ug/en/assets/pdf/legal-alert-investment-code-act-2019.pdf" target="_blank" rel="noopener noreferrer" className={linkClass}>PwC Uganda, legal alert on the Investment Code Act 2019</a></li>
                <li><a href="https://ugandainvest.go.ug/investing-in-uganda-how-to-apply-for-an-investment-license-certificate/" target="_blank" rel="noopener noreferrer" className={linkClass}>Uganda Investment Authority, how to apply for an investment licence</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
