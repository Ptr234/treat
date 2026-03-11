import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity-client';
import {
  DASHBOARD_TICKET_STATS_QUERY,
  DASHBOARD_RECENT_TICKETS_QUERY,
  DASHBOARD_SLA_ALERTS_QUERY,
  DASHBOARD_VIP_TICKETS_QUERY,
  DASHBOARD_AGENCY_TICKETS_QUERY,
  DASHBOARD_PIPELINE_QUERY,
  DASHBOARD_ANALYTICS_LATEST_QUERY,
} from '@/lib/sanity-queries';
import { apiError } from '@/lib/api-utils';
import type { DGDashboardMetrics, AgencyScore, DGAlert, DGActivity } from '@/types';

// ── Types for raw Sanity query results ──────────────────────────────

interface TicketStats {
  total: number;
  new: number;
  assigned: number;
  inProgress: number;
  pendingExternal: number;
  resolved: number;
  closed: number;
  critical: number;
  high: number;
  escalated: number;
}

interface RawTicket {
  _id: string;
  referenceNumber: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  contactName: string;
  assignee?: string;
  isEscalated?: boolean;
  investmentSize?: string;
  sector?: string;
  slaDeadlineAt?: string;
  createdAt: string;
  resolvedAt?: string;
  closedAt?: string;
  assignedAgency?: { name: string; code: string };
}

interface RawAgencyStats {
  _id: string;
  name: string;
  code: string;
  slaResponseHours?: number;
  activeCases: number;
  resolvedToday: number;
  totalResolved: number;
  totalAssigned: number;
  slaBreaches: number;
}

interface PipelineStats {
  totalProjects: number;
  activeProjects: number;
  totalInvestmentUSD: number | null;
}

interface AnalyticsLatest {
  period: string;
  totalInquiries: number;
  resolvedInquiries: number;
  avgResolutionHours: number;
  slaComplianceRate: number;
  satisfactionAverage: number;
  funnelData?: {
    inquiries: number;
    facilitation: number;
    applications: number;
    licensing: number;
    operational: number;
  };
}

// ── Acronym mapping for agencies without a short code ───────────────

const AGENCY_ACRONYMS: Record<string, string> = {
  UIA: 'UIA',
  URSB: 'URSB',
  URA: 'URA',
  DCIC: 'DCIC',
  NEMA: 'NEMA',
  KCCA: 'KCCA',
  LANDS: 'MLHUD',
  UNBS: 'UNBS',
  ERA: 'ERA',
  NSSF: 'NSSF',
};

// ── Helper: compute agency composite score ──────────────────────────

function computeAgencyScore(a: RawAgencyStats): number {
  if (a.totalAssigned === 0) return 0; // no ticket data → no score
  const resolutionRate = a.totalResolved / a.totalAssigned;
  const slaRate = 1 - a.slaBreaches / a.totalAssigned;
  // Weighted: 50% resolution rate, 50% SLA compliance
  return Math.round((resolutionRate * 50 + slaRate * 50) * 100) / 100;
}

