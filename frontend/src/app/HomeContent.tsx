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
  { title: 'Agriculture & agro-processing', blurb: 'Uganda\'s farms produce coffee, tea, dairy and a wide range of food crops that can be processed locally. Investment here ranges from primary processing to packaging and export-ready products. Adding value locally keeps more of the income inside the country. Listed agricultural projects show their licences, incentives and lead agencies.', image: '/images/uganda-tea-plantation.webp' },
  { title: 'Tourism & hospitality', blurb: 'Uganda\'s national parks, lakes and the Nile attract visitors throughout the year. Opportunities include lodges, hotels, visitor centres and adventure facilities. Demand is supported by the country\'s promotion as a travel destination. Each tourism listing shows its investment range and the tourism licences it needs.', image: '/images/lake-bunyonyi-uganda.jpg' },
  { title: 'Infrastructure & real estate', blurb: 'Kampala and other growing towns need roads, housing, offices and utilities. Regional connections make Uganda a gateway to neighbouring markets in East Africa. Projects range from urban developments to waterfront estates. Land titles, planning approvals and building permits are the main steps to plan for.', image: '/images/uganda-kampala-city-view.webp' },
  { title: 'ICT & innovation', blurb: 'Uganda has a young, English-speaking workforce and a growing digital economy. Opportunities include IT and business process outsourcing parks, digital services and technology companies. National ICT policy supports entrepreneurship and skills development. Each listing explains the licences and incentives that apply.', image: '/images/uganda-flag-city.jpg' },
  { title: 'Manufacturing', blurb: 'Manufacturers can serve Uganda\'s domestic demand and reach markets across East Africa. Opportunities include processing plants, light industry and factories that add value to local raw materials. Free zones and industrial parks offer incentives to qualifying businesses. Manufacturing projects normally need manufacturing and environmental licences.', image: '/images/uganda-map-flag.jpg' },
  // No dedicated energy/mining photo exists in the asset library; this repeats
  // the infrastructure image rather than use another watermarked or mismatched one.
  { title: 'Energy & minerals', blurb: 'Uganda has hydropower, solar potential and mineral resources including limestone, iron ore and silica sand. Investment opportunities include power plants, rehabilitation projects and mineral processing. Regional demand for power is growing, which supports new energy projects. Mining leases and environmental approvals are central to these investments.', image: '/images/uganda-kampala-city-view.webp' },
  { title: 'Healthcare', blurb: 'Uganda needs reliable health services and essential medical supplies. Opportunities include the manufacture of medical consumables and private health facilities. Government procurement can create demand for locally made products. Investors should plan for medical device licensing and quality compliance from the outset.', image: '/images/uganda-flag-city.jpg' },
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
  { icon: BuildingOffice2Icon, title: 'Investment facilitation', description: 'Investors can get guidance at every stage of a project, from the first enquiry through to licensing. The Uganda Investment Authority coordinates the process and points you to the right agencies. Support covers exploring sectors, establishing a business and expanding an existing project. Early contact helps you understand the licences and incentives that apply to your project.', href: '/investments', label: 'Investment opportunities' },
  { icon: DocumentCheckIcon, title: 'Business services', description: 'Registration, licensing and compliance are the core steps for most businesses in Uganda. This section shows the government agency responsible for each step and the requirements that apply. Following the steps in order avoids repeated applications. Keep your documents ready before you start each process.', href: '/services', label: 'Business services' },
  { icon: BuildingLibraryIcon, title: 'Agency connections', description: 'Most investments involve several public institutions, from registration to tax, environment and utilities. This directory lists each agency with its services, operating hours and addresses. It helps you find the right contact without searching across several government websites. Use it to decide which office to visit or call first.', href: '/agencies', label: 'Agency directory' },
  { icon: MapIcon, title: 'Investor resources', description: 'The downloads area gathers the forms, guides and market information that investors commonly need. Projects, practical guides and templates are kept together in one place. Start here if you want background before speaking to an agency. Download the documents you need and keep them with your business records.', href: '/downloads', label: 'Downloads and guides' },
];

const JOURNEY = [
  { title: 'Explore', text: 'Compare sectors, opportunities and the requirements for investing in Uganda.', href: '/investments', label: 'Explore investment' },
  { title: 'Get guidance', text: 'Connect with the agencies and services that match your plans.', href: '/services', label: 'Find a service' },
  { title: 'Take the next step', text: 'Start an investment application or speak with the OneStop Centre team.', href: '/investments/onboarding', label: 'Begin onboarding' },
];

