// Professional API client for OneStopCentre Uganda backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    // Validate and sanitize endpoint
    if (!this.isValidEndpoint(endpoint)) {
      throw new Error('Invalid API endpoint');
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

      // Validate response content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Security validation methods
  isValidEndpoint(endpoint) {
    if (typeof endpoint !== 'string') return false;
    if (endpoint.length > 200) return false; // Prevent DOS
    if (!/^\/[a-zA-Z0-9\/\-_?&=]*$/.test(endpoint)) return false; // Only allow safe characters
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
    
    if (data.success && data.data.token) {
      this.token = data.data.token;
      localStorage.setItem('authToken', this.token);
    }
    
    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.success && data.data.token) {
      this.token = data.data.token;
      localStorage.setItem('authToken', this.token);
    }
    
    return data;
  }

  async verifyToken() {
    if (!this.token) {
      throw new Error('No token available');
    }
    
    return this.request('/auth/verify');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
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