import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/OneStopCentre Uganda/i)
    
    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('text=Home')).toBeVisible()
    await expect(page.locator('text=Services')).toBeVisible()
    await expect(page.locator('text=Investments')).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    // Test Services navigation
    await page.click('text=Services')
    await expect(page).toHaveURL(/.*services/)
    
    // Go back to home
    await page.goto('/')
    
    // Test Investments navigation
    await page.click('text=Investments')
    await expect(page).toHaveURL(/.*investments/)
  })

  test('should display hero section', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=OneStopCentre Uganda')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check mobile menu visibility
    const mobileMenuButton = page.locator('[aria-label="Menu"]')
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      await expect(page.locator('nav')).toBeVisible()
    }
  })

  test('should have accessible elements', async ({ page }) => {
    // Check for proper headings structure
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    // Check for alt text on images
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
    
    // Check for proper link accessibility
    const links = page.locator('a')
    const linkCount = await links.count()
    
    for (let i = 0; i < Math.min(linkCount, 10); i++) { // Check first 10 links
      const link = links.nth(i)
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      
      expect(text || ariaLabel).toBeTruthy()
    }
  })

  test('should load without console errors', async ({ page }) => {
    const consoleLogs = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Filter out known harmless errors
    const criticalErrors = consoleLogs.filter(log => 
      !log.includes('favicon') && 
      !log.includes('analytics') &&
      !log.includes('Third-party')
    )
    
    expect(criticalErrors).toHaveLength(0)
  })
})