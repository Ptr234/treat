// Shared API request/response types — mirrors ASP.NET DTOs exactly
// These types are consumed by the Next.js frontend

// ── Standard API wrapper ────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

// ── Auth ─────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface ProfileUpdateRequest {
  name?: string;
  password?: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  picture?: string;
}

// ── Tickets ──────────────────────────────────────────────────────────
export interface CreateTicketRequest {
  title: string;
  description: string;
  category: string;
  priority?: string;
  contactEmail: string;
  contactName: string;
  contactPhone?: string;
  investorNationality?: string;
  sector?: string;
  investmentSize?: string;
  isEscalated?: boolean;
}

export interface UpdateTicketRequest {
  status?: string;
  priority?: string;
  assignee?: string;
  assignedAgencyCode?: string;
  satisfactionRating?: number;
  satisfactionComment?: string;
  isEscalated?: boolean;
}

export interface TicketMessageRequest {
  content: string;
  authorName: string;
  authorRole: string;
  authorEmail?: string;
  isInternal?: boolean;
}

export interface PublicCommentRequest {
  content: string;
  authorName: string;
  authorEmail: string;
}

// ── Chatbot ──────────────────────────────────────────────────────────
export interface ChatRequest {
  message: string;
  history: Array<{ role: string; content: string }>;
  language?: string;
  sessionId?: string;
}

export interface ChatLogRequest {
  sessionId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userLocation?: string;
  userMessage: string;
  botResponse: string;
  language: string;
  sentiment?: string;
  tier: string;
}

export interface ChatResponse {
  response: string;
  language: string;
  sentiment?: string;
  tier: string;
}

// ── Investors ────────────────────────────────────────────────────────
export interface CreateInvestorRequest {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  companyName?: string;
  position?: string;
  investorType: string;
  experience: string;
  investmentGoal: string;
  investmentAmount: string;
  timeHorizon: string;
  riskTolerance: string;
  primarySector: string;
  secondarySectors?: string[];
  specificInterests?: string;
  capitalSource: string;
  timeframe: string;
  supportNeeded?: string[];
}

export interface InvestorResponse {
  referenceNumber: string;
  name: string;
  email: string;
  status: string;
}

// ── Messages ─────────────────────────────────────────────────────────
export interface SendMessageRequest {
  channel: string;
  content: string;
  isInternal?: boolean;
}
