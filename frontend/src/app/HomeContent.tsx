'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  BuildingLibraryIcon,
  DocumentCheckIcon,
  MapIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import staticData from '@/data/investment-opportunities.json';
import type { InvestmentOpportunity } from '@/types';

type Sector = { title: string; blurb: string; image: string; link?: string };

const OPPORTUNITIES = staticData as unknown as InvestmentOpportunity[];

// Only genuine, unwatermarked Uganda photographs belong here. Several files in
// public/images turned out to be stock photos with visible watermarks, an
// infographic mislabeled as a background photo, or a photo of an identifiable
// person — none of those are fit to publish. See PROGRESS.md.
const HERO_IMAGES = [
  '/images/uganda-kampala-city-view.webp',
  '/images/uganda-flag-city.jpg',
  '/images/lake-bunyonyi-uganda.jpg',
  '/images/uganda-map-flag.jpg',
];

const SECTORS: Sector[] = [
  { title: 'Agriculture & agro-processing', blurb: 'Grow value across coffee, tea, dairy and food processing.', image: '/images/uganda-tea-plantation.webp' },
  { title: 'Tourism & hospitality', blurb: 'Discover opportunities from the Nile to Uganda’s national parks.', image: '/images/lake-bunyonyi-uganda.jpg' },
  { title: 'Infrastructure & real estate', blurb: 'Build for a growing economy with regional connections.', image: '/images/uganda-kampala-city-view.webp' },
  { title: 'ICT & innovation', blurb: 'Join a young, fast-growing and increasingly connected market.', image: '/images/uganda-flag-city.jpg' },
  { title: 'Manufacturing', blurb: 'Serve local demand and reach markets across East Africa.', image: '/images/uganda-map-flag.jpg' },
  // No dedicated energy/mining photo exists in the asset library; this repeats
  // the infrastructure image rather than use another watermarked or mismatched one.
  { title: 'Energy & minerals', blurb: 'Explore opportunities in renewables, oil, gas and mining.', image: '/images/uganda-kampala-city-view.webp' },
  { title: 'Healthcare', blurb: 'Explore investment in health services and essential care.', image: '/images/uganda-flag-city.jpg' },
];

const AGENCIES = [
  { name: 'Uganda Investment Authority', acronym: 'UIA', image: '/images/logos/UIA%20logo.png' },
  { name: 'Uganda Revenue Authority', acronym: 'URA', image: '/images/logos/URA%20logo.png' },
  { name: 'Uganda Registration Services Bureau', acronym: 'URSB', image: '/images/logos/URSB%20logo.png' },
  { name: 'National Environment Management Authority', acronym: 'NEMA', image: '/images/logos/NEMA.png' },
  { name: 'Kampala Capital City Authority', acronym: 'KCCA', image: '/images/logos/kcca.png' },
  { name: 'National Social Security Fund', acronym: 'NSSF', image: '/images/logos/NSSF%20logo.png' },
];

const OFFERINGS = [
  { icon: BuildingOffice2Icon, title: 'Investment facilitation', description: 'Guidance for investors exploring, establishing or expanding a project in Uganda, from first enquiry to licensing.', href: '/investments', label: 'Investment opportunities' },
  { icon: DocumentCheckIcon, title: 'Business services', description: 'Find registration, licensing and compliance support from government agencies, with the requirements for each step.', href: '/services', label: 'Business services' },
  { icon: BuildingLibraryIcon, title: 'Agency connections', description: 'Locate the public institutions and contacts involved in your business journey, with hours and addresses.', href: '/agencies', label: 'Agency directory' },
  { icon: MapIcon, title: 'Investor resources', description: 'Explore projects, practical guides, forms and market information in one place.', href: '/downloads', label: 'Downloads and guides' },
];

const JOURNEY = [
  { number: '01', title: 'Explore', text: 'Compare sectors, opportunities and the requirements for investing in Uganda.', href: '/investments', label: 'Explore investment' },
  { number: '02', title: 'Get guidance', text: 'Connect with the agencies and services that match your plans.', href: '/services', label: 'Find a service' },
  { number: '03', title: 'Take the next step', text: 'Start an investment application or speak with the OneStop Centre team.', href: '/investments/onboarding', label: 'Begin onboarding' },
];

