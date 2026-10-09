'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  GlobeAltIcon,
  BuildingOffice2Icon,
  DocumentArrowDownIcon,
  CalendarIcon,
  TableCellsIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import SectorDistributionChart from '@/components/analytics/SectorDistributionChart';
import InvestmentFunnel from '@/components/analytics/InvestmentFunnel';
import TimeSeriesChart from '@/components/analytics/TimeSeriesChart';
import BenchmarkTable from '@/components/analytics/BenchmarkTable';
import GeographicHeatMap from '@/components/analytics/GeographicHeatMap';
import { mockAnalytics as fallbackAnalytics, projectAnalysis } from '@/data/mock/analytics';
import type { InquiryAnalytics } from '@/types';

type AnalyticsTab = 'inquiries' | 'projects';

const dateRanges = [
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Last 12 Months', value: '12m' },
  { label: 'All Time', value: 'all' }
];

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState('12m');
  const [showNotification, setShowNotification] = useState(false);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('inquiries');
  // Analytics data comes from mock/Sanity in Phase 3 — using mock data for now
  const [mockAnalytics] = useState<InquiryAnalytics>(fallbackAnalytics);

  const handleExport = (type?: 'pdf' | 'csv') => {
    if (type === 'csv') {
      // Build CSV from current analytics data
      const rows: string[][] = [];

      if (activeTab === 'inquiries') {
        // Summary
        rows.push(['Metric', 'Value']);
        rows.push(['Total Inquiries', String(mockAnalytics.summary.totalInquiries)]);
        rows.push(['Total Investment Value', String(mockAnalytics.summary.totalInvestmentValue)]);
        rows.push(['Conversion Rate', `${mockAnalytics.summary.conversionRate}%`]);
        rows.push(['Avg Response Time', mockAnalytics.summary.avgResponseTime]);
        rows.push(['Top Country', mockAnalytics.summary.topCountry]);
        rows.push(['Top Sector', mockAnalytics.summary.topSector]);
        rows.push([]);

        // Sector distribution
        rows.push(['Sector', 'Count', 'Percentage', 'Investment Value', 'Trend']);
        for (const s of mockAnalytics.sectorDistribution) {
          rows.push([s.sector, String(s.count), `${s.percentage}%`, String(s.investmentValue), `${s.trend} ${s.trendPercentage}%`]);
        }
        rows.push([]);

        // Geographic
        rows.push(['Country', 'Code', 'Inquiries', 'Investment Value', 'Region']);
        for (const g of mockAnalytics.geographic) {
          rows.push([g.country, g.countryCode, String(g.inquiries), String(g.investmentValue), g.region]);
        }
      } else {
        // Project analysis
        rows.push(['Metric', 'Value']);
        rows.push(['Total Licensed Projects', String(projectAnalysis.overview.totalLicensedProjects)]);
        rows.push(['Total Investment Pledged', `$${projectAnalysis.overview.totalInvestmentPledged}`]);
        rows.push(['Planned Employment', String(projectAnalysis.overview.totalPlannedEmployment)]);
        rows.push(['Bankable Projects', String(projectAnalysis.overview.activeBankableProjects)]);
      }

      const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `osc-analytics-${activeTab}-${selectedRange}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }

    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${(value / 1e3).toFixed(0)}K`;
  };

  const summaryCards = [
    {
      title: 'Total Inquiries',
      value: mockAnalytics.summary.totalInquiries.toLocaleString(),
      icon: ChartBarIcon,
      color: 'from-yellow-600 to-yellow-700'
    },
    {
      title: 'Total Investment Value',
      value: formatCurrency(mockAnalytics.summary.totalInvestmentValue),
      icon: CurrencyDollarIcon,
      color: 'from-yellow-700 to-neutral-800'
    },
    {
      title: 'Conversion Rate',
      value: `${mockAnalytics.summary.conversionRate}%`,
      icon: ArrowTrendingUpIcon,
      color: 'from-yellow-600 to-yellow-700'
    },
    {
      title: 'Avg Response Time',
      value: mockAnalytics.summary.avgResponseTime,
      icon: ClockIcon,
      color: 'from-yellow-700 to-neutral-800'
    },
    {
      title: 'Top Country',
      value: mockAnalytics.summary.topCountry,
      icon: GlobeAltIcon,
      color: 'from-yellow-600 to-yellow-700'
    },
    {
      title: 'Top Sector',
      value: mockAnalytics.summary.topSector.split(' &')[0],
      icon: BuildingOffice2Icon,
      color: 'from-yellow-700 to-neutral-800'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Investment statistics' }]}
        caption="Invest"
        title="Investment statistics"
        lead="Insights into investment enquiries, licensed projects and performance benchmarks."
        actions={
          <>
            <div className="relative">
              <label htmlFor="analytics-range" className="sr-only">Date range</label>
              <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#ce1126]" aria-hidden="true" />
              <select id="analytics-range" value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)} className="gov-input !w-auto !pl-10 pr-8">
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
            <button type="button" onClick={() => handleExport('csv')} className="gov-btn">
              <DocumentArrowDownIcon className="h-5 w-5" aria-hidden="true" />
              Export CSV
            </button>
            <button type="button" onClick={() => window.print()} className="gov-btn gov-btn--secondary">
              Print or save as PDF
            </button>
          </>
        }
      />

      {/* Tabs */}
      <div className="border-b-2 border-black bg-white">
        <div role="tablist" aria-label="Statistics" className="gov-container flex overflow-x-auto">
          {([
            { id: 'inquiries', label: 'Enquiry analytics', Icon: ChartBarIcon },
            { id: 'projects', label: 'Project analysis', Icon: TableCellsIcon },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={`flex min-h-[3.25rem] items-center gap-2 whitespace-nowrap border-b-4 px-5 text-[15px] font-bold transition-colors ${
                activeTab === id ? 'border-[#ffd700] bg-black text-white' : 'border-transparent text-[#3b3934] hover:bg-[#f5f3ee] hover:text-black'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'inquiries' && (
        <div className="gov-container pt-8">
          <div className="gov-warning max-w-3xl text-[15px]">
            <p>The enquiry figures below are illustrative sample data, not live platform metrics.</p>
          </div>
        </div>
      )}

      {/* Export Notification */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          role="status"
          className="fixed right-4 top-4 z-50 flex items-center gap-3 border-l-[6px] border-[#ffd700] bg-black px-6 py-3 text-white"
        >
          <DocumentArrowDownIcon className="h-5 w-5" aria-hidden="true" />
          <span className="font-semibold">Export complete. Check your downloads.</span>
        </motion.div>
      )}

      <div className="gov-container py-8">
        {activeTab === 'inquiries' ? (
          <>
            {/* Summary Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
            >
              {summaryCards.map((card) => (
                <motion.div
                  key={card.title}
                  variants={itemVariants}
                  className="bg-white rounded-md p-5 transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-md bg-gradient-to-br ${card.color}`}>
                      <card.icon className="w-5 h-5 text-black" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-black mb-1">{card.value}</p>
                  <p className="text-xs font-medium text-neutral-700 uppercase tracking-wide">{card.title}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Dashboard Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="p-6 border-t border-neutral-200 pt-5">
                  <GeographicHeatMap data={mockAnalytics.geographic} />
                </motion.div>
                <motion.div variants={itemVariants} className="p-6 border-t border-neutral-200 pt-5">
                  <SectorDistributionChart data={mockAnalytics.sectorDistribution} />
                </motion.div>
              </div>
              <motion.div variants={itemVariants} className="p-6 border-t border-neutral-200 pt-5">
                <TimeSeriesChart data={mockAnalytics.timeSeries} />
              </motion.div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="p-6 border-t border-neutral-200 pt-5">
                  <InvestmentFunnel data={mockAnalytics.funnelData} />
                </motion.div>
                <motion.div variants={itemVariants} className="p-6 border-t border-neutral-200 pt-5">
                  <BenchmarkTable data={mockAnalytics.benchmarks} />
                </motion.div>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            {/* Project Analysis Tab */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Licensed Projects', value: projectAnalysis.overview.totalLicensedProjects.toLocaleString(), sub: '1991 — 2025' },
                  { label: 'Investment Pledged', value: `$${projectAnalysis.overview.totalInvestmentPledged}B`, sub: 'Cumulative' },
                  { label: 'Planned Employment', value: `${(projectAnalysis.overview.totalPlannedEmployment).toLocaleString()}`, sub: 'Jobs created' },
                  { label: 'Bankable Projects', value: projectAnalysis.overview.activeBankableProjects.toString(), sub: `$${projectAnalysis.overview.bankableInvestmentValue}B pipeline` },
                ].map((card) => (
                  <motion.div key={card.label} variants={itemVariants} className="p-5 border-t border-neutral-200 pt-5">
                    <p className="text-xs font-medium text-neutral-600 uppercase tracking-wide mb-1">{card.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-black">{card.value}</p>
                    <p className="text-sm text-red-600 font-medium mt-1">{card.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Licensed Projects by Decade */}
              <motion.div variants={itemVariants} className="p-4 sm:p-6 border-t border-neutral-200 pt-5">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-red-600" />
                  Licensed Projects by Period
                </h3>
                {/* Mobile card view */}
                <div className="lg:hidden space-y-3">
                  {projectAnalysis.licensedByDecade.map((row) => {
                    const pct = (row.projects / projectAnalysis.overview.totalLicensedProjects) * 100;
                    return (
                      <div key={row.period} className="border border-neutral-200 rounded-md p-4 hover:border-black">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-black">{row.period}</span>
                          <span className="text-xs text-neutral-600">{pct.toFixed(0)}% share</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-neutral-600">Projects</p>
                            <p className="font-medium text-black">{row.projects.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-600">Investment</p>
                            <p className="font-semibold text-red-600">${row.investment}B</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-600">Employment</p>
                            <p className="font-medium text-neutral-800">{row.employment.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Desktop table view */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-neutral-200">
                      <tr>
                        <th className="text-left py-3 font-semibold text-neutral-800">Period</th>
                        <th className="text-right py-3 font-semibold text-neutral-800">Projects</th>
                        <th className="text-right py-3 font-semibold text-neutral-800">Investment (USD)</th>
                        <th className="text-right py-3 font-semibold text-neutral-800">Employment</th>
                        <th className="text-left py-3 font-semibold text-neutral-800 pl-6">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {projectAnalysis.licensedByDecade.map((row) => {
                        const pct = (row.projects / projectAnalysis.overview.totalLicensedProjects) * 100;
                        return (
                          <tr key={row.period} className="hover:bg-neutral-50">
                            <td className="py-3 font-medium text-black">{row.period}</td>
                            <td className="py-3 text-right text-neutral-800">{row.projects.toLocaleString()}</td>
                            <td className="py-3 text-right font-semibold text-red-600">${row.investment}B</td>
                            <td className="py-3 text-right text-neutral-800">{row.employment.toLocaleString()}</td>
                            <td className="py-3 pl-6">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-neutral-600">{pct.toFixed(0)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Recent Financial Years Performance */}
              {projectAnalysis.recentFYData && (
                <motion.div variants={itemVariants} className="p-4 sm:p-6 border-t border-neutral-200 pt-5">
                  <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-red-600" />
                    Recent Performance (Last 5 Financial Years)
                  </h3>
                  {/* Mobile card view */}
                  <div className="lg:hidden space-y-3">
                    {projectAnalysis.recentFYData.map((fy: { fy: string; projects: number; investment: number; employment: number }) => (
                      <div key={fy.fy} className="border border-neutral-200 rounded-md p-4 hover:border-black">
                        <p className="font-semibold text-black mb-2">{fy.fy}</p>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-neutral-600">Projects</p>
                            <p className="font-medium text-black">{fy.projects.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-600">Investment</p>
                            <p className="font-semibold text-red-600">${(fy.investment / 1_000_000_000).toFixed(2)}B</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-600">Employment</p>
                            <p className="font-medium text-neutral-800">{fy.employment.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop table view */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-neutral-200">
                        <tr>
                          <th className="text-left py-3 font-semibold text-neutral-800">Financial Year</th>
                          <th className="text-right py-3 font-semibold text-neutral-800">Projects</th>
                          <th className="text-right py-3 font-semibold text-neutral-800">Investment (US$)</th>
                          <th className="text-right py-3 font-semibold text-neutral-800">Employment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {projectAnalysis.recentFYData.map((fy: { fy: string; projects: number; investment: number; employment: number }) => (
                          <tr key={fy.fy} className="hover:bg-neutral-50">
                            <td className="py-3 font-medium text-black">{fy.fy}</td>
                            <td className="py-3 text-right text-neutral-800">{fy.projects.toLocaleString()}</td>
                            <td className="py-3 text-right font-semibold text-red-600">
                              ${(fy.investment / 1_000_000_000).toFixed(2)}B
                            </td>
                            <td className="py-3 text-right text-neutral-800">{fy.employment.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-neutral-600 mt-3">
                    Key Insight: FY 2022/23 recorded the highest planned investment at US$10.05 Billion
                  </p>
                </motion.div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sector Breakdown */}
                <motion.div variants={itemVariants} className="p-6 border-t border-neutral-200 pt-5">
                  <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                    <BuildingOffice2Icon className="w-5 h-5 text-red-600" />
                    Licensed Projects by Sector
                  </h3>
                  <div className="space-y-3">
                    {projectAnalysis.licensedBySector.map((s) => (
                      <div key={s.sector}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-neutral-800">{s.sector}</span>
                          <span className="text-neutral-600">{s.projects.toLocaleString()} ({s.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${s.percentage}%` }} />
                        </div>
                        <p className="text-xs text-red-600 mt-0.5">${s.investment}B invested</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Regional Distribution */}
                <motion.div variants={itemVariants} className="p-6 border-t border-neutral-200 pt-5">
                  <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                    <MapIcon className="w-5 h-5 text-red-600" />
                    Distribution by Region
                  </h3>
                  <div className="space-y-4">
                    {projectAnalysis.licensedByRegion.map((r) => (
                      <div key={r.region} className="bg-neutral-50 rounded-md p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-black">{r.region} Region</h4>
                          <span className="text-sm font-bold text-red-600">${r.investment}B</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${r.percentage}%` }} />
                          </div>
                          <span className="text-sm font-medium text-neutral-700 w-20 text-right">{r.projects.toLocaleString()} ({r.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-bold text-black mb-3">Top Origin Countries</h4>
                    <div className="space-y-2">
                      {projectAnalysis.topOriginCountries.slice(0, 5).map((c, i) => (
                        <div key={c.country} className="flex items-center justify-between text-sm">
                          <span className="text-neutral-800"><span className="font-semibold text-neutral-500 mr-2">{i + 1}.</span>{c.country}</span>
                          <span className="font-medium text-black">{c.projects.toLocaleString()} projects · ${c.investment}B</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bankable Projects Pipeline */}
              <motion.div variants={itemVariants} className="p-4 sm:p-6 border-t border-neutral-200 pt-5">
                <h3 className="text-lg font-bold text-black mb-2 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-5 h-5 text-red-600" />
                  Bankable Projects Pipeline — 2025
                </h3>
                <p className="text-sm text-neutral-600 mb-4">Investment-ready projects identified by UIA for potential investors</p>
                {/* Mobile card view */}
                <div className="lg:hidden space-y-3">
                  {projectAnalysis.bankableProjects.map((b) => (
                    <div key={b.sector} className="border border-neutral-200 rounded-md p-4 hover:border-black">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-black">{b.sector}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          b.status === 'Ready for investment' ? 'bg-black text-white' :
                          b.status === 'Feasibility complete' ? 'bg-[#ffd700] text-black' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-neutral-600">Projects</p>
                          <p className="font-medium text-black">{b.count}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600">Total Value</p>
                          <p className="font-semibold text-red-600">${b.totalValue}M</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop table view */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-neutral-200">
                      <tr>
                        <th className="text-left py-3 font-semibold text-neutral-800">Sector</th>
                        <th className="text-right py-3 font-semibold text-neutral-800">Projects</th>
                        <th className="text-right py-3 font-semibold text-neutral-800">Total Value ($M)</th>
                        <th className="text-left py-3 font-semibold text-neutral-800 pl-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {projectAnalysis.bankableProjects.map((b) => (
                        <tr key={b.sector} className="hover:bg-neutral-50">
                          <td className="py-3 font-medium text-black">{b.sector}</td>
                          <td className="py-3 text-right text-neutral-800">{b.count}</td>
                          <td className="py-3 text-right font-semibold text-red-600">${b.totalValue}M</td>
                          <td className="py-3 pl-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              b.status === 'Ready for investment' ? 'bg-black text-white' :
                              b.status === 'Feasibility complete' ? 'bg-[#ffd700] text-black' :
                              'bg-neutral-100 text-neutral-800'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Yearly Trend */}
              <motion.div variants={itemVariants} className="p-6 border-t border-neutral-200 pt-5">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-red-600" />
                  Annual Licensing Trend (2018–2025)
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                  {projectAnalysis.yearlyTrend.map((y) => {
                    const maxProjects = Math.max(...projectAnalysis.yearlyTrend.map(t => t.projects));
                    const heightPct = (y.projects / maxProjects) * 100;
                    return (
                      <div key={y.year} className="flex flex-col items-center">
                        <div className="w-full h-20 sm:h-32 flex items-end justify-center">
                          <div
                            className="w-full max-w-[40px] bg-yellow-500 rounded-t-lg transition-all"
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <p className="text-xs font-bold text-black mt-2">{y.year}</p>
                        <p className="text-xs text-neutral-600">{y.projects}</p>
                        <p className="text-[10px] text-red-600">${y.investment}B</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 p-4 bg-yellow-50 border-t border-neutral-200 pt-5"
        >
          <p className="text-sm text-neutral-800 text-center">
            {activeTab === 'projects' ? (
              <>
                <span className="font-semibold">Data Updated:</span> {new Date().toLocaleString('en-UG', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                  timeZone: 'Africa/Kampala'
                })} (EAT)
                <span className="block sm:inline sm:ml-2">| Source: UIA Licensed Projects Database & Bankable Projects Report 2025</span>
              </>
            ) : (
              <span className="font-semibold">Note: Inquiry Analytics above uses sample data for illustration and does not reflect live UIA figures.</span>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
