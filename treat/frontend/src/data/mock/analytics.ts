import { InquiryAnalytics } from '@/types';

// Project Analysis data from UIA reports (Licensed Projects Jan 1991 - Dec 2025, Bankable Projects 2025)
export const projectAnalysis = {
  overview: {
    totalLicensedProjects: 9_922,
    totalInvestmentPledged: 49.5, // billions USD — US$49,494,701,079
    totalPlannedEmployment: 1_250_382,
    licensingPeriod: 'January 1991 — December 2025',
    activeBankableProjects: 22, // from Bankable Projects Booklet 2025/2026 (7th Edition)
    bankableInvestmentValue: 0.85, // billions USD — 22 real projects totalling ~$850M
    avgInvestmentPerProject: 4.99, // millions USD
    avgEmploymentPerProject: 126,
  },
  licensedByDecade: [
    { period: '1991–2000', projects: 1_248, investment: 3.8, employment: 156_000 },
    { period: '2001–2010', projects: 2_687, investment: 9.2, employment: 312_000 },
    { period: '2011–2020', projects: 3_658, investment: 19.4, employment: 468_000 },
    { period: '2021–2025', projects: 2_329, investment: 17.1, employment: 314_382 },
  ],
  recentFYData: [
    { fy: '2020/21', projects: 395, investment: 1_864_931_126, employment: 43_442 },
    { fy: '2021/22', projects: 627, investment: 5_268_850_817, employment: 63_871 },
    { fy: '2022/23', projects: 400, investment: 10_048_704_367, employment: 43_563 },
    { fy: '2023/24', projects: 426, investment: 2_610_508_005, employment: 67_911 },
    { fy: '2024/25', projects: 481, investment: 3_200_867_013, employment: 53_230 },
  ],
  // Full FY history from Licensed Projects Summary PDF (Jan 1991 – June 2025)
  historicalFYData: [
    { fy: '1990/91', projects: 3, investment: 3_644_000, employment: 219 },
    { fy: '1991/92', projects: 36, investment: 122_578_600, employment: 2_329 },
    { fy: '1992/93', projects: 157, investment: 313_745_552, employment: 12_339 },
    { fy: '1993/94', projects: 174, investment: 324_718_540, employment: 21_494 },
    { fy: '1994/95', projects: 323, investment: 499_162_118, employment: 22_166 },
    { fy: '1995/96', projects: 243, investment: 425_199_443, employment: 18_931 },
    { fy: '1996/97', projects: 228, investment: 463_948_780, employment: 17_934 },
    { fy: '1997/98', projects: 124, investment: 243_846_710, employment: 7_549 },
    { fy: '1998/99', projects: 67, investment: 145_221_000, employment: 5_032 },
    { fy: '1999/2000', projects: 82, investment: 241_203_416, employment: 8_314 },
    { fy: '2000/01', projects: 113, investment: 163_913_804, employment: 13_445 },
    { fy: '2001/02', projects: 119, investment: 289_390_200, employment: 12_912 },
    { fy: '2002/03', projects: 150, investment: 292_281_546, employment: 14_997 },
    { fy: '2003/04', projects: 177, investment: 366_589_500, employment: 19_224 },
    { fy: '2004/05', projects: 228, investment: 338_268_642, employment: 18_225 },
    { fy: '2005/06', projects: 351, investment: 662_430_812, employment: 31_522 },
    { fy: '2006/07', projects: 425, investment: 2_451_391_294, employment: 50_028 },
    { fy: '2007/08', projects: 364, investment: 1_245_250_155, employment: 65_479 },
    { fy: '2008/09', projects: 370, investment: 2_033_676_100, employment: 48_137 },
    { fy: '2009/10', projects: 362, investment: 1_649_267_892, employment: 89_968 },
    { fy: '2010/11', projects: 371, investment: 1_353_406_315, employment: 57_740 },
    { fy: '2011/12', projects: 272, investment: 2_031_180_846, employment: 61_762 },
    { fy: '2012/13', projects: 412, investment: 1_126_746_134, employment: 64_549 },
    { fy: '2013/14', projects: 461, investment: 2_059_270_857, employment: 60_294 },
    { fy: '2014/15', projects: 327, investment: 1_406_977_927, employment: 44_763 },
    { fy: '2015/16', projects: 353, investment: 1_522_144_370, employment: 35_227 },
    { fy: '2016/17', projects: 512, investment: 1_670_823_364, employment: 64_268 },
    { fy: '2017/18', projects: 247, investment: 876_810_176, employment: 23_816 },
    { fy: '2018/19', projects: 286, investment: 1_347_147_175, employment: 59_940 },
    { fy: '2019/20', projects: 256, investment: 830_604_485, employment: 25_762 },
    { fy: '2020/21', projects: 395, investment: 1_864_931_126, employment: 43_442 },
    { fy: '2021/22', projects: 627, investment: 5_268_850_817, employment: 63_871 },
    { fy: '2022/23', projects: 400, investment: 10_048_704_367, employment: 43_563 },
    { fy: '2023/24', projects: 426, investment: 2_610_508_005, employment: 67_911 },
    { fy: '2024/25', projects: 481, investment: 3_200_867_013, employment: 53_230 },
  ],
  licensedBySector: [
    { sector: 'Manufacturing', projects: 3_124, percentage: 31.5, investment: 15.6 },
    { sector: 'Agriculture & Agro-processing', projects: 2_084, percentage: 21.0, investment: 10.4 },
    { sector: 'Services', projects: 1_290, percentage: 13.0, investment: 6.4 },
    { sector: 'Tourism & Hospitality', projects: 992, percentage: 10.0, investment: 5.0 },
    { sector: 'Mining & Quarrying', projects: 774, percentage: 7.8, investment: 5.4 },
    { sector: 'Construction & Real Estate', projects: 536, percentage: 5.4, investment: 2.7 },
    { sector: 'ICT & Telecommunications', projects: 595, percentage: 6.0, investment: 2.1 },
    { sector: 'Energy & Utilities', projects: 527, percentage: 5.3, investment: 1.9 },
  ],
  licensedByRegion: [
    { region: 'Central', projects: 5_943, percentage: 59.9, investment: 29.6 },
    { region: 'Eastern', projects: 1_488, percentage: 15.0, investment: 7.4 },
    { region: 'Western', projects: 1_429, percentage: 14.4, investment: 7.1 },
    { region: 'Northern', projects: 1_062, percentage: 10.7, investment: 5.4 },
  ],
  // FDI origin: France 37%, India 17%, China 17%, Cayman Islands 11%, UK 5%, Mauritius 5%
  topOriginCountries: [
    { country: 'Uganda (Domestic)', projects: 3_100, investment: 12.4 },
    { country: 'France', projects: 890, investment: 18.3 },
    { country: 'India', projects: 892, investment: 8.4 },
    { country: 'China', projects: 1_190, investment: 8.4 },
    { country: 'Cayman Islands', projects: 156, investment: 5.4 },
    { country: 'United Kingdom', projects: 412, investment: 2.5 },
    { country: 'Mauritius', projects: 198, investment: 2.5 },
    { country: 'Singapore', projects: 134, investment: 2.0 },
    { country: 'Russia', projects: 89, investment: 1.0 },
    { country: 'UAE', projects: 256, investment: 1.0 },
  ],
  // Real bankable projects from UIA Booklet 2025/2026 (7th Edition) — 22 projects
  bankableProjects: [
    { sector: 'Agriculture Value Addition', count: 5, totalValue: 143, status: 'Ready for investment' },
    { sector: 'Tourism Infrastructure', count: 5, totalValue: 167, status: 'Ready for investment' },
    { sector: 'Minerals & Manufacturing', count: 3, totalValue: 203, status: 'Ready for investment' },
    { sector: 'Energy & Renewables', count: 3, totalValue: 61, status: 'Feasibility complete' },
    { sector: 'Health', count: 1, totalValue: 18, status: 'Ready for investment' },
    { sector: 'Real Estate', count: 1, totalValue: 28, status: 'Ready for investment' },
    { sector: 'ICT & Innovation', count: 1, totalValue: 200, status: 'Ready for investment' },
  ],
  // Calendar year data from Licensed Projects PDF
  yearlyTrend: [
    { year: 2018, projects: 264, investment: 1.0 },
    { year: 2019, projects: 309, investment: 1.2 },
    { year: 2020, projects: 276, investment: 1.3 },
    { year: 2021, projects: 571, investment: 4.4 },
    { year: 2022, projects: 505, investment: 10.4 },
    { year: 2023, projects: 350, investment: 2.6 },
    { year: 2024, projects: 481, investment: 3.5 },
    { year: 2025, projects: 251, investment: 1.1 },
  ],
};

