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
    it('rejects weak passwords', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'weak');
      await user.type(screen.getByLabelText(/confirm password/i), 'weak');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/password.*strength|must contain|requirements/i)).toBeInTheDocument();
      });
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

    it('rejects invalid email format', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPassword123!');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/email.*invalid|valid email/i)).toBeInTheDocument();
      });
    });

    it('requires all fields', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errors = screen.getAllByText(/required/i);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Successful registration', () => {
    it('submits valid registration data', async () => {
      const user = userEvent.setup();
      mockSignup.mockResolvedValue({ success: true });

      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPassword123!');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'ValidPassword123!',
        });
      });
    });

    it('calls onSuccess callback after registration', async () => {
      const user = userEvent.setup();
      mockSignup.mockResolvedValue({ success: true });

      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPassword123!');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('disables button while registering', async () => {
      const user = userEvent.setup();
      mockSignup.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPassword123!');

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error handling', () => {
    it('displays error message on duplicate email', async () => {
      const user = userEvent.setup();
      mockSignup.mockRejectedValue(new Error('Email already exists'));

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPassword123!');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/already.*exists|already.*taken/i)).toBeInTheDocument();
      });
    });

    it('displays generic error message on other failures', async () => {
      const user = userEvent.setup();
      mockSignup.mockRejectedValue(new Error('Server error'));

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPassword123!');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed|error|try again/i)).toBeInTheDocument();
      });
    });

    it('clears error when user modifies form', async () => {
      const user = userEvent.setup();
      mockSignup.mockRejectedValue(new Error('Registration failed'));

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPassword123!');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
      });

      // Modify email to clear error
      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'another@example.com');

      expect(screen.queryByText(/registration failed/i)).not.toBeInTheDocument();
    });
  });

  describe('Password strength indicator', () => {
    it('shows weak password indicator', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password/i);
      await user.type(passwordInput, 'weak');

      expect(screen.getByText(/weak/i)).toBeInTheDocument();
    });

    it('shows strong password indicator', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password/i);
      await user.type(passwordInput, 'ValidPassword123!@#$%');

      expect(screen.getByText(/strong|excellent/i)).toBeInTheDocument();
    });
  });

  describe('Terms and conditions', () => {
    it('requires accepting terms', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPassword123!');

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit when terms accepted', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/first name/i), 'Test');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPassword123!');

      const termsCheckbox = screen.getByRole('checkbox', { name: /terms|agree/i });
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      expect(submitButton).not.toBeDisabled();
    });
  });
});
