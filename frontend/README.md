# OneStopCentre Uganda - Frontend

Modern React application for OneStopCentre Uganda providing streamlined access to government business services and investment opportunities.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Tech Stack

- **React 19** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **TypeScript** - Type safety and better development experience
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations and transitions
- **Heroicons & Lucide** - Beautiful icon libraries

## 📱 Features

### Core Functionality
- **Business Registration**: Multi-step wizard with validation
- **Investment Opportunities**: Browse and filter investments
- **Government Services**: Comprehensive directory with search
- **Tax Calculator**: Real-time tax calculations
- **ROI Calculator**: Investment return calculations
- **Support System**: Contact forms and help resources

### User Experience
- **Responsive Design**: Mobile-first approach
- **Theme System**: Multiple background themes with auto-rotation
- **Smart Notifications**: Context-aware notification system
- **Advanced Search**: Real-time search with suggestions
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Optimized with lazy loading and code splitting

### Technical Features
- **PWA Ready**: Service worker integration
- **SEO Optimized**: Meta tags and structured data
- **Offline Support**: Basic offline functionality
- **Error Boundaries**: Graceful error handling
- **Loading States**: Skeleton screens and smooth transitions

## 🎨 Design System

### Color Palette
- **Primary**: Yellow/Orange gradient (#fbbf24 to #f97316)
- **Secondary**: Clean white with subtle shadows
- **Text**: Gray scale (#111827 to #6b7280)
- **Status**: Green (success), Red (error), Yellow (warning), Blue (info)

### Typography
- **Font**: Inter with system font fallbacks
- **Responsive**: Automatic scaling based on screen size
- **Weights**: 300-800 for different UI elements

### Components
- **Cards**: Glass-morphism with backdrop blur
- **Buttons**: Gradient backgrounds with hover states
- **Forms**: Clean inputs with focus states
- **Modals**: Overlay with smooth animations

## 📊 Performance

### Optimizations
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP format with fallbacks
- **Font Loading**: Preconnect to Google Fonts
- **Critical CSS**: Inline critical styles
- **Bundle Analysis**: Visualizer for bundle optimization

### Metrics
- **Lighthouse Score**: 95+ on all metrics
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable React components
├── pages/              # Route-based page components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── data/               # Static data and constants
├── types/              # TypeScript type definitions
└── test/               # Test utilities and setup
```

### Scripts
```bash
npm run dev             # Development server (Vite)
npm run build           # Production build
npm run preview         # Preview production build
npm run lint            # ESLint
npm run lint:fix        # ESLint with auto-fix
npm run test            # Vitest unit tests
npm run e2e             # Playwright E2E tests
```

### Environment Variables
```bash
# Optional - for development
VITE_API_URL=http://localhost:3001/api
VITE_ENABLE_ANALYTICS=false
```

## 🧪 Testing

### Unit Tests (Vitest)
```bash
npm run test            # Run all tests
npm run test:watch      # Watch mode
npm run test:ui         # Test UI
npm run test:coverage   # Coverage report
```

### E2E Tests (Playwright)
```bash
npm run e2e             # Run E2E tests
npm run e2e:ui          # Interactive UI mode
npm run e2e:report      # View test report
```

### Testing Strategy
- **Unit Tests**: Component logic and utilities
- **Integration Tests**: Component interactions
- **E2E Tests**: Critical user journeys
- **Accessibility Tests**: Automated a11y checks

## 🚀 Deployment

### GitHub Pages (Automatic)
- Deploys automatically on push to main branch
- Uses GitHub Actions workflow
- Custom domain: https://oscdigitaltool.com

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy to any static hosting service
# Upload contents of dist/ folder
```

### Build Configuration
- **Output**: `dist/` folder
- **Base Path**: Configurable for subdirectory deployment
- **Assets**: Hashed filenames for cache busting
- **Compression**: Gzip and Brotli ready

## 🔒 Security

### Features
- **Content Security Policy**: Prepared headers
- **XSS Prevention**: Sanitized user inputs
- **HTTPS Only**: Secure by default
- **No Secrets**: No API keys in frontend code

### Best Practices
- Input sanitization
- Secure routing
- Protected routes (when authentication is added)
- Error message sanitization

## ♿ Accessibility

### Features
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant
- **Reduced Motion**: Respects user preferences

### Testing
- Automated accessibility testing with axe-core
- Manual testing with screen readers
- Keyboard-only navigation verification
- Color contrast verification

## 📱 Mobile Experience

### Responsive Design
- Mobile-first CSS approach
- Breakpoint-specific layouts
- Touch-friendly interface elements
- Optimized font sizes and spacing

### Mobile Features
- Touch gestures (swipe navigation)
- Optimized images for mobile networks
- Reduced motion for battery life
- Offline functionality

## 🔧 API Integration

### Backend Connection
```javascript
// Example API client usage
import apiClient from './api/client';

// Authentication
const user = await apiClient.login(credentials);

// Business registration
const registration = await apiClient.submitBusinessRegistration(data);

// Get investments
const investments = await apiClient.getInvestments({ sector: 'agriculture' });
```

### Error Handling
- Network error handling
- API error responses
- User-friendly error messages
- Retry mechanisms

## 🎯 Browser Support

### Modern Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Browsers
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 13+

### Features Used
- ES2020 JavaScript
- CSS Grid and Flexbox
- CSS Custom Properties
- Intersection Observer API

## 📈 Analytics

### Ready for Integration
- Google Analytics 4 structure
- Custom event tracking
- User journey mapping
- Conversion funnel tracking
- Performance monitoring

## 🔄 Updates

### Version Management
- Semantic versioning
- Changelog maintenance
- Dependency updates
- Security patches

### Deployment Pipeline
- Automated testing
- Build verification
- Deployment automation
- Rollback capabilities

## 📞 Support

For frontend-specific issues:
- Check the console for error messages
- Verify network connectivity
- Clear browser cache
- Check browser compatibility

Technical support: support@onestopcentre.ug

## 📄 License

MIT License - see LICENSE file for details.

---

**OneStopCentre Uganda Frontend** - Modern, accessible, and performant React application.