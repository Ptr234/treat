import React from 'react'
import { render } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import { NotificationProvider } from '../contexts/NotificationContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { MobileProvider } from '../contexts/MobileContext'

// Custom render function that includes all providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    initialEntries = ['/'],
    ...renderOptions
  } = options

  function Wrapper({ children }) {
    return (
      <HashRouter>
        <NotificationProvider>
          <ThemeProvider>
            <MobileProvider>
              {children}
            </MobileProvider>
          </ThemeProvider>
        </NotificationProvider>
      </HashRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock data for testing
export const mockInvestmentData = {
  id: 1,
  name: 'Test Investment',
  category: 'Agriculture',
  description: 'Test investment description',
  benefits: ['Benefit 1', 'Benefit 2'],
  requirements: ['Requirement 1', 'Requirement 2']
}

export const mockServiceData = {
  id: 1,
  name: 'Test Service',
  category: 'Business Registration',
  description: 'Test service description',
  requirements: ['Requirement 1'],
  timeframe: '5-10 days',
  cost: 'UGX 50,000'
}

// Test helpers
export const createMockEvent = (overrides = {}) => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  target: { value: '' },
  ...overrides
})

export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// re-export everything from testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'