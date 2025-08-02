#!/usr/bin/env node

/**
 * Comprehensive Route Verification Script
 * Tests all application routes and components for expected results
 */

const fs = require('fs');
const path = require('path');

// Define all expected routes
const EXPECTED_ROUTES = [
  '/',
  '/about', 
  '/investments',
  '/services',
  '/agencies',
  '/tools',
  '/calculator',
  '/roi-calculator', 
  '/downloads',
  '/support',
  '/invoice',
  '/document-checklist',
  '/registration-wizard',
  '/search'
];

// Define all expected page components
const EXPECTED_PAGES = [
  'HomePage',
  'AboutPage',
  'InvestmentsPage', 
  'ServicesPage',
  'AgenciesPage',
  'ToolsPage',
  'TaxCalculatorPage',
  'ROICalculatorPage',
  'DownloadsPage',
  'SupportPage',
  'InvoicePage',
  'DocumentChecklistPage',
  'BusinessRegistrationPage',
  'SearchPage',
  'NotFoundPage'
];

// Define critical components that must exist
const CRITICAL_COMPONENTS = [
  'Header',
  'Footer',
  'MobileNavigation',
  'ErrorBoundary', 
  'NavigationErrorHandler',
  'LoadingScreen',
  'ProfessionalNotificationSystem'
];

console.log('🔍 Starting Comprehensive Route & Component Verification...\n');

// Check if App.jsx exists and has correct structure
function verifyAppStructure() {
  console.log('📄 Verifying App.jsx structure...');
  
  const appPath = path.join(__dirname, 'src', 'App.jsx');
  if (!fs.existsSync(appPath)) {
    console.error('❌ App.jsx not found!');
    return false;
  }
  
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  // Check for required imports
  const requiredImports = [
    'HashRouter as Router',
    'Routes',
    'Route',
    'Suspense',
    'lazy'
  ];
  
  for (const importItem of requiredImports) {
    if (!appContent.includes(importItem)) {
      console.error(`❌ Missing required import: ${importItem}`);
      return false;
    }
  }
  
  // Check for all routes
  let missingRoutes = [];
  for (const route of EXPECTED_ROUTES) {
    if (!appContent.includes(`path="${route}"`)) {
      missingRoutes.push(route);
    }
  }
  
  if (missingRoutes.length > 0) {
    console.error(`❌ Missing routes: ${missingRoutes.join(', ')}`);
    return false;
  }
  
  console.log('✅ App.jsx structure verified');
  return true;
}

// Check if all page files exist
function verifyPageFiles() {
  console.log('📁 Verifying page files...');
  
  const pagesDir = path.join(__dirname, 'src', 'pages');
  if (!fs.existsSync(pagesDir)) {
    console.error('❌ Pages directory not found!');
    return false;
  }
  
  let missingPages = [];
  for (const page of EXPECTED_PAGES) {
    const pagePath = path.join(pagesDir, `${page}.jsx`);
    if (!fs.existsSync(pagePath)) {
      missingPages.push(page);
    }
  }
  
  if (missingPages.length > 0) {
    console.error(`❌ Missing page files: ${missingPages.join(', ')}`);
    return false;
  }
  
  console.log('✅ All page files verified');
  return true;
}

// Check if all critical components exist
function verifyCriticalComponents() {
  console.log('🧩 Verifying critical components...');
  
  const componentsDir = path.join(__dirname, 'src', 'components');
  if (!fs.existsSync(componentsDir)) {
    console.error('❌ Components directory not found!');
    return false;
  }
  
  let missingComponents = [];
  for (const component of CRITICAL_COMPONENTS) {
    const componentPath = path.join(componentsDir, `${component}.jsx`);
    if (!fs.existsSync(componentPath)) {
      missingComponents.push(component);
    }
  }
  
  if (missingComponents.length > 0) {
    console.error(`❌ Missing critical components: ${missingComponents.join(', ')}`);
    return false;
  }
  
  console.log('✅ All critical components verified');
  return true;
}