const QUICK_ACTIONS = [
  { title: 'Explore investment opportunities', detail: 'Browse the sectors, projects and incentives open to investors in Uganda. Each listing explains the investment range, the lead agency, the licences required and the incentives on offer. You can review the sector overview before choosing a project to explore. Open a listing to see the contacts and next steps for that opportunity.', keywords: 'project sector incentive investor', href: '/investments' },
  { title: 'Register a business', detail: 'Start company formation and business name registration through the Uganda Registration Services Bureau (URSB). The registration guide lists the documents and steps for each type of business. It also shows the fees that apply at each stage. Registration is the legal foundation for banking, tax and licensing that follows.', keywords: 'company business ursb incorporation', href: '/business/registration' },
  { title: 'Find permits and licences', detail: 'Discover which permits and licences your business needs, and which agency issues each one. The services guide sets out the requirements for each step, from company formation to environmental clearance. Work permits and immigration approvals for foreign staff are covered as well. Checking this list before you start trading helps you avoid delays and penalties.', keywords: 'license licence tax ura permit approval', href: '/services' },
  { title: 'Estimate my returns', detail: 'Use the ROI calculator to estimate the return on a business opportunity before you commit capital. Enter your investment, revenue and cost assumptions to see the projected return. Comparing scenarios shows how sensitive the result is to changes in prices or volumes. The calculator is a planning aid, so confirm important decisions with professional advice.', keywords: 'roi calculate calculator forecast', href: '/tools/roi-calculator' },
];

