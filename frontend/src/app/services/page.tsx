import PageHeader from '@/components/ui/PageHeader';
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

export default function ServicesPage() {
  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Services' }]}
        caption="Services"
        title="Government services for your business"
        lead={
          <p>
            Find the approval or service that matches your next step, see which agency is responsible, and follow the link to its guidance.
            Requirements can change, so confirm the latest checklist and charges with the agency before you pay.
          </p>
        }
        actions={
          <>
            <Link href="/business/registration" className="gov-btn gov-btn--start">Start business registration</Link>
            <Link href="/agencies" className="gov-link">Contact an agency</Link>
          </>
        }
      />

      <div className="gov-container grid gap-12 py-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:py-16">
        {/* Contents */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav aria-labelledby="contents-heading" className="gov-related !border-black">
            <h2 id="contents-heading">Contents</h2>
            <ul>
              {serviceCategories.map((category) => (
                <li key={category.key} className="flex gap-2 text-[15px]">
                  <span aria-hidden="true" className="text-[#5c5850]">—</span>
                  <a href={`#${category.key}`} className="gov-link font-normal">{category.title}</a>
                </li>
              ))}
              <li className="flex gap-2 text-[15px]">
                <span aria-hidden="true" className="text-[#5c5850]">—</span>
                <a href="#assistance-heading" className="gov-link font-normal">Get help</a>
              </li>
            </ul>
          </nav>
        </aside>

        <div>
          <h2 className="sr-only">Essential business services</h2>
          <div className="space-y-16">
            {serviceCategories.map((category) => (
              <section key={category.key} id={category.key} aria-labelledby={`${category.key}-heading`} className="scroll-mt-6">
                <h2 id={`${category.key}-heading`} className="gov-title-l border-b-2 border-black pb-3">{category.title}</h2>
                <div className="mt-8 grid gap-6 xl:grid-cols-2">
                  {category.services.map((service) => (
                    <article key={service.id} className="gov-card">
                      <p><span className="gov-tag">{service.agency}</span></p>
                      <h3 className="gov-card__title mt-4">
                        <Link href={service.href}>{service.title}</Link>
                      </h3>
                      <p className="mt-2 text-[15px] text-[#3b3934]"><strong className="text-black">Who it is for:</strong> {service.audience}</p>
                      <p className="mt-3 text-[15px] leading-6 text-[#3b3934]">{service.description}</p>
                      <dl className="gov-summary mt-5 text-[15px]">
                        <div><dt>Processing time</dt><dd>{service.timeline}</dd></div>
                        <div><dt>Fees</dt><dd>{service.cost}</dd></div>
                      </dl>
                      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
                        <Link href={service.href} className="gov-arrow-link">Next step</Link>
                        <Link href="/tools/document-checklist" className="gov-link">Document checklist</Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="gov-inset mt-12 text-[15px]">
            Before applying, confirm the current document checklist, fees and processing time with the responsible agency.
          </p>

          {/* Assistance */}
          <section className="mt-16 border-t-4 border-[#ce1126] pt-8" aria-labelledby="assistance-heading">
            <h2 id="assistance-heading" className="gov-title-l scroll-mt-6">Need assistance?</h2>
            <p className="gov-body mt-3">The OneStop Centre team can guide you through each step.</p>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              <div>
                <h3 className="text-lg font-bold">Phone</h3>
                <p className="mt-1 text-[15px] text-[#3b3934]">Speak to the OneStop Centre team.</p>
                <a href="tel:+256414301000" className="gov-link mt-2 inline-block">+256 414 301 000</a>
              </div>
              <div>
                <h3 className="text-lg font-bold">Forms and guidance</h3>
                <p className="mt-1 text-[15px] text-[#3b3934]">Download application forms and guides.</p>
                <Link href="/downloads" className="gov-link mt-2 inline-block">View downloads</Link>
              </div>
              <div>
                <h3 className="text-lg font-bold">Visit an office</h3>
                <p className="mt-1 text-[15px] text-[#3b3934]">Addresses and hours for partner agencies.</p>
                <Link href="/agencies" className="gov-link mt-2 inline-block">Find locations</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
