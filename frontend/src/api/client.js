import secureTokenStorage from '../utils/secureTokenStorage.js';

// Professional API client for OneStopCentre Uganda backend
const getApiBaseUrl = () => {
  // Try environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect based on current location
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // Production detection
  if (hostname === 'petergra38.github.io' || hostname.includes('onrender.com')) {
    return 'https://treat.onrender.com/api';
  }
  
  // Development fallback
  return `${protocol}//localhost:3001/api`;
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    this.initializeToken();
  }

  async initializeToken() {
    this.token = await secureTokenStorage.getToken();
  }

  async request(endpoint, options = {}) {
    // Validate and sanitize endpoint
    if (!this.isValidEndpoint(endpoint)) {
      throw new Error('Invalid API endpoint');
    }

    // Ensure we have the latest token
    if (!this.token) {
      this.token = await secureTokenStorage.getToken();
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // CSRF protection
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Add request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses (like HTML error pages)
        await response.text();
        
        // Better error messages based on status
        let message;
        if (response.status === 404) {
          message = 'API endpoint not found. Please check your connection.';
        } else if (response.status === 500) {
          message = 'Server error. Please try again later.';
        } else if (response.status === 0 || !response.status) {
          message = 'Unable to connect to server. Please check your internet connection.';
        } else {
          message = `Server error: ${response.status} ${response.statusText}`;
        }
        
        data = { 
          success: false, 
          message,
          apiUrl: this.baseURL // For debugging
        };
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      // Error logging removed for production build
      throw error;
    }
  }

  // Security validation methods
  isValidEndpoint(endpoint) {
    if (typeof endpoint !== 'string') return false;
    if (endpoint.length > 200) return false; // Prevent DOS
    if (!/^\/[a-zA-Z0-9/\-_?&=]*$/.test(endpoint)) return false; // Only allow safe characters
    return true;
  }

  sanitizeInput(input) {
    if (typeof input === 'string') {
      return input.trim().slice(0, 1000); // Limit string length
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized = {};
      Object.keys(input).forEach(key => {
        if (key.length <= 50) { // Limit key length
          sanitized[key] = this.sanitizeInput(input[key]);
        }
      });
      return sanitized;
    }
    return input;
  }

  // Authentication methods
  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Note: New auth flow doesn't immediately return token, requires verification
    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Note: New auth flow doesn't immediately return token, requires verification
    return data;
  }

  async verifyToken() {
    if (!this.token) {
      throw new Error('No token available');
    }
    
    return this.request('/auth/verify');
  }

  async verifyEmail(email, code, type = 'registration') {
    const data = await this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code, type }),
    });
    
    if (data.success && data.data.token) {
      this.token = data.data.token;
      await secureTokenStorage.setToken(this.token);
    }
    
    return data;
  }

  async googleSignIn(idToken) {
    const data = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    
    // Note: Google auth also requires email verification
    return data;
  }

  async resendVerificationCode(email, type = 'registration') {
    return this.request('/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
    });
  }

  async logout() {
    this.token = null;
    await secureTokenStorage.removeToken();
  }

  // User methods
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(updates) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Business registration methods
  async submitBusinessRegistration(businessData) {
    return this.request('/business/register', {
      method: 'POST',
      body: JSON.stringify(businessData),
    });
  }

  async getMyRegistrations(page = 1, limit = 10) {
    return this.request(`/business/my-registrations?page=${page}&limit=${limit}`);
  }

  async getBusinessRegistration(id) {
    return this.request(`/business/${id}`);
  }

  // Investment methods
  async getInvestments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/investments${queryString ? `?${queryString}` : ''}`);
  }

  async getInvestment(id) {
    return this.request(`/investments/${id}`);
  }

  async getInvestmentSectors() {
    return this.request('/investments/sectors');
  }

  // Government services methods
  async getServices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/services${queryString ? `?${queryString}` : ''}`);
  }

  async getService(id) {
    return this.request(`/services/${id}`);
  }

  async searchServices(query) {
    return this.request(`/services/search?q=${encodeURIComponent(query)}`);
  }

  async getServiceCategories() {
    return this.request('/services/categories');
  }

  async getServiceDepartments() {
    return this.request('/services/departments');
  }

  // Support methods
  async createSupportTicket(ticketData) {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async getMySupportTickets(page = 1, limit = 10) {
    return this.request(`/support/tickets/my?page=${page}&limit=${limit}`);
  }

  async getSupportTicket(id) {
    return this.request(`/support/tickets/${id}`);
  }

  async submitContactForm(contactData) {
    return this.request('/support/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  // Admin methods (if user has admin role)
  async getAllUsers(page = 1, limit = 50) {
    return this.request(`/users?page=${page}&limit=${limit}`);
  }

  async getAllBusinessRegistrations(filters = {}, page = 1, limit = 50) {
    const params = { ...filters, page, limit };
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/business?${queryString}`);
  }

  async updateBusinessStatus(id, status) {
    return this.request(`/business/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAllSupportTickets(filters = {}, page = 1, limit = 50) {
    const params = { ...filters, page, limit };
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/support/tickets?${queryString}`);
  }

  // Health check
  async healthCheck() {
    const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
    return response.json();
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

export default apiClient;

// Export the class for testing or multiple instances
export { ApiClient };