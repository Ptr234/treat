import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../RegisterForm';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

interface _MockAuthRegisterContext {
  signup: jest.Mock;
  logout: jest.Mock;
  user: null;
  isLoading: boolean;
  error: null;
}

describe('RegisterForm', () => {
  const mockSignup = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      signup: mockSignup,
      logout: jest.fn(),
      user: null,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAuth>);
  });

  describe('Form rendering', () => {
    it('renders all required fields', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('displays create account button', () => {
      render(<RegisterForm />);
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('allows all form fields to be filled', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPassword123!');

      expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
      expect(screen.getByDisplayValue('User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });

    it('rejects non-matching passwords', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword123!');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords.*match|do not match/i)).toBeInTheDocument();
      });
    });

    it('accepts valid email format', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      await user.type(emailInput, 'valid.email@test.com');

      expect(emailInput.value).toBe('valid.email@test.com');
    });

    it('requires all fields', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
        expect(inputs.some(i => i.getAttribute('required') !== null)).toBe(true);
      });
    });
  });

  describe('Successful registration', () => {
    it('shows registration unavailable message', async () => {
      const user = userEvent.setup();

      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPassword123!');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/registration is not available|admin-only platform/i)).toBeInTheDocument();
      });
    });

    it('requires matching passwords before allowing submission', async () => {
      const user = userEvent.setup();

      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword123!');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('renders form with all required fields', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('displays error when passwords do not match', async () => {
      const user = userEvent.setup();

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword456!');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('displays unavailable message on form submission', async () => {
      const user = userEvent.setup();

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPassword123!');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/registration is not available|admin-only/i)).toBeInTheDocument();
      });
    });

    it('clears error when user modifies form', async () => {
      const user = userEvent.setup();

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword456!');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });

      // Modify confirm password to match
      const confirmInput = screen.getByLabelText(/confirm password/i);
      await user.clear(confirmInput);
      await user.type(confirmInput, 'ValidPassword123!');

      expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
    });
  });

  describe('Password strength feedback', () => {
    it('shows password match feedback', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      await user.type(passwordInput, 'ValidPassword123!');
      await user.type(confirmInput, 'ValidPassword123!');

      expect(screen.getByText(/passwords match/i)).toBeInTheDocument();
    });

    it('shows password mismatch feedback', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      await user.type(passwordInput, 'ValidPassword123!');
      await user.type(confirmInput, 'DifferentPassword456!');

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
});
