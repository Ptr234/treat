import type { Metadata } from "next";
import { Public_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, SITE_URL, SOCIAL_IMAGE, organizationLd, websiteLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { Providers } from "./providers";
import LayoutShell from "@/components/layout/LayoutShell";

// Self-hosted at build time: no request to Google from the visitor's browser.
const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-public", display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", display: "swap", weight: ["600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  description: DEFAULT_DESCRIPTION,
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_UG',
    siteName: SITE_NAME,
    images: [{ url: new URL(SOCIAL_IMAGE.path, SITE_URL).toString(), width: SOCIAL_IMAGE.width, height: SOCIAL_IMAGE.height, alt: `${SITE_NAME} social preview` }],
  },
  title: {
    default: DEFAULT_TITLE,
    template: '%s | OneStop Centre Uganda',
  },
  keywords: [
    'Uganda investment',
    'invest in Uganda',
    'business registration Uganda',
    'URSB',
    'Uganda Investment Authority',
    'UIA',
    'government services Uganda',
    'tax calculator Uganda',
    'OneStop Centre',
    'ROI calculator',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'government',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  // Add the Google Search Console token here once it is issued:
  // verification: { google: 'token-from-search-console' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-UG" className={`${publicSans.variable} ${sourceSerif.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0b0b0b" />
        <JsonLd data={[organizationLd, websiteLd]} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#0b0b0b" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className="antialiased bg-white text-[#0b0b0b]"
        suppressHydrationWarning
      >
        <GoogleAnalytics />
        <Providers>
          <LayoutShell>
            {children}
          </LayoutShell>
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
