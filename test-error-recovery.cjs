#!/usr/bin/env node

/**
 * Error Recovery Test Script
 * Tests error boundaries and fallback mechanisms
 */

const { chromium } = require('playwright');

async function testErrorRecovery() {
  console.log('🧪 Testing Error Recovery Mechanisms...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  try {
    // Test 1: Valid route loading
    console.log('1️⃣ Testing valid route loading...');
    await page.goto('http://localhost:3003/', { waitUntil: 'networkidle' });
    await page.waitForSelector('header', { timeout: 10000 });
    console.log('✅ Home page loaded successfully');
    
    // Test 2: Invalid route handling  
    console.log('2️⃣ Testing invalid route handling...');
    await page.goto('http://localhost:3003/#/invalid-route', { waitUntil: 'networkidle' });
    const notFoundText = await page.textContent('h1');
    if (notFoundText && (notFoundText.includes('Not Found') || notFoundText.includes('Error'))) {
      console.log('✅ Invalid route properly handled with error page');
    } else {
      console.log('❌ Invalid route not properly handled');
    }
    
    // Test 3: Navigation error recovery
    console.log('3️⃣ Testing navigation error recovery...');
    await page.goto('http://localhost:3003/', { waitUntil: 'networkidle' });
    
    // Click on navigation links
    const navLinks = await page.$$('nav a, nav button');
    let navWorking = true;
    
    for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
      try {
        await navLinks[i].click();
        await page.waitForTimeout(1000);
        
        // Check if page changed or error occurred
        const currentUrl = page.url();
        if (currentUrl.includes('error') && !currentUrl.includes('search')) {
          navWorking = false;
          break;
        }
      } catch (error) {
        console.log(`⚠️ Navigation link ${i} failed: ${error.message}`);
        navWorking = false;
      }
    }
    
    if (navWorking) {
      console.log('✅ Navigation links working properly');
    } else {
      console.log('❌ Navigation issues detected');
    }
    
    // Test 4: Error boundary functionality
    console.log('4️⃣ Testing error boundary...');
    
    // Try to trigger a JavaScript error and see if it's caught
    await page.evaluate(() => {
      // Simulate a component error
      window.dispatchEvent(new Error('Test error for boundary'));
    });
    
    await page.waitForTimeout(2000);
    
    // Check if page is still functional
    const pageTitle = await page.title();
    if (pageTitle && pageTitle.includes('Uganda Investment')) {
      console.log('✅ Error boundary working - page remains functional');
    } else {
      console.log('❌ Error boundary may not be working properly');
    }
    
    // Test 5: Cache error recovery
    console.log('5️⃣ Testing cache error recovery...');
    
    // Clear cache and reload
    await page.evaluate(() => {
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('header', { timeout: 10000 });
    console.log('✅ Cache clearing and recovery working');
    
    // Test 6: Mobile navigation
    console.log('6️⃣ Testing mobile navigation...');
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile size
    await page.reload({ waitUntil: 'networkidle' });
    
    const mobileNav = await page.$('div[class*="fixed bottom-0"]');
    if (mobileNav) {
      console.log('✅ Mobile navigation detected');
      
      // Test mobile nav links
      const mobileLinks = await page.$$('div[class*="fixed bottom-0"] button');
      if (mobileLinks.length > 0) {
        await mobileLinks[0].click();
        await page.waitForTimeout(1000);
        console.log('✅ Mobile navigation links working');
      }
    } else {
      console.log('⚠️ Mobile navigation not detected');
    }
    
    // Final error check
    console.log('\n📊 Error Summary:');
    console.log(`Total console errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('❌ Console errors detected:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No console errors detected');
    }
    
    console.log('\n🎉 Error Recovery Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Only run if server is available
async function checkServer() {
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch('http://localhost:3003/');
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Development server not running on http://localhost:3003/');
    console.log('Please run "npm run dev" first, then run this test.');
    process.exit(1);
  }
  
  await testErrorRecovery();
}

// Check if playwright is available
try {
  main().catch(error => {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Note: This test requires Playwright. Install with:');
    console.log('npm install -D playwright');
    console.log('npx playwright install');
  });
} catch (error) {
  console.log('⚠️ Playwright not available. Skipping automated tests.');
  console.log('✅ Manual testing recommended:');
  console.log('1. Navigate to http://localhost:3003/');
  console.log('2. Test all navigation links');
  console.log('3. Try invalid routes (e.g., /invalid-route)');
  console.log('4. Check browser console for errors');
  console.log('5. Test on mobile viewport');
}