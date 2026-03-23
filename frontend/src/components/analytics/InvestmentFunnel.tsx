'use client';

import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import type { FunnelStage } from '@/types';

interface InvestmentFunnelProps {
  data: FunnelStage[];
}

export default function InvestmentFunnel({ data }: InvestmentFunnelProps) {
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: FunnelStage }> }) => {
    if (active && payload && payload.length) {
      const stage = payload[0]?.payload as FunnelStage;
      return (
        <div className="bg-white p-4 border border-yellow-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{stage.stage}</p>
          <p className="text-sm text-gray-600">Count: <span className="font-medium">{stage.count}</span></p>
          <p className="text-sm text-gray-600">Conversion: <span className="font-medium">{stage.conversionRate.toFixed(1)}%</span></p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = (props: { x: number; y: number; width: number; value: number }) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width + 10}
        y={y + 15}
        fill="#374151"
        fontSize={14}
        fontWeight="600"
      >
        {value.toLocaleString()}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment Funnel</h3>
        <p className="text-sm text-gray-600 mb-6">Track investor journey from initial inquiry to operation</p>
      </div>

      {/* Funnel Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 80, bottom: 20, left: 120 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="stage"
            tick={{ fontSize: 14, fontWeight: 500 }}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            radius={[0, 8, 8, 0]}
            barSize={40}
          >
            <LabelList content={(props) => <CustomLabel {...(props as { x: number; y: number; width: number; value: number })} />} />
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Conversion Rates Between Stages */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Stage-to-Stage Conversion</h4>
        <div className="space-y-3">
          {data.slice(0, -1).map((stage, index) => {
            const nextStage = data[index + 1];
            if (!nextStage) return null;
            const conversionRate = ((nextStage.count / stage.count) * 100).toFixed(1);
            return (
              <div key={stage.stage} className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                  <span className="text-xs text-gray-500">({stage.count})</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm font-semibold text-yellow-600 min-w-[50px]">
                    {conversionRate}%
                  </span>
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: nextStage.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{nextStage.stage}</span>
                  <span className="text-xs text-gray-500">({nextStage.count})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Conversion Summary */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Overall Conversion Rate</p>
            <p className="text-xs text-gray-600 mt-1">From Inquiry to Operational</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-yellow-700">
              {data.length > 0 && data[data.length - 1] && data[0] ? ((data[data.length - 1]!.count / data[0]!.count) * 100).toFixed(1) : '0'}%
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {data[data.length - 1]?.count ?? 0} / {data[0]?.count ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
