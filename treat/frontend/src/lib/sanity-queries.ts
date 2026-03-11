// GROQ query helpers for all Sanity content types
// Use with: const data = await client.fetch(EVENTS_QUERY)
// Next.js App Router: add { next: { revalidate: 3600 } } to fetch options

// ===================== EVENTS =====================
export const EVENTS_QUERY = `
  *[_type == "event" && isPublished == true] | order(date desc) {
    _id, title, slug, date, endDate, category, description,
    location, registrationUrl, isPublished,
    image { asset->{ url } },
    resources[] { title, file { asset->{ url } }, url }
  }
`;

export const EVENT_BY_SLUG_QUERY = `
  *[_type == "event" && slug.current == $slug][0] {
    _id, title, slug, date, endDate, category, description,
    location, registrationUrl, isPublished,
    image { asset->{ url } },
    resources[] { title, file { asset->{ url } }, url }
  }
`;

// ===================== LICENSED PROJECTS =====================
export const PROJECTS_QUERY = `
  *[_type == "licenseProject"] | order(companyName asc) {
    _id, companyName, referenceNumber, sector, subSector,
    region, district, location, coordinates,
    investmentValueUSD, investmentValueRange, status,
    employmentLocal, employmentForeign, licenseDate, fiscalYear,
    nationality, isIndustrialPark, industrialParkName
  }
`;

export const PROJECTS_BY_SECTOR_QUERY = `
  *[_type == "licenseProject" && sector == $sector] | order(companyName asc) {
    _id, companyName, sector, region, status, coordinates,
    investmentValueRange, employmentLocal
  }
`;

export const PROJECTS_MAP_QUERY = `
  *[_type == "licenseProject" && defined(coordinates)] {
    _id, companyName, sector, region, status,
    coordinates, investmentValueRange
  }
`;

// ===================== AGENCIES =====================
export const AGENCIES_QUERY = `
  *[_type == "agency"] | order(name asc) {
    _id, name, code, description, contactEmail, contactPhone, website,
    logo { asset->{ url } }, services, slaResponseHours
  }
`;

export const AGENCY_BY_CODE_QUERY = `
  *[_type == "agency" && code == $code][0] {
    _id, name, code, description, contactEmail, contactPhone, website,
    logo { asset->{ url } }, services, slaResponseHours
  }
`;

// ===================== TICKETS =====================
export const TICKET_BY_REFERENCE_QUERY = `
  *[_type == "ticket" && referenceNumber == $ref][0] {
    _id, referenceNumber, title, description, category, priority, status,
    contactName, contactEmail, assignee, slaDeadlineAt,
    satisfactionRating, isEscalated, createdAt, resolvedAt, closedAt,
    assignedAgency->{ _id, name, code }
  }
`;

export const TICKETS_ADMIN_QUERY = `
  *[_type == "ticket"] | order(createdAt desc) [$from...$to] {
    _id, referenceNumber, title, category, priority, status,
    contactName, contactEmail, assignee, slaDeadlineAt,
    isEscalated, createdAt, resolvedAt,
    assignedAgency->{ name, code }
  }
`;

export const TICKET_MESSAGES_QUERY = `
  *[_type == "ticketMessage" && ticket._ref == $ticketId] | order(sentAt asc) {
    _id, content, authorName, authorRole, authorEmail,
    attachments[] { asset->{ url } }, sentAt, isInternal
  }
`;

// ===================== ANALYTICS =====================
export const ANALYTICS_BY_PERIOD_QUERY = `
  *[_type == "analyticsMetadata" && period == $period][0] {
    _id, period, totalInquiries, resolvedInquiries, avgResolutionHours,
    slaComplianceRate, satisfactionAverage, inquiriesByRegion,
    inquiriesBySector, funnelData
  }
`;

export const ANALYTICS_LIST_QUERY = `
  *[_type == "analyticsMetadata"] | order(period desc) {
    _id, period, totalInquiries, slaComplianceRate, satisfactionAverage
  }
`;

// ===================== DASHBOARD CONFIG =====================
export const DASHBOARD_CONFIG_QUERY = `
  *[_type == "dashboardConfig" && isActive == true] {
    _id, key, label, value, numericValue, alertThreshold, metadata
  }
`;

export const DASHBOARD_CONFIG_BY_KEY_QUERY = `
  *[_type == "dashboardConfig" && key == $key][0] {
    _id, key, label, value, numericValue, alertThreshold, metadata
  }
`;

// ===================== ADDITIONAL TICKET QUERIES =====================

export const EVENT_BY_ID_OR_SLUG_QUERY = `
  *[_type == "event" && (_id == $id || slug.current == $id)][0] {
    _id, title, slug, date, endDate, category, description, location,
    registrationUrl, isPublished, image { asset->{ url } },
    resources[] { title, file { asset->{ url } }, url }
  }
`;

