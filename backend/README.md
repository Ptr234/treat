# OneStopCentre Uganda Backend

Professional Node.js backend API for the OneStopCentre Uganda platform, providing secure endpoints for government services, business registration, investment opportunities, and user management.

## 🚀 Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Set Up PostgreSQL Database**
   ```bash
   # Create database
   createdb onestopcentre_db
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Configure Environment**
   ```bash
   # Required environment variables in .env
   DATABASE_URL=postgresql://username:password@localhost:5432/onestopcentre_db
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   FRONTEND_URL=https://oscdigitaltool.com
   ```

4. **Run Database Migration**
   ```bash
   npm run migrate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin only)

### Business Registration
- `POST /api/business/register` - Submit business registration
- `GET /api/business/my-registrations` - Get user's registrations
- `GET /api/business/:id` - Get specific registration
- `GET /api/business` - Get all registrations (admin)
- `PATCH /api/business/:id/status` - Update status (admin)

### Investments
- `GET /api/investments` - Get all investment opportunities
- `GET /api/investments/sectors` - Get investment sectors
- `GET /api/investments/:id` - Get specific investment
- `POST /api/investments` - Create investment (admin)

### Government Services
- `GET /api/services` - Get all government services
- `GET /api/services/categories` - Get service categories
- `GET /api/services/search` - Search services
- `GET /api/services/:id` - Get specific service

### Support
- `POST /api/support/tickets` - Create support ticket
- `GET /api/support/tickets/my` - Get user's tickets
- `POST /api/support/contact` - Public contact form
- `GET /api/support/tickets` - Get all tickets (admin)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer your_jwt_token_here
```

## 🌐 CORS Configuration

The backend is configured to work with your GitHub Pages deployment:
- Frontend URL: `https://oscdigitaltool.com`
- Development: `http://localhost:5173`

## 📊 Database Schema

Professional PostgreSQL schema includes:
- Users with role-based access
- Business registrations with status tracking
- Investment opportunities with sector categorization
- Government services catalog
- Support ticket system
- Activity logging for audit trails

## 🚀 Deployment to Render

### Automatic Deployment

1. **Connect GitHub Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `/server` directory

2. **Configure Service**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node.js

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   JWT_SECRET=your_secure_jwt_secret
   FRONTEND_URL=https://oscdigitaltool.com
   ALLOWED_ORIGINS=https://oscdigitaltool.com
   ```

4. **PostgreSQL Database**
   - Create PostgreSQL service on Render
   - Copy DATABASE_URL to web service environment

### Using render.yaml

Deploy using the included `render.yaml` configuration:

```bash
# Deploy from root directory
render-cli deploy
```

## 🔧 React Integration

### API Client Setup

```javascript
// api/client.js
const API_BASE_URL = 'https://your-backend-url.onrender.com/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Auth methods
  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = data.data.token;
    localStorage.setItem('authToken', this.token);
    return data;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Business methods
  async submitBusinessRegistration(businessData) {
    return this.request('/business/register', {
      method: 'POST',
      body: JSON.stringify(businessData),
    });
  }

  async getMyRegistrations() {
    return this.request('/business/my-registrations');
  }

  // Investment methods
  async getInvestments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/investments?${queryString}`);
  }

  // Services methods
  async getServices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/services?${queryString}`);
  }

  async searchServices(query) {
    return this.request(`/services/search?q=${encodeURIComponent(query)}`);
  }
}

export default new ApiClient();
```

### Usage in React Components

```javascript
// components/BusinessRegistration.jsx
import { useState } from 'react';
import apiClient from '../api/client';

function BusinessRegistration() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    address: '',
    district: '',
    sector: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.submitBusinessRegistration(formData);
      console.log('Registration submitted:', response.data);
      // Handle success
    } catch (error) {
      console.error('Registration failed:', error.message);
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## 📈 Monitoring & Health

- Health check endpoint: `GET /health`
- Comprehensive error logging
- Rate limiting (100 requests per 15 minutes)
- Security headers with Helmet.js

## 🔒 Security Features

- JWT authentication with secure secret rotation
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS configuration for your domain
- Input validation with Joi
- SQL injection prevention with parameterized queries
- Security headers via Helmet.js

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Health check
curl https://your-backend-url.onrender.com/health
```

## 📝 Environment Variables

Required environment variables:

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/onestopcentre_db

# Security
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://oscdigitaltool.com
ALLOWED_ORIGINS=https://oscdigitaltool.com,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test all endpoints

## 📞 Support

For API support, contact: support@onestopcentre.ug