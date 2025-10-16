// Core application types for OneStopCentre Uganda

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
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