const QUICK_ACTIONS = [
  { title: 'Explore investment opportunities', detail: 'Sectors, projects and incentives', keywords: 'project sector incentive investor', href: '/investments', label: '01' },
  { title: 'Register a business', detail: 'Company setup and registration', keywords: 'company business ursb incorporation', href: '/business/registration', label: '02' },
  { title: 'Find permits and licences', detail: 'Government agencies and requirements', keywords: 'license licence tax ura permit approval', href: '/services', label: '03' },
  { title: 'Estimate my returns', detail: 'Uganda-focused business tools', keywords: 'roi calculate calculator forecast', href: '/tools/roi-calculator', label: '04' },
];

const linkClass =
  'font-semibold text-black underline decoration-yellow-400 decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

const sectionHeading = 'mb-3 text-xs font-bold uppercase tracking-[0.18em] text-red-600';

// Which investment-data categories feed each homepage sector.
// Every published project is mapped once; empty categories are left out of the homepage list.
const SECTOR_CATEGORIES: Record<string, string[]> = {
  'Agriculture & agro-processing': ['Agriculture & Agribusiness'],
  'Tourism & hospitality': ['Tourism & Hospitality'],
  'Infrastructure & real estate': ['Infrastructure Development'],
  'ICT & innovation': ['ICT & Technology'],
  'Manufacturing': [],
  'Energy & minerals': ['Energy & Utilities', 'Mining & Minerals'],
  Healthcare: ['Healthcare'],
};

const PROJECT_VISUALS = [
  { image: '/images/uganda-tea-plantation.webp', icon: BuildingStorefrontIcon, label: 'Ugandan tea plantation' },
  { image: '/images/uganda-map-flag.jpg', icon: BuildingStorefrontIcon, label: 'Map of Uganda' },
  { image: '/images/lake-bunyonyi-uganda.jpg', icon: GlobeAltIcon, label: 'Lake Bunyonyi in Uganda' },
];

