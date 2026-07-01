import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserAuthForm from '@/components/auth/UserAuthForm';

const mockLogin = jest.fn().mockResolvedValue(undefined);
const mockSignup = jest.fn().mockResolvedValue(undefined);

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin, signup: mockSignup, isLoading: false }),
}));

describe('UserAuthForm', () => {
  beforeEach(() => {
    mockLogin.mockClear();
    mockSignup.mockClear();
  });

  const emailInput = (c: HTMLElement) => c.querySelector('input[type="email"]') as HTMLInputElement;
  const passwordInput = (c: HTMLElement) => c.querySelector('input[type="password"]') as HTMLInputElement;
  const nameInput = (c: HTMLElement) => c.querySelector('input[type="text"]') as HTMLInputElement;

  it('signs in with email + password and calls onSuccess', async () => {
    const onSuccess = jest.fn();
    const { container } = render(<UserAuthForm onSuccess={onSuccess} />);

    await userEvent.type(emailInput(container), 'a@b.com');
    await userEvent.type(passwordInput(container), 'Passw0rd1');
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(mockLogin).toHaveBeenCalledWith('a@b.com', 'Passw0rd1');
    expect(mockSignup).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it('toggles to create-account mode and signs up', async () => {
    const { container } = render(<UserAuthForm onSuccess={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /create one/i }));

    await userEvent.type(nameInput(container), 'Jane');
    await userEvent.type(emailInput(container), 'jane@b.com');
    await userEvent.type(passwordInput(container), 'Passw0rd1');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(mockSignup).toHaveBeenCalledWith('Jane', 'jane@b.com', 'Passw0rd1');
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows an error message when auth fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    const { container } = render(<UserAuthForm onSuccess={jest.fn()} />);

    await userEvent.type(emailInput(container), 'a@b.com');
    await userEvent.type(passwordInput(container), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });
});
