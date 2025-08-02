# OneStopCentre Uganda - React Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.6-646CFF.svg)](https://vitejs.dev/)

A modern, fully responsive React application for OneStopCentre Uganda - Investing in Uganda simplified. Providing streamlined access to ATMS sector investments, government services, and tax calculations.

## 🚀 Features

### Core Functionality
- **Business Services**: Company registration, tax registration, social security, and licensing
- **Investment Opportunities**: ATMS sector investments with tax incentives
- **Tax Calculator**: Real-time calculation of tax obligations and incentives
- **Support System**: Multiple contact methods and comprehensive FAQs

### User Experience Enhancements
- **Full React Architecture**: Modern component-based structure with hooks and context
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Smart Notifications**: Intelligent notification system with reduced noise option
- **Theme System**: 6 beautiful background themes with auto-rotation option
- **Advanced Search**: Real-time search with suggestions and history
- **Swipe Gestures**: Mobile-friendly navigation with touch gestures
- **Loading States**: Smooth loading animations and skeleton screens

### Technical Features
- **Performance Optimized**: Lazy loading, code splitting, and image optimization
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **PWA Ready**: Service worker integration and offline capability
- **SEO Optimized**: Meta tags, Open Graph, and structured data
- **Modern Animations**: Framer Motion for smooth transitions and interactions

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4.0
- **Animations**: Framer Motion
- **Icons**: Heroicons, Lucide React
- **UI Components**: Headless UI
- **Build Tool**: Vite with ES modules
- **Styling**: Tailwind CSS with custom design system

## 📱 Mobile Optimizations

### Responsive Design
- Mobile-first approach with breakpoint-specific designs
- Touch-friendly button sizes (minimum 44px)
- Optimized font sizes and spacing for mobile devices
- Adaptive layouts that work on all screen sizes

### Mobile Features
- **Swipe Navigation**: Swipe between sections, close modals, and trigger actions
- **Smart Notifications**: Reduced notification frequency on mobile
- **Touch Optimizations**: Enhanced touch targets and gesture recognition
- **Performance**: Optimized for mobile networks and devices

### Gesture Controls
- **Swipe Left**: Navigate to next section or close mobile menu
- **Swipe Right**: Open mobile menu or navigate to previous section
- **Swipe Up**: Close modals or scroll to top
- **Swipe Down**: Open search or scroll down

## 🎨 Design System

