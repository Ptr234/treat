# OneStopCentre Uganda - Complete Deployment Setup Guide

## 🚀 Quick Start Guide

Your OneStopCentre Uganda full-stack application is now ready for development and deployment!

### Development Setup

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start both frontend and backend
npm run dev

# Frontend will be available at: http://localhost:5173
# Backend API will be available at: http://localhost:3001
# API Health Check: http://localhost:3001/health
```

## 🏗️ Project Architecture

```
onestopcentre-uganda/
├── frontend/          # React + Vite (Port 5173)
│   ├── src/api/       # API client for backend communication
│   ├── src/hooks/     # React hooks including useApi, useAuth
│   └── .env.*         # Environment configurations
├── backend/           # Node.js + Express API (Port 3001)
│   ├── database/      # Database connection with mock/PostgreSQL
│   ├── routes/        # REST API endpoints
│   └── .env          # Backend configuration
└── package.json       # Monorepo scripts
```

## 🔧 Environment Configuration

### Backend (.env)
The backend is configured to use a **mock database** for development (no PostgreSQL required):

```bash
# Current setup
NODE_ENV=development
PORT=3001
USE_MOCK_DB=true        # Uses in-memory mock data
JWT_SECRET=onestopcentre_uganda_super_secure_jwt_secret_key_2024_development
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Files
- `.env.development` - Development API URL (http://localhost:3001/api)
- `.env.production` - Production API URL (will be set to your Render backend URL)

## 📊 Database Options

### Option 1: Mock Database (Current - No Setup Required)
- ✅ **Already configured and working**
- ✅ No PostgreSQL installation needed
- ✅ Includes sample data (users, investments, services)
- ✅ Perfect for development and testing

### Option 2: PostgreSQL (For Production)
```bash
# Install PostgreSQL locally
sudo apt install postgresql postgresql-contrib  # Ubuntu/Debian
brew install postgresql                         # macOS

# Create database
createdb onestopcentre_db

# Update backend/.env
USE_MOCK_DB=false
DATABASE_URL=postgresql://username:password@localhost:5432/onestopcentre_db

# Run migration
cd backend && npm run migrate
```

## 🌐 API Integration

The frontend is already connected to the backend with a professional API client:

### Usage Examples

```javascript
import apiClient from '../api/client.js';

// Get investments
const investments = await apiClient.getInvestments({ sector: 'agriculture' });

// Submit business registration
const registration = await apiClient.submitBusinessRegistration({
  businessName: 'My Company',
  businessType: 'LLC',
  address: 'Kampala, Uganda',
  district: 'Kampala',
  sector: 'Technology'
});

// Authentication
const user = await apiClient.login({
  email: 'user@example.com',
  password: 'password123'
});
```

### React Hooks Available

```javascript
import { useApi, useAuth, useMutation } from '../hooks/useApi.js';

// Fetch data with loading states
const { data, loading, error } = useApi('/investments');

// Authentication hook
const { user, login, logout, isAuthenticated } = useAuth();

// For form submissions
const { mutate, loading } = useMutation();
```

## 🚀 Deployment Instructions

### Frontend Deployment (GitHub Pages)

1. **Automatic Deployment Already Setup**
   - Deploys automatically on push to main branch
   - Uses GitHub Actions workflow in `.github/workflows/deploy-frontend.yml`
   - Deploys to: https://oscdigitaltool.com

2. **Manual Update for Backend URL**
   - After deploying backend, update `frontend/.env.production`
   - Set `VITE_API_URL=https://your-backend-url.onrender.com/api`
   - Commit and push to trigger new deployment

### Backend Deployment (Render)

1. **Create New Web Service on Render**
   - Connect your GitHub repository
   - Set **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

2. **Environment Variables** (Set in Render Dashboard)
   ```
   NODE_ENV=production
   USE_MOCK_DB=false
   JWT_SECRET=your_super_secure_jwt_secret_here
   FRONTEND_URL=https://oscdigitaltool.com
   ALLOWED_ORIGINS=https://oscdigitaltool.com
   ```

3. **Database Setup** (Optional - can use mock DB initially)
   - Create PostgreSQL service on Render
   - Copy DATABASE_URL to web service environment
   - Set `USE_MOCK_DB=false`

4. **Alternative: Use Render Blueprint**
   ```bash
   # Use the included render.yaml for one-click deployment
   # Just connect the repo and Render will setup everything
   ```

## 🧪 Testing Your Setup

### Local Development Test
```bash
# Test backend health
curl http://localhost:3001/health

# Test API endpoints
curl http://localhost:3001/api/investments
curl http://localhost:3001/api/services

# Test frontend
open http://localhost:5173
```

### Production Test
```bash
# Test builds
npm run build:frontend    # Should build successfully
cd backend && npm start   # Should start in production mode
cd frontend && npm run preview  # Should serve production build
```

## 🔒 Security & Best Practices

### Already Implemented
- ✅ JWT authentication with secure secrets
- ✅ CORS properly configured for your domain
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Input validation with Joi
- ✅ Security headers with Helmet
- ✅ Environment variable management
- ✅ Error handling and logging

### For Production
- Set strong JWT_SECRET (generated automatically by Render)
- Use HTTPS only (handled by Render/GitHub Pages)
- Monitor API usage and errors
- Regular security updates

## 📱 Features Ready to Use

### User Features
- Business registration with validation
- Investment opportunities browsing
- Government services directory
- Contact forms and support tickets
- User authentication and profiles

### Admin Features (when authenticated as admin)
- User management
- Business registration approval
- Investment and service management
- Support ticket handling

### Technical Features
- Responsive design (mobile-first)
- Real-time API integration
- Error handling and validation
- Loading states and animations
- SEO optimization
- PWA capabilities

## 🐛 Troubleshooting

### Common Issues

**Frontend not connecting to backend:**
- Check if backend is running on port 3001
- Verify VITE_API_URL in environment files
- Check browser console for CORS errors

**Backend database errors:**
- Ensure USE_MOCK_DB=true for development
- For PostgreSQL: check connection string and database exists

**Build failures:**
- Run with `--legacy-peer-deps` for React 19 compatibility
- Clear node_modules and reinstall if needed

### Getting Help
- Check application logs in browser console
- Backend logs in terminal where server is running
- API health check: http://localhost:3001/health

## 🎯 Next Steps

1. **Develop Features**: The full-stack is ready - add your business logic
2. **Deploy Backend**: Set up Render deployment for your API
3. **Configure Production**: Update environment variables
4. **Add Database**: Switch to PostgreSQL when ready
5. **Monitor**: Set up logging and monitoring

## 📞 Support

Your application is production-ready with professional architecture:
- Full authentication system
- Complete CRUD operations
- Secure API with validation
- Responsive frontend
- Deployment configurations

For technical support: support@onestopcentre.ug

---
**Your OneStopCentre Uganda application is ready for production! 🚀**