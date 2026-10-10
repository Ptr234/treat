import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SupportPage from '../page';
import * as apiClient from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@/lib/api-client');
jest.mock('@/contexts/AuthContext');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const signedOut = { user: null, isAuthenticated: false, isLoading: false } as unknown as ReturnType<typeof useAuth>;
const investor = {
  user: { id: 'u1', name: 'Amina Nansubuga', email: 'Amina@Example.com', role: 'user' },
  isAuthenticated: true,
  isLoading: false,
} as unknown as ReturnType<typeof useAuth>;

// Simulated typing is slow on loaded machines; the default 5 s isn't enough.
jest.setTimeout(20_000);

describe('SupportPage contact form', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(signedOut);
  });

  it('submits the field names the ASP.NET contact endpoint requires', async () => {
    const user = userEvent.setup();
    const apiFetch = jest.spyOn(apiClient, 'apiFetch').mockResolvedValue({ success: true });

    render(<SupportPage />);
    await user.type(screen.getByLabelText(/full name/i), 'Amina Nansubuga');
    await user.type(screen.getByLabelText(/email address/i), 'amina@example.com');
    await user.selectOptions(screen.getByLabelText(/subject category/i), 'investment-licensing');
    await user.type(screen.getByLabelText(/^message/i), 'How do I apply for a licence?');
    await user.click(screen.getByRole('button', { name: /send|submit/i }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1));
    const [path, init] = apiFetch.mock.calls[0]!;
    expect(path).toBe('/api/contact/inquiries');
    expect(JSON.parse(init!.body as string)).toEqual({
      agencyCode: 'UIA',
      agencyName: 'Uganda Investment Authority',
      name: 'Amina Nansubuga',
      email: 'amina@example.com',
      phone: null,
      serviceType: 'Investment Licensing',
      subject: 'Investment Licensing',
      message: 'How do I apply for a licence?',
      urgency: 'normal',
    });
  });

  it('for a signed-in investor, fills in and locks the account email and sends it', async () => {
    mockUseAuth.mockReturnValue(investor);
    const user = userEvent.setup();
    const apiFetch = jest.spyOn(apiClient, 'apiFetch').mockResolvedValue({ success: true });

    render(<SupportPage />);
    const email = screen.getByLabelText(/email address/i) as HTMLInputElement;
    await waitFor(() => expect(email.value).toBe('amina@example.com'));
    expect(email.readOnly).toBe(true);
    expect(screen.getByText(/My submissions/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/full name/i), 'Amina Nansubuga');
    await user.type(screen.getByLabelText(/^message/i), 'Any update on my licence?');
    await user.click(screen.getByRole('button', { name: /send|submit/i }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1));
    expect(JSON.parse(apiFetch.mock.calls[0]![1]!.body as string).email).toBe('amina@example.com');
  });
});