### Color Palette
- **Primary**: Yellow/Orange gradient (#fbbf24 to #f97316)
- **Secondary**: White with subtle shadows
- **Text**: Gray scale from #111827 to #6b7280
- **Status Colors**: Green (success), Red (error), Yellow (warning), Blue (info)

### Typography
- **Font**: Inter (system fallback to Roboto, system fonts)
- **Responsive Text**: Automatic scaling based on device size
- **Weight Scale**: 300-800 for different UI elements

### Components
- **Cards**: Glass-morphism effect with backdrop blur
- **Buttons**: Gradient backgrounds with hover animations
- **Inputs**: Rounded corners with focus states
- **Notifications**: Contextual colors with icons

## 🌈 Theme System

### Available Themes
1. **Default**: Clean white/gray gradient
2. **Sunset**: Pink/purple gradient
3. **Ocean**: Blue/purple gradient
4. **Forest**: Green/teal gradient
5. **Lavender**: Purple/pink gradient
6. **Autumn**: Orange/yellow gradient

### Theme Features
- **Auto-Rotation**: Themes change every 30 seconds when enabled
- **Smooth Transitions**: 0.8s ease transitions between themes
- **Context Preservation**: Content remains readable across all themes
- **User Preference**: Manual theme selection with localStorage persistence

## 📊 Performance Optimizations

### Loading Performance
- **Critical CSS**: Inline critical styles in HTML
- **Font Loading**: Preconnect to Google Fonts with fallbacks
- **Image Optimization**: Lazy loading with modern formats
- **Code Splitting**: Dynamic imports for route-based splitting

### Runtime Performance
- **React Optimizations**: useMemo, useCallback for expensive operations
- **Animation Performance**: Hardware acceleration with transform3d
- **Scroll Performance**: Intersection Observer for visibility detection
- **Memory Management**: Proper cleanup of event listeners and timers

### Mobile Performance
- **Touch Optimization**: Passive event listeners
- **Gesture Debouncing**: Throttled gesture recognition
- **Reduced Motion**: Respects user's motion preferences
- **Battery Optimization**: Efficient animation loops

## 🔧 Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd clean-version

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/          # React components
│   ├── Header.jsx       # Main navigation
│   ├── Hero.jsx         # Landing section
│   ├── Services.jsx     # Government services
│   ├── Investments.jsx  # ATMS sector investments
│   ├── Calculator.jsx   # Tax calculator
│   ├── Support.jsx      # Contact and support
│   ├── SearchComponent.jsx # Advanced search
│   ├── NotificationSystem.jsx # Smart notifications
│   ├── BackgroundTheme.jsx # Theme system
│   ├── SwipeGestures.jsx # Mobile gestures
│   └── LoadingScreen.jsx # Loading animations
├── contexts/           # React contexts
│   ├── NotificationContext.jsx # Notification state
│   ├── ThemeContext.jsx # Theme management
│   └── MobileContext.jsx # Mobile detection
├── App.jsx            # Main app component
├── main.jsx           # React entry point
├── index.css          # Global styles
├── input.css          # Tailwind base
└── App.css            # Component styles
```

## 🌐 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: ES2020, CSS Grid, Flexbox, Custom Properties
- **Fallbacks**: System fonts, reduced animations, basic layouts

## ♿ Accessibility

### Features
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant contrast ratios
- **Reduced Motion**: Respects user's motion preferences
- **High Contrast**: Support for high contrast mode

### Testing
- Tested with screen readers (NVDA, VoiceOver)
- Keyboard-only navigation verified
- Color contrast verified with tools
- Mobile accessibility tested on real devices

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFlare, AWS CloudFront
- **Traditional Hosting**: Any web server with static file support

### Environment Variables
No environment variables required for basic functionality.

## 📈 Analytics and Monitoring

### Performance Monitoring
- Core Web Vitals tracking ready
- Error boundary implementation
- Performance API integration points

### User Analytics
- Event tracking structure prepared
- User journey mapping ready
- Conversion funnel analytics ready

## 🔒 Security

### Features
- **CSP Ready**: Content Security Policy headers supported
- **XSS Prevention**: Sanitized user inputs
- **HTTPS Ready**: Secure by default
- **No Sensitive Data**: No API keys or secrets in frontend

## 📱 Progressive Web App (PWA)

### Features Ready
- Service worker integration points
- Web app manifest prepared
- Offline functionality structure
- Install prompts ready

## 🎯 Key Improvements Made

### 1. Full React Architecture
- Converted from vanilla JavaScript to modern React
- Component-based structure with proper state management
- Context providers for global state (notifications, theme, mobile)

### 2. Enhanced Mobile Experience
- Fully responsive design with mobile-first approach
- Touch gestures for navigation and interaction
- Optimized button sizes and touch targets
- Mobile-specific layouts and interactions

### 3. Smart Notification System
- Contextual notifications with proper positioning
- Reduced notification mode to prevent spam
- Auto-dismissal with configurable timing
- Proper notification lifecycle management

### 4. Advanced Theme System
- 6 beautiful background themes
- Auto-rotation feature with smooth transitions
- User preference persistence
- Context-aware theming that maintains readability

### 5. Performance Optimizations
- Lazy loading and code splitting
- Hardware-accelerated animations
- Optimized images and fonts
- Reduced memory footprint

### 6. User Experience Enhancements
- Advanced search with real-time suggestions
- Keyboard navigation support
- Loading states and skeleton screens
- Smooth page transitions

## 📞 Support

For technical support or questions about the application:
- **Phone**: +256 775 692 335
- **WhatsApp**: +256 775 692 335
- **Email**: support@onestopcentre.ug

## 📄 License

This project is proprietary software for OneStopCentre Uganda.

---

**OneStopCentre Uganda** - Investing in Uganda simplified...

