// Comprehensive BusinessRegistrationWizard Component Tests
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import BusinessRegistrationWizard from '../BusinessRegistrationWizard'
import { NotificationProvider } from '../../contexts/NotificationContext'
import { accessibilityTestUtils } from '../../utils/accessibilityManager'

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <NotificationProvider>
      {children}
    </NotificationProvider>
  </BrowserRouter>
)

describe('BusinessRegistrationWizard Component', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe('Rendering and Structure', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('displays the wizard title', () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByText(/business registration/i)).toBeInTheDocument()
    })

    it('shows step indicators', () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      // Should show progress indicators
      const progressElements = screen.getAllByTestId(/step-/i)
      expect(progressElements.length).toBeGreaterThan(0)
    })

    it('displays the first step initially', () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      // First step should be visible
      expect(screen.getByTestId('step-1')).toBeInTheDocument()
      expect(screen.getByTestId('step-1')).toHaveAttribute('aria-current', 'step')
    })
  })

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })
    })

    it('validates business name format', async () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      const businessNameInput = screen.getByLabelText(/business name/i)
      await user.type(businessNameInput, 'Invalid@Name!')
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid business name/i)).toBeInTheDocument()
      })
    })

    it('validates Uganda phone number format', async () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, '123456789')
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid uganda phone/i)).toBeInTheDocument()
      })
    })

    it('validates TIN number format', async () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      // Navigate to step with TIN field
      const tinInput = screen.getByLabelText(/tin/i)
      await user.type(tinInput, '12345')
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid tin format/i)).toBeInTheDocument()
      })
    })
  })

  describe('Step Navigation', () => {
    it('allows navigation to next step with valid data', async () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      // Fill required fields
      await user.type(screen.getByLabelText(/business name/i), 'Valid Business Name Ltd')
      await user.type(screen.getByLabelText(/phone/i), '+256700123456')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('step-2')).toHaveAttribute('aria-current', 'step')
      })
    })

    it('allows navigation back to previous step', async () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      // Navigate to step 2 first
      await user.type(screen.getByLabelText(/business name/i), 'Valid Business Name Ltd')
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      await waitFor(() => {
        expect(screen.getByTestId('step-2')).toHaveAttribute('aria-current', 'step')
      })
      
      // Go back
      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('step-1')).toHaveAttribute('aria-current', 'step')
      })
    })

    it('preserves form data when navigating between steps', async () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      const businessName = 'Test Business Ltd'
      await user.type(screen.getByLabelText(/business name/i), businessName)
      
      // Navigate forward and back
      await user.click(screen.getByRole('button', { name: /next/i }))
      await user.click(screen.getByRole('button', { name: /back/i }))
      
      // Data should be preserved
      expect(screen.getByLabelText(/business name/i)).toHaveValue(businessName)
    })
  })

  describe('Accessibility', () => {
    it('passes accessibility audit', async () => {
      const { container } = render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      await accessibilityTestUtils.testComponentAccessibility(container)
    })

    it('has proper ARIA labels and descriptions', () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      const form = screen.getByRole('form')
      expect(form).toHaveAttribute('aria-labelledby')
      expect(form).toHaveAttribute('aria-describedby')
    })

    it('announces step changes to screen readers', async () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      
      // Should have aria-live region for announcements
      expect(screen.getByRole('status')).toBeInTheDocument()
      
      await user.type(screen.getByLabelText(/business name/i), 'Valid Business Name Ltd')
      await user.click(nextButton)
      
      await waitFor(() => {
        const announcement = screen.getByRole('status')
        expect(announcement).toHaveTextContent(/step 2/i)
      })
    })

    it('supports keyboard navigation', async () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      const firstInput = screen.getByLabelText(/business name/i)
      firstInput.focus()
      
      // Tab through form elements
      await user.tab()
      expect(document.activeElement).not.toBe(firstInput)
      
      // Should be able to navigate with arrow keys in radio groups
      const radioGroup = screen.getByRole('radiogroup')
      if (radioGroup) {
        const firstRadio = within(radioGroup).getAllByRole('radio')[0]
        firstRadio.focus()
        
        fireEvent.keyDown(firstRadio, { key: 'ArrowDown' })
        expect(document.activeElement).not.toBe(firstRadio)
      }
    })

    it('provides clear error messages', async () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        const errorMessage = screen.getByRole('alert')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveAttribute('aria-live', 'assertive')
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const mockSubmit = vi.fn()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
      
      render(
        <TestWrapper>
          <BusinessRegistrationWizard onSubmit={mockSubmit} />
        </TestWrapper>
      )
      
      // Fill all required fields through all steps
      await fillCompleteForm(user)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
          businessName: expect.any(String),
          phone: expect.any(String),
          email: expect.any(String)
        }))
      })
    })

    it('handles submission errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
      
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      await fillCompleteForm(user)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/error/i)
      })
    })

    it('shows loading state during submission', async () => {
      global.fetch = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )
      
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      await fillCompleteForm(user)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      // Should show loading state
      expect(screen.getByText(/submitting/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Data Persistence', () => {
    it('saves form data to localStorage', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      await user.type(screen.getByLabelText(/business name/i), 'Test Business')
      
      expect(setItemSpy).toHaveBeenCalledWith(
        'businessRegistrationDraft',
        expect.stringContaining('Test Business')
      )
    })

    it('restores form data from localStorage', () => {
      const savedData = {
        businessName: 'Restored Business',
        step: 1
      }
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(savedData))
      
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      expect(screen.getByLabelText(/business name/i)).toHaveValue('Restored Business')
    })
  })

  describe('Security', () => {
    it('sanitizes all user inputs', async () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      const maliciousInput = '<script>alert("xss")</script>'
      await user.type(screen.getByLabelText(/business name/i), maliciousInput)
      
      expect(screen.getByLabelText(/business name/i).value).not.toContain('<script>')
    })

    it('validates file uploads', async () => {
      render(
        <TestWrapper>
          <BusinessRegistrationWizard />
        </TestWrapper>
      )
      
      const fileInput = screen.getByLabelText(/upload.*document/i)
      const maliciousFile = new File(['malicious content'], 'malware.exe', {
        type: 'application/exe'
      })
      
      await user.upload(fileInput, maliciousFile)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument()
      })
    })
  })
})

// Helper function to fill complete form
async function fillCompleteForm(user) {
  await user.type(screen.getByLabelText(/business name/i), 'Test Business Ltd')
  await user.type(screen.getByLabelText(/phone/i), '+256700123456')
  await user.type(screen.getByLabelText(/email/i), 'test@example.com')
  
  // Navigate through all steps
  let nextButton
  while ((nextButton = screen.queryByRole('button', { name: /next/i }))) {
    await user.click(nextButton)
    await waitFor(() => {
      // Wait for step transition
    })
  }
}