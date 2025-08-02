import React from 'react'
import { Helmet } from 'react-helmet-async'

const SEOHead = ({
  title = "OneStopCentre Uganda - Investing in Uganda Simplified",
  description = "OneStopCentre Uganda provides streamlined access to government business services, ATMS sector investments, and tax calculations. Your gateway to investing and doing business in Uganda.",
  keywords = "Uganda business, government services, ATMS investments, tax calculator, business registration, Uganda investment opportunities, OneStopCentre",
  image = "/images/uganda-business-bg.jpeg",
  url = "https://oscdigitaltool.com",
  type = "website",
  author = "OneStopCentre Uganda",
  publishedTime,
  modifiedTime
}) => {
  const canonicalUrl = `${url}${window.location.pathname}`
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "OneStopCentre Uganda",
    description,
    url,
    "logo": `${url}/images/oneStopCenter-logo.jpeg`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+256-775-692-335",
      "contactType": "Customer Service",
      "availableLanguage": ["English"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "UG",
      "addressLocality": "Kampala"
    },
    "sameAs": [
      "https://oscdigitaltool.com"
    ]
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${url}${image}`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="OneStopCentre Uganda" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${url}${image}`} />
      <meta name="twitter:creator" content="@OSCUganda" />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow" />
      <meta name="theme-color" content="#f59e0b" />
      <meta name="msapplication-TileColor" content="#f59e0b" />
      
      {/* Geo Tags */}
      <meta name="geo.region" content="UG" />
      <meta name="geo.placename" content="Uganda" />
      <meta name="geo.position" content="0.3476;32.5825" />
      <meta name="ICBM" content="0.3476, 32.5825" />
      
      {/* Article Meta Tags (for blog posts) */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      
      {/* PWA Meta Tags */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="OSC Uganda" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
    </Helmet>
  )
}

export default SEOHead