export const TICKET_COUNT_BY_YEAR_QUERY = `
  count(*[_type == "ticket" && referenceNumber match $pattern])
`;

export const TICKET_REF_EXISTS_QUERY = `
  count(*[_type == "ticket" && referenceNumber == $ref]) > 0
`;

export const TICKETS_TOTAL_COUNT_QUERY = `
  count(*[_type == "ticket"])
`;

// ===================== DASHBOARD METRICS (Aggregated) =====================

// Ticket counts by status for KPI cards
export const DASHBOARD_TICKET_STATS_QUERY = `{
  "total": count(*[_type == "ticket"]),
  "new": count(*[_type == "ticket" && status == "NEW"]),
  "assigned": count(*[_type == "ticket" && status == "ASSIGNED"]),
  "inProgress": count(*[_type == "ticket" && status == "IN_PROGRESS"]),
  "pendingExternal": count(*[_type == "ticket" && status == "PENDING_EXTERNAL"]),
  "resolved": count(*[_type == "ticket" && status == "RESOLVED"]),
  "closed": count(*[_type == "ticket" && status == "CLOSED"]),
  "critical": count(*[_type == "ticket" && priority == "critical"]),
  "high": count(*[_type == "ticket" && priority == "high"]),
  "escalated": count(*[_type == "ticket" && isEscalated == true])
}`;

// Recent tickets for activity feed (last 20)
export const DASHBOARD_RECENT_TICKETS_QUERY = `
  *[_type == "ticket"] | order(createdAt desc) [0...20] {
    _id, referenceNumber, title, category, priority, status,
    contactName, assignee, isEscalated,
    createdAt, resolvedAt, closedAt,
    assignedAgency->{ name, code }
  }
`;

// Tickets with SLA breaches or approaching deadline
export const DASHBOARD_SLA_ALERTS_QUERY = `
  *[_type == "ticket" && status in ["NEW", "ASSIGNED", "IN_PROGRESS", "PENDING_EXTERNAL"] && defined(slaDeadlineAt)] | order(slaDeadlineAt asc) [0...20] {
    _id, referenceNumber, title, category, priority, status,
    contactName, slaDeadlineAt, isEscalated, createdAt,
    assignedAgency->{ name, code }
  }
`;

// VIP / large investment tickets
export const DASHBOARD_VIP_TICKETS_QUERY = `
  *[_type == "ticket" && (category == "vip" || priority == "critical") && status in ["NEW", "ASSIGNED", "IN_PROGRESS", "PENDING_EXTERNAL"]] | order(createdAt desc) [0...10] {
    _id, referenceNumber, title, category, priority, status,
    contactName, investmentSize, sector, slaDeadlineAt, createdAt,
    assignedAgency->{ name, code }
  }
`;

// Tickets grouped by agency for scorecard
export const DASHBOARD_AGENCY_TICKETS_QUERY = `
  *[_type == "agency"] | order(name asc) {
    _id, name, code, slaResponseHours,
    "activeCases": count(*[_type == "ticket" && assignedAgency._ref == ^._id && status in ["NEW", "ASSIGNED", "IN_PROGRESS", "PENDING_EXTERNAL"]]),
    "resolvedToday": count(*[_type == "ticket" && assignedAgency._ref == ^._id && status == "RESOLVED" && resolvedAt >= now() - 60*60*24]),
    "totalResolved": count(*[_type == "ticket" && assignedAgency._ref == ^._id && status in ["RESOLVED", "CLOSED"]]),
    "totalAssigned": count(*[_type == "ticket" && assignedAgency._ref == ^._id]),
    "slaBreaches": count(*[_type == "ticket" && assignedAgency._ref == ^._id && defined(slaDeadlineAt) && slaDeadlineAt < now() && status in ["NEW", "ASSIGNED", "IN_PROGRESS", "PENDING_EXTERNAL"]])
  }
`;

// Pipeline value from licensed projects
export const DASHBOARD_PIPELINE_QUERY = `{
  "totalProjects": count(*[_type == "licenseProject"]),
  "activeProjects": count(*[_type == "licenseProject" && status in ["Licensed", "Operational", "Under Construction"]]),
  "totalInvestmentUSD": math::sum(*[_type == "licenseProject" && defined(investmentValueUSD)].investmentValueUSD)
}`;

// Latest analytics metadata for performance gauges
export const DASHBOARD_ANALYTICS_LATEST_QUERY = `
  *[_type == "analyticsMetadata"] | order(period desc) [0] {
    _id, period, totalInquiries, resolvedInquiries,
    avgResolutionHours, slaComplianceRate, satisfactionAverage,
    funnelData
  }
`;

// ===================== AGENCY PROFILES (Officers) =====================
export const AGENCY_PROFILES_QUERY = `
  *[_type == "agencyProfile" && isActive == true] | order(name asc) {
    _id, name, email, role, isActive, sanityUserId,
    agency->{ _id, name, code }
  }
`;
