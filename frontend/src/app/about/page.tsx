import Link from 'next/link';
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const linkClass =
  'font-semibold text-black underline decoration-yellow-400 decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

const OFFERINGS = [
  {
    icon: BuildingOfficeIcon,
    title: 'Business registration',
    description: 'Simplified digital business registration process with comprehensive support and guidance.',
    href: '/business/registration',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Investment support',
    description: 'Access to investment opportunities and professional facilitation services.',
    href: '/investments',
  },
  {
    icon: UserGroupIcon,
    title: 'Government services',
    description: 'Direct access to various government agencies and their specialized services.',
    href: '/agencies',
  },
  {
    icon: WrenchScrewdriverIcon,
    title: 'Digital tools',
    description: 'Professional calculators, forms, and tools to optimize business operations.',
    href: '/tools',
  },
];

// Figures as published. Sourced from the Uganda Investment Authority, October 2025.
const IMPACT = [
  { value: '1,425+', label: 'Projects facilitated' },
  { value: '1.0M+', label: 'Jobs created' },
  { value: '$2.5B+', label: 'FDI facilitated' },
  { value: '98%', label: 'Success rate' },
];

export default function AboutPage() {
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
            <li className="font-semibold text-black" aria-current="page">About</li>
          </ol>
        </nav>
      </div>

      {/* Title */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">About</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">OneStop Centre Uganda</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700 sm:text-lg">
          Simplifying government services and investment processes for a prosperous Uganda.
        </p>
      </section>

      {/* Mission and vision */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="mission-heading">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          <div className="border-t-2 border-black pt-6">
            <h2 id="mission-heading" className="text-2xl font-bold sm:text-3xl">Our mission</h2>
            <p className="mt-5 leading-7 text-neutral-700">
              OneStop Centre Uganda serves as the digital gateway to streamlined government services,
              business registration, and investment opportunities. We are committed to making it easier
              for entrepreneurs, investors, and businesses to navigate Uganda&apos;s regulatory landscape
              with precision and efficiency.
            </p>
          </div>
          <div className="border-t-2 border-black pt-6">
            <h2 className="text-2xl font-bold sm:text-3xl">Our vision</h2>
            <p className="mt-5 leading-7 text-neutral-700">
              To be the leading digital platform that empowers economic growth in Uganda by
              providing seamless access to government services and investment opportunities.
              We envision a future where businesses thrive through simplified processes and
              strategic government partnerships.
            </p>
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-16" aria-labelledby="offer-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">What we offer</p>
            <h2 id="offer-heading" className="mt-2 text-2xl font-bold sm:text-3xl">Services for your business journey in Uganda</h2>
          </div>
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
            {OFFERINGS.map((service) => (
              <li key={service.title} className="grid gap-4 py-6 sm:grid-cols-[3rem_1fr_auto] sm:items-start sm:gap-6">
                <service.icon className="h-7 w-7 text-red-600" aria-hidden="true" />
                <div>
                  <h3 className="text-lg font-bold">{service.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">{service.description}</p>
                </div>
                <Link href={service.href} className={`${linkClass} text-sm`}>
                  Explore
                  <span className="sr-only"> {service.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Impact */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="impact-heading">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Our impact</p>
          <h2 id="impact-heading" className="mt-2 text-2xl font-bold sm:text-3xl">Measurable results for Uganda’s economic development</h2>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-10 border-y border-neutral-200 py-10 lg:grid-cols-4">
          {IMPACT.map((stat) => (
            <div key={stat.label} className="border-l-4 border-yellow-400 pl-4">
              <dt className="text-sm font-medium text-neutral-600">{stat.label}</dt>
              <dd className="mt-2 text-3xl font-bold text-black sm:text-4xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-neutral-600">Data as of October 2025. Source: Uganda Investment Authority.</p>
      </section>
    </div>
  );
}
