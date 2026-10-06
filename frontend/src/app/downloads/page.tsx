'use client';

import PageBand from '@/components/ui/PageBand';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { client } from '@/lib/sanity-client';
import { DOWNLOADABLE_RESOURCES_QUERY } from '@/lib/sanity-queries';
import { SanityDownloadableResource } from '@/types/sanity';

interface CategoryConfig {
  key: string;
  title: string;
  description: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'business_registration',
    title: 'Business registration forms',
    description: 'Official forms for business registration and licensing',
  },
  {
    key: 'tax_registration',
    title: 'Tax registration',
    description: 'Tax-related forms and guides',
  },
  {
    key: 'investment_licenses',
    title: 'Investment licenses',
    description: 'Investment and licensing documentation',
  },
  {
    key: 'guides_resources',
    title: 'Guides and resources',
    description: 'Comprehensive guides and helpful resources',
  },
];

const linkClass =
  'font-semibold text-black underline decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DownloadsPage() {
  const [resources, setResources] = useState<SanityDownloadableResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  useEffect(() => {
    async function fetchResources() {
      try {
        const data = await client.fetch<SanityDownloadableResource[]>(DOWNLOADABLE_RESOURCES_QUERY);
        setResources(data || []);
      } catch (err) {
        console.error('Failed to fetch downloadable resources:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const handleDownload = (resource: SanityDownloadableResource) => {
    import('@/lib/track').then(({ trackEvent }) =>
      trackEvent('download', resource.title, { category: resource.category })
    );
    if (resource.file?.asset?.url) {
      const link = document.createElement('a');
      link.href = resource.file.asset.url;
      link.download = resource.title;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    } else {
      showToast('File not available. Contact support@onestopcentre.go.ug for assistance.');
    }
  };

  // Group resources by category
  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    resources: resources.filter((r) => r.category === cat.key),
  }));

  // Only show categories that have resources
  const visibleCategories = grouped.filter((g) => g.resources.length > 0);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Breadcrumb band */}
      <div className="border-b border-neutral-200 bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-red-600 hover:underline underline-offset-4">Home</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li className="font-semibold text-black" aria-current="page">Downloads</li>
          </ol>
        </nav>
      </div>

      {/* Title */}
      <PageBand>
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Downloads and resources</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700 sm:text-lg">
          Browse downloadable forms and guidance for business registration, investment and related public services. Each available resource includes its file type and any published description, so you can check that it is relevant before opening it. Documents may be revised by their issuing agencies; confirm that you have the current version before filing an application. If the resource you need is not listed, contact the responsible agency or the support team for direction.
        </p>
      </section>
      </PageBand>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-black" role="status" aria-label="Loading resources" />
          </div>
        )}

        {/* Empty state */}
        {!loading && visibleCategories.length === 0 && (
          <div className=" py-6 pl-6">
            <h2 className="text-xl font-bold">No downloadable resources are published yet</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-700">
              The resource library is currently empty. For a form or document needed for a specific application, check the responsible agency’s website or contact its office to confirm the current version. You can also use the service directory to find agency contact details and browse the online user guide for help navigating the OneStop Centre.
            </p>
            <div className="mt-4 flex flex-wrap gap-5 text-sm">
              <Link href="/agencies" className="font-semibold text-black underline decoration-2 underline-offset-4 hover:text-red-600">Find an agency</Link>
              <Link href="/guide" className="font-semibold text-black underline decoration-2 underline-offset-4 hover:text-red-600">Open the user guide</Link>
            </div>
          </div>
        )}

        {/* Categories */}
        {!loading && visibleCategories.length > 0 && (
          <div className="space-y-14">
            {visibleCategories.map((category) => (
              <section key={category.key} aria-labelledby={`downloads-${category.key}`}>
                <div className="flex flex-col gap-2 border-b border-neutral-200 pb-3 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <h2 id={`downloads-${category.key}`} className="text-xl font-bold sm:text-2xl">{category.title}</h2>
                    <p className="mt-1 text-sm text-neutral-700">{category.description}</p>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {category.resources.length} file{category.resources.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <ul className="divide-y divide-neutral-200">
                  {category.resources.map((resource) => (
                    <li key={resource._id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold leading-snug">{resource.title}</h3>
                        {resource.description && (
                          <p className="mt-1 text-sm leading-6 text-neutral-700">{resource.description}</p>
                        )}
                        <p className="mt-2 flex flex-wrap items-center gap-x-3 text-xs text-neutral-600">
                          <span className="font-bold uppercase tracking-wider text-red-600">{resource.fileType}</span>
                          {resource.file?.asset?.size && <span>{formatFileSize(resource.file.asset.size)}</span>}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownload(resource)}
                        className="inline-flex flex-shrink-0 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-bold text-yellow-400 hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                      >
                        Download<span className="sr-only"> {resource.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {/* Help */}
        <section className="mt-16 pt-8" aria-labelledby="downloads-help-heading">
          <h2 id="downloads-help-heading" className="text-2xl font-bold">Need help with documents?</h2>
          <p className="mt-3 max-w-2xl leading-7 text-neutral-700">
            Our support team can help you understand which documents you need and guide you through the completion process.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link href="/support" className={linkClass}>Contact support</Link>
            <Link href="/tools/document-checklist" className={linkClass}>View checklist</Link>
          </div>
        </section>

        {/* Notice */}
        <section className="mt-12 border-l-4 border-red-600 pl-6" aria-labelledby="downloads-notice-heading">
          <h2 id="downloads-notice-heading" className="text-lg font-bold">Important notice</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-neutral-700">
            Always ensure you&apos;re using the latest version of forms and documents. Requirements may change based on current regulations.
            When in doubt, contact the relevant government agency or our support team for verification.
          </p>
        </section>
      </div>

      {/* Toast */}
      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex max-w-md items-start gap-3 bg-black px-5 py-4 text-white shadow-2xl"
        >
          <p className="flex-1 text-sm leading-relaxed">{toast.message}</p>
          <button
            type="button"
            onClick={() => setToast({ show: false, message: '' })}
            aria-label="Dismiss notification"
            className="flex-shrink-0 text-white hover:text-yellow-400"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
