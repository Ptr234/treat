/**
 * Sanity-only fallback for investor profiles.
 * When NEXT_PUBLIC_BACKEND_URL is set, apiFetch() routes to ASP.NET instead.
 */
import { NextRequest } from 'next/server';
import { getWriteClient } from '@/lib/sanity-client';
import {
  INVESTOR_COUNT_BY_YEAR_QUERY,
  INVESTOR_REF_EXISTS_QUERY,
  INVESTOR_BY_EMAIL_QUERY,
} from '@/lib/sanity-queries';
import { apiSuccess, apiError, validateBody, sanitizeString } from '@/lib/api-utils';
import { createInvestorProfileSchema } from '@/lib/validations';
import { sendInvestorWelcomeEmail } from '@/lib/email';
import { createRateLimiter, clientIp } from '@/lib/rate-limit';

const investorCreateLimiter = createRateLimiter(60_000, 10); // 10 submissions/minute/IP

// ── Reference number generation ──────────────────────────────────────

async function generateInvestorRef(): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `INV-${year}-*`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await getWriteClient().fetch<number>(INVESTOR_COUNT_BY_YEAR_QUERY, { pattern });
    const seq = count + 1 + attempt;
    const ref = `INV-${year}-${String(seq).padStart(4, '0')}`;

    const exists = await getWriteClient().fetch<boolean>(INVESTOR_REF_EXISTS_QUERY, { ref });
    if (!exists) return ref;
  }

  const ts = Date.now().toString(36).toUpperCase();
  return `INV-${new Date().getFullYear()}-T${ts}`;
}

// ── POST: create investor profile ────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    if (investorCreateLimiter.isRateLimited(clientIp(request))) {
      return apiError('Too many requests. Please wait a moment before trying again.', 429, 'RATE_LIMITED');
    }

    const [data, err] = await validateBody(request, createInvestorProfileSchema);
    if (err) return err;

    const email = data.email.toLowerCase().trim();

    // Check if investor with this email already exists. The reference number is
    // never returned directly here — anyone can submit an arbitrary email, so
    // echoing it back would let a caller enumerate which emails have a profile
    // and harvest valid reference numbers. It's emailed to the address on file
    // instead, which only the account owner can read.
    const existing = await getWriteClient().fetch(INVESTOR_BY_EMAIL_QUERY, { email });
    if (existing) {
      sendInvestorWelcomeEmail({
        to: email,
        name: existing.name ?? data.name,
        referenceNumber: existing.referenceNumber,
        primarySector: existing.primarySector ?? data.primarySector,
        investmentAmount: existing.investmentAmount ?? data.investmentAmount,
      }).catch((err) => console.error('[POST /api/investors] reminder email failed:', err));

      return apiSuccess({ existing: true }, undefined, 200);
    }

    const referenceNumber = await generateInvestorRef();

    const profile = await getWriteClient().create({
      _type: 'investorProfile',
      referenceNumber,
      name: sanitizeString(data.name),
      email,
      phone: data.phone,
      nationality: sanitizeString(data.nationality),
      companyName: data.companyName ? sanitizeString(data.companyName) : undefined,
      position: data.position ? sanitizeString(data.position) : undefined,
      investorType: data.investorType,
      experience: data.experience,
      investmentGoal: data.investmentGoal,
      investmentAmount: data.investmentAmount,
      timeHorizon: data.timeHorizon,
      riskTolerance: data.riskTolerance,
      primarySector: data.primarySector,
      secondarySectors: data.secondarySectors,
      specificInterests: data.specificInterests ? sanitizeString(data.specificInterests) : undefined,
      capitalSource: data.capitalSource,
      timeframe: data.timeframe,
      supportNeeded: data.supportNeeded,
      status: 'new',
      createdAt: new Date().toISOString(),
    });

    // Send welcome email (fire-and-forget)
    sendInvestorWelcomeEmail({
      to: email,
      name: data.name,
      referenceNumber,
      primarySector: data.primarySector,
      investmentAmount: data.investmentAmount,
    }).catch((err) => console.error('[POST /api/investors] email failed:', err));

    return apiSuccess(
      { referenceNumber, investorId: profile._id, existing: false },
      undefined,
      201
    );
  } catch (error) {
    console.error('[POST /api/investors]', error);
    return apiError('Failed to create investor profile');
  }
}
