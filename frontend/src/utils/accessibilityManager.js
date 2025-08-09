// Comprehensive WCAG 2.1 AA Accessibility Manager
import { axe, toHaveNoViolations } from 'jest-axe'

export class AccessibilityManager {
  constructor() {
    this.violations = []
    this.testResults = new Map()
    this.auditConfig = {
      // WCAG 2.1 AA compliance rules
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
        'focus-management': { enabled: true },
        'semantic-markup': { enabled: true },
        'alternative-text': { enabled: true },
        'form-labels': { enabled: true },
        'heading-structure': { enabled: true },
        'landmark-regions': { enabled: true },
        'skip-links': { enabled: true }
      },
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
      exclude: ['.loading-fallback', '.hidden']
    }
  }

  // Run comprehensive accessibility audit
  async runFullAudit(container = document.body) {
    try {
      const results = await axe.run(container, this.auditConfig)
      this.processResults(results)
      return results
    } catch (error) {
      console.error('❌ Accessibility audit failed:', error)
      throw error
    }
  }

  // Process and categorize results
  processResults(results) {
    const { violations, passes, incomplete } = results
    
    this.violations = violations.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.length,
      elements: violation.nodes.map(node => node.target.join(' > '))
    }))

    // Log detailed results
    if (violations.length > 0) {
      console.group('🚨 Accessibility Violations Found')
      violations.forEach(violation => {
        console.error(`${violation.impact?.toUpperCase()}: ${violation.description}`)
        console.log(`Help: ${violation.help}`)
        console.log(`URL: ${violation.helpUrl}`)
        console.log(`Affected elements:`, violation.nodes.map(n => n.target))
      })
      console.groupEnd()
    } else {
      console.log('✅ No accessibility violations found!')
    }

    console.log(`📊 Accessibility Summary:`)
    console.log(`✅ Passed: ${passes.length} rules`)
    console.log(`🚨 Violations: ${violations.length} issues`)
    console.log(`⚠️ Incomplete: ${incomplete.length} checks`)
  }

  // Check color contrast ratios
  async checkColorContrast() {
    const elements = document.querySelectorAll('*:not(script):not(style)')
    const issues = []

    elements.forEach(element => {
      const styles = getComputedStyle(element)
      const background = styles.backgroundColor
      const color = styles.color
      
      if (background !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)') {
        const ratio = this.calculateContrastRatio(background, color)
        if (ratio < 4.5) { // WCAG AA standard
          issues.push({
            element: element.tagName + (element.className ? `.${element.className}` : ''),
            ratio: ratio.toFixed(2),
            background,
            color,
            recommendation: ratio < 3 ? 'CRITICAL' : 'WARNING'
          })
        }
      }
    })

    return issues
  }

  // Calculate contrast ratio between two colors
  calculateContrastRatio(color1, color2) {
    const getLuminance = (color) => {
      const rgb = color.match(/\d+/g)
      if (!rgb) return 0
      
      const [r, g, b] = rgb.map(c => {
        c = parseInt(c) / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }

  // Check keyboard navigation
  checkKeyboardNavigation() {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const issues = []
    
    focusableElements.forEach((element, index) => {
      // Check if element is visible
      const styles = getComputedStyle(element)
      const isVisible = styles.display !== 'none' && 
                       styles.visibility !== 'hidden' && 
                       styles.opacity !== '0'
      
      if (isVisible) {
        // Check for focus indicators
        const focusStyles = this.getFocusStyles(element)
        if (!focusStyles.hasFocusIndicator) {
          issues.push({
            element: element.tagName.toLowerCase(),
            issue: 'Missing focus indicator',
            selector: this.getElementSelector(element)
          })
        }
        
        // Check tab order
        const tabIndex = parseInt(element.tabIndex)
        if (tabIndex > 0 && tabIndex !== index + 1) {
          issues.push({
            element: element.tagName.toLowerCase(),
            issue: 'Irregular tab order',
            tabIndex,
            expectedIndex: index + 1,
            selector: this.getElementSelector(element)
          })
        }
      }
    })
    
    return issues
  }

  // Get focus styles for an element
  getFocusStyles(element) {
    // Temporarily focus element to check styles
    const originalFocus = document.activeElement
    element.focus()
    
    const focusedStyles = getComputedStyle(element, ':focus')
    const normalStyles = getComputedStyle(element)
    
    const hasFocusIndicator = 
      focusedStyles.outline !== normalStyles.outline ||
      focusedStyles.outlineWidth !== normalStyles.outlineWidth ||
      focusedStyles.boxShadow !== normalStyles.boxShadow ||
      focusedStyles.backgroundColor !== normalStyles.backgroundColor ||
      focusedStyles.borderColor !== normalStyles.borderColor
    
    // Restore original focus
    if (originalFocus) {
      originalFocus.focus()
    } else {
      element.blur()
    }
    
    return { hasFocusIndicator }
  }

  // Check ARIA labels and roles
  checkAriaCompliance() {
    const issues = []
    
    // Check required ARIA labels
    const elementsNeedingLabels = document.querySelectorAll(
      'button:not([aria-label]):not([aria-labelledby]), ' +
      'input:not([aria-label]):not([aria-labelledby]):not([id]), ' +
      '[role="button"]:not([aria-label]):not([aria-labelledby])'
    )
    
    elementsNeedingLabels.forEach(element => {
      issues.push({
        element: element.tagName.toLowerCase(),
        issue: 'Missing ARIA label',
        selector: this.getElementSelector(element)
      })
    })
    
    // Check invalid ARIA roles
    const elementsWithRoles = document.querySelectorAll('[role]')
    const validRoles = [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
      'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
      'contentinfo', 'definition', 'dialog', 'directory', 'document',
      'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
      'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main',
      'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
      'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation',
      'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
      'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
      'slider', 'spinbutton', 'status', 'switch', 'tab', 'table',
      'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar',
      'tooltip', 'tree', 'treegrid', 'treeitem'
    ]
    
    elementsWithRoles.forEach(element => {
      const role = element.getAttribute('role')
      if (!validRoles.includes(role)) {
        issues.push({
          element: element.tagName.toLowerCase(),
          issue: `Invalid ARIA role: ${role}`,
          selector: this.getElementSelector(element)
        })
      }
    })
    
    return issues
  }

  // Check heading structure
  checkHeadingStructure() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const issues = []
    let previousLevel = 0
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1))
      
      // Check for h1 at the start
      if (index === 0 && level !== 1) {
        issues.push({
          element: heading.tagName.toLowerCase(),
          issue: 'First heading should be h1',
          selector: this.getElementSelector(heading)
        })
      }
      
      // Check for skipped levels
      if (level > previousLevel + 1) {
        issues.push({
          element: heading.tagName.toLowerCase(),
          issue: `Heading level skipped (${previousLevel} to ${level})`,
          selector: this.getElementSelector(heading)
        })
      }
      
      // Check for empty headings
      if (!heading.textContent.trim()) {
        issues.push({
          element: heading.tagName.toLowerCase(),
          issue: 'Empty heading',
          selector: this.getElementSelector(heading)
        })
      }
      
      previousLevel = level
    })
    
    return issues
  }

  // Generate CSS selector for element
  getElementSelector(element) {
    if (element.id) return `#${element.id}`
    if (element.className) return `${element.tagName.toLowerCase()}.${element.className.split(' ')[0]}`
    return element.tagName.toLowerCase()
  }

  // Generate accessibility report
  generateReport() {
    const colorIssues = this.checkColorContrast()
    const keyboardIssues = this.checkKeyboardNavigation()
    const ariaIssues = this.checkAriaCompliance()
    const headingIssues = this.checkHeadingStructure()
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: colorIssues.length + keyboardIssues.length + ariaIssues.length + headingIssues.length,
        colorContrast: colorIssues.length,
        keyboard: keyboardIssues.length,
        aria: ariaIssues.length,
        headings: headingIssues.length
      },
      details: {
        colorContrast: colorIssues,
        keyboard: keyboardIssues,
        aria: ariaIssues,
        headings: headingIssues
      },
      recommendations: this.generateRecommendations(colorIssues, keyboardIssues, ariaIssues, headingIssues)
    }
    
    console.log('📋 Accessibility Report Generated:', report)
    return report
  }

  // Generate specific recommendations
  generateRecommendations(colorIssues, keyboardIssues, ariaIssues, headingIssues) {
    const recommendations = []
    
    if (colorIssues.length > 0) {
      recommendations.push({
        category: 'Color Contrast',
        priority: 'HIGH',
        action: 'Adjust colors to meet WCAG AA contrast ratio of 4.5:1',
        affectedElements: colorIssues.length
      })
    }
    
    if (keyboardIssues.length > 0) {
      recommendations.push({
        category: 'Keyboard Navigation',
        priority: 'HIGH',
        action: 'Add visible focus indicators and fix tab order',
        affectedElements: keyboardIssues.length
      })
    }
    
    if (ariaIssues.length > 0) {
      recommendations.push({
        category: 'ARIA Compliance',
        priority: 'MEDIUM',
        action: 'Add proper ARIA labels and use valid roles',
        affectedElements: ariaIssues.length
      })
    }
    
    if (headingIssues.length > 0) {
      recommendations.push({
        category: 'Heading Structure',
        priority: 'MEDIUM',
        action: 'Fix heading hierarchy and remove empty headings',
        affectedElements: headingIssues.length
      })
    }
    
    return recommendations
  }

  // Auto-fix common accessibility issues
  autoFix() {
    let fixedCount = 0
    
    // Add alt text to images without it
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])')
    imagesWithoutAlt.forEach(img => {
      img.setAttribute('alt', '')
      fixedCount++
    })
    
    // Add labels to form inputs
    const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby]):not([id])')
    inputsWithoutLabels.forEach((input, index) => {
      const id = `auto-input-${index}`
      input.setAttribute('id', id)
      
      const label = document.createElement('label')
      label.setAttribute('for', id)
      label.className = 'sr-only'
      label.textContent = input.placeholder || input.type || 'Input field'
      input.parentNode.insertBefore(label, input)
      fixedCount++
    })
    
    console.log(`✅ Auto-fixed ${fixedCount} accessibility issues`)
    return fixedCount
  }
}

// Export singleton instance
export const accessibilityManager = new AccessibilityManager()

// Enhanced accessibility testing utilities for Jest
export const accessibilityTestUtils = {
  // Setup for Jest tests
  setupJestAxe: () => {
    if (typeof expect !== 'undefined' && typeof toHaveNoViolations !== 'undefined') {
      expect.extend(toHaveNoViolations)
    }
  },
  
  // Test component accessibility
  testComponentAccessibility: async (component) => {
    if (typeof axe !== 'undefined' && typeof expect !== 'undefined') {
      const results = await axe(component)
      expect(results).toHaveNoViolations()
      return results
    }
    return null
  },
  
  // Test page accessibility
  testPageAccessibility: async (page) => {
    if (typeof axe !== 'undefined' && typeof expect !== 'undefined') {
      const results = await axe(page)
      expect(results).toHaveNoViolations()
      return results
    }
    return null
  }
}

export default AccessibilityManager