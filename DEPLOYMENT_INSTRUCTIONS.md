# OneStopCentre Uganda - Complete Deployment Instructions

## 🚀 Production Deployment Checklist

### Phase 1: Pre-Deployment Preparation

#### 1. Fix Dynamic Import Issue
```bash
# Temporarily convert InvestmentsPage to regular import to resolve Vite hot-reload issue
# In src/App.jsx, change:
const InvestmentsPage = lazy(() => import('./pages/InvestmentsPage'))
# To:
import InvestmentsPage from './pages/InvestmentsPage'

# After deployment, revert back to lazy loading for production optimization
```

#### 2. Environment Configuration
```bash
# Create production environment variables
cp backend/.env.example backend/.env.production

# Update backend/.env.production with:
NODE_ENV=production
USE_MOCK_DB=false
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=[generate-new-64-char-secret]
ALLOWED_ORIGINS=https://yourdomain.com
PORT=10000
```

#### 3. Database Setup (PostgreSQL)
```bash
# Install PostgreSQL on Render or use external provider
# Run database migrations
cd backend
npm run migrate

# Verify database connection
npm run db:test
```

### Phase 2: Frontend Deployment (GitHub Pages)

#### 1. Build Configuration
```bash
cd frontend

# Ensure vite.config.js has correct base path
# Update base: '/repository-name/' if deploying to GitHub Pages subdirectory

# Build production version
npm run build

# Test production build locally
npm run preview
```

#### 2. GitHub Pages Setup
```bash
# In repository settings:
# - Enable GitHub Pages
# - Source: GitHub Actions
# - Configure custom domain if needed

# GitHub Actions workflow is already configured in:
# .github/workflows/deploy.yml
```

#### 3. Update Asset Paths
```bash
# Ensure all API calls point to production backend
# Update frontend/src/api/client.js baseURL to:
const baseURL = 'https://your-backend-app.onrender.com'
```

### Phase 3: Backend Deployment (Render)

#### 1. Render Service Configuration
```yaml
# render.yaml (already configured)
services:
  - type: web
    name: onestopcentre-uganda-backend
    env: node
    plan: starter # or higher for production
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: onestopcentre-postgres
          property: connectionString
```

#### 2. Database Service
```yaml
# In render.yaml
databases:
  - name: onestopcentre-postgres
    plan: starter # or higher for production
    databaseName: onestopcentre_db
    user: osc_user
```

#### 3. Environment Variables on Render
```bash
# Set in Render dashboard:
JWT_SECRET=[generate-secure-64-char-secret]
ALLOWED_ORIGINS=https://yourdomain.github.io
NODE_ENV=production
PORT=10000
```

### Phase 4: Domain & SSL Configuration

#### 1. Custom Domain Setup
```bash
# For GitHub Pages:
# - Add CNAME file to frontend/public/ with your domain
# - Configure DNS A records to GitHub Pages IPs:
#   185.199.108.153
#   185.199.109.153
#   185.199.110.153
#   185.199.111.153

# For Render:
# - Add custom domain in Render dashboard
# - Configure DNS CNAME to point to Render
```

#### 2. SSL Certificates
```bash
# GitHub Pages: Automatic SSL with Let's Encrypt
# Render: Automatic SSL with custom domains
# Ensure "Enforce HTTPS" is enabled
```

### Phase 5: Performance Optimization

#### 1. CDN Configuration
```bash
# Enable CloudFlare or similar CDN
# Configure caching rules:
# - Static assets: 1 year cache
# - HTML files: No cache
# - API responses: 1 hour cache
```

#### 2. Security Headers
```bash
# Already configured in frontend/dist/.htaccess and _headers
# Additional security headers for production:
# - Strict-Transport-Security
# - Content-Security-Policy
# - X-Frame-Options
```

### Phase 6: Monitoring & Analytics

#### 1. Production Monitoring
```bash
# The monitoring system is already configured
# For production, integrate with:
# - Google Analytics
# - Sentry for error tracking
# - LogRocket for user sessions
```

