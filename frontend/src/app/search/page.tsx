'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ugandaAgencies } from '@/data/agencies';
import investmentOpportunities from '@/data/investment-opportunities.json';
import PageHeader from '@/components/ui/PageHeader';

type ResultType = 'Agency' | 'Service' | 'Investment' | 'Guidance';

type SearchResult = {
  id: string;
  title: string;
  type: ResultType;
  description: string;
  url: string;
  relevance: number;
  meta?: string;
};

// Pages on this site that answer common tasks directly.
const SERVICE_PAGES: Omit<SearchResult, 'relevance'>[] = [
  { id: 'business-reg', type: 'Service', title: 'Register a business', url: '/business/registration', description: 'Reserve a business name and incorporate a company with the Uganda Registration Services Bureau (URSB). Lists the documents and fees for each stage.', meta: 'URSB · company registration incorporation name reservation' },
  { id: 'tax-reg', type: 'Service', title: 'Tax registration and compliance (TIN)', url: '/services#starting', description: 'Get a Tax Identification Number (TIN) from the Uganda Revenue Authority before most business dealings with government and banks.', meta: 'URA · tax certificate TIN VAT' },
  { id: 'investment-licence', type: 'Service', title: 'Investment licence', url: '/investments/process', description: 'Apply to the Uganda Investment Authority for an investment licence before you start operating. The licence is free and unlocks incentives.', meta: 'UIA · investment license licence certificate incentives' },
  { id: 'work-permit', type: 'Service', title: 'Work permits for foreign staff', url: '/services#foreign', description: 'Work and residence permits from the Directorate of Citizenship and Immigration Control, sponsored by the employing organisation.', meta: 'DCIC · immigration visa work permit foreign' },
  { id: 'environment', type: 'Service', title: 'Environmental impact assessment', url: '/services#operations', description: 'NEMA reviews the Environmental and Social Impact Assessment (ESIA) before approving most large projects.', meta: 'NEMA · environment permit ESIA clearance' },
  { id: 'track', type: 'Service', title: 'Track an application', url: '/track', description: 'Check the progress of a business registration using your reference number.', meta: 'status reference tracking' },
  { id: 'incentives', type: 'Guidance', title: 'Investment incentives', url: '/incentives', description: 'Tax holidays, exemptions and allowances under the Investment Code Act 2019 and the Income Tax Act.', meta: 'tax holiday exemption allowance free zone' },
  { id: 'process', type: 'Guidance', title: 'Investment process', url: '/investments/process', description: 'The five steps from company registration to an operating licence, and the agency responsible for each.', meta: 'steps how to invest' },
  { id: 'downloads', type: 'Guidance', title: 'Forms and downloads', url: '/downloads', description: 'Application forms and guidance documents published by government agencies.', meta: 'forms documents templates' },
  { id: 'checklist', type: 'Guidance', title: 'Document checklist', url: '/tools/document-checklist', description: 'The documents needed for business registration and licensing.', meta: 'documents requirements checklist' },
  { id: 'tax-calc', type: 'Guidance', title: 'Tax calculator', url: '/tools/tax-calculator', description: 'Estimate income tax, corporation tax and VAT using URA rates.', meta: 'tax calculator PAYE VAT corporation' },
  { id: 'faq', type: 'Guidance', title: 'Frequently asked questions', url: '/support#faq-heading', description: 'Answers about registration timelines, documents, minimum investment and tax obligations.', meta: 'faq questions help fees' },
];

const POPULAR = ['Company registration fees', 'Investment licence', 'Work permit', 'TIN registration', 'Tax holiday', 'Environmental permit'];
const FILTERS: Array<'All' | ResultType> = ['All', 'Service', 'Agency', 'Investment', 'Guidance'];
const FILTER_LABELS: Record<string, string> = { All: 'All results', Service: 'Services', Agency: 'Agencies', Investment: 'Investment projects', Guidance: 'Guidance and tools' };

function score(query: string, fields: Array<[string | undefined, number]>) {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return 0;
  let total = 0;
  for (const word of words) {
    let best = 0;
    for (const [text, weight] of fields) {
      if (text && text.toLowerCase().includes(word)) best = Math.max(best, weight);
    }
    if (!best) return 0; // every word must match somewhere
    total += best;
  }
  return total;
}

function search(query: string): SearchResult[] {
  const results: SearchResult[] = [];
  for (const agency of ugandaAgencies) {
    const relevance = score(query, [[agency.name, 40], [agency.acronym, 40], [agency.services.join(' '), 30], [agency.description, 20], [agency.category, 15]]);
    if (relevance) {
      results.push({ id: `agency-${agency.id}`, type: 'Agency', title: `${agency.name} (${agency.acronym})`, url: `/agencies/${agency.id}`, description: agency.description, relevance, meta: agency.contact.phone });
    }
  }
  for (const opp of investmentOpportunities) {
    const relevance = score(query, [[opp.title, 40], [opp.category, 30], [opp.agency, 25], [opp.description, 20]]);
    if (relevance) {
      results.push({ id: `opp-${opp.id}`, type: 'Investment', title: opp.title, url: `/investments/${opp.id}`, description: opp.description, relevance, meta: `${opp.investmentRange} · ${opp.category}` });
    }
  }
  for (const page of SERVICE_PAGES) {
    const relevance = score(query, [[page.title, 45], [page.meta, 30], [page.description, 20]]);
    if (relevance) results.push({ ...page, relevance: relevance + 5, meta: undefined });
  }
  return results.sort((a, b) => b.relevance - a.relevance);
}

