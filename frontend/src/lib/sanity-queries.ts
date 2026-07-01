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
  *[_type == "licenseProject"] | order(investmentValueUSD desc) {
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
    satisfactionRating, satisfactionComment, isEscalated,
    createdAt, resolvedAt, closedAt,
    documents[] { asset->{ url } },
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

// Active escalated tickets for dashboard
export const DASHBOARD_ESCALATED_TICKETS_QUERY = `
  *[_type == "ticket" && isEscalated == true && status in ["NEW", "ASSIGNED", "IN_PROGRESS", "PENDING_EXTERNAL"]] | order(escalatedAt desc) [0...10] {
    _id, referenceNumber, title, priority, status,
    contactName, contactEmail, slaDeadlineAt, escalatedAt, createdAt,
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

// ===================== INVESTOR PROFILES =====================
export const INVESTOR_COUNT_BY_YEAR_QUERY = `
  count(*[_type == "investorProfile" && referenceNumber match $pattern])
`;

export const INVESTOR_REF_EXISTS_QUERY = `
  count(*[_type == "investorProfile" && referenceNumber == $ref]) > 0
`;

export const INVESTOR_BY_EMAIL_QUERY = `
  *[_type == "investorProfile" && email == $email][0] {
    _id, referenceNumber, name, email, phone, nationality,
    companyName, position, investorType, experience, investmentGoal,
    investmentAmount, timeHorizon, riskTolerance, primarySector,
    secondarySectors, specificInterests, capitalSource, timeframe,
    supportNeeded, status, createdAt
  }
`;

// ===================== DOWNLOADABLE RESOURCES =====================
export const DOWNLOADABLE_RESOURCES_QUERY = `
  *[_type == "downloadableResource" && isPublished == true] | order(category asc, sortOrder asc) {
    _id, title, description, category, fileType, sortOrder,
    file { asset->{ url, size, mimeType } }
  }
`;

export const DOWNLOADABLE_RESOURCES_BY_CATEGORY_QUERY = `
  *[_type == "downloadableResource" && isPublished == true && category == $category] | order(sortOrder asc) {
    _id, title, description, category, fileType, sortOrder,
    file { asset->{ url, size, mimeType } }
  }
`;

// ===================== AGENCY PROFILES (Officers) =====================
export const AGENCY_PROFILES_QUERY = `
  *[_type == "agencyProfile" && isActive == true] | order(name asc) {
    _id, name, email, role, isActive, sanityUserId,
    agency->{ _id, name, code }
  }
`;

// ===================== CHAT ENQUIRIES =====================

// Recent enquiries for admin dashboard (paginated)
export const CHAT_ENQUIRIES_QUERY = `
  *[_type == "chatEnquiry"] | order(createdAt desc) [$from...$to] {
    _id, sessionId, userName, userEmail, userPhone, userLocation,
    userMessage, botResponse, language, sentiment, tier, createdAt
  }
`;

export const CHAT_ENQUIRIES_TOTAL_COUNT_QUERY = `
  count(*[_type == "chatEnquiry"])
`;

// Aggregated stats for enquiry dashboard
export const CHAT_ENQUIRY_STATS_QUERY = `{
  "total": count(*[_type == "chatEnquiry"]),
  "today": count(*[_type == "chatEnquiry" && createdAt >= now() - 60*60*24]),
  "thisWeek": count(*[_type == "chatEnquiry" && createdAt >= now() - 60*60*24*7]),
  "byLanguage": {
    "en": count(*[_type == "chatEnquiry" && language == "en"]),
    "fr": count(*[_type == "chatEnquiry" && language == "fr"]),
    "ar": count(*[_type == "chatEnquiry" && language == "ar"]),
    "zh": count(*[_type == "chatEnquiry" && language == "zh"]),
    "sw": count(*[_type == "chatEnquiry" && language == "sw"])
  },
  "bySentiment": {
    "positive": count(*[_type == "chatEnquiry" && sentiment == "positive"]),
    "neutral": count(*[_type == "chatEnquiry" && sentiment == "neutral"]),
    "negative": count(*[_type == "chatEnquiry" && sentiment == "negative"])
  },
  "byTier": {
    "ai": count(*[_type == "chatEnquiry" && tier == "ai"]),
    "kb": count(*[_type == "chatEnquiry" && tier == "kb"]),
    "suggestions": count(*[_type == "chatEnquiry" && tier == "suggestions"])
  },
  "uniqueSessions": count(array::unique(*[_type == "chatEnquiry"].sessionId))
}`;

// All messages for a specific session (conversation view)
export const CHAT_SESSION_MESSAGES_QUERY = `
  *[_type == "chatEnquiry" && sessionId == $sessionId] | order(createdAt asc) {
    _id, userName, userEmail, userPhone, userLocation,
    userMessage, botResponse, language, sentiment, tier, createdAt
  }
`;

// ── Homepage sector cards (CMS-managed image cards) ──────────────────
export const HOMEPAGE_SECTORS_QUERY = `
  *[_type == "homepageSector" && isPublished == true] | order(order asc) {
    "title": title,
    "blurb": blurb,
    "image": image.asset->url,
    "link": coalesce(link, "/investments")
  }
`;

// ── Homepage settings (hero slideshow + section background images) ────
export const HOMEPAGE_SETTINGS_QUERY = `
  *[_type == "homepageSettings"][0]{
    "hero": heroImages[].asset->url,
    "about": aboutImage.asset->url,
    "cta": ctaImage.asset->url
  }
`;
