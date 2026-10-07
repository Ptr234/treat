'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import PageBand from '@/components/ui/PageBand';
import { ugandaRegions } from '@/data/mock/projects';
import { useProjects } from '@/hooks/useProjects';
import type { LicensedProject, ProjectStatus } from '@/types';
import DynamicLeafletMap from '@/components/projects/DynamicLeafletMap';
import {
  ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, BuildingOffice2Icon, FunnelIcon, MapIcon,
  MagnifyingGlassIcon, Squares2X2Icon, TableCellsIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

type ViewMode = 'list' | 'map' | 'table';
type SortField = 'name' | 'investmentValue' | 'plannedEmployment' | 'sector' | 'region';
const statuses: ProjectStatus[] = ['active', 'under_construction', 'planned', 'completed'];
const statusLabels: Record<ProjectStatus, string> = {
  active: 'Operational', under_construction: 'In progress', planned: 'Planned', completed: 'Completed',
};
const statusColors: Record<ProjectStatus, string> = {
  active: '#FFD700', under_construction: '#CE1126', planned: '#000000', completed: '#737373',
};
const ranges = [
  { label: 'Under $5M', min: 0, max: 5_000_000 },
  { label: '$5M–$15M', min: 5_000_000, max: 15_000_000 },
  { label: '$15M–$30M', min: 15_000_000, max: 30_000_000 },
  { label: '$30M and above', min: 30_000_000, max: Infinity },
];
const sectorColors: Record<string, string> = {
  Agriculture: '#FFD700', Tourism: '#000000', Mining: '#CE1126', ICT: '#8A7200',
  Manufacturing: '#5E0811', Energy: '#737373',
};
const currency = (value: number) => value >= 1_000_000
  ? `$${(value / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`
  : `$${(value / 1_000).toLocaleString(undefined, { maximumFractionDigits: 0 })}K`;
const inputClass = 'rounded-md border border-neutral-400 bg-white text-sm text-black outline-none focus:border-black focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2';
const linkClass = 'font-semibold text-red-700 underline decoration-2 underline-offset-4 hover:text-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 rounded-sm';

function StatusLabel({ status }: { status: ProjectStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-600">
      <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: statusColors[status] }} aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}