const linkClass =
  'font-semibold text-black underline decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

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
  // Keep the CMS sector directory visible even when its titles do not match
  // the local opportunity-category mapping. Empty matches get the existing
  // no-projects state in the detail panel instead of leaving a blank column.
  const visibleSectors = sectors;
  const activeSector = visibleSectors[activeSectorIndex] ?? visibleSectors[0] ?? SECTORS[0]!;
  const activeProjects = projectsFor(activeSector.title);

  return (
    <div className="bg-white text-black">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-black text-white">
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
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-red-700/70" />
          <div aria-hidden="true" data-decorative="true" className="pointer-events-none absolute -right-28 top-1/2 hidden h-[30rem] w-[30rem] -translate-y-1/2 lg:block">
            <span className="absolute inset-0 border border-yellow-400/40" />
            <span className="absolute inset-12 border border-white/20" />
            <span className="absolute inset-24 border-2 border-red-600/70" />
          </div>
          <div aria-hidden="true" data-decorative="true" className="pointer-events-none absolute bottom-10 right-8 hidden items-end gap-2 lg:flex">
            {[
              { height: 48, color: 'bg-yellow-400/80' },
              { height: 80, color: 'bg-yellow-400/80' },
              { height: 64, color: 'bg-red-600' },
              { height: 112, color: 'bg-yellow-400/80' },
            ].map((bar, index) => (
              <span key={index} className={`w-3 ${bar.color}`} style={{ height: `${bar.height}px` }} />
            ))}
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_.75fr] lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-yellow-300">
              <span className="h-1 w-10 bg-yellow-400" aria-hidden="true" />
              Uganda Investment Authority · OneStop Centre
            </p>
            <h1 className="font-display max-w-3xl text-5xl font-semibold uppercase leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Invest in Uganda. <span className="text-yellow-300">Build what’s next.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
              Use the OneStop Centre to understand the practical steps behind doing business in Uganda. Compare published investment opportunities, learn which public agencies handle key requirements, and find a clear next action for your plans. The directory brings project information, service guidance and support contacts together in one place, so you can move from early research to a more informed conversation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/investments"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-yellow-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Explore investments <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/services"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/60 px-6 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Find a service
              </Link>
            </div>
          </div>

          <div className="border-l border-white/25 py-2 pl-6 sm:pl-8">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-white/65">A single point of access</p>
            <ul className="mt-5 divide-y divide-white/20">
              {[
                ['Find investment opportunities', 'Browse projects by sector, investment range and lead agency.'],
                ['Understand business requirements', 'Locate registration, permits and compliance guidance.'],
                ['Connect with public agencies', 'Identify institutions and the next step for your plans.'],
              ].map(([title, description]) => (
                <li key={title} className="py-4 first:pt-0 last:pb-0">
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
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-black via-black to-red-700/60 py-12 text-white" aria-label="Investor updates and help">
          <div aria-hidden="true" data-decorative="true" className="pointer-events-none absolute -right-20 top-1/2 hidden h-72 w-72 -translate-y-1/2 lg:block">
            <span className="absolute inset-0 border border-yellow-400/40" />
            <span className="absolute inset-10 border border-white/20" />
            <span className="absolute inset-20 border-2 border-red-600/70" />
          </div>
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-300">News &amp; events</p>
            <h2 className="mt-2 font-display text-xl font-bold uppercase">Meet Uganda’s investment community</h2>
            <Link href="/events" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white underline underline-offset-4">View events <ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-300">Common questions</p>
            <h2 className="mt-2 font-display text-xl font-bold uppercase">Get answers before you apply</h2>
            <Link href="/support#faq-heading" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white underline underline-offset-4">Browse investor FAQs <ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-300">Investor guide</p>
            <h2 className="mt-2 font-display text-xl font-bold uppercase">Plan your next step in Uganda</h2>
            <Link href="/guide" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white underline underline-offset-4">Read the investor guide <ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      {/* Task finder */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="task-heading">
        <div className="flex flex-col gap-4 border-b border-neutral-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={sectionHeading}>Investor task finder</p>
            <h2 id="task-heading" className="font-display text-2xl font-bold uppercase sm:text-3xl">What would you like to do?</h2>
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
            <li key={action.title}>
              <Link href={action.href} className="group flex h-full flex-col justify-between gap-6 px-0 py-6 sm:px-6 hover:bg-neutral-50">
                <span className="flex items-center justify-end text-red-600">
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
            <div key={fact.label} className=" pl-4 sm:ml-6 sm:first:ml-0 sm:pl-6">
              <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">{fact.label}</dt>
              <dd className="font-data mt-1 text-4xl font-semibold leading-none text-black sm:text-5xl">{fact.value}</dd>
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
            <h2 id="offer-heading" className="font-display text-3xl font-bold uppercase leading-tight tracking-tight sm:text-4xl">
              Government Support, Made Easier to Navigate
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
              <h2 id="featured-heading" className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">Projects open to investors now</h2>
            </div>
            <Link href="/investments" className={`${linkClass} text-sm`}>All investment opportunities</Link>
          </div>
          <div className="divide-y divide-neutral-200 border-y border-neutral-200">
            {featured.map((opp) => {
              const [lead, ...rest] = opp.description.split(/(?<=\.)\s+/);
              return (
                <article key={opp.id} className="grid gap-8 py-10 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-14">
                  <div>
                    <p className="inline-block bg-black px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-yellow-400">{opp.category.split('&')[0]?.trim()}</p>
                    <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-black sm:text-3xl">
                      <Link href={`/investments/${opp.id}`} className={linkClass}>{opp.title}</Link>
                    </h3>
                    <p className="mt-4 text-lg font-medium leading-8 text-black">{lead}</p>
                    {rest.length > 0 && <p className="mt-3 max-w-prose text-base leading-7 text-neutral-700">{rest.join(' ')}</p>}
                    <p className="mt-5 text-sm text-neutral-600"><span className="font-bold text-black">Lead agency:</span> {opp.agency}</p>
                  </div>
                  <aside aria-label={`Key figures for ${opp.title}`} className="flex flex-col">
                    <dl className="divide-y divide-neutral-200">
                      <div className="pb-4">
                        <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-600">Investment</dt>
                        <dd className="mt-1 font-display text-3xl font-semibold leading-tight text-black">{opp.investmentRange}</dd>
                      </div>
                      <div className="py-4">
                        <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-600">Expected ROI</dt>
                        <dd className="mt-1 text-xl font-semibold text-black">{opp.roi}</dd>
                      </div>
                      <div className="pt-4">
                        <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-600">Timeline</dt>
                        <dd className="mt-1 text-xl font-semibold text-black">{opp.timeline}</dd>
                      </div>
                    </dl>
                    <Link
                      href={`/investments/${opp.id}`}
                      className="mt-6 inline-flex items-center justify-center gap-2 bg-black px-5 py-3 text-sm font-bold text-yellow-400 hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                    >
                      View project details <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </aside>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="sectors-heading">
        <div className="mb-10 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className={sectionHeading}>Explore Uganda</p>
            <h2 id="sectors-heading" className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">Opportunities across priority sectors</h2>
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
                <p className="mt-6 pl-4 text-sm leading-6 text-neutral-700">
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
          <h2 id="journey-heading" className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">Move forward in three steps</h2>
            <p className="mt-4 leading-7 text-neutral-700">Find useful information and support for your next decision.</p>
          </div>
          <ol className="grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-neutral-200">
            {JOURNEY.map((step) => (
              <li key={step.title} className="md:px-8 first:md:pl-0 last:md:pr-0">
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
              <h2 id="agencies-heading" className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">Connected to Uganda’s public institutions</h2>
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
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-black via-black to-red-700/60 py-16 text-white">
          <div aria-hidden="true" data-decorative="true" className="pointer-events-none absolute -right-20 top-1/2 hidden h-72 w-72 -translate-y-1/2 lg:block">
            <span className="absolute inset-0 border border-yellow-400/40" />
            <span className="absolute inset-10 border border-white/20" />
            <span className="absolute inset-20 border-2 border-red-600/70" />
          </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">Here to help</p>
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">Have a question about investing in Uganda?</h2>
            <p className="mt-4 leading-7 text-white/85">
              Speak with the OneStop Centre or get quick answers from our investment assistant.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/support"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-yellow-400 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Contact the centre <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={openAssistant}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-white/70 px-5 py-3 text-sm font-bold text-white hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
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
