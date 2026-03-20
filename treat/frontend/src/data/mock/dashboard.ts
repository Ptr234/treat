import { DGDashboardMetrics } from '@/types';

// Generate timestamps relative to now so mock data always looks fresh
function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600000).toISOString();
}

export const mockDashboardMetrics: DGDashboardMetrics = {
  liveInquiries: 47,
  activeCases: 156,
  pendingApprovals: 23,
  escalatedCount: 3,
  pipelineValue: 2.8,
  responseRate: 92,
  conversionRate: 15.3,
  slaCompliance: 88,
  investorSatisfaction: 87,
  agencyScorecard: [
    {
      agency: 'Uganda Investment Authority',
      acronym: 'UIA',
      score: 94,
      activeCases: 32,
      resolvedToday: 8,
      avgResponseTime: '1.8 hours',
      slaCompliance: 96
    },
    {
      agency: 'Uganda Registration Services Bureau',
      acronym: 'URSB',
      score: 91,
      activeCases: 18,
      resolvedToday: 5,
      avgResponseTime: '2.4 hours',
      slaCompliance: 93
    },
    {
      agency: 'Uganda Revenue Authority',
      acronym: 'URA',
      score: 89,
      activeCases: 24,
      resolvedToday: 6,
      avgResponseTime: '3.1 hours',
      slaCompliance: 91
    },
    {
      agency: 'Kampala Capital City Authority',
      acronym: 'KCCA',
      score: 85,
      activeCases: 15,
      resolvedToday: 3,
      avgResponseTime: '4.2 hours',
      slaCompliance: 87
    },
    {
      agency: 'Directorate of Citizenship & Immigration Control',
      acronym: 'DCIC',
      score: 82,
      activeCases: 21,
      resolvedToday: 4,
      avgResponseTime: '5.6 hours',
      slaCompliance: 84
    },
    {
      agency: 'National Environment Management Authority',
      acronym: 'NEMA',
      score: 88,
      activeCases: 12,
      resolvedToday: 2,
      avgResponseTime: '3.8 hours',
      slaCompliance: 90
    },
    {
      agency: 'Uganda National Bureau of Standards',
      acronym: 'UNBS',
      score: 86,
      activeCases: 9,
      resolvedToday: 2,
      avgResponseTime: '4.5 hours',
      slaCompliance: 88
    },
    {
      agency: 'Ministry of Lands, Housing & Urban Development',
      acronym: 'MLHUD',
      score: 79,
      activeCases: 16,
      resolvedToday: 1,
      avgResponseTime: '7.2 hours',
      slaCompliance: 78
    },
    {
      agency: 'National Social Security Fund',
      acronym: 'NSSF',
      score: 90,
      activeCases: 9,
      resolvedToday: 3,
      avgResponseTime: '2.9 hours',
      slaCompliance: 92
    }
  ],
  alerts: [
    {
      id: 'ALT-001',
      type: 'vip_delay',
      severity: 'critical',
      title: 'VIP Investor Case Approaching Deadline',
      message: 'UAE pharmaceutical investor (TKT-2026-002, USD 50M) - land allocation deadline in 48 hours. Board approval expiring soon.',
      timestamp: hoursAgo(0.5),
      acknowledged: false,
      relatedTicketId: 'TKT-2026-002'
    },
    {
      id: 'ALT-002',
      type: 'sla_breach',
      severity: 'high',
      title: 'SLA Breach - Work Permit Processing',
      message: 'DCIC has 3 work permit applications exceeding SLA by 2+ weeks. Immediate escalation required.',
      timestamp: hoursAgo(2.5),
      acknowledged: true,
      relatedTicketId: 'TKT-2026-003'
    },
    {
      id: 'ALT-003',
      type: 'large_investment',
      severity: 'high',
      title: 'Large Investment Inquiry - Steel Manufacturing',
      message: 'Chinese consortium inquiring about USD 120M steel plant in Jinja. Minister meeting scheduled this week.',
      timestamp: hoursAgo(3),
      acknowledged: true,
      relatedTicketId: 'TKT-2026-010'
    },
    {
      id: 'ALT-004',
      type: 'high_volume',
      severity: 'medium',
      title: 'High Volume of Mining Inquiries',
      message: 'Unusual spike in gold mining inquiries (23 in last 48 hours) following new geological survey publication.',
      timestamp: hoursAgo(19),
      acknowledged: true
    },
    {
      id: 'ALT-005',
      type: 'sla_breach',
      severity: 'medium',
      title: 'UNBS Product Certification Delays',
      message: '5 product certification cases pending over 90 days due to laboratory equipment issues.',
      timestamp: hoursAgo(22),
      acknowledged: true,
      relatedTicketId: 'TKT-2026-006'
    },
    {
      id: 'ALT-006',
      type: 'large_investment',
      severity: 'medium',
      title: 'Tourism Investment - Murchison Falls',
      message: 'South African hospitality group investing USD 8.2M in luxury eco-lodge. EIA approval pending from NEMA.',
      timestamp: hoursAgo(48),
      acknowledged: true
    },
    {
      id: 'ALT-007',
      type: 'system_down',
      severity: 'low',
      title: 'URSB Online Portal Scheduled Maintenance',
      message: 'URSB online business registration portal will be down for maintenance this weekend 22:00-02:00.',
      timestamp: hoursAgo(50),
      acknowledged: true
    },
    {
      id: 'ALT-008',
      type: 'high_volume',
      severity: 'low',
      title: 'Investment Forum Registration Surge',
      message: 'Uganda Investment Forum 2026 registrations at 68% capacity (342/500). Consider expanding venue or capping.',
      timestamp: hoursAgo(72),
      acknowledged: true
    }
  ],
  recentActivity: [
    {
      id: 'ACT-001',
      action: 'License Issued',
      actor: 'Sarah Nakato (UIA)',
      target: 'Coffee Processing Facility - Mbale (LIC/2026/0234)',
      timestamp: hoursAgo(0.25),
      type: 'approval'
    },
    {
      id: 'ACT-002',
      action: 'VIP Meeting Scheduled',
      actor: 'Dr. Chris Kassami (UIA ED)',
      target: 'Chinese Steel Consortium - Meeting with Minister of Finance',
      timestamp: hoursAgo(3.5),
      type: 'escalation'
    },
    {
      id: 'ACT-003',
      action: 'Case Escalated to DCIC',
      actor: 'Grace Tumusiime (UIA)',
      target: 'Work Permit Delay Complaint (TKT-2026-003)',
      timestamp: hoursAgo(4.75),
      type: 'escalation'
    },
    {
      id: 'ACT-004',
      action: 'New Inquiry Received',
      actor: 'System',
      target: 'USD 12M Solar Mini-Grid Network - German Investor',
      timestamp: hoursAgo(19.5),
      type: 'inquiry'
    },
    {
      id: 'ACT-005',
      action: 'Ticket Resolved',
      actor: 'Patrick Mugisha (UIA)',
      target: 'Tourism Tax Incentives Inquiry (TKT-2026-004)',
      timestamp: hoursAgo(21.7),
      type: 'resolution'
    },
    {
      id: 'ACT-006',
      action: 'EIA Approval Granted',
      actor: 'David Okware (NEMA)',
      target: 'Solar Farm Project - Soroti (5MW)',
      timestamp: hoursAgo(25),
      type: 'approval'
    },
    {
      id: 'ACT-007',
      action: 'Land Allocation Approved',
      actor: 'Ministry of Lands',
      target: 'Pharmaceutical Plant - Namanve (25 acres)',
      timestamp: hoursAgo(26.5),
      type: 'approval'
    },
    {
      id: 'ACT-008',
      action: 'New Inquiry Received',
      actor: 'System',
      target: 'USD 7.5M Fish Farming Complex - Norwegian Investor',
      timestamp: hoursAgo(44),
      type: 'inquiry'
    },
    {
      id: 'ACT-009',
      action: 'TIN Registration Completed',
      actor: 'Robert Kyagulanyi (URA)',
      target: 'AgriTech Solutions Ltd (TIN: 1002345678)',
      timestamp: hoursAgo(46),
      type: 'approval'
    },
    {
      id: 'ACT-010',
      action: 'Case Escalated to UNBS',
      actor: 'Grace Tumusiime (UIA)',
      target: 'Product Certification Delay Complaint (TKT-2026-006)',
      timestamp: hoursAgo(68),
      type: 'escalation'
    }
  ]
};
