'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/solid';
import type { SectorAnalyticsData } from '@/types';

interface SectorDistributionChartProps {
  data: SectorAnalyticsData[];
}

const GREEN_SHADES = [
  '#166534', // neutral-800
  '#15803d', // yellow-700
  '#16a34a', // yellow-600
  '#22c55e', // yellow-500
  '#4ade80', // yellow-400
  '#86efac', // yellow-300
  '#bbf7d0', // yellow-200
  '#dcfce7', // yellow-100
];

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
        <div className="bg-white p-4 border border-yellow-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.sector}</p>
          <p className="text-sm text-gray-600">Count: <span className="font-medium">{data.count}</span></p>
          <p className="text-sm text-gray-600">Percentage: <span className="font-medium">{data.percentage.toFixed(1)}%</span></p>
          <p className="text-sm text-gray-600">Investment: <span className="font-medium">{formatCurrency(data.investmentValue)}</span></p>
        </div>
      );
    }
    return null;
  };

  const TrendIcon = ({ trend, percentage }: { trend: 'up' | 'down' | 'stable'; percentage: number }) => {
    if (trend === 'up') {
      return (
        <span className="inline-flex items-center text-yellow-600 text-xs font-medium">
          <ArrowTrendingUpIcon className="w-3 h-3 mr-0.5" />
          {percentage.toFixed(1)}%
        </span>
      );
    }
    if (trend === 'down') {
      return (
        <span className="inline-flex items-center text-red-600 text-xs font-medium">
          <ArrowTrendingDownIcon className="w-3 h-3 mr-0.5" />
          {Math.abs(percentage).toFixed(1)}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-gray-500 text-xs font-medium">
        <MinusIcon className="w-3 h-3 mr-0.5" />
        {percentage.toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Pie Chart (Donut) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sector Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
              outerRadius={140}
              innerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={GREEN_SHADES[index % GREEN_SHADES.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Sector Trend List */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Sector Trends</h4>
        <div className="space-y-2">
          {data.map((sector, index) => (
            <div key={sector.sector} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: GREEN_SHADES[index % GREEN_SHADES.length] }}
                />
                <span className="text-sm font-medium text-gray-700">{sector.sector}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{sector.count} inquiries</span>
                <TrendIcon trend={sector.trend} percentage={sector.trendPercentage} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart Comparison */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Investment Value by Sector</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" tickFormatter={formatCurrency} />
            <YAxis
              type="category"
              dataKey="sector"
              width={200}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => typeof value === 'number' ? formatCurrency(value) : ''}
              labelStyle={{ color: '#111827' }}
            />
            <Bar dataKey="investmentValue" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={GREEN_SHADES[index % GREEN_SHADES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
