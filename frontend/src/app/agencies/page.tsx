'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ArrowRight, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { ugandaAgencies, type AgencyContact } from '@/data/agencies';

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

const linkClass =
  'font-semibold text-black underline decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

/* ────────────────────────────────────────────────────────
   Agency detail block — used everywhere on the page
   ──────────────────────────────────────────────────────── */

function AgencyDetail({ agency }: { agency: AgencyContact }) {
  const openAssistant = () => {
    document.dispatchEvent(new CustomEvent('openChatWidget', {
      detail: { message: `I need help with ${agency.name} (${agency.acronym}) services` }
    }));
  };

  return (
    <article className="border-t border-neutral-200 pt-6">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-neutral-200 bg-white p-2">
          {agency.logo ? (
            <Image src={agency.logo} alt={agency.acronym} width={36} height={36} className="object-contain" />
          ) : (
            <span className="text-lg font-black text-black">{agency.acronym[0]}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <span className="text-red-600">{agency.acronym}</span>
          </p>
          <h3 className="mt-1 text-lg font-bold leading-snug">
            <Link
              href={`/agencies/${agency.id}`}
              className="text-black underline decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm"
            >
              {agency.name}
            </Link>
          </h3>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-neutral-700">{agency.description}</p>

      {agency.services.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-black">Services</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-neutral-700">
            {agency.services.map((service) => (
              <li key={service} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-yellow-400" />
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2.5 bg-neutral-50 py-3 pl-4 pr-3 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" aria-hidden="true" />
          <span className="min-w-0 truncate text-neutral-700">{agency.contact.email}</span>
        </div>
        <div className="flex items-start gap-2">
          <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" aria-hidden="true" />
          <span className="text-neutral-700">{agency.contact.phone}</span>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" aria-hidden="true" />
          <span className="text-neutral-700">{agency.operatingHours}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" aria-hidden="true" />
          <span className="text-neutral-700">{agency.contact.address}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link href={`/agencies/${agency.id}`} className={`${linkClass} inline-flex items-center gap-1`}>
          View details <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <button type="button" onClick={openAssistant} className={linkClass}>
          Ask assistant
        </button>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────────────
   Section wrapper — heading with a red marker, then detail
   blocks in two columns
   ──────────────────────────────────────────────────────── */

function Section({ heading, subtitle, count, agencies }: { heading: string; subtitle?: string; count?: number; agencies: AgencyContact[] }) {
  return (
    <section className="mb-14">
      <div className="mb-8 border-b border-neutral-200 pb-3">
        <h2 className="text-xl font-bold sm:text-2xl">
          <span className="mr-3 inline-block h-4 w-4 bg-red-600 align-middle" aria-hidden="true" />
          {heading}
        </h2>
        {(subtitle || count !== undefined) && (
          <p className="mt-2 text-sm text-neutral-600">
            {subtitle}
            {subtitle && count !== undefined && ' · '}
            {count !== undefined && `${count} ${count === 1 ? 'agency' : 'agencies'}`}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
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
            <li className="font-semibold text-black" aria-current="page">OSC Hub</li>
          </ol>
        </nav>
      </div>

      {/* Hero: title, intro and overview */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Agency directory</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              OneStop Centre Agency Hub
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-700 sm:text-lg">
              Find public agencies involved in business registration, investment facilitation, licensing and compliance. Search by agency name, acronym or service, or filter the directory by service area to locate the right starting point. Agency profiles bring together available contact details, office information and services in one place. Check directly with the agency before visiting, as office hours, appointment availability and requirements may change.
            </p>
          </div>
          <dl aria-label="Directory overview" className="divide-y divide-neutral-200 border-t border-neutral-200">
            {[
              { label: 'Total agencies', value: ugandaAgencies.length },
              { label: 'Categories', value: categoryCount },
              { label: 'With appointments', value: withAppointments },
              { label: 'Official websites listed', value: withWebsite },
            ].map((stat) => (
              <div key={stat.label} className="flex items-baseline justify-between gap-6 py-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">{stat.label}</dt>
                <dd className="font-display text-3xl font-semibold leading-none text-black">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Toolbar: search and filters on one row */}
        <div className="mt-12 grid gap-6 border-y border-neutral-200 py-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <label htmlFor="agency-search" className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Search
            </label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
              <input
                id="agency-search"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Agency name, acronym or service"
                className="min-h-12 w-full rounded-md border border-neutral-400 bg-white py-3 pl-12 pr-12 text-sm text-black placeholder-neutral-500 focus:border-black focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-red-600"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
            Service area
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="mt-2 block min-h-12 w-full rounded-md border border-neutral-400 bg-white px-3 text-sm font-normal normal-case tracking-normal text-neutral-900 focus:border-black focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              <option value="">All service areas</option>
              {Array.from(new Set(ugandaAgencies.map((agency) => agency.category))).map((category) => (
                <option key={category} value={category}>{getHeading(category).heading}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
            Location
            <select
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              className="mt-2 block min-h-12 w-full rounded-md border border-neutral-400 bg-white px-3 text-sm font-normal normal-case tracking-normal text-neutral-900 focus:border-black focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              <option value="">All locations</option>
              <option value="kampala">Kampala</option>
              <option value="outside">Outside Kampala</option>
            </select>
          </label>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        {filteredAgencies !== null ? (
          /* Search results */
          <section>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
              <p className="text-sm text-neutral-700">
                <span className="font-bold text-red-600">{filteredAgencies.length}</span>{' '}
                {filteredAgencies.length === 1 ? 'agency' : 'agencies'} match your filters
              </p>
              <button type="button" onClick={clearFilters} className={`${linkClass} text-sm`}>
                Clear filters
              </button>
            </div>
            {filteredAgencies.length === 0 ? (
              <div className="border-l-4 border-red-600 bg-neutral-50 p-6">
                <h3 className="text-lg font-bold">No agencies match your search</h3>
                <p className="mt-2 text-sm text-neutral-700">
                  Try a different keyword, for example &ldquo;tax&rdquo;, &ldquo;registration&rdquo; or &ldquo;investment&rdquo;.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
                {filteredAgencies.map(a => (
                  <AgencyDetail key={a.id} agency={a} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Key agencies */}
            <Section
              heading="Key agencies"
              subtitle="Start your investment journey with these essential agencies"
              agencies={featured}
            />

            {/* Remaining agencies by category */}
            {Array.from(grouped.entries()).map(([category, agencies]) => {
              const remaining = agencies.filter(a => !FEATURED_IDS.includes(a.id));
              if (remaining.length === 0) return null;
              const { heading, subtitle } = getHeading(category);
              return (
                <Section
                  key={category}
                  heading={heading}
                  subtitle={subtitle}
                  count={remaining.length}
                  agencies={remaining}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
