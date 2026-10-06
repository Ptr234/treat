'use client';

import type { GeographicData } from '@/types';

interface GeographicHeatMapProps {
  data: GeographicData[];
}

const COUNTRY_FLAGS: Record<string, string> = {
  CN: '🇨🇳', IN: '🇮🇳', AE: '🇦🇪', GB: '🇬🇧', US: '🇺🇸',
  KE: '🇰🇪', ZA: '🇿🇦', DE: '🇩🇪', JP: '🇯🇵', NL: '🇳🇱',
  RW: '🇷🇼', TR: '🇹🇷', FR: '🇫🇷', CA: '🇨🇦', EG: '🇪🇬',
  NG: '🇳🇬', TZ: '🇹🇿', IT: '🇮🇹', SG: '🇸🇬', BE: '🇧🇪'
};

export default function GeographicHeatMap({ data }: GeographicHeatMapProps) {
  const sortedData = [...data].sort((a, b) => b.inquiries - a.inquiries);
  const maxInquiries = sortedData[0]?.inquiries || 1;
  const totalCountries = sortedData.length;
  const topCountry = sortedData[0];
  const totalInvestmentValue = sortedData.reduce((sum, country) => sum + country.investmentValue, 0);

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${(value / 1e3).toFixed(0)}K`;
  };

  const groupByRegion = (data: GeographicData[]) => {
    const regions: Record<string, GeographicData[]> = {};
    data.forEach(country => {
      if (!regions[country.region]) {
        regions[country.region] = [];
      }
      regions[country.region]?.push(country);
    });
    return regions;
  };

  const regionGroups = groupByRegion(sortedData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-black mb-2">Geographic Distribution</h3>
        <p className="text-sm text-neutral-700">Investment inquiries by country and region</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-yellow-50 border-t border-neutral-200 pt-5">
        <div>
          <p className="text-xs font-medium text-neutral-700 uppercase">Countries</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{totalCountries}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-700 uppercase">Top Source</p>
          <p className="text-lg font-bold text-red-600 mt-1 flex items-center gap-2">
            <span>{topCountry ? COUNTRY_FLAGS[topCountry.countryCode] || '🌍' : '🌍'}</span>
            {topCountry?.country}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-700 uppercase">Total Investment Value</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalInvestmentValue)}</p>
        </div>
      </div>

      {/* Top 5 Countries Highlight */}
      <div>
        <h4 className="text-md font-semibold text-black mb-3">Top 5 Countries</h4>
        <div className="space-y-2">
          {sortedData.slice(0, 5).map((country) => (
            <div
              key={country.countryCode}
              className="p-4 border-t border-neutral-200 pt-5"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{COUNTRY_FLAGS[country.countryCode] || '🌍'}</span>
                  <div>
                    <p className="font-semibold text-black">{country.country}</p>
                    <p className="text-xs text-neutral-700">{country.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{country.inquiries}</p>
                  <p className="text-xs text-neutral-700">inquiries</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full transition-all border-t border-neutral-200 pt-5"
                    style={{ width: `${(country.inquiries / maxInquiries) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-neutral-800 min-w-[80px] text-right">
                  {formatCurrency(country.investmentValue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Breakdown */}
      <div>
        <h4 className="text-md font-semibold text-black mb-3">All Countries by Region</h4>
        <div className="space-y-6">
          {Object.entries(regionGroups).map(([region, countries]) => {
            const regionTotal = countries.reduce((sum, c) => sum + c.inquiries, 0);
            const regionInvestment = countries.reduce((sum, c) => sum + c.investmentValue, 0);

            return (
              <div key={region} className="overflow-hidden border-t border-neutral-200 pt-5">
                {/* Region Header */}
                <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-black">{region}</h5>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-neutral-700">
                        <span className="font-medium text-black">{regionTotal}</span> inquiries
                      </span>
                      <span className="text-neutral-700">
                        <span className="font-medium text-red-600">{formatCurrency(regionInvestment)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Countries in Region */}
                <div className="divide-y divide-gray-100">
                  {countries.map((country) => (
                    <div
                      key={country.countryCode}
                      className="px-4 py-3 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xl">{COUNTRY_FLAGS[country.countryCode] || '🌍'}</span>
                        <div className="flex-1 min-w-[150px]">
                          <p className="text-sm font-medium text-black">{country.country}</p>
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden max-w-[200px]">
                            <div
                              className="h-full bg-yellow-500 rounded-full transition-all"
                              style={{ width: `${(country.inquiries / maxInquiries) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-neutral-800 min-w-[60px] text-right">
                            {country.inquiries}
                          </span>
                        </div>
                        <div className="min-w-[100px] text-right">
                          <p className="text-sm font-medium text-red-600">
                            {formatCurrency(country.investmentValue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