const TAG: Record<ResultType, string> = {
  Service: 'gov-tag',
  Agency: 'gov-tag gov-tag--outline',
  Investment: 'gov-tag gov-tag--gold',
  Guidance: 'gov-tag gov-tag--grey',
};

export default function SearchPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | ResultType>('All');

  // The header search box and popular-search links arrive as /search?q=…
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q') ?? '';
    setInput(q);
    setQuery(q);
  }, []);

  const allResults = useMemo(() => (query.trim() ? search(query) : []), [query]);
  const results = filter === 'All' ? allResults : allResults.filter((r) => r.type === filter);
  const countFor = (type: 'All' | ResultType) => (type === 'All' ? allResults.length : allResults.filter((r) => r.type === type).length);

  const runSearch = (q: string) => {
    setQuery(q);
    setFilter('All');
    router.replace(q ? `/search?q=${encodeURIComponent(q)}` : '/search', { scroll: false });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch(input.trim());
  };

  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Search' }]}
        caption="Search"
        title="Search this website"
        lead="Find services, government agencies, investment projects and guidance."
      >
        <form role="search" onSubmit={submit} className="max-w-2xl">
          <label htmlFor="site-search" className="gov-label text-lg">Search</label>
          <div className="gov-search">
            <input
              id="site-search"
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="For example, work permit"
              autoComplete="off"
              className="!min-h-[3.25rem] !text-lg"
            />
            <button type="submit" aria-label="Search" className="!min-h-[3.25rem] !w-[3.25rem]">
              <MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </form>
      </PageHeader>

      <div className="gov-container py-12">
        {query ? (
          <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
            <aside aria-label="Filter results">
              <fieldset className="bg-[#f5f3ee] p-5">
                <legend className="sr-only">Type of result</legend>
                <p className="gov-label">Type of result</p>
                <div className="mt-2 space-y-2.5">
                  {FILTERS.map((f) => (
                    <label key={f} className="flex items-center gap-3 text-[15px] font-normal">
                      <input type="radio" name="result-type" className="h-5 w-5 shrink-0" checked={filter === f} onChange={() => setFilter(f)} />
                      <span className="flex-1">{FILTER_LABELS[f]}</span>
                      <span className="font-data text-sm text-[#5c5850]">{countFor(f)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </aside>

            <section aria-labelledby="results-heading">
              <h2 id="results-heading" className="border-b-2 border-black pb-3 text-xl font-bold" aria-live="polite">
                {results.length} {results.length === 1 ? 'result' : 'results'} for &lsquo;{query}&rsquo;
              </h2>
              {results.length === 0 ? (
                <div className="mt-6 max-w-2xl">
                  <p className="text-[17px] font-bold">There are no matching results.</p>
                  <p className="mt-3 text-[15px] text-[#3b3934]">Improve your search results by:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-[#3b3934]">
                    <li>checking your spelling</li>
                    <li>using fewer or different words, such as an agency acronym (URA, URSB, UIA)</li>
                    <li>choosing &lsquo;All results&rsquo; under type of result</li>
                  </ul>
                  <p className="mt-4 text-[15px]">Or <Link href="/support" className="gov-link">contact the OneStop Centre</Link>.</p>
                </div>
              ) : (
                <ol>
                  {results.map((result) => (
                    <li key={result.id} className="border-b border-[#dcd8cf] py-5">
                      <span className={TAG[result.type]}>{result.type === 'Investment' ? 'Investment project' : result.type}</span>
                      <h3 className="mt-2 text-lg font-bold leading-snug">
                        <Link href={result.url} className="text-black underline decoration-1 underline-offset-4 hover:text-[#9a0d1c] hover:decoration-[3px]">
                          {result.title}
                        </Link>
                      </h3>
                      <p className="mt-1 line-clamp-2 max-w-3xl text-[15px] leading-6 text-[#3b3934]">{result.description}</p>
                      {result.meta && <p className="mt-1 text-sm text-[#5c5850]">{result.meta}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-2">
            <section aria-labelledby="popular-heading">
              <h2 id="popular-heading" className="gov-title-m border-b-2 border-black pb-3">Popular searches</h2>
              <ul className="mt-4 space-y-3 text-[17px]">
                {POPULAR.map((term) => (
                  <li key={term}>
                    <button type="button" onClick={() => { setInput(term); runSearch(term); }} className="gov-link">{term}</button>
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="browse-heading">
              <h2 id="browse-heading" className="gov-title-m border-b-2 border-black pb-3">Browse instead</h2>
              <ul className="mt-4 space-y-4">
                {[
                  { label: 'Government services', href: '/services', note: 'Licences, permits, tax and registration' },
                  { label: 'Government agencies', href: '/agencies', note: `${ugandaAgencies.length} agencies with contact details` },
                  { label: 'Investment projects', href: '/investments', note: `${investmentOpportunities.length} published projects` },
                  { label: 'Forms and downloads', href: '/downloads', note: 'Application forms and guidance' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="gov-arrow-link text-[17px]">{item.label}</Link>
                    <p className="text-[15px] text-[#5c5850]">{item.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
