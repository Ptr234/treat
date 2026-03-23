'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import type { TimeSeriesPoint } from '@/types';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const [chartHeight, setChartHeight] = useState(400);

  useEffect(() => {
    const updateHeight = () => setChartHeight(window.innerWidth < 640 ? 280 : 400);
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  const formatMonth = (dateString: string) => {
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${(value / 1e3).toFixed(0)}K`;
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: TimeSeriesPoint }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as TimeSeriesPoint;
      return (
        <div className="bg-white p-4 border border-yellow-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-3">{formatMonth(label ?? '')}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-200" />
              <span className="text-sm text-gray-600">Inquiries:</span>
              <span className="text-sm font-medium text-gray-900">{data.inquiries}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neutral-800" />
              <span className="text-sm text-gray-600">Conversions:</span>
              <span className="text-sm font-medium text-gray-900">{data.conversions}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Investment Value:</span>
              <span className="text-sm font-medium text-yellow-700 ml-2">
                {formatCurrency(data.investmentValue)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Inquiry & Conversion Trends</h3>
        <p className="text-sm text-gray-600">Monthly performance over the past year</p>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={formatMonth}
            tick={{ fontSize: chartHeight < 300 ? 10 : 12 }}
            stroke="#9ca3af"
            interval={chartHeight < 300 ? 1 : 0}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="inquiries"
            stroke="#16a34a"
            strokeWidth={2}
            fill="url(#colorInquiries)"
            name="Inquiries"
          />
          <Line
            type="monotone"
            dataKey="conversions"
            stroke="#166534"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#166534', r: 4 }}
            name="Conversions"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
        {(() => {
          const totalInquiries = data.reduce((sum, point) => sum + point.inquiries, 0);
          const totalConversions = data.reduce((sum, point) => sum + point.conversions, 0);
          const avgInquiries = data.length > 0 ? Math.round(totalInquiries / data.length) : 0;
          const conversionRate = totalInquiries > 0 ? ((totalConversions / totalInquiries) * 100).toFixed(1) : '0.0';

          return (
            <>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs font-medium text-gray-600 uppercase">Total Inquiries</p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">{totalInquiries.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs font-medium text-gray-600 uppercase">Total Conversions</p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">{totalConversions}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs font-medium text-gray-600 uppercase">Avg Monthly Inquiries</p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">{avgInquiries}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs font-medium text-gray-600 uppercase">Conversion Rate</p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">{conversionRate}%</p>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
