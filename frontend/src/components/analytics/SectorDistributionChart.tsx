'use client';

import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, LabelList, CartesianGrid } from 'recharts';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/solid';
import type { SectorAnalyticsData } from '@/types';

interface SectorDistributionChartProps {
  data: SectorAnalyticsData[];
}

// Sectors are named on the axis, so colour does not carry identity here:
// one ink per measure (black = enquiry count, dark gold = investment value).
const COUNT_INK = '#0b0b0b';
const VALUE_INK = '#8a7200';
const AXIS_INK = '#5c5850';
const GRID_INK = '#e7e3da';

export default function SectorDistributionChart({ data }: SectorDistributionChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${(value / 1e3).toFixed(0)}K`;
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: SectorAnalyticsData }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as SectorAnalyticsData;
      return (
        <div className="border border-[#dcd8cf] border-t-4 border-t-black bg-white p-4 shadow-[0_6px_18px_rgb(0_0_0/0.12)]">
          <p className="font-semibold text-black mb-2">{data.sector}</p>
          <p className="text-sm text-neutral-700">Count: <span className="font-medium">{data.count}</span></p>
          <p className="text-sm text-neutral-700">Percentage: <span className="font-medium">{data.percentage.toFixed(1)}%</span></p>
          <p className="text-sm text-neutral-700">Investment: <span className="font-medium">{formatCurrency(data.investmentValue)}</span></p>
        </div>
      );
    }
    return null;
  };

  const TrendIcon = ({ trend, percentage }: { trend: 'up' | 'down' | 'stable'; percentage: number }) => {
    if (trend === 'up') {
      return (
        <span className="inline-flex items-center text-black text-xs font-bold">
          <ArrowTrendingUpIcon className="w-3 h-3 mr-0.5" />
          {percentage.toFixed(1)}%
        </span>
      );
    }
    if (trend === 'down') {
      return (
        <span className="inline-flex items-center text-[#9a0d1c] text-xs font-bold">
          <ArrowTrendingDownIcon className="w-3 h-3 mr-0.5" />
          {Math.abs(percentage).toFixed(1)}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-neutral-600 text-xs font-medium">
        <MinusIcon className="w-3 h-3 mr-0.5" />
        {percentage.toFixed(1)}%
      </span>
    );
  };

  const byCount = [...data].sort((a, b) => b.count - a.count);
  const byValue = [...data].sort((a, b) => b.investmentValue - a.investmentValue);
  const barHeight = (n: number) => Math.max(220, n * 44 + 40);

  return (
    <div className="space-y-10">
      {/* Share of enquiries */}
      <div>
        <h3 className="text-lg font-bold text-black">Enquiries by sector</h3>
        <p className="mb-4 text-sm text-[#5c5850]">Share of all enquiries, largest first</p>
        <ResponsiveContainer width="100%" height={barHeight(byCount.length)}>
          <BarChart data={byCount} layout="vertical" margin={{ top: 0, right: 64, left: 0, bottom: 0 }} barCategoryGap={10}>
            <CartesianGrid horizontal={false} stroke={GRID_INK} />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="sector" width={190} tick={{ fontSize: 13, fill: '#262522' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f3ee' }} />
            <Bar dataKey="count" fill={COUNT_INK} radius={[0, 4, 4, 0]} maxBarSize={22}>
              <LabelList dataKey="percentage" position="right" formatter={(v: unknown) => (typeof v === 'number' ? `${v.toFixed(1)}%` : '')} style={{ fill: '#262522', fontSize: 13, fontWeight: 700 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sector trends */}
      <div>
        <h4 className="mb-3 text-base font-bold text-black">Sector trends</h4>
        <table className="gov-table">
          <thead>
            <tr><th scope="col">Sector</th><th scope="col" className="text-right">Enquiries</th><th scope="col" className="text-right">Change</th></tr>
          </thead>
          <tbody>
            {byCount.map((sector) => (
              <tr key={sector.sector}>
                <th scope="row" className="font-semibold text-black">{sector.sector}</th>
                <td className="text-right font-data">{sector.count}</td>
                <td className="text-right"><TrendIcon trend={sector.trend} percentage={sector.trendPercentage} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Investment value */}
      <div>
        <h4 className="text-base font-bold text-black">Investment value by sector</h4>
        <p className="mb-4 text-sm text-[#5c5850]">US dollars, largest first</p>
        <ResponsiveContainer width="100%" height={barHeight(byValue.length)}>
          <BarChart data={byValue} layout="vertical" margin={{ top: 0, right: 72, left: 0, bottom: 0 }} barCategoryGap={10}>
            <CartesianGrid horizontal={false} stroke={GRID_INK} />
            <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: AXIS_INK }} stroke={GRID_INK} />
            <YAxis type="category" dataKey="sector" width={190} tick={{ fontSize: 13, fill: '#262522' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value) => (typeof value === 'number' ? formatCurrency(value) : '')}
              labelStyle={{ color: '#0b0b0b', fontWeight: 700 }}
              contentStyle={{ borderRadius: 0, border: '1px solid #dcd8cf', borderTop: '4px solid #0b0b0b' }}
              cursor={{ fill: '#f5f3ee' }}
            />
            <Bar dataKey="investmentValue" name="Investment value" fill={VALUE_INK} radius={[0, 4, 4, 0]} maxBarSize={22}>
              <LabelList dataKey="investmentValue" position="right" formatter={(v: unknown) => (typeof v === 'number' ? formatCurrency(v) : '')} style={{ fill: '#262522', fontSize: 13, fontWeight: 700 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
