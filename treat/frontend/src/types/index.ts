// Core application types for OneStopCentre Uganda

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  picture?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pendingVerification: { email: string; type: 'registration' | 'login' } | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface BusinessRegistration {
  id?: string;
  businessName: string;
  businessType: string;
  registrationNumber?: string;
  taxNumber?: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  documents: File[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

// Investment-related types
export interface ContactInfo {
  agency: string;
  email: string;
  phone: string;
  website: string;
  address?: string;
  director?: string;
}

export interface InvestmentDocument {
  name: string;
  type: string;
  size: string;
  url: string;
}

export interface InvestmentContact {
  email: string;
  phone: string;
  website: string;
  address: string;
}

export interface InvestmentKeyMetrics {
  marketGrowth: string;
  exportValue: string;
  employmentPotential: string;
  paybackPeriod: string;
}

export interface InvestmentOpportunity {
  id: number;
  title: string;
  category: string;
  description: string;
  fullDescription: string;
  investmentRange: string;
  roi: string;
  timeline: string;
  agency: string;
  priority: string;
  keyRisks: string;
  contact: InvestmentContact;
  logoPath: string;
  marketSize: string;
  competitiveAdvantage: string;
  requiredLicenses: string[];
  incentives: string[];
  keyMetrics: InvestmentKeyMetrics;
  documents: InvestmentDocument[];
}

export interface InvestmentData {
  // Step 1: Investment Profile
  investorType: 'individual' | 'institutional' | 'foreign' | '';
  experience: 'beginner' | 'intermediate' | 'advanced' | '';
  investmentGoal: 'growth' | 'income' | 'diversification' | 'strategic' | '';
  
  // Step 2: Investment Capacity
  investmentAmount: string;
  timeHorizon: 'short-term' | 'medium-term' | 'long-term' | '';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | '';
  
  // Step 3: Sector Interest
  primarySector: string;
  secondarySectors: string[];
  specificInterests: string;
  
  // Step 4: Personal/Entity Details
  name: string;
  email: string;
  phone: string;
  nationality: string;
  companyName: string;
  position: string;
  
  // Step 5: Investment Readiness
  capitalSource: 'savings' | 'loan' | 'partnership' | 'grant' | '';
  timeframe: 'immediate' | '3-months' | '6-months' | '1-year' | '';
  supportNeeded: string[];
}

export interface ROICalculatorData {
  initialInvestment: string;
  sector: string;
  projectDuration: string;
  annualRevenue: string;
  operatingCosts: string;
  employeeCount: string;
  location: string;
  isATMSQualified: boolean;
}

export interface ROIResults {
  sector: {
    multiplier: number;
    taxCredit: number;
    description: string;
  };
  initial: number;
  duration: number;
  annualRevenue: number;
  annualProfit: number;
  netAnnualCashFlow: number;
  totalCashFlow: number;
  totalProfit: number;
  roi: number;
  annualROI: number;
  riskAdjustedROI: number;
  paybackPeriod: number;
  taxCredit: number;
  taxSavings: number;
  jobsCreated: number;
  economicImpact: number;
  normalTax: number;
  actualTax: number;
}

export interface InvestorProfile {
  tier: string;
  amount: string;
  icon: string;
  color: string;
  benefits: string[];
  successRate: string;
  minInvestment?: string;
}

export interface InvestmentSector {
  name: string;
  roi: string;
  icon: string;
  opportunities: string;
  incentives: string;
  minInvestment: string;
}

export interface InvestmentStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  visual: string;
  keyPoints?: string[];
  profiles?: InvestorProfile[];
  sectors?: InvestmentSector[];
  timeline?: Array<{
    phase: string;
    duration: string;
    description: string;
  }>;
  contacts?: Array<{
    title: string;
    contact: string;
    description: string;
    available: string;
  }>;
  action: string;
  nextStep: string;
}

export interface Investment {
  id: string;
  title: string;
  description: string;
  sector: string;
  investmentType: string;
  minimumAmount: number;
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  duration: number;
  status: 'active' | 'closed' | 'coming_soon';
  documents: string[];
  images: string[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  agency: string;
  requirements: string[];
  documents: string[];
  fee: number;
  processingTime: string;
  onlineAvailable: boolean;
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
}

export interface Agency {
  id: string;
  name: string;
  acronym: string;
  description: string;
  category: string;
  logo?: string;
  website?: string;
  services: Service[];
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    director?: string;
  };
}

export interface ROICalculation {
  initialInvestment: number;
  expectedReturn: number;
  duration: number;
  roi: number;
  totalReturn: number;
  annualReturn: number;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

export interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  isDark: boolean;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T = unknown> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Component prop types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// Next.js specific types
export interface PageProps {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface MetadataConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
}

// ============================================
// Module 1: AI Investor Assistant (Chatbot)
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language?: ChatLanguage;
  sentiment?: 'positive' | 'neutral' | 'negative';
  escalated?: boolean;
}

export type ChatLanguage = 'en' | 'fr' | 'ar' | 'zh' | 'sw';

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  language: ChatLanguage;
  startedAt: string;
  status: 'active' | 'escalated' | 'closed';
}