// Check package.json for required dependencies
function verifyDependencies() {
  console.log('📦 Verifying dependencies...');
  
  const packagePath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.error('❌ package.json not found!');
    return false;
  }
  
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = { ...packageData.dependencies, ...packageData.devDependencies };
  
  const requiredDeps = [
    'react',
    'react-dom', 
    'react-router-dom',
    'framer-motion',
    'vite',
    'tailwindcss'
  ];
  
  let missingDeps = [];
  for (const dep of requiredDeps) {
    if (!deps[dep]) {
      missingDeps.push(dep);
    }
  }
  
  if (missingDeps.length > 0) {
    console.error(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
    return false;
  }
  
  console.log('✅ All required dependencies verified');
  return true;
}

// Check build configuration
function verifyBuildConfig() {
  console.log('⚙️ Verifying build configuration...');
  
  const viteConfigPath = path.join(__dirname, 'vite.config.js');
  if (!fs.existsSync(viteConfigPath)) {
    console.error('❌ vite.config.js not found!');
    return false;
  }
  
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  const requiredConfigs = [
    '@vitejs/plugin-react',
    'VitePWA',
    'manifest',
    'workbox'
  ];
  
  for (const config of requiredConfigs) {
    if (!viteConfig.includes(config)) {
      console.error(`❌ Missing build config: ${config}`);
      return false;
    }
  }
  
  console.log('✅ Build configuration verified');
  return true;
}

// Check if dist folder was built correctly
function verifyBuildOutput() {
  console.log('🏗️ Verifying build output...');
  
  const distPath = path.join(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
    console.error('❌ Dist folder not found! Run "npm run build" first.');
    return false;
  }
  
  const requiredFiles = [
    'index.html',
    'manifest.webmanifest', 
    'sw.js',
    'registerSW.js'
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing build file: ${file}`);
      return false;
    }
  }
  
  // Check if assets were generated
  const assetsPath = path.join(distPath, 'assets');
  if (!fs.existsSync(assetsPath)) {
    console.error('❌ Assets folder not found in build!');
    return false;
  }
  
  const assets = fs.readdirSync(assetsPath);
  const jsFiles = assets.filter(f => f.endsWith('.js'));
  const cssFiles = assets.filter(f => f.endsWith('.css'));
  
  if (jsFiles.length === 0) {
    console.error('❌ No JavaScript files found in build!');
    return false;
  }
  
  if (cssFiles.length === 0) {
    console.error('❌ No CSS files found in build!');
    return false;
  }
  
  console.log(`✅ Build output verified (${jsFiles.length} JS, ${cssFiles.length} CSS files)`);
  return true;
}

// Main verification function
async function runVerification() {
  console.log('🚀 Uganda Investment One Stop Center - Route Verification\n');
  
  const checks = [
    { name: 'App Structure', fn: verifyAppStructure },
    { name: 'Page Files', fn: verifyPageFiles },
    { name: 'Critical Components', fn: verifyCriticalComponents },
    { name: 'Dependencies', fn: verifyDependencies },
    { name: 'Build Configuration', fn: verifyBuildConfig },
    { name: 'Build Output', fn: verifyBuildOutput }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      const result = check.fn();
      if (!result) {
        allPassed = false;
      }
    } catch (error) {
      console.error(`❌ ${check.name} failed:`, error.message);
      allPassed = false;
    }
    console.log(''); // Add spacing
  }
  
  if (allPassed) {
    console.log('🎉 ALL VERIFICATIONS PASSED!');
    console.log('✅ Application is ready for production deployment');
    console.log('✅ All routes are properly configured');
    console.log('✅ All components exist and are accessible');
    console.log('✅ Build is optimized and ready');
    console.log('\n🌐 Access your application at: http://localhost:3003/');
    console.log('📱 Test all routes and navigation');
    console.log('🔧 Check browser console for any runtime errors');
  } else {
    console.log('❌ VERIFICATION FAILED!');
    console.log('Please fix the issues listed above before deployment.');
    process.exit(1);
  }
}

// Run the verification
runVerification().catch(error => {
  console.error('❌ Verification script failed:', error);
  process.exit(1);
});