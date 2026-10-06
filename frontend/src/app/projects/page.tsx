'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ugandaRegions } from '@/data/mock/projects';
import { useProjects } from '@/hooks/useProjects';
import type { LicensedProject, ProjectStatus } from '@/types';
import DynamicLeafletMap from '@/components/projects/DynamicLeafletMap';
import {
  ArrowDownIcon, ArrowUpIcon, BuildingOffice2Icon, FunnelIcon, MapIcon,
  MagnifyingGlassIcon, Squares2X2Icon, TableCellsIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

type ViewMode = 'map' | 'cards' | 'table';
type SortField = 'name' | 'investmentValue' | 'plannedEmployment' | 'sector' | 'region';
const statuses: ProjectStatus[] = ['active', 'under_construction', 'planned', 'completed'];
const statusLabels: Record<ProjectStatus, string> = {
  active: 'Operational', under_construction: 'In progress', planned: 'Planned', completed: 'Completed',
};
const ranges = [
  { label: 'Under $5M', min: 0, max: 5_000_000 },
  { label: '$5M–$15M', min: 5_000_000, max: 15_000_000 },
  { label: '$15M–$30M', min: 15_000_000, max: 30_000_000 },
  { label: '$30M and above', min: 30_000_000, max: Infinity },
];
const statusStyle: Record<ProjectStatus, string> = {
  active: 'bg-yellow-400 text-black ring-yellow-500',
  under_construction: 'bg-red-50 text-red-700 ring-red-200',
  planned: 'bg-white text-black ring-neutral-400',
  completed: 'bg-neutral-100 text-neutral-700 ring-neutral-200',
};
const sectorColors: Record<string, string> = {
  Agriculture: '#FFD700', Tourism: '#000000', Mining: '#CE1126', ICT: '#8A7200',
  Manufacturing: '#5E0811', Energy: '#737373',
};
const currency = (value: number) => value >= 1_000_000
  ? `$${(value / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`
  : `$${(value / 1_000).toLocaleString(undefined, { maximumFractionDigits: 0 })}K`;

function StatusPill({ status }: { status: ProjectStatus }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle[status]}`}>{statusLabels[status]}</span>;
}

export default function ProjectsPage() {
  const { data: projects, loading, error } = useProjects();
  const [view, setView] = useState<ViewMode>('cards');
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
  const exportCsv = () => {
    const headers = ['Project Name', 'Company', 'Sector', 'Region', 'District', 'Investment USD', 'Employment', 'Status'];
    const rows = sorted.map((p) => [p.name, p.company, p.sector, p.region, p.district, p.investmentValue, p.plannedEmployment, statusLabels[p.status]]);
    const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const blob = new Blob([[headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'uganda-projects.csv'; anchor.click(); URL.revokeObjectURL(url);
  };

  const ProjectCard = ({ project }: { project: LicensedProject }) => (
    <article className={`group border-b border-neutral-200 py-5 transition-colors ${selectedProject === project.id ? 'border-l-2 border-l-red-700 pl-4' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-neutral-600">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sectorColor(project.sector) }} />{project.sector}
        </span>
        <StatusPill status={project.status} />
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold leading-snug text-neutral-900">{project.name}</h3>
      <p className="mt-1 text-sm text-neutral-500">{project.company}</p>
      <p className="mt-4 flex items-center gap-1.5 text-sm text-neutral-600">
        <MapIcon className="h-4 w-4 text-neutral-400" />{project.district}{project.district ? ', ' : ''}{project.region}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-neutral-200 pt-4">
        <div><p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Investment</p><p className="mt-1 text-lg font-bold text-neutral-900">{currency(project.investmentValue)}</p></div>
        <div><p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Employment</p><p className="mt-1 text-lg font-bold text-neutral-900">{project.plannedEmployment.toLocaleString()}</p></div>
      </div>
      {project.industrialPark && <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-500">{project.industrialPark}</p>}
      <button type="button" onClick={() => { setSelectedProject(project.id); setView('map'); setTimeout(() => mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }} className="mt-4 text-sm font-semibold text-red-700 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">View on map <span aria-hidden="true">→</span></button>
    </article>
  );

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="border-b border-neutral-200 bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-5 py-3 text-sm text-neutral-500 sm:px-8">
          <Link href="/" className="hover:text-red-700">Home</Link><span className="mx-2 text-neutral-300">/</span><span className="font-medium text-neutral-800" aria-current="page">Projects</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
        <header className="relative overflow-hidden bg-black px-6 py-9 text-white sm:px-10 sm:py-12">
          <div className="absolute -right-14 -top-24 h-72 w-72 rounded-full border-[40px] border-white/5" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">Uganda investment directory</p>
            <h1 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight sm:text-5xl">Find a Project to Invest In</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80 sm:text-base sm:leading-7">Explore licensed projects across Uganda. Search by company, sector or location, compare investment and employment figures, and use the map to see where opportunities are based.</p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-white/10 px-3 py-1.5">Updated project directory</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">Filter by sector and region</span>
            </div>
          </div>
        </header>

        <section aria-label="Project summary" className="grid grid-cols-1 border-b border-neutral-300 sm:grid-cols-3">
          {[
            { label: 'Projects in View', value: loading ? '—' : filtered.length.toLocaleString(), note: `of ${projects.length.toLocaleString()} listed` },
            { label: 'Investment Represented', value: loading ? '—' : `$${(investment / 1_000_000_000).toFixed(2)}B`, note: 'combined project value' },
            { label: 'Employment', value: loading ? '—' : jobs.toLocaleString(), note: 'planned and current jobs' },
          ].map((item) => <div key={item.label} className="border-b border-neutral-200 py-5 sm:border-b-0 sm:border-r sm:px-6 sm:py-6 first:sm:pl-0 last:border-0"><p className="text-sm font-medium text-neutral-500">{item.label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">{item.value}</p><p className="mt-1 text-xs text-neutral-400">{item.note}</p></div>)}
        </section>

        <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className={`${filtersOpen ? 'block' : 'hidden'} w-full shrink-0 border-b border-neutral-300 pb-6 lg:block lg:w-64 lg:border-b-0 lg:border-r lg:pr-6 lg:pb-0`} aria-label="Project filters">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4"><h2 className="flex items-center gap-2 font-display text-lg font-semibold"> <FunnelIcon className="h-4 w-4 text-red-700" />Filters</h2>{hasFilters && <button onClick={clearFilters} className="text-xs font-semibold text-red-700 hover:underline">Reset</button>}</div>
            <label htmlFor="project-search" className="mb-2 mt-5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">Search</label>
            <div className="relative"><MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" /><input id="project-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, company, place" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15" /></div>
            <fieldset className="mt-6"><legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Sector</legend><div className="max-h-48 space-y-2 overflow-y-auto">{availableSectors.map((sector) => <label key={sector} className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700"><input type="checkbox" checked={sectors.includes(sector)} onChange={() => toggle(sectors, sector, setSectors)} className="h-4 w-4 accent-black" /><span className="h-2 w-2 rounded-full" style={{ backgroundColor: sectorColor(sector) }} />{sector}</label>)}</div></fieldset>
            <fieldset className="mt-6 border-t border-neutral-100 pt-5"><legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Region</legend><div className="space-y-2">{ugandaRegions.map((region) => <label key={region} className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700"><input type="checkbox" checked={regions.includes(region)} onChange={() => toggle(regions, region, setRegions)} className="h-4 w-4 accent-black" />{region}</label>)}</div></fieldset>
            <fieldset className="mt-6 border-t border-neutral-100 pt-5"><legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Investment Size</legend><select value={investmentRange} onChange={(e) => setInvestmentRange(e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-red-700"><option value="">Any Investment</option>{ranges.map((range) => <option key={range.label} value={range.label}>{range.label}</option>)}</select></fieldset>
            <fieldset className="mt-6 border-t border-neutral-100 pt-5"><legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Project Status</legend><div className="space-y-2.5">{statuses.map((status) => <label key={status} className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700"><input type="checkbox" checked={statusFilters.includes(status)} onChange={() => toggle(statusFilters, status, setStatusFilters)} className="h-4 w-4 accent-black" />{statusLabels[status]}</label>)}</div></fieldset>
          </aside>

          <section className="min-w-0 flex-1" aria-label="Projects">
            <div className="border-y border-neutral-300 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div><h2 className="font-display text-xl font-semibold uppercase">Explore Projects</h2><p className="mt-0.5 text-sm text-neutral-500">{loading ? 'Loading directory…' : `${filtered.length} ${filtered.length === 1 ? 'project' : 'projects'} found`}</p></div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setFiltersOpen((open) => !open)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 lg:hidden"><FunnelIcon className="h-4 w-4" />Filters</button>
                <div role="group" aria-label="Display mode" className="flex border-b border-neutral-200">{([{ mode: 'cards', label: 'List', Icon: Squares2X2Icon }, { mode: 'map', label: 'Map', Icon: MapIcon }, { mode: 'table', label: 'Table', Icon: TableCellsIcon }] as const).map(({ mode, label, Icon }) => <button key={mode} type="button" onClick={() => setView(mode)} aria-pressed={view === mode} className={`inline-flex h-10 items-center gap-1.5 border-b-2 px-2.5 text-xs font-semibold sm:px-3 ${view === mode ? 'border-red-700 text-red-700' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}><Icon className="h-4 w-4" /><span className="hidden sm:inline">{label}</span></button>)}</div>
                  <label className="sr-only" htmlFor="sort-projects">Sort projects</label><select id="sort-projects" value={sortField} onChange={(e) => { setSortField(e.target.value as SortField); setDescending(e.target.value === 'investmentValue' || e.target.value === 'plannedEmployment'); }} className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-red-700"><option value="investmentValue">Investment</option><option value="plannedEmployment">Employment</option><option value="name">Name</option><option value="sector">Sector</option><option value="region">Region</option></select>
                  <button type="button" onClick={() => setDescending((value) => !value)} aria-label={descending ? 'Sort ascending' : 'Sort descending'} className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50">{descending ? <ArrowDownIcon className="h-4 w-4" /> : <ArrowUpIcon className="h-4 w-4" />}</button>
                  <button type="button" onClick={exportCsv} className="h-10 rounded-xl bg-black px-4 text-sm font-semibold text-white hover:bg-neutral-800">Export CSV</button>
                </div>
              </div>
              {hasFilters && <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3"><span className="mr-1 text-xs font-medium text-neutral-400">Active filters</span>{search && <button onClick={() => setSearch('')} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">{search} <XMarkIcon className="ml-1 inline h-3 w-3" /></button>}{sectors.map((v) => <button key={v} onClick={() => toggle(sectors, v, setSectors)} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">{v} <XMarkIcon className="ml-1 inline h-3 w-3" /></button>)}{regions.map((v) => <button key={v} onClick={() => toggle(regions, v, setRegions)} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">{v} <XMarkIcon className="ml-1 inline h-3 w-3" /></button>)}{investmentRange && <button onClick={() => setInvestmentRange('')} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">{investmentRange} <XMarkIcon className="ml-1 inline h-3 w-3" /></button>}{statusFilters.map((v) => <button key={v} onClick={() => toggle(statusFilters, v, setStatusFilters)} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">{statusLabels[v]} <XMarkIcon className="ml-1 inline h-3 w-3" /></button>)}<button onClick={clearFilters} className="px-2 text-xs font-semibold text-red-700">Clear all</button></div>}
            </div>

            {error && <div role="status" className="mt-5 border-l-2 border-yellow-500 bg-yellow-50 p-4 text-sm text-black">Project Data Could Not Be Loaded. Please try again shortly.</div>}
            {loading ? <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-neutral-200/70" />)}</div>
              : sorted.length === 0 ? <div className="mt-6 border-y border-neutral-300 px-6 py-16 text-center"><BuildingOffice2Icon className="mx-auto h-10 w-10 text-neutral-300" /><h2 className="mt-4 font-display text-xl font-semibold">{projects.length ? 'No Projects Match These Filters' : 'No Project Records Available'}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">{projects.length ? 'Try changing your search or removing a filter.' : 'Project listings will appear here when data is available.'}</p>{hasFilters && <button onClick={clearFilters} className="mt-4 text-sm font-semibold text-red-700 hover:underline">Clear Filters</button>}</div>
              : view === 'cards' ? <div className="mt-5 grid gap-x-8 sm:grid-cols-2 xl:grid-cols-3">{sorted.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
              : view === 'map' ? <div ref={mapRef} className="mt-5 border-y border-neutral-300 py-2"><DynamicLeafletMap projects={sorted} selectedProject={selectedProject} onSelectProject={setSelectedProject} getSectorColor={sectorColor} formatCurrency={currency} /><div className="mt-3 divide-y divide-neutral-200 border-t border-neutral-200 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0">{sorted.slice(0, 6).map((p) => <button key={p.id} onClick={() => setSelectedProject(p.id)} className={`flex justify-between gap-4 py-3 text-left ${selectedProject === p.id ? 'text-red-700' : 'text-neutral-700'}`}><span className="truncate text-sm font-semibold">{p.name}</span><span className="shrink-0 text-xs text-neutral-500">{p.region} · {currency(p.investmentValue)}</span></button>)}</div></div>
              : <div className="mt-5 overflow-x-auto border-y border-neutral-300"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-neutral-300 text-xs uppercase tracking-wide text-neutral-500"><tr>{([['name', 'Project'], ['sector', 'Sector'], ['region', 'Region'], ['investmentValue', 'Investment'], ['plannedEmployment', 'Employment']] as [SortField, string][]).map(([field, label]) => <th key={field} className="px-5 py-4 font-semibold"><button onClick={() => setSort(field)} className="inline-flex items-center gap-1.5 hover:text-red-700">{label}{sortField === field && (descending ? <ArrowDownIcon className="h-3.5 w-3.5" /> : <ArrowUpIcon className="h-3.5 w-3.5" />)}</button></th>)}<th className="px-5 py-4 font-semibold">Status</th></tr></thead><tbody className="divide-y divide-neutral-200">{sorted.map((p) => <tr key={p.id} className="hover:bg-neutral-100/60"><td className="px-5 py-4"><p className="font-semibold text-neutral-900">{p.name}</p><p className="mt-0.5 text-xs text-neutral-500">{p.company} · {p.district}</p></td><td className="px-5 py-4 text-sm">{p.sector}</td><td className="px-5 py-4 text-sm">{p.region}</td><td className="px-5 py-4 text-sm font-semibold">{currency(p.investmentValue)}</td><td className="px-5 py-4 text-sm">{p.plannedEmployment.toLocaleString()}</td><td className="px-5 py-4"><StatusPill status={p.status} /></td></tr>)}</tbody></table></div>}
            <p className="mt-5 text-xs leading-5 text-neutral-400">Directory figures are provided for initial exploration. Confirm project status, investment terms and other details with the relevant agency or project promoter.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