export interface ChatKBEntry {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  category: string;
  language: ChatLanguage;
}

// ============================================
// Module 2: Events & Investment Activities
// ============================================

export type EventCategory = 'forum' | 'mission' | 'symposium' | 'summit' | 'webinar';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface InvestmentEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  endDate?: string;
  time: string;
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
  registrationDeadline: string;
  capacity: number;
  registered: number;
  speakers: EventSpeaker[];
  resources: EventResource[];
  status: EventStatus;
  imageUrl?: string;
  organizer: string;
}

export interface EventSpeaker {
  name: string;
  title: string;
  organization: string;
  photoUrl?: string;
}

export interface EventResource {
  name: string;
  type: string;
  url: string;
  size?: string;
}

export interface EventRegistration {
  eventId: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  registeredAt: string;
}

// ============================================
// Module 3: Inquiry Analytics Dashboard
// ============================================

export interface InquiryAnalytics {
  geographic: GeographicData[];
  sectorDistribution: SectorAnalyticsData[];
  funnelData: FunnelStage[];
  timeSeries: TimeSeriesPoint[];
  benchmarks: BenchmarkData[];
  summary: AnalyticsSummary;
}

export interface GeographicData {
  country: string;
  countryCode: string;
  inquiries: number;
  investmentValue: number;
  region: string;
}

export interface SectorAnalyticsData {
  sector: string;
  count: number;
  percentage: number;
  investmentValue: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: number;
  color: string;
}

export interface TimeSeriesPoint {
  date: string;
  inquiries: number;
  conversions: number;
  investmentValue: number;
}

export interface BenchmarkData {
  metric: string;
  current: number;
  target: number;
  regional: number;
  unit: string;
}

export interface AnalyticsSummary {
  totalInquiries: number;
  totalInvestmentValue: number;
  conversionRate: number;
  avgResponseTime: string;
  topCountry: string;
  topSector: string;
}

// ============================================
// Module 4: Issue Tracking System
// ============================================

export type TicketStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_EXTERNAL' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 'general_inquiry' | 'procedure_query' | 'application_support' | 'license_delay' | 'complaint' | 'vip';

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  assignee?: string;
  assigneeAgency?: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  responseTime?: string;
  resolutionTime?: string;
  history: TicketHistoryEntry[];
  attachments: TicketAttachment[];
  satisfaction?: number;
  contactEmail: string;
  contactName: string;
}

export interface TicketHistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  status?: TicketStatus;
}

export interface TicketAttachment {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  url?: string;
}

export interface SLAConfig {
  category: TicketCategory;
  priority: TicketPriority;
  responseTime: string;
  resolutionTime: string;
}

// ============================================
// Module 6: Licensed Projects Database & Map
// ============================================

export type ProjectStatus = 'active' | 'under_construction' | 'planned' | 'completed';

export interface LicensedProject {
  id: string;
  name: string;
  company: string;
  sector: string;
  subSector?: string;
  region: string;
  district: string;
  coordinates: { lat: number; lng: number };
  investmentValue: number;
  plannedEmployment: number;
  status: ProjectStatus;
  country: string;
  industrialPark?: string;
  startDate: string;
  operationalDate?: string;
  licenseNumber?: string;
}

export interface ProjectFilter {
  sector?: string;
  region?: string;
  investmentRange?: string;
  status?: ProjectStatus;
  searchQuery?: string;
}

// ============================================
// Module 7: DG Live Dashboard
// ============================================

export interface EscalatedTicketSummary {
  referenceNumber: string;
  title: string;
  priority: string;
  status: string;
  contactName: string;
  agency: string;
  escalatedAt: string;
}

export interface DGDashboardMetrics {
  liveInquiries: number;
  activeCases: number;
  pendingApprovals: number;
  escalatedCount?: number;
  pipelineValue: number;
  responseRate: number;
  conversionRate: number;
  slaCompliance: number;
  investorSatisfaction: number;
  agencyScorecard: AgencyScore[];
  alerts: DGAlert[];
  recentActivity: DGActivity[];
  escalatedTickets?: EscalatedTicketSummary[];
}

export interface AgencyScore {
  agency: string;
  acronym: string;
  score: number;
  activeCases: number;
  resolvedToday: number;
  avgResponseTime: string;
  slaCompliance: number;
}

export type AlertType = 'vip_delay' | 'sla_breach' | 'high_volume' | 'large_investment' | 'system_down';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DGAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  relatedTicketId?: string;
}

export interface DGActivity {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  type: 'inquiry' | 'approval' | 'escalation' | 'resolution';
}