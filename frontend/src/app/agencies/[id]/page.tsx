import PageHeader from '@/components/ui/PageHeader';
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

const linkClass = 'gov-link';

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
    { name: 'Government agencies', path: '/agencies/' },
    { name: agency.acronym, path: `/agencies/${agency.id}/` },
  ]);

  const relatedAgencies = ugandaAgencies
    .filter((other) => other.category === agency.category && other.id !== agency.id)
    .slice(0, 3);

  return (
    <div className="bg-white">
      <JsonLd data={[agencyLd, agencyCrumbs]} />
      <PageHeader
        crumbs={[{ label: 'Government agencies', href: '/agencies/' }, { label: agency.acronym }]}
        caption={<>{agency.acronym} · <span className="capitalize">{agency.category.replace(/_/g, ' ')}</span></>}
        title={agency.name}
        lead={agency.description}
        actions={
          <>
            <a href="#request" className="gov-btn gov-btn--start">Request a service</a>
            <a href={`mailto:${agency.contact.email}`} className={linkClass}>Email the agency</a>
          </>
        }
        aside={
          agency.logo ? (
            <div className="hidden h-48 items-center justify-center border border-[#dcd8cf] border-t-4 border-t-black bg-white p-6 lg:flex">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={agency.logo} alt={`${agency.name} logo`} className="max-h-full max-w-full object-contain" />
            </div>
          ) : undefined
        }
      />

      <div className="gov-container grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-16">
        <div>
          <nav aria-labelledby="contents-heading" className="mb-12">
            <h2 id="contents-heading" className="text-base font-bold">Contents</h2>
            <ul className="mt-2 space-y-1.5 text-[15px]">
              {SECTION_LINKS.map((item) => (
                <li key={item.href} className="flex gap-2">
                  <span aria-hidden="true" className="text-[#5c5850]">—</span>
                  <a href={item.href} className={`${linkClass} font-normal`}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <section id="services" aria-labelledby="services-heading" className="scroll-mt-6">
            <h2 id="services-heading" className="gov-title-l border-b-2 border-black pb-3">Services offered</h2>
            <p className="gov-inset mt-5 text-[15px]">
              Requirements, fees and processing times depend on the service. Contact the agency to confirm current details before applying.
            </p>
            <ol className="mt-4">
              {agency.services.map((service, index) => (
                <li key={index} className="flex gap-4 border-b border-[#dcd8cf] py-4">
                  <span className="font-data w-7 shrink-0 font-bold text-[#9a0d1c]">{String(index + 1).padStart(2, '0')}</span>
                  <p className="font-bold leading-snug">{service}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Related agencies */}
          {relatedAgencies.length > 0 && (
            <section aria-labelledby="related-heading" className="mt-16">
              <h2 id="related-heading" className="gov-title-l border-b-2 border-black pb-3">Related agencies</h2>
              <ul className="mt-6 grid gap-6 md:grid-cols-3">
                {relatedAgencies.map((related) => (
                  <li key={related.id} className="gov-card gov-card--link">
                    <span className="gov-tag w-fit">{related.acronym}</span>
                    <h3 className="gov-card__title mt-3 text-base">
                      <Link href={`/agencies/${related.id}/`}>{related.name}</Link>
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#3b3934]">{related.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Request a service */}
          <section id="request" aria-labelledby="request-heading" className="mt-16 scroll-mt-6 bg-[#f5f3ee] p-6 sm:p-8">
            <h2 id="request-heading" className="gov-title-l">Request a service</h2>
            <p className="gov-body mt-3 max-w-2xl">
              Send a request to {agency.name}. Keep the reference number for follow-up; the agency will confirm the next steps and processing time.
            </p>
            <div className="mt-8">
              <ServiceRequestForm agencyName={agency.name} agencyCode={agency.acronym} agencyEmail={agency.contact.email} services={agency.services} />
            </div>
          </section>
        </div>

        {/* Contact */}
        <aside id="contact" aria-labelledby="contact-heading" className="scroll-mt-6 lg:sticky lg:top-6 lg:self-start">
          <div className="border-t-4 border-black bg-[#f5f3ee] p-5">
            <h2 id="contact-heading" className="text-lg font-bold">Contact {agency.acronym}</h2>
            <dl className="mt-4 space-y-4 text-[15px]">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Telephone</dt>
                <dd className="mt-1"><a href={`tel:${agency.contact.phone}`} className={linkClass}>{agency.contact.phone}</a></dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Email</dt>
                <dd className="mt-1"><a href={`mailto:${agency.contact.email}`} className={`${linkClass} break-all`}>{agency.contact.email}</a></dd>
              </div>
              {agency.contact.website && (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Website</dt>
                  <dd className="mt-1"><a href={agency.contact.website} target="_blank" rel="noopener noreferrer" className={`${linkClass} break-all`}>{agency.contact.website.replace(/^https?:\/\//, '')}</a></dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Address</dt>
                <dd className="mt-1 text-[#262522]">{agency.contact.address}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Opening hours</dt>
                <dd className="mt-1 text-[#262522]">{agency.operatingHours}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Appointments</dt>
                <dd className="mt-1 text-[#262522]">{agency.hasAppointmentBooking ? 'Bookable online' : 'Contact to arrange'}</dd>
              </div>
            </dl>
            <p className="gov-hint mt-5 border-t border-[#dcd8cf] pt-4">Confirm details on the agency&apos;s website before visiting.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
