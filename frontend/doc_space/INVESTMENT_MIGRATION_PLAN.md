# Investment Migration Plan - OneStopCentre Uganda Next.js

## Executive Summary
Strategic migration of all investment-related components, pages, and functionality from the React application to Next.js with TypeScript, ensuring seamless integration with existing routing, preserving all logos, naming conventions, and maintaining full functionality.

## Current State Analysis

### Existing Next.js Structure
- **Location**: Root directory (previously onestopcentre-nextjs)
- **Framework**: Next.js 15.5.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Current Pages**: Basic placeholder pages for investments, tools, services

### Components to Migrate
1. **Investment Components**
   - `Investments.jsx` - Main investment opportunities display
   - `InvestmentOnboardingWizard.jsx` - Step-by-step investment guide
   - `InvestmentROICalculator.jsx` - ROI calculation tool
   - `InvestorTour.jsx` - Interactive investment tour

2. **Data Files**
   - `comprehensiveInvestments.js` - Full investment database
   - `optimizedInvestments.js` - Performance-optimized investment data
   - `contactDatabase.js` - Agency contact information

3. **Pages**
   - `InvestmentsPage.jsx` - Main investments page
   - `InvestmentOnboardingPage.jsx` - Onboarding wizard page
   - `ROICalculatorPage.jsx` - ROI calculator page

## Migration Strategy

### Phase 1: Data Layer Setup
1. **Create TypeScript interfaces** for all data structures
2. **Migrate data files** with proper typing
3. **Set up contact database** with agency information
4. **Preserve all logos** and image references

### Phase 2: Component Migration
1. **Convert React components to TypeScript**
2. **Replace React Router with Next.js navigation**
3. **Update Framer Motion animations**
4. **Integrate with existing NotificationContext**

### Phase 3: Routing Integration
1. **Update App Router structure**
2. **Create proper page layouts**
3. **Implement dynamic routing** for investment categories
4. **Set up URL parameters** for filtering

### Phase 4: Feature Integration
1. **Connect with existing Header/Footer**
2. **Integrate authentication context**
3. **Set up API routes** for investment applications
4. **Implement email/phone contact handlers**

## Detailed Implementation Plan

### 1. Data Layer (Priority: HIGH)

#### Files to Create:
```
src/
  types/
    investment.ts         # Investment TypeScript interfaces
  data/
    investments/
      comprehensive.ts    # Comprehensive investment data
      optimized.ts       # Optimized investment data
      contacts.ts        # Contact database
      categories.ts      # Investment categories
```

#### Key Interfaces:
```typescript
interface Investment {
  id: string
  title: string
  category: string
  sector: string
  description: string
  investmentRange: string
  expectedROI: string
  timeline: string
  priority: 'high' | 'medium' | 'low'
  contact: ContactInfo
  requirements?: string[]
  incentives?: string[]
  riskFactors?: string[]
}

interface ContactInfo {
  agency: string
  email: string
  phone: string
  website: string
  address?: string
  logo: string
}
```

### 2. Component Structure (Priority: HIGH)

#### Components to Create/Update:
```
src/components/
  investments/
    InvestmentCard.tsx           # Individual investment card
    InvestmentGrid.tsx           # Grid/list view of investments
    InvestmentFilters.tsx        # Filter and search controls
    InvestmentDetails.tsx        # Detailed investment view
    InvestmentStats.tsx          # Statistics overview
    
  interactive/
    InvestmentOnboardingWizard.tsx  # Already exists - update
    InvestorTour.tsx                 # Already exists - update
    
  tools/
    ROICalculator.tsx               # Already exists - update
    InvestmentROICalculator.tsx     # Enhanced ROI calculator
```

### 3. Page Structure (Priority: HIGH)

#### Pages to Update:
```
src/app/
  investments/
    page.tsx                    # Main investments page
    [category]/
      page.tsx                  # Category-specific page
    onboarding/
      page.tsx                  # Investment onboarding
      
  tools/
    roi-calculator/
      page.tsx                  # Update existing
```

### 4. Routing Strategy

#### URL Structure:
- `/investments` - All investments
- `/investments?sector=agriculture` - Filtered by sector
- `/investments?search=coffee` - Search results
- `/investments/agriculture-agribusiness` - Category page
- `/investments/onboarding` - Onboarding wizard
- `/tools/roi-calculator` - ROI calculator

#### Dynamic Routing:
- Use Next.js App Router for all pages
- Implement URL parameters for filtering
- Preserve search state in URL
- Support deep linking to specific sections

### 5. Logo and Asset Preservation

#### Logo Mapping:
```typescript
const agencyLogos = {
  'UIA': '/images/logos/UIA logo.png',
  'MAAIF': '/images/logos/MINISTRY OF AGRICULTURE.png',
  'UCDA': '/images/logos/UCDA.png',
  'UTB': '/images/logos/UTB.png',
  'MEMD': '/images/logos/MINISTRY OF ENERGY.png',
  'NITA': '/images/logos/NITA.png',
  'BOU': '/images/logos/BOU.jpeg',
  'UCC': '/images/logos/UCC logo.png',
  'KCCA': '/images/logos/kcca.png',
  // ... all other agency logos
}
```

#### Image Assets:
- Keep all existing images in `public/images/`
- Maintain Uganda-specific imagery (flag, coat of arms, etc.)
- Preserve investment sector icons
- Keep background images for visual consistency

### 6. Feature Implementation Details

