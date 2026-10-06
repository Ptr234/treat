'use client';

import { useState } from 'react';
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
 <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white text-black"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Analytics & Intelligence</h1>
                {activeTab === 'inquiries' && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Sample Data
                  </span>
                )}
              </div>
              <p className="text-black text-lg max-w-2xl">
                Comprehensive insights into investment inquiries, licensed projects, and performance benchmarks
              </p>
              {activeTab === 'inquiries' && (
                <p className="text-black/80 text-sm max-w-2xl mt-1">
                  The figures below are illustrative sample data, not live platform metrics.
                </p>
              )}
              {/* Tab Navigation */}
              <div className="flex gap-2 mt-4 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('inquiries')}
                  className={`px-3 sm:px-5 py-2 min-h-[44px] rounded-md text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'inquiries'
                      ? 'bg-white text-red-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <ChartBarIcon className="w-4 h-4" />
                  Inquiry Analytics
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`px-3 sm:px-5 py-2 min-h-[44px] rounded-md text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'projects'
                      ? 'bg-white text-red-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <TableCellsIcon className="w-4 h-4" />
                  Project Analysis
                </button>
              </div>
            </div>

            {/* Date Range & Export Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                <select
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white text-black rounded-md border border-yellow-400 focus:outline-none focus:ring-2 focus-visible:ring-red-600 font-medium appearance-none cursor-pointer"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-white text-red-600 rounded-md font-medium hover:bg-yellow-50 transition-colors flex items-center gap-2 justify-center"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                Print / PDF
              </button>

              <button
                onClick={() => handleExport('csv')}
                className="px-4 py-2.5 bg-black text-yellow-400 rounded-md font-medium hover:bg-white transition-colors flex items-center gap-2 justify-center border border-yellow-400"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Export Notification */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-yellow-400 text-black px-6 py-3 rounded-md flex items-center gap-3"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
          <span className="font-medium">Export complete! Check your downloads.</span>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <motion.div variants={itemVariants} className="p-6 border-t-2 border-black pt-5">
                  <GeographicHeatMap data={mockAnalytics.geographic} />
                </motion.div>
                <motion.div variants={itemVariants} className="p-6 border-t-2 border-black pt-5">
                  <SectorDistributionChart data={mockAnalytics.sectorDistribution} />
                </motion.div>
              </div>
              <motion.div variants={itemVariants} className="p-6 border-t-2 border-black pt-5">
                <TimeSeriesChart data={mockAnalytics.timeSeries} />
              </motion.div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="p-6 border-t-2 border-black pt-5">
                  <InvestmentFunnel data={mockAnalytics.funnelData} />
                </motion.div>
                <motion.div variants={itemVariants} className="p-6 border-t-2 border-black pt-5">
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
                  <motion.div key={card.label} variants={itemVariants} className="p-5 border-t-2 border-black pt-5">
                    <p className="text-xs font-medium text-neutral-600 uppercase tracking-wide mb-1">{card.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-black">{card.value}</p>
                    <p className="text-sm text-red-600 font-medium mt-1">{card.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Licensed Projects by Decade */}
              <motion.div variants={itemVariants} className="p-4 sm:p-6 border-t-2 border-black pt-5">
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
                <motion.div variants={itemVariants} className="p-4 sm:p-6 border-t-2 border-black pt-5">
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
                <motion.div variants={itemVariants} className="p-6 border-t-2 border-black pt-5">
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
                <motion.div variants={itemVariants} className="p-6 border-t-2 border-black pt-5">
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
              <motion.div variants={itemVariants} className="p-4 sm:p-6 border-t-2 border-black pt-5">
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
                          b.status === 'Ready for investment' ? 'bg-green-100 text-green-800' :
                          b.status === 'Feasibility complete' ? 'bg-blue-100 text-blue-800' :
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
                              b.status === 'Ready for investment' ? 'bg-green-100 text-green-800' :
                              b.status === 'Feasibility complete' ? 'bg-blue-100 text-blue-800' :
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
              <motion.div variants={itemVariants} className="p-6 border-t-2 border-black pt-5">
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
          className="mt-8 p-4 bg-yellow-50 border-t-2 border-black pt-5"
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
