import PageHeader from '@/components/ui/PageHeader';
import FactRow from '@/components/ui/FactRow';
import Link from 'next/link';

const linkClass = 'gov-link';

const STEPS = [
  {
    title: 'Register your company with URSB',
    agency: 'Uganda Registration Services Bureau (URSB)',
    summary:
      'Company incorporation is the first step. You reserve a business name, then submit the incorporation documents to receive a Certificate of Incorporation. Companies can be registered as local, public or foreign.',
    details: [
      'Reserve a business name. The reservation fee is UGX 35,000.',
      'Registration fee: UGX 105,000 where nominal share capital does not exceed UGX 5,000,000. Above that, 1.5% of nominal share capital.',
      'Submit the incorporation documents, including the Memorandum and Articles of Association.',
    ],
    source: { label: 'URSB, business, company and document registration fees', href: 'https://ursb.go.ug/business-company-and-document-registration-fees/' },
  },
  {
    title: 'Register for tax with URA',
    agency: 'Uganda Revenue Authority (URA)',
    summary: 'After incorporation, the company obtains a Tax Identification Number (TIN) from URA before it starts operating.',
    details: ['Apply for the TIN with your Certificate of Incorporation.'],
    source: { label: 'UIA, Getting Started (Investment Process)', href: 'https://ugandainvest.go.ug/getting-started/' },
  },
  {
    title: 'Apply for the investment licence',
    agency: 'Uganda Investment Authority (UIA)',
    summary:
      'Before the company begins operations, it applies for an investment licence (certificate) from UIA. Applying for and processing the licence is free of charge. UIA reports approval within 24 working hours of a complete application, and its service charter commits to 48 hours.',
    details: [
      'The licence is the step that grants incentives, so apply before you commence operations.',
      'Applications can be made online through the eBiz platform.',
    ],
    source: { label: 'UIA, how to apply for an investment licence', href: 'https://ugandainvest.go.ug/investing-in-uganda-how-to-apply-for-an-investment-license-certificate/' },
  },
  {
    title: 'Obtain secondary licences for your sector',
    agency: 'Relevant sector regulators',
    summary:
      'Depending on the activity, the project may need further permits or clearances as it is implemented. Examples given by UIA include mining, air transport, banking and forestry.',
    details: ['Check with UIA which sector licences apply to your project before you start building.'],
    source: { label: 'UIA, Getting Started (Investment Process)', href: 'https://ugandainvest.go.ug/getting-started/' },
  },
  {
    title: 'Secure work permits for foreign staff',
    agency: 'Directorate of Citizenship and Immigration Control',
    summary:
      'Foreign personnel who will work in the business need a work permit. Permits are sponsored by the employing organisation, which needs an organisation code. Applications are made online, and processing times are set by the Directorate, so confirm them when you apply.',
    details: [
      'Apply online through the official immigration portal at visas.immigration.go.ug. Beware of imitation sites.',
      'Upload the required documents and make any payment the application asks for.',
      'Attend biometric capture at an immigration office with your documents, receipts, approval letter and passport.',
    ],
    source: { label: 'Uganda Immigration, work permit services', href: 'https://www.immigration.go.ug/services/work-permit' },
  },
];

export default function InvestmentProcessPage() {
  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Investments', href: '/investments/' }, { label: 'Investment process' }]}
        caption="Step by step"
        title="From company registration to operating licence"
        lead="Setting up an investment in Uganda follows five steps. The first three must be complete before you start operating. Each step is handled by a different agency, so this page shows who to contact and what to prepare."
      >
        <FactRow
          facts={[
            { label: 'Steps', value: '5' },
            { label: 'Investment licence fee', value: 'Free' },
            { label: 'Online platform', value: 'eBiz' },
          ]}
        />
      </PageHeader>

      <div className="gov-container grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-16">
        <section aria-labelledby="steps-heading">
          <h2 id="steps-heading" className="gov-title-l mb-8">The steps</h2>
          <ol className="gov-steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="!pb-12">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="gov-tag">{step.agency}</span>
                  {i < 3 && <span className="gov-tag gov-tag--gold">Before you operate</span>}
                </p>
                <h3 className="mt-3 text-[22px] font-bold leading-snug">{step.title}</h3>
                <p className="gov-body mt-3 text-[17px]">{step.summary}</p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-[#262522]">
                  {step.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                <p className="gov-hint mt-4">
                  Source:{' '}
                  <a href={step.source.href} target="_blank" rel="noopener noreferrer" className="gov-link font-normal">{step.source.label}</a>
                </p>
              </li>
            ))}
          </ol>
        </section>

        <aside className="space-y-10 lg:sticky lg:top-6 lg:self-start" aria-labelledby="process-next-heading">
          <div className="gov-related">
            <h2 id="process-next-heading">Prepare before you start</h2>
            <ul className="list-disc space-y-2 pl-5 text-[15px] text-[#3b3934]">
              <li>Gather the documents for each step with the document checklist.</li>
              <li>Check which incentives apply before you apply for the licence.</li>
              <li>Read the conditions attached to each incentive.</li>
            </ul>
            <ul className="mt-5 text-[15px]">
              <li><Link href="/tools/document-checklist/" className={linkClass}>Document checklist</Link></li>
              <li><Link href="/incentives/" className={linkClass}>Investment incentives</Link></li>
            </ul>
            <Link href="/investments/onboarding/" className="gov-btn mt-6 w-full">Start onboarding</Link>
          </div>
          <div className="gov-inset gov-inset--red text-[15px]">
            <p className="font-bold">Important</p>
            <p className="mt-2 leading-6 text-[#3b3934]">
              This page summarises the process as published by the Uganda Investment Authority. Requirements, fees and timelines can change. Confirm current requirements with UIA, URSB and URA before you commit capital.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
