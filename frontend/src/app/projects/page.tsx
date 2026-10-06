'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ugandaRegions } from '@/data/mock/projects';
import { useProjects } from '@/hooks/useProjects';
import { ProjectStatus } from '@/types';
import DynamicLeafletMap from '@/components/projects/DynamicLeafletMap';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapIcon,
  TableCellsIcon,
  Squares2X2Icon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentArrowDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

type ViewMode = 'map' | 'table' | 'cards';
type SortField = 'name' | 'investmentValue' | 'plannedEmployment' | 'sector' | 'region';
type SortOrder = 'asc' | 'desc';

const sectors = ['Agriculture', 'Tourism', 'Mining', 'ICT', 'Manufacturing', 'Energy'];
const investmentRanges = [
  { label: 'Under $5M', min: 0, max: 5000000 },
  { label: '$5M - $15M', min: 5000000, max: 15000000 },
  { label: '$15M - $30M', min: 15000000, max: 30000000 },
  { label: 'Over $30M', min: 30000000, max: Infinity }
];
const statuses: ProjectStatus[] = ['active', 'under_construction', 'planned', 'completed'];

const linkClass =
  'font-semibold text-black underline decoration-yellow-400 decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

const inputClass =
  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black placeholder-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1';

const checkboxClass = 'h-4 w-4 cursor-pointer accent-black';

/** A single applied filter, removable on its own. */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 border border-black bg-white py-0.5 pl-2.5 pr-1 text-xs font-medium text-black">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="p-0.5 text-neutral-600 hover:text-red-600"
      >
        <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </span>
  );
}

