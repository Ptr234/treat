// Global TypeScript Definitions for OneStopCentre Uganda
export interface BaseEntity {
  id: string;
  created_at?: Date;
  updated_at?: Date;
}

// Business Registration Types
export interface BusinessRegistration extends BaseEntity {
  businessName: string;
  businessType: 'sole_proprietorship' | 'partnership' | 'company' | 'cooperative';
  registrationNumber?: string;
  tinNumber?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  documents: BusinessDocument[];
  applicant: ApplicantInfo;
}

export interface ApplicantInfo {
  fullName: string;
  email: string;
  phone: string;
  address: {
    district: string;
    subcounty: string;
    village: string;
    postalCode?: string;
  };
  idType: 'national_id' | 'passport';
  idNumber: string;
}

export interface BusinessDocument {
  id: string;
  type: DocumentType;
  name: string;
  url?: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  required: boolean;
  uploadedAt?: Date;
}

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: 'identity' | 'business' | 'financial' | 'legal';
  maxSize: number; // in MB
  allowedFormats: string[];
}

// Investment Types
export interface Investment extends BaseEntity {
  title: string;
  description: string;
  sector: InvestmentSector;
  location: {
    district: string;
    region: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  investmentAmount: {
    min: number;
    max?: number;
    currency: 'UGX' | 'USD';
  };
  roi: {
    percentage: number;
    timeframe: string;
    risk: 'low' | 'medium' | 'high';
  };
  requirements: string[];
  benefits: string[];
  contact: ContactInfo;
  images: string[];
  documents: string[];
  status: 'active' | 'inactive' | 'pending';
}

export type InvestmentSector = 
  | 'agriculture'
  | 'manufacturing'
  | 'tourism'
  | 'energy'
  | 'ict'
  | 'health'
  | 'education'
  | 'transport'
  | 'real_estate'
  | 'mining';

// Government Services Types
export interface GovernmentService extends BaseEntity {
  name: string;
  description: string;
  agency: GovernmentAgency;
  category: ServiceCategory;
  requirements: ServiceRequirement[];
  procedure: ServiceStep[];
  fees: ServiceFee[];
  timeline: string;
  digitalAvailable: boolean;
  physicalLocationRequired: boolean;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface GovernmentAgency extends BaseEntity {
  name: string;
  abbreviation: string;
  description: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  address: Address;
  services: string[]; // Service IDs
  operatingHours: OperatingHours;
}

export interface ServiceRequirement {
  id: string;
  description: string;
  type: 'document' | 'payment' | 'application' | 'other';
  mandatory: boolean;
}

export interface ServiceStep {
  step: number;
  title: string;
  description: string;
  estimatedTime: string;
  responsible: string; // Agency or applicant
}

export interface ServiceFee {
  description: string;
  amount: number;
  currency: 'UGX' | 'USD';
  paymentMethods: PaymentMethod[];
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'credit_card';

export type ServiceCategory = 
  | 'business_registration'
  | 'licensing'
  | 'permits'
  | 'certification'
  | 'taxation'
  | 'immigration'
  | 'land'
  | 'health'
  | 'education'
  | 'transport'
  | 'utilities';

// Common Types
export interface Address {
  street?: string;
  district: string;
  region: string;
  country: string;
  postalCode?: string;
}

export interface ContactInfo {
  name: string;
  title?: string;
  email: string;
  phone: string;
  alternativePhone?: string;
}

export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  open: string; // HH:MM format
  close: string; // HH:MM format
  closed?: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    timestamp: string;
  };
}

// Form Types
export interface FormValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
}

export interface FormField<T = unknown> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'checkbox' | 'radio' | 'file' | 'textarea';
  placeholder?: string;
  options?: { value: T; label: string }[];
  validation?: FormValidation;
  defaultValue?: T;
  disabled?: boolean;
  required?: boolean;
}

// Notification Types
export interface Notification extends BaseEntity {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  readAt?: Date;
  userId?: string;
  actionUrl?: string;
  actionLabel?: string;
}

// Analytics Types
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  userAgent: string;
  ipAddress?: string;
  referrer?: string;
}

// Cache Types
export interface CacheItem<T = unknown> {
  key: string;
  data: T;
  timestamp: Date;
  expiresAt?: Date;
  tags?: string[];
}

// Error Types
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  context?: Record<string, unknown>;
  timestamp: Date;
}

// Theme Types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'comfortable' | 'spacious';
}

// Global Application State
export interface AppState {
  user?: UserProfile;
  theme: ThemeConfig;
  language: 'en' | 'sw' | 'lg';
  notifications: Notification[];
  loading: boolean;
  online: boolean;
}

export interface UserProfile extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'citizen' | 'business_owner' | 'investor' | 'admin';
  preferences: UserPreferences;
  businessRegistrations?: BusinessRegistration[];
  investments?: Investment[];
}

export interface UserPreferences {
  theme: ThemeConfig;
  language: 'en' | 'sw' | 'lg';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    dataSharing: boolean;
  };
}

// Utility Types
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type NonEmptyArray<T> = [T, ...T[]];