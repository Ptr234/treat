import PageBand from '@/components/ui/PageBand';
import Link from 'next/link';

// Organized services by logical categories
const serviceCategories = [
  {
    key: 'starting',
    title: 'Starting Your Business',
    services: [
      {
        id: 'business-registration',
        title: 'Business Registration & Company Formation',
        audience: 'Founders forming a company or registering a business entity.',
        description: 'Company formation is the first legal step for most businesses in Uganda. The process covers name reservation, registration of the company and the filing of the required forms. Confirm the requirements for your business type before you apply, as they differ between companies, partnerships and sole proprietors. Once registered, the business can open accounts and apply for tax numbers and licences.',
        agency: 'URSB',
        timeline: 'Confirm with URSB',
        cost: 'UGX 105,000 registration fee (nominal capital up to UGX 5M)',
        href: '/business/registration'
      },
      {
        id: 'tax-services',
        title: 'Tax Registration & Compliance',
        audience: 'Businesses and taxpayers seeking a TIN or tax compliance guidance.',
        description: 'A Tax Identification Number (TIN) is required before most business dealings with government and banks. URA issues TINs to individuals and non-individuals and provides the tax information you need to comply. Support covers registration and the ongoing filing obligations that follow. Consider tax incentives and advisory services before you finalise your business plan.',
        agency: 'URA',
        timeline: 'Confirm current processing time with URA',
        cost: 'Confirm current fees with URA',
        href: '/agencies/ura'
      },
      {
        id: 'investment-licensing',
        title: 'Investment Licensing',
        audience: 'Investors seeking UIA licensing, facilitation or advisory support.',
        description: 'The Uganda Investment Authority promotes investment and facilitates projects from the first enquiry to licensing. It issues investment licences and provides advisory services to domestic and foreign investors. Aftercare and monitoring continue once a project is operating. Contact UIA early to understand which licences your project needs.',
        agency: 'UIA',
        timeline: '24 working hours once the application is complete',
        cost: 'Free of charge',
        href: '/agencies/uia'
      },
      {
        id: 'trading-license',
        title: 'Trading License & Local Permits',
        audience: 'Businesses that need local trading licences or operating permits.',
        description: 'Local trading licences or permits may be required depending on the kind of business and where it operates. Requirements are set locally, so check with the relevant local authority for your site. Operating without the required licence can lead to penalties or closure. Plan for licence costs and renewal dates in your business budget.',
        agency: 'KCCA / Local Councils',
        timeline: 'Varies by local authority and licence type',
        cost: 'Varies by local authority and business classification',
        href: '/agencies/kcca'
      }
    ]
  },
  {
    key: 'operations',
    title: 'Ongoing Operations & Compliance',
    services: [
      {
        id: 'compliance-monitoring',
        title: 'Compliance & Monitoring',
        audience: 'Businesses seeking ongoing regulatory guidance or monitoring support.',
        description: 'Compliance continues after a business is registered and licensed. Regular filings, tax returns and renewals must be kept up to date. Regulatory monitoring helps you spot changes in requirements that affect your business. Use these support services to keep your business in good standing.',
        agency: 'Various',
        timeline: 'Depends on the service and agency',
        cost: 'Confirm with the responsible agency',
        href: '/support'
      },
      {
        id: 'nssf-registration',
        title: 'NSSF Registration & Social Security',
        audience: 'Employers who need guidance on employee social security registration.',
        description: 'Businesses with employees must register with the National Social Security Fund. Employers register their staff and remit contributions on their behalf. Registration is mandatory, so it should be part of payroll planning from the start. Contributions build retirement savings for workers.',
        agency: 'NSSF',
        timeline: 'Confirm current processing time with NSSF',
        cost: 'Confirm current fees with NSSF',
        href: '/agencies/nssf'
      },
      {
        id: 'environmental-clearance',
        title: 'Environmental Impact Assessment',
        audience: 'Project developers whose plans may require environmental assessment.',
        description: 'Projects that affect land, water, air or wildlife may need an environmental clearance certificate. NEMA reviews the Environmental and Social Impact Assessment (ESIA) before approving most large projects. Early environmental planning avoids redesign and delays in construction. Keep records of your monitoring and compliance audits.',
        agency: 'NEMA',
        timeline: 'Project-specific; confirm with NEMA',
        cost: 'Project-specific; confirm with NEMA',
        href: '/agencies/nema'
      }
    ]
  },
  {
    key: 'foreign',
    title: 'Services for Foreign Nationals',
    services: [
      {
        id: 'work-permits',
        title: 'Work Permits & Immigration Services',
        audience: 'Employing organisations seeking work or residence permits for foreign staff.',
        description: 'Foreign investors and staff may need work permits, residence permits or other immigration approvals. The Directorate of Citizenship and Immigration Control handles these applications. Plan permit timelines early, since they affect when key staff can start work. Keep the documents supporting each application ready before you submit.',
        agency: 'DCIC',
        timeline: 'Set by the Directorate; confirm when you apply',
        cost: 'Confirm with the Directorate',
        href: '/agencies/dcic'
      }
    ]
  }
];