export default function HomePage() {
  const [heroImages, setHeroImages] = useState(HERO_IMAGES);
  const [sectors, setSectors] = useState(SECTORS);
  const [heroIndex, setHeroIndex] = useState(0);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [taskSearch, setTaskSearch] = useState('');
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

  const openAssistant = () => document.dispatchEvent(new CustomEvent('openChatWidget'));
  const matchingActions = QUICK_ACTIONS.filter((action) =>
    `${action.title} ${action.detail} ${action.keywords}`.toLowerCase().includes(taskSearch.trim().toLowerCase()),
  );
  const categoryCount = new Set(OPPORTUNITIES.map((o) => o.category)).size;
  const highPriority = OPPORTUNITIES.filter((o) => o.priority === 'High');
  const featured = highPriority.slice(0, 3);

  const projectsFor = (title: string) => {
    const categories = SECTOR_CATEGORIES[title] ?? [];
    return OPPORTUNITIES.filter((o) => categories.includes(o.category));
  };
  const visibleSectors = sectors.filter((sector) => projectsFor(sector.title).length > 0);
  const activeSector = visibleSectors[activeSectorIndex] ?? visibleSectors[0] ?? SECTORS[0]!;
  const activeProjects = projectsFor(activeSector.title);

  return (
    <div className="bg-white text-black">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#10283f] text-white">
        <div className="absolute inset-0 -z-10" data-decorative="true">
          {!lowBandwidth && (
            <Image
              src={heroImages[heroIndex] ?? '/images/uganda-kampala-city-view.webp'}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-35"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#10283f] via-[#10283f]/95 to-[#10283f]/55" />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_.75fr] lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-yellow-300">
              <span className="h-1 w-10 bg-yellow-400" aria-hidden="true" />
              Uganda Investment Authority · OneStop Centre
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Invest in Uganda. <span className="text-yellow-300">Build what’s next.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
              Use the OneStop Centre to understand the practical steps behind doing business in Uganda. Compare published investment opportunities, learn which public agencies handle key requirements, and find a clear next action for your plans. The directory brings project information, service guidance and support contacts together in one place, so you can move from early research to a more informed conversation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/investments"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-yellow-400 px-6 py-3 text-sm font-bold text-[#10283f] transition hover:bg-yellow-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#10283f]"
              >
                Explore investments <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/services"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/60 px-6 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-[#10283f] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#10283f]"
              >
                Find a service
              </Link>
            </div>
          </div>

          <div className="border-l border-white/25 py-2 pl-6 sm:pl-8">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-white/65">A single point of access</p>
            <ul className="mt-5 divide-y divide-white/20">
              {[
                ['01', 'Find investment opportunities', 'Browse projects by sector, investment range and lead agency.'],
                ['02', 'Understand business requirements', 'Locate registration, permits and compliance guidance.'],
                ['03', 'Connect with public agencies', 'Identify institutions and the next step for your plans.'],
              ].map(([number, title, description]) => (
                <li key={number} className="grid grid-cols-[2.5rem_1fr] gap-3 py-4 first:pt-0 last:pb-0">
                  <span className="pt-0.5 text-xs font-bold text-yellow-300">{number}</span>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/70">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
            {heroImages.length > 1 && (
              <div className="mt-6 flex gap-2" role="group" aria-label="Choose featured image">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setHeroIndex(index)}
                    aria-label={`Show image ${index + 1}`}
                    aria-current={index === heroIndex}
                    className={`h-1.5 transition-all ${index === heroIndex ? 'w-8 bg-yellow-300' : 'w-3 bg-white/50 hover:bg-white'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Events, answers and practical investor resources */}
      <section className="border-y border-neutral-200 bg-[#10283f] py-12 text-white" aria-label="Investor updates and help">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-300">News &amp; events</p>
            <h2 className="mt-2 text-xl font-bold">Meet Uganda’s investment community</h2>
            <Link href="/events" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-yellow-300 underline-offset-4">View events <ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-300">Common questions</p>
            <h2 className="mt-2 text-xl font-bold">Get answers before you apply</h2>
            <Link href="/support#faq-heading" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-yellow-300 underline-offset-4">Browse investor FAQs <ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-300">Investor guide</p>
            <h2 className="mt-2 text-xl font-bold">Plan your next step in Uganda</h2>
            <Link href="/guide" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-yellow-300 underline-offset-4">Read the investor guide <ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      {/* Task finder */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="task-heading">
        <div className="flex flex-col gap-4 border-b-2 border-black pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={sectionHeading}>Investor task finder</p>
            <h2 id="task-heading" className="text-2xl font-bold sm:text-3xl">What would you like to do?</h2>
          </div>
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">Search investor tasks</span>
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
            <input
              value={taskSearch}
              onChange={(event) => setTaskSearch(event.target.value)}
              placeholder="Search a task or service"
              className="h-11 w-full rounded-md border border-neutral-400 bg-white pl-10 pr-3 text-sm text-black placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            />
          </label>
        </div>
        <ul className="grid divide-y divide-neutral-200 sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
          {matchingActions.length ? matchingActions.map((action) => (
            <li key={action.label}>
              <Link href={action.href} className="group flex h-full flex-col justify-between gap-6 px-0 py-6 sm:px-6 hover:bg-neutral-50">
                <span className="flex items-center justify-between text-xs font-bold tracking-[0.12em] text-red-600">
                  {action.label}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-bold leading-snug text-black group-hover:text-red-600">{action.title}</span>
                  <span className="mt-1 block text-sm text-neutral-600">{action.detail}</span>
                </span>
              </Link>
            </li>
          )) : (
            <li className="col-span-full py-6 text-sm text-neutral-700">
              No task matches that search. Try “registration”, “permits” or “investment”.
            </li>
          )}
        </ul>
      </section>

      {/* Key facts */}
      <section className="border-y border-neutral-200 bg-neutral-50" aria-label="Key facts">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-[.16em] text-neutral-500">Investment directory at a glance</p>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-0">
          {[
            { label: 'Listed opportunities', value: String(OPPORTUNITIES.length), note: 'Browse projects and their published details' },
            { label: 'Sectors represented', value: String(categoryCount), note: 'Explore the directory by industry' },
            { label: 'Lead agencies', value: String(new Set(OPPORTUNITIES.map((o) => o.agency).filter(Boolean)).size), note: 'Named across the listed opportunities' },
          ].map((fact) => (
            <div key={fact.label} className="border-l-4 border-yellow-400 pl-4 sm:ml-6 sm:first:ml-0 sm:pl-6">
              <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">{fact.label}</dt>
              <dd className="font-data mt-1 text-4xl font-semibold leading-none text-[#10283f] sm:text-5xl">{fact.value}</dd>
              <p className="mt-1 text-xs leading-5 text-neutral-600">{fact.note}</p>
            </div>
          ))}
          </dl>
          <p className="mt-5 text-[11px] text-neutral-500">Counts reflect the opportunities currently published in this directory.</p>
        </div>
      </section>

      {/* What we offer */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="offer-heading">
        <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
          <div>
            <p className={sectionHeading}>One coordinated entry point</p>
            <h2 id="offer-heading" className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Government support, made easier to navigate.
            </h2>
            <p className="mt-5 leading-7 text-neutral-700">
              The OneStop Centre helps investors and businesses understand the steps, find the right agency and move forward with confidence.
            </p>
            <Link href="/about" className={`${linkClass} mt-6 inline-flex items-center gap-2 text-sm`}>
              About the OneStop Centre <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
            {OFFERINGS.map(({ icon: Icon, title, description, href, label }) => (
              <li key={title} className="grid gap-4 py-6 sm:grid-cols-[3rem_1fr] sm:gap-6">
                <Icon className="h-7 w-7 text-red-600" aria-hidden="true" />
                <div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">{description}</p>
                  <Link href={href} className={`${linkClass} mt-3 inline-block text-sm`}>{label}</Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured opportunities (from the investment opportunities data) */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-16" aria-labelledby="featured-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={sectionHeading}>High-priority opportunities</p>
              <h2 id="featured-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">Projects open to investors now</h2>
            </div>
            <Link href="/investments" className={`${linkClass} text-sm`}>All investment opportunities</Link>
          </div>
          <div className="grid gap-x-10 gap-y-10 md:grid-cols-3">
            {featured.map((opp, index) => {
              const visual = PROJECT_VISUALS[index % PROJECT_VISUALS.length]!;
              const SectorIcon = visual.icon;
              return <article key={opp.id} className="overflow-hidden border border-neutral-200 bg-white shadow-sm">
                <div className="relative aspect-[16/9] bg-neutral-200">
                  <Image src={visual.image} alt={visual.label} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded bg-white px-3 py-1.5 text-xs font-bold text-[#10283f] shadow">
                    <SectorIcon className="h-4 w-4" aria-hidden="true" />{opp.category.split('&')[0]?.trim()}
                  </span>
                </div>
                <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-red-600">{opp.category.split('&')[0]?.trim()}</p>
                <h3 className="mt-3 text-lg font-bold leading-snug">
                  <Link href={`/investments/${opp.id}`} className={linkClass}>{opp.title}</Link>
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-700">{index === 0 ? 'Develop a fruit processing facility in the Luwero region, turning locally grown produce into products for domestic and regional markets.' : index === 1 ? 'Build a cassava processing facility in Pader, creating higher value products and supporting Northern Uganda’s agricultural supply chain.' : 'Develop cocoa processing capacity in Bundibugyo and supply value-added products to local and export markets.'}</p>
                <dl className="mt-5 grid grid-cols-3 gap-3 border-l-4 border-yellow-400 bg-white py-3 pl-4 pr-2 text-sm">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">Investment</dt>
                    <dd className="font-data mt-0.5 text-xs font-semibold text-black">{opp.investmentRange}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">ROI</dt>
                    <dd className="font-data mt-0.5 text-xs font-semibold text-black">{opp.roi}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">Timeline</dt>
                    <dd className="font-data mt-0.5 text-xs font-semibold text-black">{opp.timeline}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-neutral-600">Agency: {opp.agency}</p>
                </div>
              </article>;
            })}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="sectors-heading">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className={sectionHeading}>Explore Uganda</p>
            <h2 id="sectors-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">Opportunities across priority sectors</h2>
            <p className="mt-4 leading-7 text-neutral-700">
              Explore sectors supported by Uganda’s natural resources, skilled people and regional connections.
            </p>
          </div>
          <Link href="/investments" className={`${linkClass} text-sm`}>All investment opportunities</Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-12">
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
            {visibleSectors.map((sector, index) => {
              const isActive = activeSectorIndex === index;
              const count = projectsFor(sector.title).length;
              return (
                <li key={sector.title}>
                  <button
                    type="button"
                    onClick={() => setActiveSectorIndex(index)}
                    aria-pressed={isActive}
                    className={`group flex w-full items-start justify-between gap-4 py-5 text-left transition-colors ${isActive ? 'text-red-600' : 'text-black hover:text-red-600'}`}
                  >
                    <span className="flex items-start gap-4">
                      <span className={`pt-0.5 text-sm font-bold ${isActive ? 'text-red-600' : 'text-neutral-600'}`}>{String(index + 1).padStart(2, '0')}</span>
                      <span>
                        <span className="block font-bold">{sector.title}</span>
                        <span className="mt-1 block text-sm leading-6 text-neutral-700">{sector.blurb}</span>
                        <span className="mt-2 block text-xs font-bold uppercase tracking-wider text-neutral-600">
                          {count > 0 ? `${count} listed ${count === 1 ? 'project' : 'projects'}` : 'No published projects'}
                        </span>
                      </span>
                    </span>
                    <ArrowRightIcon className={`mt-1 h-4 w-4 shrink-0 transition-transform ${isActive ? 'translate-x-0 text-red-600' : 'opacity-0 group-hover:opacity-100'}`} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>

          <div>
            <div className="relative aspect-[16/9] overflow-hidden bg-neutral-200">
              <Image key={activeSector.title} src={activeSector.image} alt={activeSector.title} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover transition duration-700" />
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">Priority sector</p>
              <h3 className="mt-2 text-2xl font-bold sm:text-3xl">{activeSector.title}</h3>
              <p className="mt-3 leading-7 text-neutral-700">{activeSector.blurb}</p>

              <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-neutral-200 py-5">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">Projects listed</dt>
                  <dd className="font-data mt-1 text-2xl font-bold">{activeProjects.length}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">High priority</dt>
                  <dd className="font-data mt-1 text-2xl font-bold">{activeProjects.filter((o) => o.priority === 'High').length}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">Agencies involved</dt>
                  <dd className="font-data mt-1 text-2xl font-bold">{new Set(activeProjects.map((o) => o.agency)).size}</dd>
                </div>
              </dl>

              {activeProjects.length > 0 ? (
                <div className="mt-6">
                  <p className="text-sm font-bold text-black">Example projects</p>
                  <ul className="mt-3 divide-y divide-neutral-200">
                    {activeProjects.slice(0, 3).map((opp) => (
                      <li key={opp.id} className="py-4">
                        <Link href={`/investments/${opp.id}`} className={`${linkClass} text-sm leading-snug`}>{opp.title}</Link>
                        <p className="mt-1 text-xs leading-5 text-neutral-700">
                          {opp.investmentRange} · ROI {opp.roi} · {opp.timeline}
                        </p>
                        <p className="text-xs text-neutral-600">{opp.agency}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-6 border-l-4 border-yellow-400 pl-4 text-sm leading-6 text-neutral-700">
                  No projects are listed for this sector yet. Ask the assistant about opportunities here, or browse all investments.
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <Link href={activeSector.link || '/investments'} className={linkClass}>Explore this sector</Link>
                {activeProjects.length > 3 && (
                  <Link href="/investments" className={linkClass}>See all {activeProjects.length} projects</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-neutral-200 py-16" aria-labelledby="journey-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className={sectionHeading}>How it works</p>
            <h2 id="journey-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">Move forward in three steps</h2>
            <p className="mt-4 leading-7 text-neutral-700">Find useful information and support for your next decision.</p>
          </div>
          <ol className="grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-neutral-200">
            {JOURNEY.map((step) => (
              <li key={step.number} className="md:px-8 first:md:pl-0 last:md:pr-0">
                <span className="text-4xl font-bold text-yellow-500" aria-hidden="true">{step.number}</span>
                <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 min-h-14 text-sm leading-6 text-neutral-700">{step.text}</p>
                <Link href={step.href} className={`${linkClass} mt-5 inline-flex items-center gap-2 text-sm`}>
                  {step.label} <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Agencies */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-16" aria-labelledby="agencies-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={sectionHeading}>Working together</p>
              <h2 id="agencies-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">Connected to Uganda’s public institutions</h2>
            </div>
            <Link href="/agencies" className={`${linkClass} text-sm`}>View all agencies</Link>
          </div>
          <ul className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {AGENCIES.map((agency) => (
              <li key={agency.acronym} className="flex items-center gap-5 border-t border-neutral-300 pt-6">
                <div className="relative h-14 w-24 shrink-0">
                  <Image src={agency.image} alt={`${agency.name} logo`} fill sizes="96px" className="object-contain object-left" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600">{agency.acronym}</p>
                  <p className="mt-1 text-sm font-semibold leading-snug">{agency.name}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final call to action */}
      <section className="border-t-4 border-yellow-400 py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className={sectionHeading}>Here to help</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Have a question about investing in Uganda?</h2>
            <p className="mt-4 leading-7 text-neutral-700">
              Speak with the OneStop Centre or get quick answers from our investment assistant.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/support"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-black px-5 py-3 text-sm font-bold text-yellow-400 hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Contact the centre <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={openAssistant}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-black px-5 py-3 text-sm font-bold text-black hover:bg-black hover:text-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden="true" />
              Ask the assistant
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
