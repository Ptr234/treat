import type { MetadataRoute } from 'next';
import { client } from '@/lib/sanity-client';
import { getInvestmentIds } from '@/lib/investments';
import { ugandaAgencies } from '@/data/agencies';
import { absoluteUrl } from '@/lib/seo';

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/services/', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/agencies/', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/investments/', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/investments/onboarding/', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/projects/', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/events/', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/business/registration/', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/tools/', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tools/roi-calculator/', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tools/tax-calculator/', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tools/invoice-generator/', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/tools/document-checklist/', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/downloads/', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/guide/', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/support/', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/about/', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/analytics/', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/chatbot/', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/search/', priority: 0.4, changeFrequency: 'monthly' },
];

async function publishedEventIds(): Promise<{ id: string; updatedAt?: string }[]> {
  try {
    return await client.fetch<{ id: string; updatedAt?: string }[]>(
      `*[_type == "event" && isPublished == true]{ "id": coalesce(slug.current, _id), "updatedAt": _updatedAt }`,
    );
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
  }));

  for (const { id } of getInvestmentIds()) {
    entries.push({ url: absoluteUrl(`/investments/${id}/`), lastModified: now, changeFrequency: 'monthly', priority: 0.7 });
  }

  for (const agency of ugandaAgencies) {
    entries.push({ url: absoluteUrl(`/agencies/${agency.id}/`), lastModified: now, changeFrequency: 'monthly', priority: 0.7 });
  }

  for (const event of await publishedEventIds()) {
    entries.push({
      url: absoluteUrl(`/events/${event.id}/`),
      lastModified: event.updatedAt ? new Date(event.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  return entries;
}
