import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SupportPage from '../page';
import * as apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');

describe('SupportPage contact form', () => {
  beforeEach(() => jest.clearAllMocks());

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
});