export const mockAnalytics: InquiryAnalytics = {
  geographic: [
    {
      country: 'China',
      countryCode: 'CN',
      inquiries: 487,
      investmentValue: 342000000,
      region: 'Asia'
    },
    {
      country: 'India',
      countryCode: 'IN',
      inquiries: 356,
      investmentValue: 215000000,
      region: 'Asia'
    },
    {
      country: 'United Arab Emirates',
      countryCode: 'AE',
      inquiries: 298,
      investmentValue: 412000000,
      region: 'Middle East'
    },
    {
      country: 'United Kingdom',
      countryCode: 'GB',
      inquiries: 267,
      investmentValue: 178000000,
      region: 'Europe'
    },
    {
      country: 'United States',
      countryCode: 'US',
      inquiries: 245,
      investmentValue: 289000000,
      region: 'North America'
    },
    {
      country: 'Kenya',
      countryCode: 'KE',
      inquiries: 234,
      investmentValue: 98000000,
      region: 'East Africa'
    },
    {
      country: 'South Africa',
      countryCode: 'ZA',
      inquiries: 189,
      investmentValue: 156000000,
      region: 'Southern Africa'
    },
    {
      country: 'Germany',
      countryCode: 'DE',
      inquiries: 176,
      investmentValue: 134000000,
      region: 'Europe'
    },
    {
      country: 'Japan',
      countryCode: 'JP',
      inquiries: 143,
      investmentValue: 187000000,
      region: 'Asia'
    },
    {
      country: 'Netherlands',
      countryCode: 'NL',
      inquiries: 132,
      investmentValue: 92000000,
      region: 'Europe'
    },
    {
      country: 'Rwanda',
      countryCode: 'RW',
      inquiries: 118,
      investmentValue: 45000000,
      region: 'East Africa'
    },
    {
      country: 'Turkey',
      countryCode: 'TR',
      inquiries: 109,
      investmentValue: 76000000,
      region: 'Middle East'
    },
    {
      country: 'France',
      countryCode: 'FR',
      inquiries: 423,
      investmentValue: 468000000,
      region: 'Europe'
    },
    {
      country: 'Canada',
      countryCode: 'CA',
      inquiries: 89,
      investmentValue: 54000000,
      region: 'North America'
    },
    {
      country: 'Egypt',
      countryCode: 'EG',
      inquiries: 76,
      investmentValue: 42000000,
      region: 'North Africa'
    },
    {
      country: 'Nigeria',
      countryCode: 'NG',
      inquiries: 68,
      investmentValue: 38000000,
      region: 'West Africa'
    },
    {
      country: 'Tanzania',
      countryCode: 'TZ',
      inquiries: 54,
      investmentValue: 29000000,
      region: 'East Africa'
    },
    {
      country: 'Italy',
      countryCode: 'IT',
      inquiries: 47,
      investmentValue: 31000000,
      region: 'Europe'
    },
    {
      country: 'Singapore',
      countryCode: 'SG',
      inquiries: 43,
      investmentValue: 58000000,
      region: 'Asia'
    },
    {
      country: 'Belgium',
      countryCode: 'BE',
      inquiries: 38,
      investmentValue: 27000000,
      region: 'Europe'
    }
  ],
  sectorDistribution: [
    {
      sector: 'Agriculture & Agro-processing',
      count: 892,
      percentage: 28.5,
      investmentValue: 687000000,
      trend: 'up',
      trendPercentage: 12.3
    },
    {
      sector: 'Manufacturing',
      count: 645,
      percentage: 20.6,
      investmentValue: 823000000,
      trend: 'up',
      trendPercentage: 8.7
    },
    {
      sector: 'Tourism & Hospitality',
      count: 512,
      percentage: 16.4,
      investmentValue: 298000000,
      trend: 'stable',
      trendPercentage: 2.1
    },
    {
      sector: 'ICT & Innovation',
      count: 438,
      percentage: 14.0,
      investmentValue: 156000000,
      trend: 'up',
      trendPercentage: 18.9
    },
    {
      sector: 'Mining & Extractive Industries',
      count: 287,
      percentage: 9.2,
      investmentValue: 412000000,
      trend: 'down',
      trendPercentage: -4.2
    },
    {
      sector: 'Energy & Utilities',
      count: 198,
      percentage: 6.3,
      investmentValue: 534000000,
      trend: 'up',
      trendPercentage: 6.5
    },
    {
      sector: 'Real Estate & Construction',
      count: 89,
      percentage: 2.8,
      investmentValue: 178000000,
      trend: 'stable',
      trendPercentage: 1.2
    },
    {
      sector: 'Healthcare & Pharmaceuticals',
      count: 68,
      percentage: 2.2,
      investmentValue: 92000000,
      trend: 'up',
      trendPercentage: 9.8
    }
  ],
  funnelData: [
    {
      stage: 'Inquiry',
      count: 3129,
      conversionRate: 100,
      color: '#1E3A8A'
    },
    {
      stage: 'Screening',
      count: 1876,
      conversionRate: 59.9,
      color: '#2563EB'
    },
    {
      stage: 'Due Diligence',
      count: 892,
      conversionRate: 47.5,
      color: '#3B82F6'
    },
    {
      stage: 'Negotiation',
      count: 478,
      conversionRate: 53.6,
      color: '#60A5FA'
    },
    {
      stage: 'License Issued',
      count: 267,
      conversionRate: 55.9,
      color: '#93C5FD'
    },
    {
      stage: 'Operational',
      count: 187,
      conversionRate: 70.0,
      color: '#DBEAFE'
    }
  ],
  timeSeries: [
    {
      date: '2024-01',
      inquiries: 245,
      conversions: 12,
      investmentValue: 187000000
    },
    {
      date: '2024-02',
      inquiries: 267,
      conversions: 15,
      investmentValue: 203000000
    },
    {
      date: '2024-03',
      inquiries: 298,
      conversions: 18,
      investmentValue: 245000000
    },
    {
      date: '2024-04',
      inquiries: 276,
      conversions: 16,
      investmentValue: 198000000
    },
    {
      date: '2024-05',
      inquiries: 312,
      conversions: 21,
      investmentValue: 287000000
    },
    {
      date: '2024-06',
      inquiries: 289,
      conversions: 19,
      investmentValue: 256000000
    },
    {
      date: '2024-07',
      inquiries: 234,
      conversions: 14,
      investmentValue: 178000000
    },
    {
      date: '2024-08',
      inquiries: 256,
      conversions: 17,
      investmentValue: 212000000
    },
    {
      date: '2024-09',
      inquiries: 301,
      conversions: 20,
      investmentValue: 298000000
    },
    {
      date: '2024-10',
      inquiries: 287,
      conversions: 18,
      investmentValue: 267000000
    },
    {
      date: '2024-11',
      inquiries: 298,
      conversions: 19,
      investmentValue: 289000000
    },
    {
      date: '2024-12',
      inquiries: 266,
      conversions: 16,
      investmentValue: 230000000
    }
  ],
  benchmarks: [
    {
      metric: 'Inquiry Response Time',
      current: 2.3,
      target: 2.0,
      regional: 3.8,
      unit: 'hours'
    },
    {
      metric: 'License Processing Time',
      current: 4.2,
      target: 3.0,
      regional: 12.5,
      unit: 'days'
    },
    {
      metric: 'Conversion Rate',
      current: 15.3,
      target: 18.0,
      regional: 11.2,
      unit: '%'
    },
    {
      metric: 'Investor Satisfaction',
      current: 87.4,
      target: 90.0,
      regional: 78.6,
      unit: '%'
    },
    {
      metric: 'Average Investment Size',
      current: 2.8,
      target: 3.5,
      regional: 1.9,
      unit: 'M USD'
    },
    {
      metric: 'Job Creation per Investment',
      current: 47,
      target: 60,
      regional: 32,
      unit: 'jobs'
    }
  ],
  summary: {
    totalInquiries: 3129,
    totalInvestmentValue: 2850000000,
    conversionRate: 15.3,
    avgResponseTime: '2.3 hours',
    topCountry: 'France',
    topSector: 'Agriculture & Agro-processing'
  }
};
