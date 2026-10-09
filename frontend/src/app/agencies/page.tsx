'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { ugandaAgencies, type AgencyContact } from '@/data/agencies';
import PageHeader from '@/components/ui/PageHeader';
import FactRow from '@/components/ui/FactRow';

/* ────────────────────────────────────────────────────────
   Category headings. One accent system for the whole page:
   red marks a section, yellow marks links and service rules.
   ──────────────────────────────────────────────────────── */

const CATEGORY_HEADINGS: Record<string, { heading: string; subtitle: string }> = {
  investment: {
    heading: 'Investment & Finance',
    subtitle: 'The agencies in this group support investment from the first enquiry through to licensing and capital raising. They regulate capital markets and help investors structure finance for projects. Licensing and facilitation are the core of their work. Start here if your project needs investment approvals or a route to finance.',
  },
  registration: {
    heading: 'Business Registration',
    subtitle: 'These agencies register companies and business names, which is the legal start for most businesses. They process the forms needed to form a company and reserve names before registration. Licensing for particular activities is often handled through the same offices. Complete registration before opening bank accounts or signing contracts.',
  },
  taxation: {
    heading: 'Taxation & Revenue',
    subtitle: 'The tax authority registers taxpayers and issues Tax Identification Numbers. It advises on tax obligations, incentives and the filing requirements that apply to your business. Compliance is continuous, with returns and payments due on set dates. Speak to the authority early to understand your tax position before you invest.',
  },
  immigration: {
    heading: 'Immigration & Citizenship',
    subtitle: 'These services handle immigration and citizenship matters for people entering or living in Uganda. Foreign investors and staff use them to apply for work permits, visas and residence status. Applications should be planned early, as processing time affects when people can start work. Keep the documents supporting each application ready before you submit.',
  },
  environment: {
    heading: 'Environment & Conservation',
    subtitle: 'These agencies review the environmental impact of projects before they proceed. Large projects typically need an Environmental and Social Impact Assessment (ESIA) certificate. Compliance audits and inspections check that projects meet their approved conditions. Build environmental planning into your project schedule from the beginning.',
  },
  standards: {
    heading: 'Standards & Quality',
    subtitle: 'This agency sets national product standards and assesses whether goods and services meet them. Certification shows that a product conforms before it is sold on the domestic or export market. Quality assurance helps manufacturers keep output consistent. Engage early in product design so that standards are built in rather than added later.',
  },
  infrastructure: {
    heading: 'Infrastructure & Utilities',
    subtitle: 'These utilities provide the electricity and water that most businesses depend on. Industrial and commercial customers must arrange connections and supply before they operate. Faults, planned interruptions and tariffs are managed through the utility. Factor connection timelines and costs into your project plan early.',
  },
  lands: {
    heading: 'Land & Housing',
    subtitle: 'These offices manage land titles, surveys and the registration of property. Clear title is essential before you invest in land or buildings. Planning and land-use rules determine what can be built on a site. Verify ownership and planning status before you commit funds.',
  },
  social_security: {
    heading: 'Social Security & Labour',
    subtitle: 'These bodies cover the employer side of labour and social security obligations. Employers register staff and remit contributions on their behalf. Compliance checks help avoid penalties and protect workers\' entitlements. Include these obligations in payroll and staffing budgets from the start.',
  },
  finance: {
    heading: 'Capital Markets',
    subtitle: 'This authority regulates the securities market and oversees the firms that operate in it. It protects investors who buy and sell shares and other securities. Companies that plan a listing or share offer must meet its requirements. Consult it early if you intend to raise capital from the public.',
  },
  tourism: {
    heading: 'Tourism',
    subtitle: 'This board promotes Uganda as a tourism destination and supports the wider sector. Tourism operators and hospitality businesses typically require operator licences. Promotion and marketing help create demand for new lodges and attractions. Speak to the board when you are planning a tourism investment.',
  },
  employers: {
    heading: 'Employers & Workforce',
    subtitle: 'These bodies advise on labour relations and the skills employers need. They support the training and workforce development that businesses rely on. Compliance with labour rules protects both employers and workers. Build these considerations into your recruitment and training plans.',
  },
  conservation: {
    heading: 'Conservation',
    subtitle: 'These initiatives protect Uganda\'s wildlife and the wild places that support tourism and biodiversity. They work with government, communities and private partners on conservation projects. Investors in eco-tourism and conservation-linked projects can use these partnerships. Early engagement helps projects respect protected areas and conservation rules.',
  },
};

function getHeading(category: string) {
  return CATEGORY_HEADINGS[category] ?? { heading: category.replace(/_/g, ' '), subtitle: '' };
}

const FEATURED_IDS = ['uia', 'ursb', 'ura'];
const CATEGORY_IMAGES: Partial<Record<string, string>> = {
  investment: '/images/uganda-kampala-city-view.webp',
  taxation: '/images/uganda-kampala-city-view.webp',
  environment: '/images/lake-bunyonyi-uganda.jpg',
  standards: '/images/uganda-tea-plantation.webp',
  infrastructure: '/images/uganda-kampala-city-view.webp',
  lands: '/images/lake-bunyonyi-uganda.jpg',
  tourism: '/images/lake-bunyonyi-uganda.jpg',
  conservation: '/images/lake-bunyonyi-uganda.jpg',
};

