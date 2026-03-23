'use client';

import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import type { BenchmarkData } from '@/types';

interface BenchmarkTableProps {
  data: BenchmarkData[];
}

export default function BenchmarkTable({ data }: BenchmarkTableProps) {
  const getStatus = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'success';
    if (percentage >= 90) return 'warning';
    return 'danger';
  };

  const StatusIcon = ({ status }: { status: 'success' | 'warning' | 'danger' }) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-yellow-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'danger':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === 'hours') return `${value.toFixed(1)}h`;
    if (unit === 'days') return `${value.toFixed(1)}d`;
    if (unit === 'M USD') return `$${value.toFixed(1)}M`;
    if (unit === 'jobs') return value.toString();
    return `${value} ${unit}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Benchmarks</h3>
        <p className="text-sm text-gray-600">Comparison against targets and regional averages</p>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-yellow-50 border-b-2 border-yellow-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Metric</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Current</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Target</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Regional Avg</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Progress</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((benchmark, index) => {
              const status = getStatus(benchmark.current, benchmark.target);
              const progress = Math.min((benchmark.current / benchmark.target) * 100, 100);
              const isReversed = benchmark.metric.includes('Time'); // Lower is better for time metrics

              return (
                <tr
                  key={benchmark.metric}
                  className={`border-b border-gray-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-yellow-50 transition-colors`}
                >
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">
                    {benchmark.metric}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-sm font-semibold text-yellow-700">
                      {formatValue(benchmark.current, benchmark.unit)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-gray-600">
                    {formatValue(benchmark.target, benchmark.unit)}
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-gray-500">
                    {formatValue(benchmark.regional, benchmark.unit)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            status === 'success' ? 'bg-yellow-600' :
                            status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${isReversed ? 100 - progress : progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 min-w-[40px]">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center">
                      <StatusIcon status={status} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {data.map((benchmark) => {
          const status = getStatus(benchmark.current, benchmark.target);
          const progress = Math.min((benchmark.current / benchmark.target) * 100, 100);

          return (
            <div
              key={benchmark.metric}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">{benchmark.metric}</h4>
                <StatusIcon status={status} />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Current</p>
                  <p className="text-sm font-semibold text-yellow-700">
                    {formatValue(benchmark.current, benchmark.unit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Target</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatValue(benchmark.target, benchmark.unit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Regional</p>
                  <p className="text-sm text-gray-600">
                    {formatValue(benchmark.regional, benchmark.unit)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      status === 'success' ? 'bg-yellow-600' :
                      status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {progress.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-yellow-600" />
          <span className="text-xs text-gray-600">On Target (≥100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
          <span className="text-xs text-gray-600">Near Target (90-99%)</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircleIcon className="w-4 h-4 text-red-600" />
          <span className="text-xs text-gray-600">Below Target (&lt;90%)</span>
        </div>
      </div>
    </div>
  );
}
