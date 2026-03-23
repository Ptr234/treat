import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import LayoutShell from "@/components/layout/LayoutShell";

export const metadata: Metadata = {
  title: {
    default: "OneStopCentre Uganda",
    template: "%s | OneStopCentre Uganda",
  },
  description: "OneStopCentre Uganda - InvestUganda simplified. A modern platform providing streamlined access to government business services, investment opportunities, and professional support.",
  keywords: [
    "Uganda",
    "Investment",
    "Business Registration",
    "Government Services",
    "OneStopCentre",
    "Tax Calculator",
    "ROI Calculator",
    "Business Support",
  ],
  authors: [
    {
      name: "Uganda Investment One Stop Center",
      url: "https://oscdigitaltool.com",
    },
  ],
  creator: "Uganda Investment One Stop Center",
  publisher: "Uganda Investment One Stop Center",
  metadataBase: new URL("https://oscdigitaltool.com"),
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: "https://oscdigitaltool.com",
    title: "OneStopCentre Uganda - InvestUganda Simplified",
    description: "Streamlined access to government business services, investment opportunities, and professional support in Uganda.",
    siteName: "OneStopCentre Uganda",
    images: [
      {
        url: "/images/oneStopCenter-logo.jpeg",
        width: 1200,
        height: 630,
        alt: "OneStopCentre Uganda Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OneStopCentre Uganda",
    description: "Streamlined access to government business services and investment opportunities in Uganda.",
    images: ["/images/oneStopCenter-logo.jpeg"],
    creator: "@UgandaInvest",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Add Google Search Console verification code when available:
  // verification: { google: "your-real-code" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#ca8a04" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className="font-sans antialiased bg-white text-gray-900 selection:bg-primary-100"
        suppressHydrationWarning
      >
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
