const puppeteer = require('puppeteer');

async function testRoutes() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  const routes = [
    'http://localhost:3000/',
    'http://localhost:3000/services',
    'http://localhost:3000/investments',
    'http://localhost:3000/tools',
    'http://localhost:3000/support'
  ];
  
  console.log('🧪 Testing routes for errors...');
  
  for (const route of routes) {
    try {
      console.log(`Testing ${route}...`);
      await page.goto(route, { waitUntil: 'networkidle2', timeout: 10000 });
      
      // Check for error elements
      const errorElement = await page.$('.error-boundary');
      if (errorElement) {
        console.log(`❌ Error found on ${route}`);
      } else {
        console.log(`✅ ${route} loaded successfully`);
      }
      
      // Wait a bit between routes
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log(`❌ ${route} failed: ${error.message}`);
    }
  }
  
  await browser.close();
}

if (require.main === module) {
  testRoutes().catch(console.error);
}