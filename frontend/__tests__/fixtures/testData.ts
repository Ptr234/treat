export const testUsers = {
  admin: {
    email: 'admin@test.local',
    password: 'Admin123!@#',
    firstName: 'Admin',
    lastName: 'User',
  },
  investorKibuli: {
    email: 'investor.kibuli@test.local',
    password: 'Investor123!@#',
    firstName: 'John',
    lastName: 'Kibuli',
    company: 'Kibuli Investments Ltd',
  },
  investorCampala: {
    email: 'investor.kampala@test.local',
    password: 'Investor123!@#',
    firstName: 'Jane',
    lastName: 'Kampala',
    company: 'Kampala Ventures',
  },
};

export const testTickets = {
  businessRegistration: {
    category: 'Business Registration',
    service: 'Company Registration',
    subject: 'Register new business entity',
    description: 'I need to register a limited liability company',
    priority: 'high',
    location: 'Kampala',
  },
  investmentInquiry: {
    category: 'Investment Inquiry',
    service: 'Investment Opportunities',
    subject: 'Industrial park investment opportunity',
    description: 'Interested in investing in the industrial park project',
    priority: 'medium',
    location: 'Jinja',
  },
  licenseApplication: {
    category: 'Licensing',
    service: 'Business License',
    subject: 'Apply for business license renewal',
    description: 'Renewal of business license for existing operations',
    priority: 'normal',
    location: 'Mbarara',
  },
};

export const testInvestments = {
  industrialPark: {
    title: 'Namanve Industrial Park',
    category: 'Infrastructure',
    sector: 'Manufacturing',
    investmentRange: '$5M - $20M',
    expectedROI: '15-20%',
    timeline: '5-7 years',
  },
  agricultureZone: {
    title: 'Export Processing Zone - Agriculture',
    category: 'Export',
    sector: 'Agriculture',
    investmentRange: '$2M - $8M',
    expectedROI: '12-18%',
    timeline: '3-5 years',
  },
  techHub: {
    title: 'Kampala Technology Innovation Hub',
    category: 'Technology',
    sector: 'IT/Software',
    investmentRange: '$1M - $5M',
    expectedROI: '20-30%',
    timeline: '2-4 years',
  },
};

export const errorScenarios = {
  invalidEmail: 'not-an-email',
  invalidPassword: '123',
  emptyFields: {
    email: '',
    password: '',
  },
  sqlInjection: "'; DROP TABLE users; --",
  xssPayload: '<script>alert("XSS")</script>',
};

export const validationTests = {
  emailFormats: [
    { email: 'valid@test.com', isValid: true },
    { email: 'user+tag@test.co.uk', isValid: true },
    { email: 'invalid@', isValid: false },
    { email: '@invalid.com', isValid: false },
    { email: 'spaces in@test.com', isValid: false },
  ],
  passwordStrength: [
    { password: 'weak', isStrong: false },
    { password: 'Medium123', isStrong: true },
    { password: 'Strong123!@#$%', isStrong: true },
  ],
  phoneNumbers: [
    { phone: '+256700000001', isValid: true },
    { phone: '+256 700 000 001', isValid: true },
    { phone: '0700000001', isValid: true },
    { phone: 'not-a-phone', isValid: false },
  ],
};

export const performanceTestData = {
  largeTicketList: Array.from({ length: 1000 }, (_, i) => ({
    reference: `TKT-${String(i + 1).padStart(6, '0')}`,
    subject: `Ticket ${i + 1}`,
    status: ['pending', 'open', 'in_progress', 'closed'][i % 4],
    priority: ['low', 'normal', 'high'][i % 3],
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  })),
  largeInvestmentList: Array.from({ length: 500 }, (_, i) => ({
    id: String(i + 1),
    title: `Investment Opportunity ${i + 1}`,
    sector: ['Manufacturing', 'Agriculture', 'Technology', 'Tourism'][i % 4],
    investmentRange: `$${Math.floor(Math.random() * 20) + 1}M`,
    roi: `${Math.floor(Math.random() * 30) + 5}%`,
  })),
};

export const regressionTests = {
  criticalPaths: [
    { path: '/dashboard', name: 'Dashboard Load' },
    { path: '/investments', name: 'Investments List' },
    { path: '/support/tickets', name: 'Tickets List' },
    { path: '/auth/login', name: 'Login Page' },
  ],
  apiEndpoints: [
    { method: 'GET', endpoint: '/api/investments', name: 'List Investments' },
    { method: 'GET', endpoint: '/api/tickets', name: 'List Tickets' },
    { method: 'POST', endpoint: '/api/tickets', name: 'Create Ticket' },
  ],
};