export default function ProjectsPage() {
  const { data: projects } = useProjects();
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedInvestmentRange, setSelectedInvestmentRange] = useState<string>('');
  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('investmentValue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSector = selectedSectors.length === 0 || selectedSectors.includes(project.sector);
      const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(project.region);
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(project.status);

      let matchesInvestment = true;
      if (selectedInvestmentRange) {
        const range = investmentRanges.find((r) => r.label === selectedInvestmentRange);
        if (range) {
          matchesInvestment = project.investmentValue >= range.min && project.investmentValue < range.max;
        }
      }

      return matchesSearch && matchesSector && matchesRegion && matchesStatus && matchesInvestment;
    });
  }, [projects, searchQuery, selectedSectors, selectedRegions, selectedInvestmentRange, selectedStatuses]);

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProjects, sortField, sortOrder]);

  const totalInvestment = filteredProjects.reduce((sum, p) => sum + p.investmentValue, 0);
  const totalEmployment = filteredProjects.reduce((sum, p) => sum + p.plannedEmployment, 0);

  // How many projects each option would match, so a filter that can only ever
  // return nothing is visibly empty before it is clicked.
  const counts = useMemo(() => {
    const tally = (pick: (p: (typeof projects)[number]) => string | undefined) =>
      projects.reduce<Record<string, number>>((acc, p) => {
        const k = pick(p);
        if (k) acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      }, {});
    return {
      sector: tally((p) => p.sector),
      region: tally((p) => p.region),
      status: tally((p) => p.status),
    };
  }, [projects]);

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const toggleStatus = (status: ProjectStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSectors([]);
    setSelectedRegions([]);
    setSelectedInvestmentRange('');
    setSelectedStatuses([]);
  };

  const hasFilters =
    searchQuery !== '' ||
    selectedSectors.length > 0 ||
    selectedRegions.length > 0 ||
    selectedInvestmentRange !== '' ||
    selectedStatuses.length > 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSectorColor = (sector: string): string => {
    const colors: Record<string, string> = {
      Agriculture: '#FBBF24',
      Tourism: '#F97316',
      Mining: '#EF4444',
      ICT: '#FDE047',
      Manufacturing: '#DC2626',
      Energy: '#FB923C'
    };
    return colors[sector] || '#F59E0B';
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const badges = {
      active: 'bg-yellow-100 text-black border-yellow-400',
      under_construction: 'bg-red-50 text-red-700 border-red-300',
      planned: 'bg-neutral-100 text-neutral-800 border-neutral-400',
      completed: 'bg-white text-neutral-700 border-neutral-400'
    };
    const labels = {
      active: 'Active',
      under_construction: 'Under construction',
      planned: 'Planned',
      completed: 'Completed'
    };
    return { className: badges[status], label: labels[status] };
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const openProject = (id: string, scrollToMap = false) => {
    setSelectedProject(id);
    if (scrollToMap) mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /** Sector dot + status badge + location, shared by every list view. */
  const ProjectMeta = ({ project }: { project: (typeof sortedProjects)[number] }) => {
    const badge = getStatusBadge(project.status);
    return (
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-700">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: getSectorColor(project.sector) }} aria-hidden="true" />
          {project.sector}
        </span>
        <span className={`border px-2 py-0.5 font-semibold ${badge.className}`}>{badge.label}</span>
        <span className="text-neutral-600">{project.district}, {project.region}</span>
      </p>
    );
  };

  /** Two-column detail list used for the cards view and the map's project list. */
  const ProjectDetail = ({ project, onOpen }: { project: (typeof sortedProjects)[number]; onOpen: () => void }) => {
    const isSelected = selectedProject === project.id;
    return (
      <article
        onClick={onOpen}
        className={`cursor-pointer border-t-2 pt-5 transition-colors ${isSelected ? 'border-red-600' : 'border-neutral-200 hover:border-black'}`}
      >
        <h3 className="text-base font-bold leading-snug text-black">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            className="text-left underline decoration-yellow-400 decoration-2 underline-offset-4 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-sm"
          >
            {project.name}
          </button>
        </h3>
        {project.company !== project.name && (
          <p className="mt-1 text-sm text-neutral-700">{project.company}</p>
        )}
        <ProjectMeta project={project} />
        <dl className="mt-4 grid grid-cols-2 gap-4 border-l-4 border-yellow-400 bg-neutral-50 py-3 pl-4 pr-3 text-sm">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">Investment</dt>
            <dd className="mt-0.5 font-bold text-black">{formatCurrency(project.investmentValue)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">Employment</dt>
            <dd className="mt-0.5 font-bold text-black">{project.plannedEmployment.toLocaleString()}</dd>
          </div>
        </dl>
        {project.industrialPark && (
          <p className="mt-3 text-xs text-neutral-600">{project.industrialPark}</p>
        )}
      </article>
    );
  };

  const SortHeader = ({ field, label, align = 'left' }: { field: SortField; label: string; align?: 'left' | 'right' }) => (
    <th scope="col" aria-sort={sortField === field ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-black ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button
        type="button"
        onClick={() => handleSort(field)}
        className={`inline-flex items-center gap-1 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${align === 'right' ? 'flex-row-reverse' : ''}`}
      >
        {label}
        {sortField === field && (sortOrder === 'asc' ? <ArrowUpIcon className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowDownIcon className="h-3.5 w-3.5" aria-hidden="true" />)}
      </button>
    </th>
  );

  const selectedDetail = selectedProject ? sortedProjects.find((p) => p.id === selectedProject) : undefined;

  return (
 <div className="min-h-screen bg-white text-black">
      {/* Breadcrumb band */}
      <div className="border-b border-neutral-200 bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-[1800px] px-4 py-4 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-red-600 hover:underline underline-offset-4">Home</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li className="font-semibold text-black" aria-current="page">Projects</li>
          </ol>
        </nav>
      </div>

      <div className="mx-auto max-w-[1800px] px-4 pb-20 pt-10 sm:px-6 lg:px-8 sm:pt-14">
        {/* Title and summary */}
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Licensed projects database</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700 sm:text-lg">
            Explore licensed investment projects across Uganda.
          </p>
        </header>

        <dl className="mt-10 grid grid-cols-1 gap-x-10 gap-y-6 border-y border-neutral-200 py-6 md:grid-cols-3">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-red-600">Licensed projects</dt>
            <dd className="mt-1 text-3xl font-bold text-black sm:text-4xl">{filteredProjects.length}</dd>
            <p className="mt-1 text-sm text-neutral-600">of {projects.length} total projects</p>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-red-600">Total investment</dt>
            <dd className="mt-1 text-3xl font-bold text-black sm:text-4xl">${(totalInvestment / 1000000000).toFixed(2)}B</dd>
            <p className="mt-1 text-sm text-neutral-600">combined capital value</p>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-red-600">Total employment</dt>
            <dd className="mt-1 text-3xl font-bold text-black sm:text-4xl">{totalEmployment.toLocaleString()}</dd>
            <p className="mt-1 text-sm text-neutral-600">jobs created and planned</p>
          </div>
        </dl>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row">
          {/* Filters: plain column with rules; becomes a full-height drawer on mobile */}
          {showFilters && (
            <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setShowFilters(false)} />
          )}
          <aside
            aria-label="Project filters"
            className={`${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto border-r border-neutral-200 bg-white p-6 transition-all duration-300 lg:relative lg:z-auto lg:max-h-none lg:w-72 lg:shrink-0 lg:overflow-visible lg:border-0 lg:p-0 ${showFilters ? '' : 'lg:hidden'}`}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-black">
                <FunnelIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                aria-label="Hide filters"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-neutral-600 hover:text-red-600 lg:hidden"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <label htmlFor="search" className="mb-2 block text-sm font-bold text-black">Search</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <fieldset>
                <legend className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold text-black">Sector</legend>
                <div className="space-y-2.5">
                  {sectors.map((sector) => (
                    <label key={sector} className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-800">
                      <input type="checkbox" checked={selectedSectors.includes(sector)} onChange={() => toggleSector(sector)} className={checkboxClass} />
                      <span className="flex-1">{sector}</span>
                      <span className="text-xs tabular-nums text-neutral-600">{counts.sector[sector] ?? 0}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold text-black">Region</legend>
                <div className="space-y-2.5">
                  {ugandaRegions.map((region) => (
                    <label key={region} className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-800">
                      <input type="checkbox" checked={selectedRegions.includes(region)} onChange={() => toggleRegion(region)} className={checkboxClass} />
                      <span className="flex-1">{region}</span>
                      <span className="text-xs tabular-nums text-neutral-600">{counts.region[region] ?? 0}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold text-black">Investment size</legend>
                <div className="space-y-2.5">
                  {investmentRanges.map((range) => (
                    <label key={range.label} className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-800">
                      <input
                        type="radio"
                        name="investment"
                        checked={selectedInvestmentRange === range.label}
                        onChange={() => setSelectedInvestmentRange(range.label)}
                        className={checkboxClass}
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold text-black">Status</legend>
                <div className="space-y-2.5">
                  {statuses.map((status) => {
                    const badge = getStatusBadge(status);
                    return (
                      <label key={status} className="flex cursor-pointer items-center gap-2.5 text-sm">
                        <input type="checkbox" checked={selectedStatuses.includes(status)} onChange={() => toggleStatus(status)} className={checkboxClass} />
                        <span className={`border px-2 py-0.5 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                        <span className="ml-auto text-xs tabular-nums text-neutral-600">{counts.status[status] ?? 0}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="border-t border-neutral-200 pt-6">
                <p className="text-sm font-bold text-black" aria-live="polite">
                  {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
                </p>
                {hasFilters && (
                  <button type="button" onClick={clearFilters} className={`${linkClass} mt-2 text-sm`}>
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 border-b-2 border-black pb-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div role="group" aria-label="View" className="flex items-center gap-1">
                  {([
                    { mode: 'map', label: 'Map', icon: MapIcon },
                    { mode: 'table', label: 'Table', icon: TableCellsIcon },
                    { mode: 'cards', label: 'Cards', icon: Squares2X2Icon },
                  ] as const).map(({ mode, label, icon: Icon }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setViewMode(mode)}
                      aria-pressed={viewMode === mode}
                      className={`inline-flex min-h-[44px] items-center gap-2 border-b-2 px-3 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${viewMode === mode ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-700 hover:text-red-600'}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-neutral-700">
                    <span className="hidden sm:inline">Sort by</span>
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value as SortField)}
                      aria-label="Sort projects by"
                      className="min-h-[44px] rounded-md border border-neutral-300 bg-white px-2 py-2 text-sm text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    >
                      <option value="investmentValue">Investment</option>
                      <option value="plannedEmployment">Employment</option>
                      <option value="name">Name</option>
                      <option value="sector">Sector</option>
                      <option value="region">Region</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                    aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center border border-neutral-300 text-neutral-800 hover:border-black focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  >
                    {sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" aria-hidden="true" /> : <ArrowDownIcon className="h-4 w-4" aria-hidden="true" />}
                  </button>
                  {!showFilters && (
                    <button
                      type="button"
                      onClick={() => setShowFilters(true)}
                      className="inline-flex min-h-[44px] items-center gap-2 border border-neutral-300 px-3 text-sm font-semibold text-neutral-800 hover:border-black"
                    >
                      <FunnelIcon className="h-4 w-4" aria-hidden="true" />
                      Show filters
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['Project Name', 'Company', 'Sector', 'Region', 'District', 'Investment Value (USD)', 'Employment', 'Status', 'Industrial Park'];
                      const rows = sortedProjects.map((p) => [
                        `"${p.name.replace(/"/g, '""')}"`,
                        `"${p.company.replace(/"/g, '""')}"`,
                        p.sector,
                        p.region,
                        p.district,
                        p.investmentValue,
                        p.plannedEmployment,
                        p.status.replace('_', ' '),
                        p.industrialPark || '',
                      ]);
                      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex min-h-[44px] items-center gap-2 bg-black px-4 text-sm font-bold text-yellow-400 hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" aria-hidden="true" />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="relative max-w-md">
                <label htmlFor="quick-search" className="sr-only">Search projects</label>
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
                <input
                  id="quick-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, company or district"
                  className={`${inputClass} pl-9`}
                />
              </div>

              {/* Active filters: each chip removes just that one filter */}
              {hasFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">Filtered by</span>
                  {searchQuery && (
                    <FilterChip label={`“${searchQuery}”`} onRemove={() => setSearchQuery('')} />
                  )}
                  {selectedSectors.map((s) => (
                    <FilterChip key={`s-${s}`} label={s} onRemove={() => toggleSector(s)} />
                  ))}
                  {selectedRegions.map((r) => (
                    <FilterChip key={`r-${r}`} label={r} onRemove={() => toggleRegion(r)} />
                  ))}
                  {selectedInvestmentRange && (
                    <FilterChip label={selectedInvestmentRange} onRemove={() => setSelectedInvestmentRange('')} />
                  )}
                  {selectedStatuses.map((st) => (
                    <FilterChip key={`st-${st}`} label={getStatusBadge(st).label} onRemove={() => toggleStatus(st)} />
                  ))}
                  <button type="button" onClick={clearFilters} className={`${linkClass} ml-1 text-xs`}>
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {sortedProjects.length === 0 ? (
              <div className="border-l-4 border-red-600 bg-neutral-50 p-6 mt-8">
                <h3 className="text-lg font-bold text-black">No projects match these filters</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-700">
                  {projects.length === 0
                    ? 'The licensed projects database is not available right now. Please try again shortly.'
                    : `None of the ${projects.length} licensed projects match your current selection. Try removing a filter or broadening the investment range.`}
                </p>
                {hasFilters && (
                  <button type="button" onClick={clearFilters} className={`${linkClass} mt-4 inline-block text-sm`}>
                    Clear all filters
                  </button>
                )}
              </div>
            ) : viewMode === 'cards' ? (
              /* Cards view: detail list */
              <div className="mt-10 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
                {sortedProjects.map((project) => (
                  <ProjectDetail key={project.id} project={project} onOpen={() => openProject(project.id)} />
                ))}
              </div>
            ) : viewMode === 'map' ? (
              <div ref={mapRef} className="relative mt-8">
                <DynamicLeafletMap
                  projects={sortedProjects}
                  selectedProject={selectedProject}
                  onSelectProject={setSelectedProject}
                  getSectorColor={getSectorColor}
                  formatCurrency={formatCurrency}
                />

                {/* Selected project summary (mobile) */}
                {selectedDetail && (
                  <div className="absolute inset-x-0 bottom-0 z-[1000] border-t-4 border-yellow-400 bg-white p-4 shadow-lg sm:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold leading-tight text-black">{selectedDetail.name}</h3>
                        {selectedDetail.company !== selectedDetail.name && (
                          <p className="text-xs text-neutral-700">{selectedDetail.company}</p>
                        )}
                      </div>
                      <button type="button" onClick={() => setSelectedProject(null)} aria-label="Close project summary" className="p-1 text-neutral-700 hover:text-red-600">
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                    <ProjectMeta project={selectedDetail} />
                    <dl className="mt-3 flex items-center gap-6 text-sm">
                      <div>
                        <dt className="text-xs text-neutral-600">Investment</dt>
                        <dd className="font-bold text-black">{formatCurrency(selectedDetail.investmentValue)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-neutral-600">Employment</dt>
                        <dd className="font-bold text-black">{selectedDetail.plannedEmployment.toLocaleString()}</dd>
                      </div>
                    </dl>
                  </div>
                )}

                {/* Mobile: horizontal scrollable project chips */}
                <div className="mt-4 overflow-x-auto border-t border-neutral-200 pt-4 sm:hidden">
                  <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>
                    {sortedProjects.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => openProject(project.id, true)}
                        aria-pressed={selectedProject === project.id}
                        className={`flex-shrink-0 border px-3 py-2 text-left transition-colors ${selectedProject === project.id ? 'border-black bg-yellow-100' : 'border-neutral-300 bg-white hover:border-black'}`}
                      >
                        <p className="max-w-[160px] truncate text-xs font-semibold text-black">{project.name}</p>
                        <p className="text-xs font-bold text-black">{formatCurrency(project.investmentValue)}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desktop: project list below the map */}
                <section className="mt-10 hidden sm:block" aria-labelledby="all-projects-heading">
                  <h3 id="all-projects-heading" className="mb-6 border-b border-neutral-200 pb-3 text-lg font-bold text-black">
                    All projects ({sortedProjects.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
                    {sortedProjects.map((project) => (
                      <ProjectDetail key={project.id} project={project} onOpen={() => openProject(project.id, true)} />
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              <>
                {/* Mobile: detail list */}
                <div className="mt-8 md:hidden">
                  <div className="divide-y divide-neutral-200">
                    {sortedProjects.map((project) => {
                      const badge = getStatusBadge(project.status);
                      return (
                        <article key={project.id} className="py-5">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm font-bold leading-tight text-black">{project.name}</h3>
                            <span className={`shrink-0 border px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${badge.className}`}>{badge.label}</span>
                          </div>
                          {project.company !== project.name && (
                            <p className="mt-1 text-xs text-neutral-700">{project.company}</p>
                          )}
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-700">
                            <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: getSectorColor(project.sector) }} aria-hidden="true" />
                            {project.sector} · {project.region} · {project.district}
                          </p>
                          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <dt className="text-xs text-neutral-600">Investment</dt>
                              <dd className="font-bold text-black">{formatCurrency(project.investmentValue)}</dd>
                            </div>
                            <div>
                              <dt className="text-xs text-neutral-600">Employment</dt>
                              <dd className="font-bold text-black">{project.plannedEmployment.toLocaleString()}</dd>
                            </div>
                          </dl>
                        </article>
                      );
                    })}
                  </div>
                </div>

                {/* Desktop: table */}
                <div className="mt-8 hidden overflow-x-auto md:block">
                  <table className="w-full border-collapse text-left">
                    <thead className="border-b-2 border-black">
                      <tr>
                        <SortHeader field="name" label="Project name" />
                        <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-black">Company</th>
                        <SortHeader field="sector" label="Sector" />
                        <SortHeader field="region" label="Region" />
                        <SortHeader field="investmentValue" label="Investment" align="right" />
                        <th scope="col" className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-black">Status</th>
                        <SortHeader field="plannedEmployment" label="Employment" align="right" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {sortedProjects.map((project) => {
                        const badge = getStatusBadge(project.status);
                        return (
                          <tr key={project.id} className="transition-colors hover:bg-neutral-50">
                            <td className="whitespace-nowrap px-4 py-4">
                              <div className="text-sm font-semibold text-black">{project.name}</div>
                              <div className="text-sm text-neutral-600">{project.district}</div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-sm text-neutral-800">{project.company}</td>
                            <td className="whitespace-nowrap px-4 py-4">
                              <span className="inline-flex items-center gap-1.5 text-sm text-neutral-800">
                                <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: getSectorColor(project.sector) }} aria-hidden="true" />
                                {project.sector}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-sm text-neutral-800">{project.region}</td>
                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-black">{formatCurrency(project.investmentValue)}</td>
                            <td className="whitespace-nowrap px-4 py-4 text-center">
                              <span className={`inline-flex border px-2 py-0.5 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-black">{project.plannedEmployment.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
