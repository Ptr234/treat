import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ugandaAgencies, getAgencyById } from '@/data/agencies';
import ServiceRequestForm from './ServiceRequestForm';
import { SITE_URL, absoluteUrl, breadcrumbLd, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

interface AgencyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return ugandaAgencies.map((agency) => ({
    id: agency.id,
  }));
}

const linkClass =
  'font-semibold text-black underline decoration-yellow-400 decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

const SECTION_LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#contact', label: 'Contact' },
  { href: '#request', label: 'Request a service' },
];

export async function generateMetadata({ params }: AgencyPageProps): Promise<Metadata> {
  const { id } = await params;
  const agency = getAgencyById(id);
  if (!agency) {
    return buildMetadata({ title: 'Agency not found', path: `/agencies/${id}/`, noIndex: true });
  }
  return buildMetadata({
    title: `${agency.name} (${agency.acronym})`,
    description: agency.description,
    path: `/agencies/${agency.id}/`,
  });
}

export default async function AgencyDetailPage({ params }: AgencyPageProps) {
  const { id } = await params;
  const agency = getAgencyById(id);

  if (!agency) {
    notFound();
  }

  const agencyLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: agency.name,
    alternateName: agency.acronym,
    description: agency.description,
    url: agency.contact.website ?? absoluteUrl(`/agencies/${agency.id}/`),
    email: agency.contact.email,
    telephone: agency.contact.phone,
    address: { '@type': 'PostalAddress', streetAddress: agency.contact.address, addressCountry: 'UG' },
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
  };
  const agencyCrumbs = breadcrumbLd([
    { name: 'Home', path: '/' },
    { name: 'Agency hub', path: '/agencies/' },
    { name: agency.acronym, path: `/agencies/${agency.id}/` },
  ]);

  const relatedAgencies = ugandaAgencies
    .filter((other) => other.category === agency.category && other.id !== agency.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white text-black">
      <JsonLd data={[agencyLd, agencyCrumbs]} />
      {/* Breadcrumb band */}
      <div className="border-b border-neutral-200 bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-red-600 hover:underline underline-offset-4">Home</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li>
              <Link href="/agencies/" className="text-red-600 hover:underline underline-offset-4">Agency hub</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li className="font-semibold text-black" aria-current="page">{agency.acronym}</li>
          </ol>
        </nav>
      </div>

      {/* Header */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1fr_auto] lg:items-start lg:px-8">
        <div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold uppercase tracking-wider">
            <span className="text-red-600">{agency.acronym}</span>
            <span className="capitalize text-neutral-600">{agency.category.replace(/_/g, ' ')}</span>
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{agency.name}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700 sm:text-lg">{agency.description}</p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <a href="#request" className="inline-flex items-center justify-center rounded-md bg-black px-5 py-2.5 font-bold text-yellow-400 hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2">
              Request a service
            </a>
            <a href={`mailto:${agency.contact.email}`} className={`${linkClass} self-center`}>Email the agency</a>
          </div>
        </div>
        {agency.logo && (
          <div className="flex h-36 w-36 items-center justify-center overflow-hidden border border-neutral-200 bg-white p-4 sm:h-48 sm:w-48 sm:p-6 lg:h-56 lg:w-56">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={agency.logo} alt={`${agency.name} logo`} className="max-h-full max-w-full object-contain" />
          </div>
        )}
      </section>

      {/* Quick facts */}
      <section aria-label="Quick facts" className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 gap-6 border-y border-neutral-200 py-6 md:grid-cols-4">
          <div className="border-l-4 border-yellow-400 pl-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Services</dt>
            <dd className="mt-1 text-2xl font-bold">{agency.services.length}</dd>
          </div>
          <div className="border-l-4 border-yellow-400 pl-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Operating hours</dt>
            <dd className="mt-1 text-sm font-bold leading-6">{agency.operatingHours}</dd>
          </div>
          <div className="border-l-4 border-yellow-400 pl-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Appointments</dt>
            <dd className="mt-1 text-sm font-bold leading-6">{agency.hasAppointmentBooking ? 'Bookable online' : 'Contact to arrange'}</dd>
          </div>
          <div className="border-l-4 border-red-600 pl-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Service area</dt>
            <dd className="mt-1 text-sm font-bold leading-6 capitalize">{agency.category.replace(/_/g, ' ')}</dd>
          </div>
        </dl>
        <nav aria-label="On this page" className="mt-4">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {SECTION_LINKS.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="font-semibold text-neutral-700 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-sm">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        {/* Services */}
        <section id="services" aria-labelledby="services-heading" className="scroll-mt-24">
          <h2 id="services-heading" className="border-b-2 border-black pb-3 text-xl font-bold sm:text-2xl">Services offered</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-700">
            Requirements, fees and processing times depend on the service. Contact the agency to confirm the current details before applying.
          </p>
          <ol className="mt-4 divide-y divide-neutral-200">
            {agency.services.map((service, index) => (
              <li key={index} className="grid gap-2 py-5 sm:grid-cols-[3rem_1fr_auto] sm:items-baseline sm:gap-6">
                <span className="text-sm font-bold text-red-600">{String(index + 1).padStart(2, '0')}</span>
                <p className="font-bold leading-snug">{service}</p>
                <p className="text-sm text-neutral-700 sm:text-right">
                  <span className="font-semibold text-black">Current details:</span> Confirm with agency
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Contact */}
        <section id="contact" aria-labelledby="contact-heading" className="mt-16 scroll-mt-24">
          <h2 id="contact-heading" className="border-b-2 border-black pb-3 text-xl font-bold sm:text-2xl">Contact information</h2>
          <p className="mt-4 text-sm text-neutral-600">Contact information is listed for convenience. Confirm details on the agency&apos;s website before visiting.</p>
          <dl className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <div className="border-l-4 border-yellow-400 pl-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Email</dt>
              <dd className="mt-1"><a href={`mailto:${agency.contact.email}`} className={linkClass}>{agency.contact.email}</a></dd>
            </div>
            <div className="border-l-4 border-yellow-400 pl-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Phone</dt>
              <dd className="mt-1"><a href={`tel:${agency.contact.phone}`} className={linkClass}>{agency.contact.phone}</a></dd>
            </div>
            {agency.contact.website && (
              <div className="border-l-4 border-yellow-400 pl-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Website</dt>
                <dd className="mt-1">
                  <a href={agency.contact.website} target="_blank" rel="noopener noreferrer" className={`${linkClass} break-all`}>{agency.contact.website}</a>
                </dd>
              </div>
            )}
            <div className="border-l-4 border-red-600 pl-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Address</dt>
              <dd className="mt-1 text-neutral-800">{agency.contact.address}</dd>
            </div>
            <div className="border-l-4 border-red-600 pl-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Operating hours</dt>
              <dd className="mt-1 text-neutral-800">{agency.operatingHours}</dd>
            </div>
          </dl>
        </section>

        {/* Related agencies */}
        {relatedAgencies.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-16">
            <h2 id="related-heading" className="border-b-2 border-black pb-3 text-xl font-bold sm:text-2xl">Related agencies</h2>
            <ul className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
              {relatedAgencies.map((related) => (
                <li key={related.id} className="border-t-2 border-yellow-400 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600">{related.acronym}</p>
                  <h3 className="mt-1 font-bold leading-snug">
                    <Link href={`/agencies/${related.id}/`} className={linkClass}>{related.name}</Link>
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">{related.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Request a service */}
        <section id="request" aria-labelledby="request-heading" className="mt-16 scroll-mt-24 border-t-4 border-yellow-400 pt-10">
          <h2 id="request-heading" className="text-xl font-bold sm:text-2xl">Request a service</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-700">
            Send a request to {agency.name}. Keep the reference number provided for follow-up; the agency will confirm the next steps and processing time.
          </p>
          <div className="mt-8">
            <ServiceRequestForm agencyName={agency.name} agencyCode={agency.acronym} agencyEmail={agency.contact.email} services={agency.services} />
          </div>
        </section>
      </div>
    </div>
  );
}