#### Investment Opportunities Display:
1. **Grid/List Toggle** - Preserve view mode switching
2. **Advanced Filtering** - Sector, priority, ROI range, investment size
3. **Search Functionality** - Real-time search across all fields
4. **Sorting Options** - By ROI, investment size, priority
5. **Contact Actions** - Call, Email, Website buttons for each opportunity

#### Investment Onboarding Wizard:
1. **Step 1**: Investor profile assessment
2. **Step 2**: Investment capacity evaluation
3. **Step 3**: Sector interests selection
4. **Step 4**: Contact information collection
5. **Step 5**: Investment readiness check
6. **Step 6**: Application submission

#### ROI Calculator Features:
1. **Sector-specific multipliers**
2. **Tax incentive calculations**
3. **Risk-adjusted returns**
4. **Job creation impact**
5. **Economic value assessment**
6. **Visual charts and graphs**

#### Investor Tour:
1. **Interactive walkthrough**
2. **Tier-based benefits display**
3. **Sector opportunities showcase**
4. **Timeline visualization**
5. **Contact information presentation**

### 7. Integration Points

#### With Existing Components:
- **Header.tsx** - Add investment menu items
- **Footer.tsx** - Investment quick links
- **AuthContext** - User investment profile
- **NotificationContext** - Investment notifications

#### API Routes to Create:
```
app/api/
  investments/
    route.ts              # GET all investments
    [id]/route.ts        # GET specific investment
    apply/route.ts       # POST investment application
    track/route.ts       # GET application status
  contact/
    email/route.ts       # POST email inquiry
    callback/route.ts    # POST callback request
```

### 8. State Management

#### Context Updates:
```typescript
// InvestmentContext.tsx
interface InvestmentContextType {
  selectedInvestment: Investment | null
  filters: InvestmentFilters
  viewMode: 'grid' | 'list'
  applications: Application[]
  setSelectedInvestment: (inv: Investment) => void
  setFilters: (filters: InvestmentFilters) => void
  submitApplication: (data: ApplicationData) => Promise<void>
}
```

### 9. Performance Optimizations

1. **Lazy Loading** - Load investment data on demand
2. **Memoization** - Cache filtered/sorted results
3. **Image Optimization** - Use Next.js Image component
4. **Code Splitting** - Separate bundles for each major feature
5. **Server Components** - Use where possible for better performance

### 10. Testing Strategy

#### Components to Test:
1. Investment filtering and search
2. ROI calculations accuracy
3. Form submissions in wizard
4. Contact action handlers
5. Responsive design on mobile
6. URL parameter handling

### 11. Deployment Checklist

- [ ] All TypeScript interfaces defined
- [ ] Data files migrated and typed
- [ ] Components converted to TSX
- [ ] Routing properly configured
- [ ] Logos and images preserved
- [ ] Contact actions functional
- [ ] Forms submit correctly
- [ ] Notifications working
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Error handling in place
- [ ] Loading states implemented

## Implementation Order

### Day 1: Foundation
1. Create TypeScript interfaces
2. Migrate data files
3. Set up contact database
4. Create base investment components

### Day 2: Core Features
1. Implement main Investments component
2. Create filtering and search
3. Set up investment grid/list views
4. Add contact action handlers

### Day 3: Advanced Features
1. Migrate Investment Onboarding Wizard
2. Update ROI Calculator
3. Implement Investor Tour
4. Add application tracking

### Day 4: Integration & Polish
1. Connect all routing
2. Integrate with existing layout
3. Add loading states and error handling
4. Performance optimization
5. Testing and bug fixes

## Success Criteria

1. **Functionality**: All investment features working as before
2. **Performance**: Page load under 2 seconds
3. **Accessibility**: WCAG 2.1 AA compliant
4. **Mobile**: Fully responsive on all devices
5. **SEO**: Proper meta tags and structured data
6. **User Experience**: Smooth transitions and interactions
7. **Data Integrity**: All investments displayed correctly
8. **Contact Actions**: Email, phone, website links functional
9. **State Management**: Filters and search persist correctly
10. **Error Handling**: Graceful fallbacks for all edge cases

## Risk Mitigation

1. **Data Loss**: Keep backups of all original files
2. **Breaking Changes**: Test incrementally
3. **Performance Issues**: Monitor bundle sizes
4. **Routing Conflicts**: Use unique paths
5. **State Management**: Implement proper error boundaries
6. **API Failures**: Add offline support
7. **Image Loading**: Provide fallbacks

## Post-Migration Tasks

1. Update documentation
2. Create user guides
3. Set up monitoring
4. Implement analytics
5. Gather user feedback
6. Performance profiling
7. SEO optimization
8. Accessibility audit

## Naming Conventions Preserved

- **OneStopCentre Uganda** - Main brand name
- **Uganda Investment Authority (UIA)** - Primary agency
- **InvestUganda** - Investment campaign name
- **ATMS** - Tax incentive program name
- All ministry and agency names preserved exactly

## Logo References Maintained

All logos will be referenced from `/images/logos/` with exact filenames:
- Government agencies (UIA, MAAIF, UCDA, etc.)
- Uganda national symbols (flag, coat of arms)
- Partner organizations
- Certification bodies

## Conclusion

This migration plan ensures a seamless transition of all investment functionality to Next.js while preserving the user experience, maintaining data integrity, and improving performance through TypeScript and modern React patterns. The phased approach allows for incremental testing and validation at each stage.