// ── Helper: format hours to human-readable ──────────────────────────

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} mins`;
  return `${hours.toFixed(1)} hours`;
}

// ── Helper: build alerts from ticket data ───────────────────────────

function buildAlerts(
  slaTickets: RawTicket[],
  vipTickets: RawTicket[],
  stats: TicketStats
): DGAlert[] {
  const alerts: DGAlert[] = [];
  const now = Date.now();

  // VIP tickets approaching deadline
  for (const t of vipTickets) {
    const hoursRemaining = t.slaDeadlineAt
      ? (new Date(t.slaDeadlineAt).getTime() - now) / 3600000
      : null;
    const isPastDue = hoursRemaining !== null && hoursRemaining < 0;

    alerts.push({
      id: `ALT-VIP-${t._id}`,
      type: 'vip_delay',
      severity: isPastDue ? 'critical' : 'high',
      title: `VIP Case: ${t.title}`,
      message: isPastDue
        ? `${t.referenceNumber} is past SLA deadline. Immediate action required.`
        : `${t.referenceNumber} — ${hoursRemaining !== null ? Math.round(hoursRemaining) + 'h remaining' : 'no SLA set'}.${t.investmentSize ? ' Investment: ' + t.investmentSize : ''}`,
      timestamp: t.createdAt,
      acknowledged: false,
      relatedTicketId: t.referenceNumber,
    });
  }

  // Default SLA hours by priority (used when slaDeadlineAt is missing)
  const DEFAULT_SLA_HOURS: Record<string, number> = {
    critical: 4,
    high: 8,
    medium: 24,
    low: 48,
  };

  // SLA breaches (non-VIP)
  const vipIds = new Set(vipTickets.map((t) => t._id));
  for (const t of slaTickets) {
    if (vipIds.has(t._id)) continue;

    // Compute effective deadline: explicit or derived from createdAt + priority
    let deadlineMs: number;
    if (t.slaDeadlineAt) {
      deadlineMs = new Date(t.slaDeadlineAt).getTime();
    } else {
      const slaHours = DEFAULT_SLA_HOURS[t.priority] ?? 24;
      deadlineMs = new Date(t.createdAt).getTime() + slaHours * 3600000;
    }

    const hoursRemaining = (deadlineMs - now) / 3600000;
    if (hoursRemaining > 8) continue; // only alert for <8h remaining

    const isPastDue = hoursRemaining < 0;
    alerts.push({
      id: `ALT-SLA-${t._id}`,
      type: 'sla_breach',
      severity: isPastDue ? 'high' : 'medium',
      title: isPastDue ? `SLA Breach: ${t.referenceNumber}` : `SLA Warning: ${t.referenceNumber}`,
      message: isPastDue
        ? `${t.title} has exceeded SLA by ${Math.abs(Math.round(hoursRemaining))}h. Agency: ${t.assignedAgency?.code || 'Unassigned'}.`
        : `${t.title} — ${Math.round(hoursRemaining)}h until SLA deadline. Agency: ${t.assignedAgency?.code || 'Unassigned'}.`,
      timestamp: t.createdAt,
      acknowledged: false,
      relatedTicketId: t.referenceNumber,
    });
  }

  // High volume alert if escalated tickets are >5
  if (stats.escalated > 5) {
    alerts.push({
      id: 'ALT-VOLUME-ESCALATED',
      type: 'high_volume',
      severity: 'medium',
      title: 'High Escalation Volume',
      message: `${stats.escalated} tickets currently escalated. Review may be needed.`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    });
  }

  // Sort: critical first, then high, medium, low
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  alerts.sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));

  return alerts;
}

// ── Helper: build activity feed from recent tickets ─────────────────

function buildActivityFeed(tickets: RawTicket[]): DGActivity[] {
  return tickets.map((t) => {
    let action: string;
    let type: DGActivity['type'];

    switch (t.status) {
      case 'NEW':
        action = 'New Inquiry Received';
        type = 'inquiry';
        break;
      case 'ASSIGNED':
        action = 'Case Assigned';
        type = 'approval';
        break;
      case 'IN_PROGRESS':
        action = 'Case In Progress';
        type = 'escalation';
        break;
      case 'PENDING_EXTERNAL':
        action = 'Pending External Response';
        type = 'escalation';
        break;
      case 'RESOLVED':
        action = 'Ticket Resolved';
        type = 'resolution';
        break;
      case 'CLOSED':
        action = 'Ticket Closed';
        type = 'resolution';
        break;
      default:
        action = 'Status Updated';
        type = 'inquiry';
    }

    return {
      id: `ACT-${t._id}`,
      action,
      actor: t.assignee || t.assignedAgency?.name || 'System',
      target: `${t.title} (${t.referenceNumber})`,
      timestamp: t.resolvedAt || t.closedAt || t.createdAt,
      type,
    };
  });
}

// ── GET handler ─────────────────────────────────────────────────────

export async function GET() {
  try {
    const [ticketStats, recentTickets, slaTickets, vipTickets, agencyStats, pipeline, analytics] =
      await Promise.all([
        client.fetch<TicketStats>(DASHBOARD_TICKET_STATS_QUERY),
        client.fetch<RawTicket[]>(DASHBOARD_RECENT_TICKETS_QUERY),
        client.fetch<RawTicket[]>(DASHBOARD_SLA_ALERTS_QUERY),
        client.fetch<RawTicket[]>(DASHBOARD_VIP_TICKETS_QUERY),
        client.fetch<RawAgencyStats[]>(DASHBOARD_AGENCY_TICKETS_QUERY),
        client.fetch<PipelineStats>(DASHBOARD_PIPELINE_QUERY),
        client.fetch<AnalyticsLatest | null>(DASHBOARD_ANALYTICS_LATEST_QUERY),
      ]);

    // KPI cards (guard against undefined counts from Sanity)
    const ts: TicketStats = {
      total: ticketStats.total ?? 0,
      new: ticketStats.new ?? 0,
      assigned: ticketStats.assigned ?? 0,
      inProgress: ticketStats.inProgress ?? 0,
      pendingExternal: ticketStats.pendingExternal ?? 0,
      resolved: ticketStats.resolved ?? 0,
      closed: ticketStats.closed ?? 0,
      critical: ticketStats.critical ?? 0,
      high: ticketStats.high ?? 0,
      escalated: ticketStats.escalated ?? 0,
    };

    const liveInquiries = ts.new + ts.assigned;
    const activeCases = ts.inProgress + ts.pendingExternal + ts.assigned;
    const pendingApprovals = ts.pendingExternal;
    const pipelineValue = (pipeline.totalInvestmentUSD ?? 0) / 1_000_000_000; // convert to billions

    // Performance gauges — use analytics if available, else compute from tickets
    const totalActionable = ts.total || 1;
    const responseRate = analytics?.slaComplianceRate
      ?? Math.round(((ts.resolved + ts.closed) / totalActionable) * 100);
    const conversionRate = analytics?.funnelData
      ? Math.round(((analytics.funnelData.licensing ?? 0) / Math.max(analytics.funnelData.inquiries ?? 1, 1)) * 100)
      : Math.round(((ts.resolved + ts.closed) / totalActionable) * 100);
    const slaCompliance = analytics?.slaComplianceRate
      ?? Math.round(
          ((totalActionable - ts.escalated) / totalActionable) * 100
        );
    const investorSatisfaction = analytics?.satisfactionAverage ?? 0;

    // Agency scorecard
    const agencyScorecard: AgencyScore[] = agencyStats.map((a) => ({
      agency: a.name,
      acronym: AGENCY_ACRONYMS[a.code] || a.code,
      score: computeAgencyScore(a),
      activeCases: a.activeCases,
      resolvedToday: a.resolvedToday,
      avgResponseTime: formatHours(a.slaResponseHours ?? 4),
      slaCompliance:
        a.totalAssigned > 0
          ? Math.round(((a.totalAssigned - a.slaBreaches) / a.totalAssigned) * 100)
          : 0,
    }));
    agencyScorecard.sort((a, b) => b.score - a.score);

    // Alerts
    const alerts = buildAlerts(slaTickets, vipTickets, ts);

    // Activity feed
    const recentActivity = buildActivityFeed(recentTickets).slice(0, 10);

    const metrics: DGDashboardMetrics = {
      liveInquiries,
      activeCases,
      pendingApprovals,
      pipelineValue,
      responseRate,
      conversionRate,
      slaCompliance,
      investorSatisfaction,
      agencyScorecard,
      alerts,
      recentActivity,
    };

    // Flag if data is empty so the client can decide to use mock fallback
    const isEmpty = ts.total === 0 && agencyStats.length === 0;

    return NextResponse.json(
      { success: true, data: metrics, isEmpty },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[GET /api/dashboard]', error);
    return apiError('Failed to fetch dashboard data');
  }
}
