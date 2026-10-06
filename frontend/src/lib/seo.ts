import type { Metadata } from 'next';

export const SITE_URL = 'https://oscdigitaltool.com';
export const SITE_NAME = 'OneStopCentre Uganda';
export const DEFAULT_TITLE = 'Invest in Uganda | OneStopCentre';
export const DEFAULT_DESCRIPTION =
  'Find investment opportunities, government services and agency guidance for building a business in Uganda through the OneStopCentre, with 16+ agencies under one roof.';
export const SOCIAL_IMAGE = { path: '/images/og-default.png', width: 1200, height: 630 };

export const CONTACT = {
  email: 'info@ugandainvest.go.ug',
  phone: '+256414301000',
  phoneDisplay: '+256 414 301 000',
  street: 'Plot 1, Baskerville Ave, Kololo',
  locality: 'Kampala',
  country: 'UG',
};

/** The site is built with `trailingSlash: true`, so every public URL ends in a slash. */
export function absoluteUrl(path = '/'): string {
  const withSlash = path === '/' || path.endsWith('/') ? path : `${path}/`;
  return new URL(withSlash, SITE_URL).toString();
}

interface MetadataOptions {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

/** Page metadata with canonical URL, Open Graph, Twitter and robots set consistently. */
export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  noIndex = false,
}: MetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const image = absoluteUrl(SOCIAL_IMAGE.path);
  const fullTitle = title.includes('OneStopCentre') ? title : `${title} | ${SITE_NAME}`;

  return {
    title: { absolute: fullTitle },
    description,
    ...(noIndex ? {} : { alternates: { canonical } }),
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
        },
    openGraph: {
      type: 'website',
      locale: 'en_UG',
      url: noIndex ? undefined : canonical,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [{ url: image, width: SOCIAL_IMAGE.width, height: SOCIAL_IMAGE.height, alt: `${SITE_NAME} social preview` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

/** Structured data for the government organisation behind the portal. */
export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'GovernmentOrganization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl('/images/oneStopCenter-logo.jpeg'),
  email: CONTACT.email,
  telephone: CONTACT.phoneDisplay,
  address: {
    '@type': 'PostalAddress',
    streetAddress: CONTACT.street,
    addressLocality: CONTACT.locality,
    addressCountry: CONTACT.country,
  },
};

export const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'en',
  publisher: { '@id': `${SITE_URL}/#organization` },
};

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