const linkClass = 'gov-link';

/* ────────────────────────────────────────────────────────
   Agency record — used everywhere on the page
   ──────────────────────────────────────────────────────── */

function AgencyDetail({ agency }: { agency: AgencyContact }) {
  const openAssistant = () => {
    document.dispatchEvent(new CustomEvent('openChatWidget', {
      detail: { message: `I need help with ${agency.name} (${agency.acronym}) services` }
    }));
  };

  return (
    <article className="gov-card h-full">
      <div className="flex items-start gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden border border-[#dcd8cf] bg-white p-2">
          {agency.logo ? (
            <Image src={agency.logo} alt="" width={44} height={44} className="object-contain" />
          ) : (
            <span className="font-display text-2xl font-semibold text-black">{agency.acronym[0]}</span>
          )}
        </div>
        <div className="min-w-0">
          <span className="gov-tag">{agency.acronym}</span>
          <h3 className="gov-card__title mt-2">
            <Link href={`/agencies/${agency.id}`}>{agency.name}</Link>
          </h3>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-[15px] leading-6 text-[#3b3934]">{agency.description}</p>

      {agency.services.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-bold">Services include</h4>
          <ul className="mt-2 space-y-1.5 text-[15px] text-[#3b3934]">
            {agency.services.slice(0, 3).map((service) => (
              <li key={service} className="flex items-start gap-2.5">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-[#ffd700] ring-1 ring-black" />
                <span>{service}</span>
              </li>
            ))}
          </ul>
          {agency.services.length > 3 && <p className="mt-2 text-sm font-semibold text-[#5c5850]">and {agency.services.length - 3} more</p>}
        </div>
      )}

      <dl className="mt-5 grid gap-x-6 gap-y-2 border-t border-[#dcd8cf] pt-4 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <dt><Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#ce1126]" aria-label="Phone" /></dt>
          <dd><a href={`tel:${agency.contact.phone.replace(/[^+\d]/g, '')}`} className="text-black underline underline-offset-4 hover:text-[#9a0d1c]">{agency.contact.phone}</a></dd>
        </div>
        <div className="flex min-w-0 items-start gap-2">
          <dt><Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#ce1126]" aria-label="Email" /></dt>
          <dd className="min-w-0"><a href={`mailto:${agency.contact.email}`} className="block truncate text-black underline underline-offset-4 hover:text-[#9a0d1c]">{agency.contact.email}</a></dd>
        </div>
        <div className="flex items-start gap-2">
          <dt><Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#ce1126]" aria-label="Opening hours" /></dt>
          <dd className="text-[#3b3934]">{agency.operatingHours}</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#ce1126]" aria-label="Address" /></dt>
          <dd className="text-[#3b3934]">{agency.contact.address}</dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-5 text-[15px]">
        <Link href={`/agencies/${agency.id}`} className="gov-arrow-link">View agency</Link>
        {agency.contact.website && <a href={agency.contact.website} target="_blank" rel="noreferrer" className={linkClass}>Official website</a>}
        <button type="button" onClick={openAssistant} className={`${linkClass} font-normal`}>Ask the assistant</button>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────────────
   Section wrapper — service-area heading, then records
   ──────────────────────────────────────────────────────── */

function Section({ id, heading, subtitle, count, agencies, image }: { id: string; heading: string; subtitle?: string; count?: number; agencies: AgencyContact[]; image?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mb-16 scroll-mt-6">
      <div className="mb-8 grid gap-5 border-b-2 border-black pb-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <h2 id={`${id}-heading`} className="gov-title-l">
            {heading}
            {count !== undefined && <span className="ml-3 align-middle font-sans text-base font-semibold text-[#5c5850]">{count} {count === 1 ? 'agency' : 'agencies'}</span>}
          </h2>
          {subtitle && <p className="gov-body mt-2 max-w-3xl text-[15px]">{subtitle}</p>}
        </div>
        {image && (
          <div className="relative hidden h-20 w-32 overflow-hidden border-l-[6px] border-[#ffd700] sm:block" data-decorative="true">
            <Image src={image} alt="" fill sizes="128px" className="object-cover" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {agencies.map((a) => (
          <AgencyDetail key={a.id} agency={a} />
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   Main page
   ──────────────────────────────────────────────────────── */

export default function GovernmentAgencies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const hasFilters = Boolean(searchQuery.trim() || categoryFilter || locationFilter);

  // Group agencies by category, preserving order
  const grouped = useMemo(() => {
    const map = new Map<string, AgencyContact[]>();
    for (const a of ugandaAgencies) {
      if (!map.has(a.category)) map.set(a.category, []);
      map.get(a.category)!.push(a);
    }
    return map;
  }, []);

  // Featured agencies shown first
  const featured = useMemo(() => {
    return ugandaAgencies.filter(a => FEATURED_IDS.includes(a.id));
  }, []);

  // Search filter; null means no search is active
  const filteredAgencies = useMemo(() => {
    if (!hasFilters) return null;
    const q = searchQuery.toLowerCase();
    return ugandaAgencies.filter(a =>
      (!q || a.name.toLowerCase().includes(q) ||
      a.acronym.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.services.some(s => s.toLowerCase().includes(q))) &&
      (!categoryFilter || a.category === categoryFilter) &&
      (!locationFilter || (locationFilter === 'kampala'
        ? a.contact.address.toLowerCase().includes('kampala')
        : locationFilter === 'outside'
          ? Boolean(a.contact.address) && !a.contact.address.toLowerCase().includes('kampala')
          : !a.contact.address))
    );
  }, [searchQuery, categoryFilter, locationFilter, hasFilters]);

  const clearFilters = () => { setSearchQuery(''); setCategoryFilter(''); setLocationFilter(''); };

  const categoryCount = new Set(ugandaAgencies.map(a => a.category)).size;
  const withAppointments = ugandaAgencies.filter(a => a.hasAppointmentBooking).length;
  const withWebsite = ugandaAgencies.filter(a => Boolean(a.contact.website)).length;

  const sections = Array.from(grouped.entries())
    .map(([category, agencies]) => ({ category, agencies: agencies.filter(a => !FEATURED_IDS.includes(a.id)) }))
    .filter((s) => s.agencies.length > 0);

  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Government agencies' }]}
        caption="Services"
        title="Find the right government agency"
        lead="Search services, compare agencies and get the contact details you need for your next step in Uganda."
      >
        <FactRow
          facts={[
            { label: 'Agencies', value: ugandaAgencies.length },
            { label: 'Service areas', value: categoryCount },
            { label: 'Book appointments online', value: withAppointments },
            { label: 'Official websites listed', value: withWebsite },
          ]}
        />
      </PageHeader>

      {/* Search and filters */}
      <div className="border-b border-[#dcd8cf] bg-white">
        <div className="gov-container grid gap-4 py-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <label htmlFor="agency-search" className="gov-label">Search agencies</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5c5850]" aria-hidden="true" />
              <input
                id="agency-search"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Agency name, acronym or service"
                className="gov-input !pl-10 !pr-10"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c5850] hover:text-black">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="agency-area" className="gov-label">Service area</label>
            <select id="agency-area" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="gov-input">
              <option value="">All service areas</option>
              {Array.from(new Set(ugandaAgencies.map((agency) => agency.category))).map((category) => (
                <option key={category} value={category}>{getHeading(category).heading}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="agency-location" className="gov-label">Location</label>
            <select id="agency-location" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} className="gov-input">
              <option value="">All locations</option>
              <option value="kampala">Kampala</option>
              <option value="outside">Outside Kampala</option>
            </select>
          </div>
        </div>
      </div>

      <div id="agency-directory-results" className="gov-container scroll-mt-6 py-12">
        {filteredAgencies !== null ? (
          <section aria-labelledby="agency-results-heading">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b-2 border-black pb-3">
              <h2 id="agency-results-heading" className="gov-title-l" aria-live="polite">
                {filteredAgencies.length} {filteredAgencies.length === 1 ? 'agency' : 'agencies'} found
              </h2>
              <button type="button" onClick={clearFilters} className={linkClass}>Clear filters</button>
            </div>
            {filteredAgencies.length === 0 ? (
              <div className="gov-inset">
                <h3 className="text-lg font-bold">No agencies match your search</h3>
                <p className="mt-1 text-[15px] text-[#3b3934]">Try a different keyword, for example &ldquo;tax&rdquo;, &ldquo;registration&rdquo; or &ldquo;investment&rdquo;.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {filteredAgencies.map(a => <AgencyDetail key={a.id} agency={a} />)}
              </div>
            )}
          </section>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)]">
            <nav aria-labelledby="areas-heading" className="lg:sticky lg:top-6 lg:self-start">
              <div className="gov-related !border-black">
                <h2 id="areas-heading">Service areas</h2>
                <ul className="text-[15px]">
                  <li><a href="#key-agencies" className={`${linkClass} font-normal`}>Key agencies</a></li>
                  {sections.map(({ category }) => (
                    <li key={category}><a href={`#area-${category}`} className={`${linkClass} font-normal`}>{getHeading(category).heading}</a></li>
                  ))}
                </ul>
              </div>
            </nav>
            <div>
              <Section id="key-agencies" heading="Key agencies" subtitle="Most investors start with these three agencies." agencies={featured} />
              {sections.map(({ category, agencies }) => {
                const { heading, subtitle } = getHeading(category);
                return (
                  <Section
                    key={category}
                    id={`area-${category}`}
                    heading={heading}
                    subtitle={subtitle}
                    count={agencies.length}
                    agencies={agencies}
                    image={CATEGORY_IMAGES[category]}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
