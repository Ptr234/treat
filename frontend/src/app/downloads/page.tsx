'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { client } from '@/lib/sanity-client';
import { DOWNLOADABLE_RESOURCES_QUERY } from '@/lib/sanity-queries';
import { SanityDownloadableResource } from '@/types/sanity';

interface CategoryConfig {
  key: string;
  title: string;
  description: string;
  accent: 'yellow' | 'red';
  icon: React.ReactNode;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'business_registration',
    title: 'Business Registration Forms',
    description: 'Official forms for business registration and licensing',
    accent: 'yellow',
    icon: (
      <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    key: 'tax_registration',
    title: 'Tax Registration',
    description: 'Tax-related forms and guides',
    accent: 'red',
    icon: (
      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: 'investment_licenses',
    title: 'Investment Licenses',
    description: 'Investment and licensing documentation',
    accent: 'yellow',
    icon: (
      <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'guides_resources',
    title: 'Guides & Resources',
    description: 'Comprehensive guides and helpful resources',
    accent: 'red',
    icon: (
      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'pdf':
      return (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    case 'docx':
      return (
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    case 'xlsx':
      return (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
  }
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
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative bg-cover bg-center bg-no-repeat py-20" style={{ backgroundImage: 'url(/images/uganda-flag-city.jpg)' }}>
        <div className="absolute inset-0 bg-black/65"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Downloads & Resources
          </h1>
          <p className="text-lg text-neutral-200 max-w-3xl mx-auto">
            Download essential forms, guides, and resources for business registration and investment in Uganda.
            All documents are official and up-to-date.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && visibleCategories.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-neutral-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h2 className="text-xl font-semibold text-white mb-2">Resources Coming Soon</h2>
            <p className="text-neutral-400 max-w-md mx-auto">
              Downloadable forms, guides, and documents are being prepared. Check back soon or contact support for immediate access.
            </p>
          </div>
        )}

        {/* Download Categories */}
        {!loading && visibleCategories.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visibleCategories.map((category) => (
              <div key={category.key} className="bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 overflow-hidden">
                {/* Category Header */}
                <div className={`px-6 py-5 border-b border-neutral-800 ${
                  category.accent === 'red'
                    ? 'bg-gradient-to-r from-red-900/40 to-neutral-900'
                    : 'bg-gradient-to-r from-yellow-900/30 to-neutral-900'
                }`}>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      {category.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                      <p className="text-neutral-400 mt-1">{category.description}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-sm text-neutral-500 bg-neutral-800 px-3 py-1 rounded-full border border-neutral-700">
                        {category.resources.length} file{category.resources.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Downloads Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-3">
                    {category.resources.map((resource) => (
                      <div
                        key={resource._id}
                        className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-yellow-600 hover:shadow-lg hover:shadow-yellow-500/5 transition-all group"
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-3">
                            {getFileIcon(resource.fileType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-white truncate">
                              {resource.title}
                            </h3>
                            {resource.description && (
                              <p className="text-sm text-neutral-400 mt-1">
                                {resource.description}
                              </p>
                            )}
                            <div className="flex items-center mt-2 text-xs gap-2">
                              <span className="bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded border border-neutral-600">
                                {resource.fileType}
                              </span>
                              {resource.file?.asset?.size && (
                                <span className="text-neutral-500">
                                  {formatFileSize(resource.file.asset.size)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(resource)}
                          className="ml-4 bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 transition-all flex items-center flex-shrink-0"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help CTA */}
        <div className="mt-12 bg-gradient-to-r from-red-900 via-red-800 to-yellow-700 rounded-xl p-8 text-center border border-red-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Need Help with Documents?</h2>
          <p className="text-red-100/80 mb-6 max-w-2xl mx-auto">
            Our support team can help you understand which documents you need and guide you through the completion process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/support"
              className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
            >
              Contact Support
            </Link>
            <Link
              href="/tools/document-checklist"
              className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all"
            >
              View Checklist
            </Link>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-8 bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/30">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-500 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-500 mb-2">Important Notice</h3>
              <p className="text-yellow-400/80">
                Always ensure you&apos;re using the latest version of forms and documents. Requirements may change based on current regulations.
                When in doubt, contact the relevant government agency or our support team for verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-yellow-500 text-black px-6 py-4 rounded-lg shadow-2xl shadow-yellow-500/30 max-w-md flex items-start gap-3 animate-slide-in border border-yellow-400">
          <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="flex-1 text-sm leading-relaxed font-medium">{toast.message}</p>
          <button
            onClick={() => setToast({ show: false, message: '' })}
            className="text-black/60 hover:text-black flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
