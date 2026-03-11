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

  const handleExport = (_type?: 'pdf' | 'csv') => {
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-yellow-700 via-yellow-600 to-neutral-800 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-3">Analytics & Intelligence</h1>
              <p className="text-yellow-100 text-lg max-w-2xl">
                Comprehensive insights into investment inquiries, licensed projects, and performance benchmarks
              </p>
              {/* Tab Navigation */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveTab('inquiries')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                    activeTab === 'inquiries'
                      ? 'bg-white text-yellow-700'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <ChartBarIcon className="w-4 h-4" />
                  Inquiry Analytics
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                    activeTab === 'projects'
                      ? 'bg-white text-yellow-700'
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
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-600" />
                <select
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white text-gray-900 rounded-lg border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-medium appearance-none cursor-pointer"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handleExport('pdf')}
                className="px-4 py-2.5 bg-white text-yellow-700 rounded-lg font-medium hover:bg-yellow-50 transition-colors flex items-center gap-2 justify-center"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                Export PDF
              </button>

              <button
                onClick={() => handleExport('csv')}
                className="px-4 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-neutral-900 transition-colors flex items-center gap-2 justify-center border border-yellow-700"
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
          className="fixed top-4 right-4 z-50 bg-yellow-600 text-black px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
          <span className="font-medium">Export initiated! File will download shortly.</span>
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
            >
              {summaryCards.map((card) => (
                <motion.div
                  key={card.title}
                  variants={itemVariants}
                  className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${card.color}`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{card.title}</p>
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
                <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-6">
                  <GeographicHeatMap data={mockAnalytics.geographic} />
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-6">
                  <SectorDistributionChart data={mockAnalytics.sectorDistribution} />
                </motion.div>
              </div>
              <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-6">
                <TimeSeriesChart data={mockAnalytics.timeSeries} />
              </motion.div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-6">
                  <InvestmentFunnel data={mockAnalytics.funnelData} />
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-6">
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
                  <motion.div key={card.label} variants={itemVariants} className="bg-white rounded-lg shadow-sm p-5">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-sm text-yellow-700 font-medium mt-1">{card.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Licensed Projects by Decade */}
              <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-yellow-600" />
                  Licensed Projects by Period
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 font-semibold text-gray-700">Period</th>
                        <th className="text-right py-3 font-semibold text-gray-700">Projects</th>
                        <th className="text-right py-3 font-semibold text-gray-700">Investment (USD)</th>
                        <th className="text-right py-3 font-semibold text-gray-700">Employment</th>
                        <th className="text-left py-3 font-semibold text-gray-700 pl-6">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {projectAnalysis.licensedByDecade.map((row) => {
                        const pct = (row.projects / projectAnalysis.overview.totalLicensedProjects) * 100;
                        return (
                          <tr key={row.period} className="hover:bg-gray-50">
                            <td className="py-3 font-medium text-gray-900">{row.period}</td>
                            <td className="py-3 text-right text-gray-700">{row.projects.toLocaleString()}</td>
                            <td className="py-3 text-right font-semibold text-yellow-700">${row.investment}B</td>
                            <td className="py-3 text-right text-gray-700">{row.employment.toLocaleString()}</td>
                            <td className="py-3 pl-6">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-gray-500">{pct.toFixed(0)}%</span>
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
                <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-yellow-600" />
                    Recent Performance (Last 5 Financial Years)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-gray-200">
                        <tr>
                          <th className="text-left py-3 font-semibold text-gray-700">Financial Year</th>
                          <th className="text-right py-3 font-semibold text-gray-700">Projects</th>
                          <th className="text-right py-3 font-semibold text-gray-700">Investment (US$)</th>
                          <th className="text-right py-3 font-semibold text-gray-700">Employment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {projectAnalysis.recentFYData.map((fy: { fy: string; projects: number; investment: number; employment: number }) => (
                          <tr key={fy.fy} className="hover:bg-gray-50">
                            <td className="py-3 font-medium text-gray-900">{fy.fy}</td>
                            <td className="py-3 text-right text-gray-700">{fy.projects.toLocaleString()}</td>
                            <td className="py-3 text-right font-semibold text-yellow-700">
                              ${(fy.investment / 1_000_000_000).toFixed(2)}B
                            </td>
                            <td className="py-3 text-right text-gray-700">{fy.employment.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Key Insight: FY 2022/23 recorded the highest planned investment at US$10.05 Billion
                  </p>
                </motion.div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sector Breakdown */}
                <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BuildingOffice2Icon className="w-5 h-5 text-yellow-600" />
                    Licensed Projects by Sector
                  </h3>
                  <div className="space-y-3">
                    {projectAnalysis.licensedBySector.map((s) => (
                      <div key={s.sector}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{s.sector}</span>
                          <span className="text-gray-500">{s.projects.toLocaleString()} ({s.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${s.percentage}%` }} />
                        </div>
                        <p className="text-xs text-yellow-700 mt-0.5">${s.investment}B invested</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Regional Distribution */}
                <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapIcon className="w-5 h-5 text-yellow-600" />
                    Distribution by Region
                  </h3>
                  <div className="space-y-4">
                    {projectAnalysis.licensedByRegion.map((r) => (
                      <div key={r.region} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{r.region} Region</h4>
                          <span className="text-sm font-bold text-yellow-700">${r.investment}B</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${r.percentage}%` }} />
                          </div>
                          <span className="text-sm font-medium text-gray-600 w-20 text-right">{r.projects.toLocaleString()} ({r.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Top Origin Countries</h4>
                    <div className="space-y-2">
                      {projectAnalysis.topOriginCountries.slice(0, 5).map((c, i) => (
                        <div key={c.country} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700"><span className="font-semibold text-gray-400 mr-2">{i + 1}.</span>{c.country}</span>
                          <span className="font-medium text-gray-900">{c.projects.toLocaleString()} projects · ${c.investment}B</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bankable Projects Pipeline */}
              <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-5 h-5 text-yellow-600" />
                  Bankable Projects Pipeline — 2025
                </h3>
                <p className="text-sm text-gray-500 mb-4">Investment-ready projects identified by UIA for potential investors</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 font-semibold text-gray-700">Sector</th>
                        <th className="text-right py-3 font-semibold text-gray-700">Projects</th>
                        <th className="text-right py-3 font-semibold text-gray-700">Total Value ($M)</th>
                        <th className="text-left py-3 font-semibold text-gray-700 pl-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {projectAnalysis.bankableProjects.map((b) => (
                        <tr key={b.sector} className="hover:bg-gray-50">
                          <td className="py-3 font-medium text-gray-900">{b.sector}</td>
                          <td className="py-3 text-right text-gray-700">{b.count}</td>
                          <td className="py-3 text-right font-semibold text-yellow-700">${b.totalValue}M</td>
                          <td className="py-3 pl-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              b.status === 'Ready for investment' ? 'bg-green-100 text-green-800' :
                              b.status === 'Feasibility complete' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
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
              <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-yellow-600" />
                  Annual Licensing Trend (2018–2025)
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {projectAnalysis.yearlyTrend.map((y) => {
                    const maxProjects = Math.max(...projectAnalysis.yearlyTrend.map(t => t.projects));
                    const heightPct = (y.projects / maxProjects) * 100;
                    return (
                      <div key={y.year} className="flex flex-col items-center">
                        <div className="w-full h-32 flex items-end justify-center">
                          <div
                            className="w-full max-w-[40px] bg-yellow-500 rounded-t-lg transition-all"
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <p className="text-xs font-bold text-gray-900 mt-2">{y.year}</p>
                        <p className="text-xs text-gray-500">{y.projects}</p>
                        <p className="text-[10px] text-yellow-700">${y.investment}B</p>
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
          className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
        >
          <p className="text-sm text-gray-700 text-center">
            <span className="font-semibold">Data Updated:</span> {new Date().toLocaleString('en-UG', {
              dateStyle: 'long',
              timeStyle: 'short',
              timeZone: 'Africa/Kampala'
            })} (EAT)
            {activeTab === 'projects' && (
              <span className="ml-2">| Source: UIA Licensed Projects Database & Bankable Projects Report 2025</span>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