const linkClass =
  'font-semibold text-black underline decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

export default function ServicesPage() {
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
            <li className="font-semibold text-black" aria-current="page">Services</li>
          </ol>
        </nav>
      </div>

      {/* Title and intro */}
      <PageBand>
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
          Government services for your business
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-neutral-600 sm:text-lg">
          Starting or expanding a business can involve several public agencies, each responsible for a different approval or service. Use this directory to identify the service that matches your next step, check which agency is responsible, and follow the link to its guidance or application process. Service pages include the available audience, fee and timing information where published. Requirements can change, so confirm the latest checklist and charges with the responsible agency before submitting documents or payment.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/business/registration" className={linkClass}>Start business registration</Link>
          <Link href="/agencies" className={linkClass}>Contact agencies</Link>
        </div>
      </section>
      </PageBand>

      {/* Service detail blocks */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="services-heading">
        <h2 id="services-heading" className="sr-only">Essential business services</h2>

        <div className="space-y-14">
          {serviceCategories.map((category) => (
            <div key={category.key}>
              <h3 className="mb-8 border-b border-neutral-200 pb-3 text-xl font-bold sm:text-2xl">
                <span className="mr-3 inline-block h-4 w-4 bg-red-600 align-middle" aria-hidden="true" />
                {category.title}
              </h3>

              <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
                {category.services.map((service) => (
                    <article key={service.id} className="border border-neutral-200 bg-white p-5 sm:p-6">
                    <p className="text-xs font-bold uppercase tracking-[.14em] text-red-700">{category.title}</p>
                    <h4 className="mt-2 text-lg font-bold leading-snug sm:text-xl">
                      <Link
                        href={service.href}
                        className="text-black hover:text-red-600 underline decoration-2 underline-offset-4 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm"
                      >
                        {service.title}
                      </Link>
                    </h4>
                    <p className="mt-3 text-sm leading-6 text-neutral-700"><span className="font-semibold text-neutral-900">Who it is for:</span> {service.audience}</p>
                    <p className="mt-3 text-sm leading-7 text-neutral-700">{service.description}</p>
                    <dl className="mt-5 grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-3 border-y border-neutral-200 py-4 text-sm">
                      <dt className="font-semibold text-neutral-900">Responsible</dt>
                      <dd className="text-neutral-700">{service.agency}</dd>
                      <dt className="font-semibold text-neutral-900">Processing time</dt>
                      <dd className="text-neutral-700">{service.timeline}</dd>
                      <dt className="font-semibold text-neutral-900">Fees</dt>
                      <dd className="text-neutral-700">{service.cost}</dd>
                    </dl>
                    <p className="mt-4 text-xs leading-5 text-neutral-600">Before applying, confirm the current document checklist, fees and processing time with the responsible agency.</p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                      <Link href="/tools/document-checklist" className={linkClass}>Document checklist</Link>
                      <Link href={service.href} className={linkClass}>Next step</Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Assistance */}
      <section className="border-t border-neutral-200 bg-white" aria-labelledby="assistance-heading">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <h2 id="assistance-heading" className="text-2xl font-bold sm:text-3xl">Need assistance?</h2>
          <p className="mt-3 max-w-3xl text-neutral-700">
            Our team is here to help guide you through every step of the process.
          </p>

          <div className="mt-10 grid gap-10 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-bold">Phone support</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Get assistance from the OneStop Centre team.</p>
              <a href="tel:+256414301000" className={`${linkClass} mt-3 inline-block`}>+256 414 301 000</a>
            </div>
            <div>
              <h3 className="text-lg font-bold">Documentation</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Find available forms, downloads and guidance.</p>
              <Link href="/downloads" className={`${linkClass} mt-3 inline-block`}>View downloads</Link>
            </div>
            <div>
              <h3 className="text-lg font-bold">Visit offices</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Find and visit our partner agency offices.</p>
              <Link href="/agencies" className={`${linkClass} mt-3 inline-block`}>Find locations</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