#### 2. Performance Monitoring
```bash
# Configure monitoring alerts:
# - Core Web Vitals
# - API response times
# - Error rates
# - Uptime monitoring
```

### Phase 7: Testing & Quality Assurance

#### 1. Pre-Deployment Testing
```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
npm run test

# End-to-end testing
npm run test:e2e
```

#### 2. Production Smoke Tests
```bash
# Test critical user journeys:
# 1. Homepage loads
# 2. Investment Opportunities page
# 3. Investment Pathway Finder
# 4. Service discovery
# 5. Contact forms
# 6. Mobile navigation
```

### Phase 8: Deployment Steps

#### 1. Backend Deployment
```bash
# 1. Push to main branch
git add .
git commit -m "🚀 Production deployment"
git push origin main

# 2. Deploy to Render (automatic via GitHub integration)
# 3. Verify deployment in Render dashboard
# 4. Test API endpoints
```

#### 2. Frontend Deployment
```bash
# 1. Update API endpoints to production URLs
# 2. Build production version
npm run build

# 3. Deploy via GitHub Actions (automatic on push to main)
# 4. Verify deployment at GitHub Pages URL
```

### Phase 9: Post-Deployment Verification

#### 1. Functionality Testing
- [ ] Homepage loads with investment statistics
- [ ] Navigation works on all devices
- [ ] Investment Pathway Finder functional
- [ ] All investment pages accessible
- [ ] Contact forms submit successfully
- [ ] Mobile navigation responsive
- [ ] Service worker caching active

#### 2. Performance Verification
- [ ] Core Web Vitals scores (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] No console errors
- [ ] Progressive Web App features working

#### 3. Security Verification
- [ ] HTTPS enforced on all pages
- [ ] Security headers present
- [ ] No mixed content warnings
- [ ] CORS properly configured
- [ ] Authentication working

### Phase 10: Go-Live Checklist

#### Final Steps Before Launch
```bash
# 1. DNS propagation complete (24-48 hours)
# 2. SSL certificates active
# 3. All redirects working
# 4. Search engine indexing configured
# 5. Social media metadata set
# 6. Analytics tracking active
# 7. Error monitoring configured
# 8. Backup procedures established
```

#### Post-Launch Monitoring
```bash
# Week 1: Daily monitoring
# - Error rates
# - Performance metrics
# - User feedback
# - Server resources

# Week 2-4: Weekly monitoring
# - Performance trends
# - User analytics
# - Security scans
# - Database optimization
```

### Emergency Rollback Plan

#### If Issues Arise
```bash
# Frontend rollback:
# 1. Revert GitHub Pages to previous commit
# 2. Redeploy previous working version

# Backend rollback:
# 1. Use Render dashboard to rollback to previous deployment
# 2. Verify database integrity
# 3. Test critical functions

# Communication plan:
# 1. Status page updates
# 2. User notifications
# 3. Stakeholder alerts
```

### Support & Maintenance

#### Ongoing Tasks
- **Daily**: Monitor error rates and performance
- **Weekly**: Security updates and dependency checks
- **Monthly**: Performance optimization and user analytics review
- **Quarterly**: Security audits and penetration testing

#### Contact Information
- **Technical Lead**: [Your contact]
- **DevOps**: [DevOps contact]
- **Emergency**: [Emergency contact]

---

## 🎯 Success Metrics

### Key Performance Indicators
- **Uptime**: 99.9%
- **Page Load Time**: < 3 seconds
- **API Response Time**: < 500ms
- **Error Rate**: < 1%
- **User Satisfaction**: > 4.5/5
- **Mobile Performance**: 90+ Lighthouse score

### Business Metrics
- **Investment Inquiries**: Track via forms
- **Service Completions**: Monitor conversion rates
- **User Engagement**: Time on site, pages per visit
- **Mobile Usage**: % of mobile users
- **Return Visitors**: User retention rate

---

*This deployment guide ensures a professional, secure, and performant launch of the OneStopCentre Uganda Investment Platform. Follow each phase carefully and test thoroughly at each step.* 🇺🇬💼