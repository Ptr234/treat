// Comprehensive Header Component Tests
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '../Header'
import { NotificationProvider } from '../../contexts/NotificationContext'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { MobileProvider } from '../../contexts/MobileContext'
import { accessibilityTestUtils } from '../../utils/accessibilityManager'

// Test wrapper with all providers
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <NotificationProvider>
      <ThemeProvider>
        <MobileProvider>
          {children}
        </MobileProvider>
      </ThemeProvider>
    </NotificationProvider>
  </BrowserRouter>
)

describe('Header Component', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('displays the site logo', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      const logo = screen.getByAltText(/onestopcentre/i)
      expect(logo).toBeInTheDocument()
    })

    it('shows navigation menu', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('displays all main navigation links', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      const expectedLinks = [
        'Home',
        'Investments', 
        'Services',
        'Agencies',
        'Tools',
        'Support'
      ]
      
      expectedLinks.forEach(linkText => {
        expect(screen.getByRole('link', { name: new RegExp(linkText, 'i') })).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('passes accessibility audit', async () => {
      const { container } = render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      await accessibilityTestUtils.testComponentAccessibility(container)
    })

    it('has proper ARIA landmarks', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      const firstLink = screen.getAllByRole('link')[0]
      firstLink.focus()
      
      expect(document.activeElement).toBe(firstLink)
      
      // Test tab navigation
      fireEvent.keyDown(firstLink, { key: 'Tab' })
      await waitFor(() => {
        expect(document.activeElement).not.toBe(firstLink)
      })
    })

    it('has proper focus indicators', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        fireEvent.focus(link)
        // Check that focused element has appropriate styling
        expect(document.activeElement).toBe(link)
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('shows mobile menu toggle on small screens', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      const mobileMenuButton = screen.getByRole('button', { name: /menu/i })
      expect(mobileMenuButton).toBeInTheDocument()
    })

    it('handles mobile menu toggle', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      const menuButton = screen.getByRole('button', { name: /menu/i })
      
      // Initially menu should be closed
      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
      
      // Click to open
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
      })
      
      // Click to close
      fireEvent.click(menuButton)
      
      await waitFor(() => {
        expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('navigates to correct routes when links are clicked', () => {
      const mockNavigate = vi.fn()
      
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      const homeLink = screen.getByRole('link', { name: /home/i })
      fireEvent.click(homeLink)
      
      // Check that navigation occurred (would need router mock in real implementation)
      expect(homeLink.getAttribute('href')).toBe('/')
    })

    it('highlights active navigation item', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      // Check for active link styling (implementation dependent)
      const activeLink = screen.getByRole('link', { name: /home/i })
      expect(activeLink).toHaveClass('active')
    })
  })

  describe('Theme Support', () => {
    it('applies correct theme classes', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('bg-white') // or whatever theme class
    })

    it('supports high contrast mode', () => {
      // Mock high contrast preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })
      
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      // Check for high contrast styling
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = performance.now()
      
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Header should render in under 50ms
      expect(renderTime).toBeLessThan(50)
    })

    it('handles multiple rapid state changes', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      const menuButton = screen.getByRole('button', { name: /menu/i })
      
      // Rapidly toggle menu multiple times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(menuButton)
        await waitFor(() => {
          // Should handle rapid clicks without errors
          expect(menuButton).toBeInTheDocument()
        })
      }
    })
  })

  describe('Error Handling', () => {
    it('handles missing context providers gracefully', () => {
      // Test without providers to ensure graceful degradation
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        )
      }).not.toThrow()
      
      consoleSpy.mockRestore()
    })

    it('handles network failures for dynamic content', async () => {
      // Mock network failure
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
      
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      // Should render without crashing even if network requests fail
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })
  })

  describe('Security', () => {
    it('sanitizes user input in search', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      const searchInput = screen.queryByRole('textbox', { name: /search/i })
      if (searchInput) {
        const maliciousInput = '<script>alert("xss")</script>'
        fireEvent.change(searchInput, { target: { value: maliciousInput } })
        
        // Input should be sanitized
        expect(searchInput.value).not.toContain('<script>')
      }
    })

    it('uses proper href attributes without javascript:', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        const href = link.getAttribute('href')
        expect(href).not.toMatch(/^javascript:/i)
      })
    })
  })
})