'use client';

import { useState, useMemo, useRef } from 'react';
import { ugandaRegions } from '@/data/mock/projects';
import { useProjects } from '@/hooks/useProjects';
import { ProjectStatus } from '@/types';
import ProjectCard from '@/components/projects/ProjectCard';
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
      active: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      under_construction: 'bg-red-500/20 text-red-400 border-red-500/40',
      planned: 'bg-yellow-300/20 text-yellow-300 border-yellow-300/40',
      completed: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/40'
    };
    const labels = {
      active: 'Active',
      under_construction: 'Under Construction',
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

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-12 bg-gradient-to-b from-yellow-400 via-red-600 to-black rounded-full" />
            <div>
              <h1 className="text-4xl font-bold text-white">Licensed Projects Database</h1>
              <p className="text-lg text-neutral-400">
                Explore licensed investment projects across Uganda
              </p>
            </div>
          </div>

          {/* Hero Summary Stats */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-red-950 rounded-2xl shadow-lg p-8 border border-neutral-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center md:text-left border-l-4 border-yellow-500 pl-6">
                <p className="text-yellow-500 text-sm font-bold uppercase tracking-widest mb-2">Licensed Projects</p>
                <p className="text-5xl lg:text-6xl font-black text-white">{filteredProjects.length}</p>
                <p className="text-neutral-500 text-sm mt-1">of {projects.length} total projects</p>
              </div>
              <div className="text-center md:text-left border-l-4 border-red-600 pl-6">
                <p className="text-red-500 text-sm font-bold uppercase tracking-widest mb-2">Total Investment</p>
                <p className="text-5xl lg:text-6xl font-black text-white">${(totalInvestment / 1000000000).toFixed(2)}B</p>
                <p className="text-neutral-500 text-sm mt-1">combined capital value</p>
              </div>
              <div className="text-center md:text-left border-l-4 border-yellow-500 pl-6">
                <p className="text-yellow-500 text-sm font-bold uppercase tracking-widest mb-2">Total Employment</p>
                <p className="text-5xl lg:text-6xl font-black text-white">{totalEmployment.toLocaleString()}</p>
                <p className="text-neutral-500 text-sm mt-1">jobs created &amp; planned</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'lg:w-80' : 'lg:w-0'} transition-all duration-300 overflow-hidden`}>
            <div className="bg-neutral-900 rounded-xl shadow-lg p-6 sticky top-6 border border-neutral-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FunnelIcon className="w-6 h-6 text-yellow-500" />
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-neutral-400 hover:text-white"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-neutral-300 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search projects..."
                      className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-neutral-300 mb-3">Sector</p>
                  <div className="space-y-2">
                    {sectors.map((sector) => (
                      <label key={sector} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSectors.includes(sector)}
                          onChange={() => toggleSector(sector)}
                          className="w-4 h-4 text-yellow-500 bg-neutral-800 border-neutral-600 rounded focus:ring-yellow-500"
                        />
                        <span className="text-sm text-neutral-300">{sector}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-neutral-300 mb-3">Region</p>
                  <div className="space-y-2">
                    {ugandaRegions.map((region) => (
                      <label key={region} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRegions.includes(region)}
                          onChange={() => toggleRegion(region)}
                          className="w-4 h-4 text-yellow-500 bg-neutral-800 border-neutral-600 rounded focus:ring-yellow-500"
                        />
                        <span className="text-sm text-neutral-300">{region}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-neutral-300 mb-3">Investment Size</p>
                  <div className="space-y-2">
                    {investmentRanges.map((range) => (
                      <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="investment"
                          checked={selectedInvestmentRange === range.label}
                          onChange={() => setSelectedInvestmentRange(range.label)}
                          className="w-4 h-4 text-yellow-500 bg-neutral-800 border-neutral-600 focus:ring-yellow-500"
                        />
                        <span className="text-sm text-neutral-300">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-neutral-300 mb-3">Status</p>
                  <div className="space-y-2">
                    {statuses.map((status) => {
                      const badge = getStatusBadge(status);
                      return (
                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedStatuses.includes(status)}
                            onChange={() => toggleStatus(status)}
                            className="w-4 h-4 text-yellow-500 bg-neutral-800 border-neutral-600 rounded focus:ring-yellow-500"
                          />
                          <span className={`text-sm px-2 py-0.5 rounded border ${badge.className}`}>{badge.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-700">
                  <p className="text-sm font-semibold text-yellow-500 mb-2">
                    {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'} Found
                  </p>
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-400 hover:text-red-300 font-medium"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-700 max-h-96 overflow-y-auto">
                <h3 className="text-sm font-semibold text-neutral-300 mb-3">Project List</h3>
                <div className="space-y-2">
                  {sortedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isSelected={selectedProject === project.id}
                      onClick={() => setSelectedProject(project.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-neutral-900 rounded-xl shadow-lg overflow-hidden border border-neutral-800">
              {/* View Toggle Bar */}
              <div className="p-6 border-b border-neutral-800">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('map')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        viewMode === 'map'
                          ? 'bg-red-600 text-white'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <MapIcon className="w-5 h-5" />
                      Map View
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        viewMode === 'table'
                          ? 'bg-red-600 text-white'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <TableCellsIcon className="w-5 h-5" />
                      Table View
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        viewMode === 'cards'
                          ? 'bg-red-600 text-white'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <Squares2X2Icon className="w-5 h-5" />
                      Cards View
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    {!showFilters && (
                      <button
                        onClick={() => setShowFilters(true)}
                        className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 font-medium flex items-center gap-2"
                      >
                        <FunnelIcon className="w-5 h-5" />
                        Show Filters
                      </button>
                    )}
                    <button
                      onClick={() => alert('Export functionality - would generate CSV/Excel file')}
                      className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold flex items-center gap-2"
                    >
                      <DocumentArrowDownIcon className="w-5 h-5" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* === CARDS VIEW === */}
              {viewMode === 'cards' ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sortedProjects.map((project) => {
                      const badge = getStatusBadge(project.status);
                      return (
                        <div
                          key={project.id}
                          onClick={() => setSelectedProject(project.id)}
                          className={`rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-yellow-500/10 ${
                            selectedProject === project.id
                              ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                              : 'border-neutral-700 bg-neutral-800 hover:border-yellow-600'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-white text-base leading-tight line-clamp-2">{project.name}</h3>
                              <p className="text-sm text-neutral-400 mt-1">{project.company}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mb-4">
                            <span
                              className="px-2.5 py-1 text-xs font-semibold rounded-full"
                              style={{ backgroundColor: getSectorColor(project.sector) + '25', color: getSectorColor(project.sector) }}
                            >
                              {project.sector}
                            </span>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-700">
                            <div>
                              <p className="text-xs text-neutral-500 mb-0.5">Investment</p>
                              <p className="text-lg font-bold text-yellow-400">{formatCurrency(project.investmentValue)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-500 mb-0.5">Employment</p>
                              <p className="text-lg font-bold text-red-400">{project.plannedEmployment.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-neutral-500">
                            {project.district}, {project.region}
                            {project.industrialPark && (
                              <span className="block mt-0.5 text-yellow-600">{project.industrialPark}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              /* === MAP VIEW === */
              ) : viewMode === 'map' ? (
                <div ref={mapRef} className="relative">
                  <DynamicLeafletMap
                    projects={sortedProjects}
                    selectedProject={selectedProject}
                    onSelectProject={setSelectedProject}
                    getSectorColor={getSectorColor}
                    formatCurrency={formatCurrency}
                  />

                  {/* Project cards grid below the map */}
                  <div className="p-6 border-t border-neutral-800">
                    <h3 className="text-lg font-bold text-white mb-4">All Projects ({sortedProjects.length})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {sortedProjects.map((project) => {
                        const badge = getStatusBadge(project.status);
                        return (
                          <div
                            key={project.id}
                            onClick={() => {
                              setSelectedProject(project.id);
                              mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className={`rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-yellow-500/10 ${
                              selectedProject === project.id
                                ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                                : 'border-neutral-700 bg-neutral-800 hover:border-yellow-600'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white text-base leading-tight line-clamp-2">{project.name}</h3>
                                <p className="text-sm text-neutral-400 mt-1">{project.company}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mb-4">
                              <span
                                className="px-2.5 py-1 text-xs font-semibold rounded-full"
                                style={{ backgroundColor: getSectorColor(project.sector) + '25', color: getSectorColor(project.sector) }}
                              >
                                {project.sector}
                              </span>
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.className}`}>
                                {badge.label}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-700">
                              <div>
                                <p className="text-xs text-neutral-500 mb-0.5">Investment</p>
                                <p className="text-lg font-bold text-yellow-400">{formatCurrency(project.investmentValue)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-neutral-500 mb-0.5">Employment</p>
                                <p className="text-lg font-bold text-red-400">{project.plannedEmployment.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="mt-3 text-xs text-neutral-500">
                              {project.district}, {project.region}
                              {project.industrialPark && (
                                <span className="block mt-0.5 text-yellow-600">{project.industrialPark}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              /* === TABLE VIEW === */
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-800 border-b border-neutral-700">
                      <tr>
                        <th
                          onClick={() => handleSort('name')}
                          className="px-6 py-3 text-left text-xs font-medium text-yellow-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-700"
                        >
                          <div className="flex items-center gap-1">
                            Project Name
                            {sortField === 'name' && (sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />)}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-yellow-500 uppercase tracking-wider">Company</th>
                        <th
                          onClick={() => handleSort('sector')}
                          className="px-6 py-3 text-left text-xs font-medium text-yellow-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-700"
                        >
                          <div className="flex items-center gap-1">
                            Sector
                            {sortField === 'sector' && (sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />)}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('region')}
                          className="px-6 py-3 text-left text-xs font-medium text-yellow-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-700"
                        >
                          <div className="flex items-center gap-1">
                            Region
                            {sortField === 'region' && (sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />)}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('investmentValue')}
                          className="px-6 py-3 text-right text-xs font-medium text-yellow-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-700"
                        >
                          <div className="flex items-center justify-end gap-1">
                            Investment
                            {sortField === 'investmentValue' && (sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />)}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-yellow-500 uppercase tracking-wider">Status</th>
                        <th
                          onClick={() => handleSort('plannedEmployment')}
                          className="px-6 py-3 text-right text-xs font-medium text-yellow-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-700"
                        >
                          <div className="flex items-center justify-end gap-1">
                            Employment
                            {sortField === 'plannedEmployment' && (sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />)}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {sortedProjects.map((project, idx) => {
                        const badge = getStatusBadge(project.status);
                        return (
                          <tr key={project.id} className={`transition-colors hover:bg-neutral-800 ${idx % 2 === 0 ? 'bg-neutral-900' : 'bg-neutral-900/50'}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">{project.name}</div>
                              <div className="text-sm text-neutral-500">{project.district}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{project.company}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                                style={{ backgroundColor: getSectorColor(project.sector) + '25', color: getSectorColor(project.sector) }}
                              >
                                {project.sector}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{project.region}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-yellow-400 text-right">
                              {formatCurrency(project.investmentValue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded border ${badge.className}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-400 text-right">
                              {project.plannedEmployment.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
