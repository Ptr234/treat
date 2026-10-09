'use client';

import PageHeader from '@/components/ui/PageHeader';
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
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Forms and downloads' }]}
        caption="Guidance"
        title="Forms and downloads"
        lead="Application forms and guidance for business registration, investment and related public services. Agencies revise their documents, so confirm you have the current version before filing."
      />

      <div className="gov-container grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-16">
        <div>
          {loading && (
            <p role="status" className="flex items-center gap-3 py-10 text-[#3b3934]">
              <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black" aria-hidden="true" />
              Loading documents…
            </p>
          )}

          {!loading && visibleCategories.length === 0 && (
            <div className="gov-inset">
              <h2 className="text-xl font-bold">No documents are published yet</h2>
              <p className="mt-2 text-[15px] leading-6 text-[#3b3934]">
                For a form needed for a specific application, check the responsible agency’s website or contact its office to confirm the current version.
              </p>
              <div className="mt-4 flex flex-wrap gap-6 text-[15px]">
                <Link href="/agencies" className="gov-link">Find an agency</Link>
                <Link href="/guide" className="gov-link">Read the user guide</Link>
              </div>
            </div>
          )}

          {!loading && visibleCategories.length > 0 && (
            <div className="space-y-14">
              {visibleCategories.map((category) => (
                <section key={category.key} aria-labelledby={`downloads-${category.key}`}>
                  <div className="flex flex-col gap-1 border-b-2 border-black pb-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 id={`downloads-${category.key}`} className="gov-title-m">{category.title}</h2>
                      <p className="mt-1 text-[15px] text-[#3b3934]">{category.description}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#5c5850]">
                      {category.resources.length} document{category.resources.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <ul>
                    {category.resources.map((resource) => (
                      <li key={resource._id} className="flex gap-5 border-b border-[#dcd8cf] py-6">
                        <span
                          aria-hidden="true"
                          className="relative grid h-[5.5rem] w-[4.25rem] shrink-0 place-items-end border-2 border-[#b9b4a9] bg-white pb-2 shadow-[3px_3px_0_#dcd8cf]"
                        >
                          <span className="absolute inset-x-2.5 top-3 space-y-1.5">
                            <span className="block h-[3px] bg-[#dcd8cf]" />
                            <span className="block h-[3px] bg-[#dcd8cf]" />
                            <span className="block h-[3px] w-2/3 bg-[#dcd8cf]" />
                          </span>
                          <span className="mx-auto bg-[#ce1126] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{resource.fileType}</span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold leading-snug">
                            <button type="button" onClick={() => handleDownload(resource)} className="text-left text-black underline decoration-1 underline-offset-4 hover:text-[#9a0d1c] hover:decoration-[3px]">
                              {resource.title}
                            </button>
                          </h3>
                          <p className="mt-1 text-sm text-[#5c5850]">
                            <span className="uppercase">{resource.fileType}</span>
                            {resource.file?.asset?.size ? `, ${formatFileSize(resource.file.asset.size)}` : ''}
                          </p>
                          {resource.description && <p className="mt-2 text-[15px] leading-6 text-[#3b3934]">{resource.description}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <div className="gov-warning mt-12 max-w-3xl text-[15px]">
            <p>
              Always use the latest version of a form. Requirements change with regulations — when in doubt, confirm with the issuing agency before you submit.
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="gov-related">
            <h2>Need help with documents?</h2>
            <p className="text-[15px] text-[#3b3934]">The support team can tell you which documents you need and how to complete them.</p>
            <ul className="mt-4">
              <li><Link href="/tools/document-checklist" className="gov-link">Document checklist</Link></li>
              <li><Link href="/support" className="gov-link">Contact support</Link></li>
              <li><Link href="/services" className="gov-link">Government services</Link></li>
            </ul>
          </div>
        </aside>
      </div>

      {toast.show && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 flex max-w-md items-start gap-3 border-l-[6px] border-[#ffd700] bg-black px-5 py-4 text-white shadow-2xl">
          <p className="flex-1 text-sm leading-relaxed">{toast.message}</p>
          <button type="button" onClick={() => setToast({ show: false, message: '' })} aria-label="Dismiss notification" className="shrink-0 text-white hover:text-[#ffd700]">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
