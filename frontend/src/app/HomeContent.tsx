'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  BuildingLibraryIcon,
  CalculatorIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  IdentificationIcon,
  MagnifyingGlassIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import staticData from '@/data/investment-opportunities.json';
import type { InvestmentOpportunity } from '@/types';
import FactRow from '@/components/ui/FactRow';
import SectionHeading from '@/components/ui/SectionHeading';

type Sector = { title: string; blurb: string; image: string; link?: string };

const OPPORTUNITIES = staticData as unknown as InvestmentOpportunity[];

// Only genuine, unwatermarked Uganda photographs belong here. Several files in
// public/images turned out to be stock photos with visible watermarks, an
// infographic mislabeled as a background photo, or a photo of an identifiable
// person — none of those are fit to publish. See PROGRESS.md.
const HERO_IMAGES = [
  '/images/uganda-kampala-city-view.webp',
  '/images/uganda-tea-plantation.webp',
];

const SECTORS: Sector[] = [
  { title: 'Agriculture & agro-processing', blurb: 'Coffee, fruit, grain and dairy processing projects.', image: '/images/uganda-tea-plantation.webp' },
  { title: 'Tourism & hospitality', blurb: 'Lodges, accommodation and visitor experiences.', image: '/images/uganda-kampala-city-view.webp' },
  { title: 'Infrastructure & real estate', blurb: 'Transport, utilities and property development.', image: '/images/uganda-kampala-city-view.webp' },
  { title: 'ICT & innovation', blurb: 'Digital services and technology businesses.', image: '/images/uganda-kampala-city-view.webp' },
  { title: 'Manufacturing', blurb: 'Local processing and light manufacturing.', image: '/images/uganda-tea-plantation.webp' },
  // No dedicated energy/mining photo exists in the asset library; this repeats
  // the infrastructure image rather than use another watermarked or mismatched one.
  { title: 'Energy & minerals', blurb: 'Power generation and mineral processing projects.', image: '/images/uganda-kampala-city-view.webp' },
  { title: 'Healthcare', blurb: 'Health facilities and medical supply production.', image: '/images/uganda-tea-plantation.webp' },
];

const AGENCIES = [
  { name: 'Uganda Investment Authority', acronym: 'UIA', image: '/images/logos/UIA%20logo.png', href: '/agencies/uia' },
  { name: 'Uganda Revenue Authority', acronym: 'URA', image: '/images/logos/URA%20logo.png', href: '/agencies/ura' },
  { name: 'Uganda Registration Services Bureau', acronym: 'URSB', image: '/images/logos/URSB%20logo.png', href: '/agencies/ursb' },
  { name: 'National Environment Management Authority', acronym: 'NEMA', image: '/images/logos/NEMA.png', href: '/agencies/nema' },
  { name: 'Kampala Capital City Authority', acronym: 'KCCA', image: '/images/logos/kcca.png', href: '/agencies/kcca' },
  { name: 'National Social Security Fund', acronym: 'NSSF', image: '/images/logos/NSSF%20logo.png', href: '/agencies/nssf' },
];

const TOP_TASKS = [
  { icon: IdentificationIcon, title: 'Register a business', detail: 'Reserve a name and incorporate a company with URSB.', href: '/business/registration' },
  { icon: DocumentMagnifyingGlassIcon, title: 'Find licences and permits', detail: 'See which agency issues the approval you need.', href: '/services' },
  { icon: ClipboardDocumentCheckIcon, title: 'Track an application', detail: 'Check progress using your reference number.', href: '/track' },
  { icon: MapIcon, title: 'Browse investment projects', detail: 'Compare published projects by sector and value.', href: '/investments' },
  { icon: CalculatorIcon, title: 'Estimate your tax', detail: 'Work out income tax, corporation tax and VAT.', href: '/tools/tax-calculator' },
  { icon: BuildingLibraryIcon, title: 'Contact a government agency', detail: 'Addresses, phone numbers and office hours.', href: '/agencies' },
];

const POPULAR_SEARCHES = ['Company registration fees', 'Investment licence', 'Work permit', 'TIN registration'];

// Condensed from /investments/process, which cites the agency source for each step.
const JOURNEY = [
  { title: 'Register your company', agency: 'URSB', detail: 'Reserve a name and file incorporation documents.' },
  { title: 'Register for tax', agency: 'URA', detail: 'Obtain a Tax Identification Number (TIN).' },
  { title: 'Apply for an investment licence', agency: 'UIA', detail: 'Free of charge; unlocks investment incentives.' },
  { title: 'Get sector licences', agency: 'Sector regulators', detail: 'Further permits depending on your activity.' },
  { title: 'Secure work permits', agency: 'Immigration', detail: 'For foreign staff, sponsored by your company.' },
];

