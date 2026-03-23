import { client } from '@/lib/sanity-client';
import type { InvestmentOpportunity } from '@/types';
import staticData from '@/data/investment-opportunities.json';

// GROQ query for investment opportunities from Sanity
const INVESTMENTS_QUERY = `
  *[_type == "investmentOpportunity"] | order(priority desc, title asc) {
    "id": coalesce(numericId, _key),
    title,
    category,
    description,
    fullDescription,
    investmentRange,
    "roi": expectedROI,
    timeline,
    "agency": contact.agency,
    priority,
    keyRisks,
    contact {
      email, phone, website, address
    },
    logoPath,
    marketSize,
    competitiveAdvantage,
    requiredLicenses,
    incentives,
    keyMetrics {
      marketGrowth, exportValue, employmentPotential, paybackPeriod
    },
    "documents": documents[] {
      "name": title, type, size, "url": file.asset->url
    }
  }
`;

const INVESTMENT_BY_ID_QUERY = `
  *[_type == "investmentOpportunity" && (numericId == $id || _id == $idStr)][0] {
    "id": coalesce(numericId, _key),
    title,
    category,
    description,
    fullDescription,
    investmentRange,
    "roi": expectedROI,
    timeline,
    "agency": contact.agency,
    priority,
    keyRisks,
    contact {
      email, phone, website, address
    },
    logoPath,
    marketSize,
    competitiveAdvantage,
    requiredLicenses,
    incentives,
    keyMetrics {
      marketGrowth, exportValue, employmentPotential, paybackPeriod
    },
    "documents": documents[] {
      "name": title, type, size, "url": file.asset->url
    }
  }
`;

/**
 * Fetch all investment opportunities.
 * Tries Sanity CMS first, falls back to static JSON.
 */
export async function getInvestments(): Promise<InvestmentOpportunity[]> {
  try {
    const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    if (!sanityProjectId) throw new Error('Sanity not configured');

    const data = await client.fetch(INVESTMENTS_QUERY, {}, { next: { revalidate: 3600 } });
    if (data && data.length > 0) return data;
  } catch {
    // Fall through to static data
  }

  return staticData as unknown as InvestmentOpportunity[];
}

/**
 * Fetch a single investment opportunity by ID.
 * Tries Sanity CMS first, falls back to static JSON.
 */
export async function getInvestmentById(id: string): Promise<InvestmentOpportunity | undefined> {
  try {
    const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    if (!sanityProjectId) throw new Error('Sanity not configured');

    const numId = parseInt(id);
    const data = await client.fetch(
      INVESTMENT_BY_ID_QUERY,
      { id: isNaN(numId) ? -1 : numId, idStr: id },
      { next: { revalidate: 3600 } }
    );
    if (data) return data;
  } catch {
    // Fall through to static data
  }

  return (staticData as unknown as InvestmentOpportunity[]).find(
    opp => opp.id === parseInt(id) || opp.id.toString() === id
  );
}

/**
 * Get all investment IDs for static generation.
 */
export function getInvestmentIds(): { id: string }[] {
  return (staticData as unknown as InvestmentOpportunity[]).map(opp => ({
    id: opp.id.toString(),
  }));
}
