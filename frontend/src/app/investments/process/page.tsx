import Link from 'next/link';

const linkClass =
  'font-semibold text-black underline decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

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
            <li className="font-semibold text-black" aria-current="page">Investment process</li>
          </ol>
        </nav>
      </div>

      {/* Title */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Investment process</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">From company registration to operating licence</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700 sm:text-lg">
          Setting up an investment in Uganda follows five steps. The first three must be completed before you start operating.
          Each step is handled by a different agency, so this page shows who to contact and what to prepare.
        </p>
        <dl className="mt-10 grid grid-cols-1 gap-6 border-y border-neutral-200 py-6 sm:grid-cols-3">
          <div className=" pl-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Steps</dt>
            <dd className="mt-1 text-2xl font-bold">5</dd>
          </div>
          <div className=" pl-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Investment licence fee</dt>
            <dd className="mt-1 text-2xl font-bold">Free of charge</dd>
          </div>
          <div className="border-l-4 border-red-600 pl-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Online platform</dt>
            <dd className="mt-1 text-2xl font-bold">eBiz</dd>
          </div>
        </dl>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="border-b border-neutral-200 pb-3 text-xl font-bold sm:text-2xl">The steps</h2>
        <ol className="mt-2 divide-y divide-neutral-200">
          {STEPS.map((step) => (
            <li key={step.title} className="grid gap-6 py-8 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <h3 className="text-lg font-bold leading-snug">{step.title}</h3>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-red-600">{step.agency}</p>
              </div>
              <div>
                <p className="text-sm leading-7 text-neutral-700">{step.summary}</p>
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-neutral-800">
                  {step.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-neutral-600">
                  Source:{' '}
                  <a href={step.source.href} target="_blank" rel="noopener noreferrer" className={linkClass}>{step.source.label}</a>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Next steps */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8" aria-labelledby="process-next-heading">
        <div className="grid gap-10 pt-10 lg:grid-cols-2">
          <div>
            <h2 id="process-next-heading" className="text-xl font-bold sm:text-2xl">Prepare before you start</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-700">
              <li>Gather the documents for each step with the document checklist.</li>
              <li>Check which incentives apply to your project before you apply for the licence.</li>
              <li>Read the investment incentives page, so you know the conditions attached to each one.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link href="/tools/document-checklist/" className={linkClass}>Document checklist</Link>
              <Link href="/incentives/" className={linkClass}>Investment incentives</Link>
              <Link href="/investments/onboarding/" className={linkClass}>Start onboarding</Link>
            </div>
          </div>
          <div className="border-l-4 border-red-600 pl-6">
            <h2 className="text-lg font-bold">Important</h2>
            <p className="mt-3 text-sm leading-7 text-neutral-700">
              This page summarises the process as published by the Uganda Investment Authority. Requirements, fees and timelines can change, and approvals depend on a complete and accurate application. Confirm current requirements with UIA, URSB and URA before you commit capital.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
