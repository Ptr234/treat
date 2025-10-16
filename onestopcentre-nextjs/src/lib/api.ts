// API Client for OneStopCentre Uganda Next.js Application
import { APIResponse, PaginatedResponse, BusinessRegistration, Investment, Service } from '@/types';

class APIClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://treat.onrender.com/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Add auth token if available
    const token = this.getAuthToken();
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
        meta: data.meta,
      };
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async verifyEmail(token: string) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async googleAuth(token: string) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // User methods
  async getCurrentUser() {
    return this.request('/user/profile');
  }

  async updateProfile(userData: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string;
  }>) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Business Registration methods
  async getBusinessRegistrations() {
    return this.request('/business/registrations');
  }

  async createBusinessRegistration(data: Partial<BusinessRegistration>) {
    return this.request('/business/registrations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBusinessRegistration(id: string, data: Partial<BusinessRegistration>) {
    return this.request(`/business/registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async submitBusinessRegistration(id: string) {
    return this.request(`/business/registrations/${id}/submit`, {
      method: 'POST',
    });
  }

  // Investment methods
  async getInvestments(params?: {
    sector?: string;
    location?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Investment>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/investments${searchParams.toString() ? `?${searchParams}` : ''}`;
    const result = await this.request<Investment[]>(endpoint);
    
    if (result.success) {
      return {
        ...result,
        pagination: (result.meta?.pagination as { page: number; limit: number; total: number; totalPages: number }) || {
          page: 1,
          limit: 10,
          total: result.data?.length || 0,
          totalPages: 1
        }
      };
    }
    
    return result as PaginatedResponse<Investment>;
  }

  async getInvestment(id: string) {
    return this.request(`/investments/${id}`);
  }

  // Services methods
  async getServices(params?: {
    category?: string;
    agency?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Service>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/services${searchParams.toString() ? `?${searchParams}` : ''}`;
    const result = await this.request<Service[]>(endpoint);
    
    if (result.success) {
      return {
        ...result,
        pagination: (result.meta?.pagination as { page: number; limit: number; total: number; totalPages: number }) || {
          page: 1,
          limit: 10,
          total: result.data?.length || 0,
          totalPages: 1
        }
      };
    }
    
    return result as PaginatedResponse<Service>;
  }

  async getService(id: string) {
    return this.request(`/services/${id}`);
  }

  // Agencies methods
  async getAgencies() {
    return this.request('/agencies');
  }

  async getAgency(id: string) {
    return this.request(`/agencies/${id}`);
  }

  // Upload methods
  async uploadFile(file: File, type: 'document' | 'image' = 'document') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = this.getAuthToken();
    const headers: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    try {
      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Upload failed: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('Upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // Notifications methods
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'POST',
    });
  }

  // Support methods
  async submitSupportTicket(data: {
    subject: string;
    message: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
  }) {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics methods
  async trackEvent(event: string, properties?: Record<string, unknown>) {
    return this.request('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ event, properties }),
    });
  }
}

// Create singleton instance
export const apiClient = new APIClient();

// Export default for easier importing
export default apiClient;