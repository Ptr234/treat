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
        description: 'Register your business legally with URSB including all required documentation.',
        agency: 'URSB',
        timeline: '6 weeks',
        cost: 'From UGX 100,000',
        href: '/business/registration'
      },
      {
        id: 'tax-services',
        title: 'Tax Registration & Compliance',
        description: 'TIN registration and comprehensive tax compliance support through URA.',
        agency: 'URA',
        timeline: '2-3 days',
        cost: 'From UGX 35,000',
        href: '/agencies'
      },
      {
        id: 'investment-licensing',
        title: 'Investment Licensing',
        description: 'Investment promotion, licensing, and facilitation services through UIA.',
        agency: 'UIA',
        timeline: '7-14 days',
        cost: 'From USD 100',
        href: '/investments'
      },
      {
        id: 'trading-license',
        title: 'Trading License & Local Permits',
        description: 'Trading licenses from local authorities required for all business operations.',
        agency: 'KCCA / Local Councils',
        timeline: '7-14 days',
        cost: 'UGX 50,000 - 500,000',
        href: '/agencies'
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
        description: 'Ongoing compliance support and regulatory monitoring services.',
        agency: 'Various',
        timeline: 'Ongoing',
        cost: 'Consultation based',
        href: '/support'
      },
      {
        id: 'nssf-registration',
        title: 'NSSF Registration & Social Security',
        description: 'Mandatory registration with National Social Security Fund for businesses with employees.',
        agency: 'NSSF',
        timeline: '3-5 days',
        cost: 'Free registration',
        href: '/agencies'
      },
      {
        id: 'environmental-clearance',
        title: 'Environmental Impact Assessment',
        description: 'Environmental clearance certificates for projects affecting the environment.',
        agency: 'NEMA',
        timeline: '90-120 days',
        cost: 'USD 500 - 5,000',
        href: '/agencies'
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
        description: 'Work permits, residence permits, and immigration services for foreign investors.',
        agency: 'DCIC',
        timeline: '14-30 days',
        cost: 'USD 1,000 - 2,000',
        href: '/agencies'
      }
    ]
  }
];

const linkClass =
  'font-semibold text-black underline decoration-yellow-400 decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

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
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
          Government services for your business
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-neutral-600 sm:text-lg">
          Find business registration, licensing and compliance services, with guidance on where to begin and which agencies can help.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/business/registration" className={linkClass}>Start business registration</Link>
          <Link href="/agencies" className={linkClass}>Contact agencies</Link>
        </div>
      </section>

      {/* Service detail blocks */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="services-heading">
        <h2 id="services-heading" className="sr-only">Essential business services</h2>

        <div className="space-y-14">
          {serviceCategories.map((category) => (
            <div key={category.key}>
              <h3 className="mb-8 border-b-2 border-black pb-3 text-xl font-bold sm:text-2xl">
                <span className="mr-3 inline-block h-4 w-4 bg-red-600 align-middle" aria-hidden="true" />
                {category.title}
              </h3>

              <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
                {category.services.map((service) => (
                  <article key={service.id}>
                    <h4 className="text-lg font-bold leading-snug">
                      <Link
                        href={service.href}
                        className="text-black hover:text-red-600 underline decoration-yellow-400 decoration-2 underline-offset-4 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm"
                      >
                        {service.title}
                      </Link>
                    </h4>
                    <p className="mt-3 text-sm leading-7 text-neutral-700">{service.description}</p>
                    <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 border-l-4 border-yellow-400 bg-white py-3 pl-4 pr-3 text-sm">
                      <dt className="font-semibold text-black">Agency</dt>
                      <dd className="text-neutral-700">{service.agency}</dd>
                      <dt className="font-semibold text-black">Timeline</dt>
                      <dd className="text-neutral-700">{service.timeline}</dd>
                      <dt className="font-semibold text-black">Cost</dt>
                      <dd className="text-neutral-700">{service.cost}</dd>
                    </dl>
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