// Which investment-data categories feed each homepage sector.
// Keyed by the sector's first word, lowercased — not its full display title.
// The CMS (Sanity) and the static fallback list word the same sectors
// differently ("Agriculture & agro-processing" vs "Agriculture & Agro-
// Processing" vs potentially something else entirely from an editor), so an
// exact-string lookup silently went empty the moment Sanity's titles replaced
// the fallback's on load.
const SECTOR_PROJECT_CATEGORIES: Record<string, string[]> = {
  agriculture: ['Agriculture & Agribusiness'],
  tourism: ['Tourism & Hospitality'],
  infrastructure: ['Infrastructure Development'],
  ict: ['ICT & Technology'],
  manufacturing: [],
  energy: ['Energy & Utilities', 'Mining & Minerals'],
  mining: ['Energy & Utilities', 'Mining & Minerals'],
  healthcare: ['Healthcare'],
};

const sectorKey = (title: string) => title.toLowerCase().match(/[a-z]+/)?.[0] ?? '';

export default function HomePage() {
  const router = useRouter();
  const [heroImages, setHeroImages] = useState(HERO_IMAGES);
  const [sectors, setSectors] = useState(SECTORS);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [activeSectorIndex, setActiveSectorIndex] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setLowBandwidth(root.classList.contains('low-bandwidth'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/homepage/sectors').then((r) => r.json()).then((json) => {
      if (active && json?.success && Array.isArray(json.data) && json.data.length) {
        setSectors(json.data);
        setActiveSectorIndex(0);
      }
    }).catch(() => undefined);
    fetch('/api/homepage/settings').then((r) => r.json()).then((json) => {
      if (active && json?.success && Array.isArray(json.data?.hero) && json.data.hero.length) setHeroImages(json.data.hero);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = new FormData(event.currentTarget).get('q')?.toString().trim() ?? '';
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  const openAssistant = () => document.dispatchEvent(new CustomEvent('openChatWidget'));
  const categoryCount = new Set(OPPORTUNITIES.map((o) => o.category)).size;
  const agencyCount = new Set(OPPORTUNITIES.map((o) => o.agency).filter(Boolean)).size;
  const featured = OPPORTUNITIES.filter((o) => o.priority === 'High').slice(0, 3);

  const projectsFor = (title: string) => {
    const categories = SECTOR_PROJECT_CATEGORIES[sectorKey(title)] ?? [];
    return OPPORTUNITIES.filter((o) => categories.includes(o.category));
  };
  const activeSector = sectors[activeSectorIndex] ?? sectors[0] ?? SECTORS[0]!;
  const activeProjects = projectsFor(activeSector.title);

  return (
    <div className="bg-white text-black">
      {/* Hero */}
      <section aria-labelledby="home-title" className="relative isolate overflow-hidden bg-[#0b0b0b] text-white">
        <div className="gov-container grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:items-center lg:gap-14 lg:py-20">
          <div>
            <p className="gov-kicker !text-[#ffd700]">Uganda Investment Authority</p>
            <h1 id="home-title" className="gov-title-xl mt-5 text-white">
              Start, register and grow your investment in Uganda
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/85">
              One place for the registrations, licences and agency contacts you need, from company name reservation to an operating licence.
            </p>

            <form role="search" onSubmit={search} className="mt-8 max-w-xl">
              <label htmlFor="home-search" className="block text-base font-bold text-white">What do you need to do?</label>
              <div className="gov-search gov-search--inverse mt-2">
                <input id="home-search" name="q" type="search" placeholder="For example, register a company" autoComplete="off" />
                <button type="submit" aria-label="Search">
                  <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="text-white/70">Popular:</span>
              {POPULAR_SEARCHES.map((term) => (
                <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="font-semibold text-white underline decoration-[#ffd700] underline-offset-4 hover:text-[#ffd700] hover:decoration-2">
                  {term}
                </Link>
              ))}
            </div>
          </div>

          <figure className="relative" data-decorative="true">
            <div className="relative aspect-[4/3] w-full overflow-hidden border-l-[9px] border-[#ffd700] bg-[#262626] sm:aspect-[16/11]">
              {!lowBandwidth && (
                <Image
                  src={heroImages[0] ?? '/images/uganda-kampala-city-view.webp'}
                  alt="Kampala city skyline"
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              )}
            </div>
            <figcaption className="absolute bottom-0 right-0 bg-[#ce1126] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
              Kampala, Uganda
            </figcaption>
          </figure>
        </div>
        <div className="gov-stripe" aria-hidden="true" />
      </section>

      {/* Top tasks */}
      <section className="gov-section" aria-labelledby="tasks-heading">
        <div className="gov-container">
          <SectionHeading id="tasks-heading" kicker="Services" title="Most used services" link={{ label: 'All government services', href: '/services' }} />
          <ul className="grid gap-px border border-[#dcd8cf] bg-[#dcd8cf] sm:grid-cols-2 lg:grid-cols-3">
            {TOP_TASKS.map((task) => (
              <li key={task.title} className="bg-white">
                <Link href={task.href} className="group flex h-full gap-4 p-6 no-underline hover:bg-[#f5f3ee]">
                  <span className="grid h-12 w-12 shrink-0 place-items-center bg-black text-[#ffd700] transition-colors group-hover:bg-[#ce1126] group-hover:text-white">
                    <task.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-lg font-bold leading-snug text-black underline decoration-1 underline-offset-4 group-hover:text-[#9a0d1c] group-hover:decoration-[3px]">{task.title}</span>
                    <span className="mt-1.5 block text-[15px] leading-6 text-[#5c5850]">{task.detail}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Investment journey */}
      <section className="gov-section gov-section--paper" aria-labelledby="journey-heading">
        <div className="gov-container grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
          <div>
            <p className="gov-kicker">Step by step</p>
            <h2 id="journey-heading" className="gov-title-l mt-3">Setting up an investment in Uganda</h2>
            <p className="gov-body mt-4 text-[17px]">
              Most investors follow five steps, each handled by a different agency. The first three must be complete before you start operating.
            </p>
            <Link href="/investments/process" className="gov-btn gov-btn--start mt-7">See the full process</Link>
          </div>
          <ol className="gov-steps">
            {JOURNEY.map((step) => (
              <li key={step.title}>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-lg font-bold">{step.title}</span>
                  <span className="gov-tag gov-tag--outline">{step.agency}</span>
                </p>
                <p className="mt-1 text-[15px] text-[#3b3934]">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Key facts */}
      <section className="gov-section pb-8 md:pb-10" aria-labelledby="facts-heading">
        <div className="gov-container">
          <h2 id="facts-heading" className="sr-only">Directory figures</h2>
          <FactRow
            facts={[
              { label: 'Published projects', value: OPPORTUNITIES.length, note: 'In the investment project directory' },
              { label: 'Sectors', value: categoryCount, note: 'Represented across listed projects' },
              { label: 'Lead agencies', value: agencyCount, note: 'Named as project contacts' },
            ]}
          />
        </div>
      </section>

      {/* Featured projects */}
      <section className="gov-section pt-8 md:pt-10" aria-labelledby="featured-heading">
        <div className="gov-container">
          <SectionHeading
            id="featured-heading"
            kicker="Invest"
            title="High-priority investment projects"
            intro="Projects the lead agencies have marked as high priority. Figures are as published by the agency."
            link={{ label: 'All investment projects', href: '/investments' }}
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {featured.map((opp) => (
              <article key={opp.id} className="gov-card gov-card--link">
                <p><span className="gov-tag gov-tag--gold">{opp.category.split('&')[0]?.trim()}</span></p>
                <h3 className="gov-card__title mt-4">
                  <Link href={`/investments/${opp.id}`}>{opp.title}</Link>
                </h3>
                <p className="mt-3 line-clamp-3 text-[15px] leading-6 text-[#3b3934]">{opp.description}</p>
                <p className="mb-4 mt-4 text-sm text-[#5c5850]"><span className="font-bold text-black">Lead agency:</span> {opp.agency}</p>
                <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-[#dcd8cf] pt-4 text-sm">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[#5c5850]">Value</dt>
                    <dd className="mt-1 font-bold text-black">{opp.investmentRange}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[#5c5850]">ROI</dt>
                    <dd className="mt-1 font-bold text-black">{opp.roi}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[#5c5850]">Timeline</dt>
                    <dd className="mt-1 font-bold text-black">{opp.timeline}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="gov-section gov-section--paper" aria-labelledby="sectors-heading">
        <div className="gov-container">
          <SectionHeading
            id="sectors-heading"
            kicker="Sectors"
            title="Browse by sector"
            intro="Choose a sector to see how many projects are listed and which agencies lead them."
          />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-12">
            <ul className="border-t-2 border-black" aria-label="Sectors">
              {sectors.map((sector, index) => {
                const isActive = activeSectorIndex === index;
                const count = projectsFor(sector.title).length;
                return (
                  <li key={sector.title} className="border-b border-[#b9b4a9]">
                    <button
                      type="button"
                      onClick={() => setActiveSectorIndex(index)}
                      aria-pressed={isActive}
                      className={`flex w-full items-center justify-between gap-3 py-3.5 pl-3 pr-2 text-left transition-colors ${isActive ? 'border-l-[6px] border-[#ce1126] bg-white font-bold text-black' : 'border-l-[6px] border-transparent font-semibold text-[#3b3934] hover:bg-white hover:text-black'}`}
                    >
                      <span>{sector.title}</span>
                      <span className={`font-data text-sm ${isActive ? 'text-[#9a0d1c]' : 'text-[#5c5850]'}`}>{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="grid gap-8 bg-white p-5 sm:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#ebe8e1]">
                {!lowBandwidth && (
                  <Image key={activeSector.title} src={activeSector.image} alt="" fill sizes="(max-width: 1280px) 100vw, 30vw" className="object-cover" />
                )}
              </div>
              <div>
                <h3 className="gov-title-m">{activeSector.title}</h3>
                <p className="mt-2 text-[15px] text-[#3b3934]">{activeSector.blurb}</p>
                <dl className="mt-5 grid grid-cols-3 border-y border-[#dcd8cf] py-4">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[#5c5850]">Projects</dt>
                    <dd className="font-data mt-1 text-2xl font-bold">{activeProjects.length}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[#5c5850]">High priority</dt>
                    <dd className="font-data mt-1 text-2xl font-bold">{activeProjects.filter((o) => o.priority === 'High').length}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[#5c5850]">Agencies</dt>
                    <dd className="font-data mt-1 text-2xl font-bold">{new Set(activeProjects.map((o) => o.agency)).size}</dd>
                  </div>
                </dl>
                {activeProjects.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {activeProjects.slice(0, 3).map((opp) => (
                      <li key={opp.id}>
                        <Link href={`/investments/${opp.id}`} className="gov-link text-[15px]">{opp.title}</Link>
                        <p className="text-sm text-[#5c5850]">{opp.investmentRange} · {opp.agency}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="gov-inset mt-4 text-[15px]">
                    No projects are listed under this sector yet. Contact the OneStop Centre to discuss opportunities.
                  </p>
                )}
                <Link href={activeSector.link || '/investments'} className="gov-arrow-link mt-5 text-[15px]">
                  View {activeProjects.length > 3 ? `all ${activeProjects.length} projects` : 'this sector'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agencies */}
      <section className="gov-section" aria-labelledby="agencies-heading">
        <div className="gov-container">
          <SectionHeading
            id="agencies-heading"
            kicker="Working together"
            title="Agencies you will deal with"
            link={{ label: 'Full agency directory', href: '/agencies' }}
          />
          <ul className="grid grid-cols-2 gap-px border border-[#dcd8cf] bg-[#dcd8cf] md:grid-cols-3 lg:grid-cols-6">
            {AGENCIES.map((agency) => (
              <li key={agency.acronym} className="bg-white">
                <Link href={agency.href} className="group flex h-full flex-col items-center gap-3 p-5 text-center no-underline hover:bg-[#f5f3ee]">
                  <span className="relative h-14 w-full">
                    <Image src={agency.image} alt="" fill sizes="160px" className="object-contain" />
                  </span>
                  <span className="text-sm font-bold text-black underline decoration-1 underline-offset-4 group-hover:decoration-[3px]">{agency.acronym}</span>
                  <span className="text-xs leading-5 text-[#5c5850]">{agency.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Help */}
      <section className="gov-section gov-section--dark" aria-labelledby="help-heading">
        <div className="gov-container grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="gov-kicker">Help</p>
            <h2 id="help-heading" className="gov-title-l mt-3 text-white">Speak to an investment officer</h2>
            <p className="mt-4 text-[17px] leading-7 text-white/80">
              Send an enquiry and the OneStop Centre will route it to the right agency, or ask the investment assistant a quick question now.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/support" className="gov-btn gov-btn--gold">Send an enquiry</Link>
            <button type="button" onClick={openAssistant} className="gov-btn gov-btn--outline-inverse">
              <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden="true" />
              Ask the assistant
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