export default function ProjectsPage() {
  const { data: projects, loading, error } = useProjects();
  const [view, setView] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [sectors, setSectors] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<ProjectStatus[]>([]);
  const [investmentRange, setInvestmentRange] = useState('');
  const [sortField, setSortField] = useState<SortField>('investmentValue');
  const [descending, setDescending] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const availableSectors = useMemo(() => [...new Set(projects.map((p) => p.sector))].sort(), [projects]);
  const filtered = useMemo(() => projects.filter((p) => {
    const term = search.trim().toLowerCase();
    const range = ranges.find((r) => r.label === investmentRange);
    return (!term || [p.name, p.company, p.district, p.region, p.sector].some((v) => v.toLowerCase().includes(term)))
      && (!sectors.length || sectors.includes(p.sector))
      && (!regions.length || regions.includes(p.region))
      && (!statusFilters.length || statusFilters.includes(p.status))
      && (!range || (p.investmentValue >= range.min && p.investmentValue < range.max));
  }), [projects, search, sectors, regions, statusFilters, investmentRange]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const av = a[sortField]; const bv = b[sortField];
    const result = typeof av === 'string' && typeof bv === 'string'
      ? av.localeCompare(bv) : Number(av) - Number(bv);
    return descending ? -result : result;
  }), [filtered, sortField, descending]);
  const investment = filtered.reduce((sum, project) => sum + project.investmentValue, 0);
  const jobs = filtered.reduce((sum, project) => sum + project.plannedEmployment, 0);
  const hasFilters = Boolean(search || sectors.length || regions.length || statusFilters.length || investmentRange);
  const clearFilters = () => { setSearch(''); setSectors([]); setRegions([]); setStatusFilters([]); setInvestmentRange(''); };
  const toggle = <T,>(values: T[], value: T, setter: (next: T[]) => void) => setter(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  const sectorColor = (sector: string) => sectorColors[sector] || '#737373';
  const setSort = (field: SortField) => {
    if (sortField === field) setDescending((value) => !value);
    else { setSortField(field); setDescending(field === 'investmentValue' || field === 'plannedEmployment'); }
  };
  const viewOnMap = (id: string) => { setSelectedProject(id); setView('map'); setTimeout(() => mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); };
  const exportCsv = () => {
    const headers = ['Project Name', 'Company', 'Sector', 'Region', 'District', 'Investment USD', 'Employment', 'Status'];
    const rows = sorted.map((p) => [p.name, p.company, p.sector, p.region, p.district, p.investmentValue, p.plannedEmployment, statusLabels[p.status]]);
    const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const blob = new Blob([[headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'uganda-projects.csv'; anchor.click(); URL.revokeObjectURL(url);
  };

  const ProjectRow = ({ project }: { project: LicensedProject }) => (
    <li className={`grid gap-6 py-8 lg:grid-cols-[1.3fr_1fr] ${selectedProject === project.id ? 'bg-yellow-50/60' : ''}`}>
      <div className="px-1">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-600">
            <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: sectorColor(project.sector) }} aria-hidden="true" />{project.sector}
          </span>
          <StatusLabel status={project.status} />
        </div>
        <h3 className="mt-3 font-display text-xl font-bold leading-snug text-black">{project.name}</h3>
        <p className="mt-1 text-sm text-neutral-600">{project.company}</p>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-neutral-600">
          <MapIcon className="h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />{project.district}{project.district ? ', ' : ''}{project.region}
        </p>
        {project.industrialPark && <p className="mt-2 text-xs text-neutral-500">{project.industrialPark}</p>}
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 bg-neutral-50 py-4 pl-5 pr-4 text-sm">
        <div><dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Investment</dt><dd className="mt-1 text-lg font-bold text-black">{currency(project.investmentValue)}</dd></div>
        <div><dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Employment</dt><dd className="mt-1 text-lg font-bold text-black">{project.plannedEmployment.toLocaleString()}</dd></div>
        <div className="col-span-2 border-t border-neutral-200 pt-3">
          <button type="button" onClick={() => viewOnMap(project.id)} className={`${linkClass} inline-flex items-center gap-1`}>View on map <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" /></button>
        </div>
      </dl>
    </li>
  );

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="border-b border-neutral-200 bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li><Link href="/" className="text-red-700 hover:underline underline-offset-4">Home</Link></li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li className="font-semibold text-black" aria-current="page">Projects</li>
          </ol>
        </nav>
      </div>

      <PageBand>
        <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Uganda investment directory</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Find a Project to Invest In</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-700 sm:text-lg">Explore licensed projects across Uganda. Search by company, sector or location, compare investment and employment figures, and use the map to see where opportunities are based.</p>
        </section>
      </PageBand>

      <div className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8">
        <section aria-label="Project summary" className="grid grid-cols-1 border-b border-neutral-300 sm:grid-cols-3">
          {[
            { label: 'Projects in view', value: loading ? '—' : filtered.length.toLocaleString(), note: `of ${projects.length.toLocaleString()} listed` },
            { label: 'Investment represented', value: loading ? '—' : `$${(investment / 1_000_000_000).toFixed(2)}B`, note: 'combined project value' },
            { label: 'Employment', value: loading ? '—' : jobs.toLocaleString(), note: 'planned and current jobs' },
          ].map((item) => <div key={item.label} className="border-b border-neutral-200 py-5 sm:border-b-0 sm:border-r sm:px-6 sm:py-6 first:sm:pl-0 last:border-0"><p className="text-xs font-bold uppercase tracking-wider text-neutral-600">{item.label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-black">{item.value}</p><p className="mt-1 text-xs text-neutral-500">{item.note}</p></div>)}
        </section>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start">
          <aside className={`${filtersOpen ? 'block' : 'hidden'} w-full shrink-0 border-b border-neutral-300 pb-6 lg:block lg:w-64 lg:border-b-0 lg:border-r lg:pr-6 lg:pb-0`} aria-label="Project filters">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4"><h2 className="flex items-center gap-2 text-base font-bold"><FunnelIcon className="h-4 w-4 text-red-700" aria-hidden="true" />Filters</h2>{hasFilters && <button onClick={clearFilters} className="text-xs font-semibold text-red-700 hover:underline">Reset</button>}</div>
            <label htmlFor="project-search" className="mb-2 mt-5 block text-xs font-bold uppercase tracking-wider text-neutral-600">Search</label>
            <div className="relative"><MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" /><input id="project-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, company, place" className={`${inputClass} min-h-11 w-full py-2.5 pl-9 pr-3`} /></div>
            <fieldset className="mt-6"><legend className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-600">Sector</legend><div className="max-h-48 space-y-2 overflow-y-auto">{availableSectors.map((sector) => <label key={sector} className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700"><input type="checkbox" checked={sectors.includes(sector)} onChange={() => toggle(sectors, sector, setSectors)} className="h-4 w-4 accent-black" /><span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: sectorColor(sector) }} aria-hidden="true" />{sector}</label>)}</div></fieldset>
            <fieldset className="mt-6 border-t border-neutral-200 pt-5"><legend className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-600">Region</legend><div className="space-y-2">{ugandaRegions.map((region) => <label key={region} className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700"><input type="checkbox" checked={regions.includes(region)} onChange={() => toggle(regions, region, setRegions)} className="h-4 w-4 accent-black" />{region}</label>)}</div></fieldset>
            <fieldset className="mt-6 border-t border-neutral-200 pt-5"><legend className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-600">Investment size</legend><select value={investmentRange} onChange={(e) => setInvestmentRange(e.target.value)} className={`${inputClass} min-h-11 w-full px-3`}><option value="">Any investment</option>{ranges.map((range) => <option key={range.label} value={range.label}>{range.label}</option>)}</select></fieldset>
            <fieldset className="mt-6 border-t border-neutral-200 pt-5"><legend className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-600">Project status</legend><div className="space-y-2.5">{statuses.map((status) => <label key={status} className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700"><input type="checkbox" checked={statusFilters.includes(status)} onChange={() => toggle(statusFilters, status, setStatusFilters)} className="h-4 w-4 accent-black" />{statusLabels[status]}</label>)}</div></fieldset>
          </aside>

          <section className="min-w-0 flex-1" aria-label="Projects">
            <div className="border-y border-neutral-300 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div><h2 className="text-xl font-bold">Explore projects</h2><p className="mt-0.5 text-sm text-neutral-500">{loading ? 'Loading directory…' : `${filtered.length} ${filtered.length === 1 ? 'project' : 'projects'} found`}</p></div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setFiltersOpen((open) => !open)} className="inline-flex h-10 items-center gap-2 rounded-md border border-neutral-400 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 lg:hidden"><FunnelIcon className="h-4 w-4" aria-hidden="true" />Filters</button>
                  <div role="group" aria-label="Display mode" className="flex border-b border-neutral-200">{([{ mode: 'list', label: 'List', Icon: Squares2X2Icon }, { mode: 'map', label: 'Map', Icon: MapIcon }, { mode: 'table', label: 'Table', Icon: TableCellsIcon }] as const).map(({ mode, label, Icon }) => <button key={mode} type="button" onClick={() => setView(mode)} aria-pressed={view === mode} className={`inline-flex h-10 items-center gap-1.5 border-b-2 px-2.5 text-xs font-semibold sm:px-3 ${view === mode ? 'border-red-700 text-red-700' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}><Icon className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">{label}</span></button>)}</div>
                  <label className="sr-only" htmlFor="sort-projects">Sort projects</label><select id="sort-projects" value={sortField} onChange={(e) => { setSortField(e.target.value as SortField); setDescending(e.target.value === 'investmentValue' || e.target.value === 'plannedEmployment'); }} className={`${inputClass} h-10 px-3`}><option value="investmentValue">Investment</option><option value="plannedEmployment">Employment</option><option value="name">Name</option><option value="sector">Sector</option><option value="region">Region</option></select>
                  <button type="button" onClick={() => setDescending((value) => !value)} aria-label={descending ? 'Sort ascending' : 'Sort descending'} className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-400 text-neutral-600 hover:bg-neutral-50">{descending ? <ArrowDownIcon className="h-4 w-4" aria-hidden="true" /> : <ArrowUpIcon className="h-4 w-4" aria-hidden="true" />}</button>
                  <button type="button" onClick={exportCsv} className="h-10 rounded-md bg-black px-4 text-sm font-semibold text-white hover:bg-neutral-800">Export CSV</button>
                </div>
              </div>
              {hasFilters && <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3"><span className="mr-1 text-xs font-medium text-neutral-600">Active filters</span>{search && <button onClick={() => setSearch('')} className="inline-flex items-center gap-1 border border-neutral-300 px-2 py-1 text-xs text-neutral-700">{search}<XMarkIcon className="h-3 w-3" aria-hidden="true" /></button>}{sectors.map((v) => <button key={v} onClick={() => toggle(sectors, v, setSectors)} className="inline-flex items-center gap-1 border border-neutral-300 px-2 py-1 text-xs text-neutral-700">{v}<XMarkIcon className="h-3 w-3" aria-hidden="true" /></button>)}{regions.map((v) => <button key={v} onClick={() => toggle(regions, v, setRegions)} className="inline-flex items-center gap-1 border border-neutral-300 px-2 py-1 text-xs text-neutral-700">{v}<XMarkIcon className="h-3 w-3" aria-hidden="true" /></button>)}{investmentRange && <button onClick={() => setInvestmentRange('')} className="inline-flex items-center gap-1 border border-neutral-300 px-2 py-1 text-xs text-neutral-700">{investmentRange}<XMarkIcon className="h-3 w-3" aria-hidden="true" /></button>}{statusFilters.map((v) => <button key={v} onClick={() => toggle(statusFilters, v, setStatusFilters)} className="inline-flex items-center gap-1 border border-neutral-300 px-2 py-1 text-xs text-neutral-700">{statusLabels[v]}<XMarkIcon className="h-3 w-3" aria-hidden="true" /></button>)}<button onClick={clearFilters} className="px-2 text-xs font-semibold text-red-700 hover:underline">Clear all</button></div>}
            </div>

            {error && <div role="status" className="mt-5 border-l-4 border-red-700 bg-yellow-50 p-4 text-sm text-black">Project data could not be loaded. Please try again shortly.</div>}
            {loading ? <ul className="mt-2 divide-y divide-neutral-200">{Array.from({ length: 5 }, (_, i) => <li key={i} className="py-8"><div className="h-4 w-24 animate-pulse bg-neutral-200" /><div className="mt-3 h-6 w-2/3 animate-pulse bg-neutral-200" /><div className="mt-2 h-4 w-1/3 animate-pulse bg-neutral-100" /><div className="mt-4 h-20 w-full animate-pulse bg-neutral-50" /></li>)}</ul>
              : sorted.length === 0 ? <div className="mt-6 border-y border-neutral-300 px-6 py-16 text-center"><BuildingOffice2Icon className="mx-auto h-10 w-10 text-neutral-300" aria-hidden="true" /><h2 className="mt-4 text-xl font-bold">{projects.length ? 'No projects match these filters' : 'No project records available'}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">{projects.length ? 'Try changing your search or removing a filter.' : 'Project listings will appear here when data is available.'}</p>{hasFilters && <button onClick={clearFilters} className="mt-4 text-sm font-semibold text-red-700 hover:underline">Clear filters</button>}</div>
              : view === 'list' ? <ul className="mt-2 divide-y divide-neutral-200">{sorted.map((project) => <ProjectRow key={project.id} project={project} />)}</ul>
              : view === 'map' ? <div ref={mapRef} className="mt-5 border-y border-neutral-300 py-2"><DynamicLeafletMap projects={sorted} selectedProject={selectedProject} onSelectProject={setSelectedProject} getSectorColor={sectorColor} formatCurrency={currency} /><div className="mt-3 divide-y divide-neutral-200 border-t border-neutral-200 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0">{sorted.slice(0, 6).map((p) => <button key={p.id} onClick={() => setSelectedProject(p.id)} className={`flex justify-between gap-4 py-3 text-left ${selectedProject === p.id ? 'text-red-700' : 'text-neutral-700'}`}><span className="truncate text-sm font-semibold">{p.name}</span><span className="shrink-0 text-xs text-neutral-500">{p.region} · {currency(p.investmentValue)}</span></button>)}</div></div>
              : <div className="mt-5 overflow-x-auto border-y border-neutral-300"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-neutral-300 text-xs font-bold uppercase tracking-wider text-neutral-600"><tr>{([['name', 'Project'], ['sector', 'Sector'], ['region', 'Region'], ['investmentValue', 'Investment'], ['plannedEmployment', 'Employment']] as [SortField, string][]).map(([field, label]) => <th key={field} className="px-5 py-4 font-bold"><button onClick={() => setSort(field)} className="inline-flex items-center gap-1.5 hover:text-red-700">{label}{sortField === field && (descending ? <ArrowDownIcon className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowUpIcon className="h-3.5 w-3.5" aria-hidden="true" />)}</button></th>)}<th className="px-5 py-4 font-bold">Status</th></tr></thead><tbody className="divide-y divide-neutral-200">{sorted.map((p) => <tr key={p.id} className="hover:bg-neutral-50"><td className="px-5 py-4"><p className="font-semibold text-black">{p.name}</p><p className="mt-0.5 text-xs text-neutral-500">{p.company} · {p.district}</p></td><td className="px-5 py-4 text-sm">{p.sector}</td><td className="px-5 py-4 text-sm">{p.region}</td><td className="px-5 py-4 text-sm font-semibold">{currency(p.investmentValue)}</td><td className="px-5 py-4 text-sm">{p.plannedEmployment.toLocaleString()}</td><td className="px-5 py-4"><StatusLabel status={p.status} /></td></tr>)}</tbody></table></div>}
            <p className="mt-5 text-xs leading-5 text-neutral-500">Directory figures are provided for initial exploration. Confirm project status, investment terms and other details with the relevant agency or project promoter.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
