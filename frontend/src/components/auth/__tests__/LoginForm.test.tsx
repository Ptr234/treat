import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import * as apiClient from '@/lib/api-client';

jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/api-client');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

interface _MockAuthContext {
  login: jest.Mock;
  logout: jest.Mock;
  user: null;
  isLoading: boolean;
  error: null;
}

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      logout: jest.fn(),
      user: null,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAuth>);
  });

  describe('Basic login flow', () => {
    it('renders email and password inputs', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('submits form with email and password', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ mfaRequired: false });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123!');
      });
    });

    it('calls onSuccess callback on successful login', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ mfaRequired: false });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('displays error message on login failure', async () => {
      const user = userEvent.setup();
      const errorMsg = 'Invalid email or password';
      mockLogin.mockRejectedValue(new Error(errorMsg));

      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(errorMsg)).toBeInTheDocument();
      });
    });

    it('clears error when user types', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue(new Error('Login failed'));

      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/email/i), 'another@example.com');

      expect(screen.queryByText('Login failed')).not.toBeInTheDocument();
    });

    it('disables submit button while loading', async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });
  });

  describe('MFA flow', () => {
    it('shows MFA form when MFA is required', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ mfaRequired: true });

      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/two-factor authentication/i)).toBeInTheDocument();
      });
    });

    it('accepts 6-digit MFA code', async () => {
      const user = userEvent.setup();
      mockLogin
        .mockResolvedValueOnce({ mfaRequired: true })
        .mockResolvedValueOnce({ mfaRequired: false });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/authentication code/i)).toBeInTheDocument();
      });

      const mfaInput = screen.getByLabelText(/authentication code/i);
      await user.type(mfaInput, '123456');

      await user.click(screen.getByRole('button', { name: /verify & sign in/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'Password123!', '123456');
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('rejects non-numeric MFA input', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ mfaRequired: true });

      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/authentication code/i)).toBeInTheDocument();
      });

      const mfaInput = screen.getByLabelText(/authentication code/i) as HTMLInputElement;
      await user.type(mfaInput, 'abcdef');

      expect(mfaInput.value).toBe('');
    });

    it('disables submit when MFA code is incomplete', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ mfaRequired: true });

      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/authentication code/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /verify & sign in/i });
      expect(submitButton).toBeDisabled();
    });

    it('allows returning to login from MFA', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ mfaRequired: true });

      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/two-factor authentication/i)).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /back to sign in/i }));

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.queryByText(/two-factor authentication/i)).not.toBeInTheDocument();
    });
  });

  describe('Password reset flow', () => {
    it('shows password reset form when forgot password clicked', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByRole('button', { name: /forgot password/i }));

      expect(screen.getByText(/reset password/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/admin@uia.go.ug/i)).toBeInTheDocument();
    });

    it('requests password reset with email', async () => {
      const user = userEvent.setup();
      const apiFetch = jest.spyOn(apiClient, 'apiFetch');
      apiFetch.mockResolvedValue({ success: true });

      render(<LoginForm />);
      await user.click(screen.getByRole('button', { name: /forgot password/i }));

      const emailInput = screen.getByPlaceholderText(/admin@uia.go.ug/i);
      await user.type(emailInput, 'admin@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      await waitFor(() => {
        expect(apiFetch).toHaveBeenCalledWith(
          '/api/auth/password-reset',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'admin@example.com' }),
          })
        );
      });
    });

    it('shows success message after password reset request', async () => {
      const user = userEvent.setup();
      const apiFetch = jest.spyOn(apiClient, 'apiFetch');
      apiFetch.mockResolvedValue({ success: true });

      render(<LoginForm />);
      await user.click(screen.getByRole('button', { name: /forgot password/i }));

      const emailInput = screen.getByPlaceholderText(/admin@uia.go.ug/i);
      await user.type(emailInput, 'admin@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      await waitFor(() => {
        expect(screen.getByText(/reset link has been sent/i)).toBeInTheDocument();
      });
    });

    it('validates new password length', async () => {
      const user = userEvent.setup();
      const apiFetch = jest.spyOn(apiClient, 'apiFetch');
      apiFetch.mockResolvedValue({ success: true });

      render(<LoginForm />);
      await user.click(screen.getByRole('button', { name: /forgot password/i }));

      const emailInput = screen.getByPlaceholderText(/admin@uia.go.ug/i);
      await user.type(emailInput, 'admin@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      await waitFor(() => {
        expect(screen.getByText(/reset link has been sent/i)).toBeInTheDocument();
      });

      const tokenInput = screen.getByPlaceholderText(/reset token from email/i);
      const passwordInput = screen.getByPlaceholderText(/min 8 chars/i);

      await user.type(tokenInput, 'reset-token');
      await user.type(passwordInput, 'short');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('submits password reset verification', async () => {
      const user = userEvent.setup();
      const apiFetch = jest.spyOn(apiClient, 'apiFetch');
      apiFetch
        .mockResolvedValueOnce({ success: true }) // request reset
        .mockResolvedValueOnce({ success: true }); // verify reset

      render(<LoginForm />);
      await user.click(screen.getByRole('button', { name: /forgot password/i }));

      const emailInput = screen.getByPlaceholderText(/admin@uia.go.ug/i);
      await user.type(emailInput, 'admin@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/reset token from email/i)).toBeInTheDocument();
      });

      const tokenInput = screen.getByPlaceholderText(/reset token from email/i);
      const passwordInput = screen.getByPlaceholderText(/min 8 chars/i);

      await user.type(tokenInput, 'valid-token');
      await user.type(passwordInput, 'NewPassword123!');
      await user.click(screen.getByRole('button', { name: /^reset password/i }));

      await waitFor(() => {
        expect(apiFetch).toHaveBeenCalledWith(
          '/api/auth/password-reset/verify',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('allows returning to login from password reset', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByRole('button', { name: /forgot password/i }));
      expect(screen.getByText(/reset password/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /back to sign in/i }));

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.queryByText(/reset password/i)).not.toBeInTheDocument();
    });
  });
});
