import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, Globe, MapPin, Download } from 'lucide-react';
import { getInvestmentById, getInvestmentIds } from '@/lib/investments';
import { breadcrumbLd, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import InvestmentDetailClient from './InvestmentDetailClient';

const linkClass =
  'font-semibold text-black underline decoration-yellow-400 decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

const sectionClass = 'border-t border-neutral-200 pt-6';
const sectionHeadingClass = 'text-lg font-bold text-black sm:text-xl';

export async function generateStaticParams() {
  return getInvestmentIds();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const opportunity = await getInvestmentById(id);
  if (!opportunity) {
    return buildMetadata({ title: 'Investment opportunity not found', path: `/investments/${id}/`, noIndex: true });
  }

  return buildMetadata({
    title: opportunity.title,
    description: opportunity.description,
    path: `/investments/${id}/`,
  });
}

export default async function InvestmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await getInvestmentById(id);

  if (!opportunity) {
    return (
 <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight">Investment opportunity not found</h1>
          <p className="mt-4 text-neutral-700">The investment opportunity you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/investments" className={`${linkClass} mt-6 inline-block`}>
            Back to opportunities
          </Link>
        </div>
      </div>
    );
  }

  const hasValidUpdateDate = Boolean(opportunity.sourceUpdatedAt && !Number.isNaN(Date.parse(opportunity.sourceUpdatedAt)));
  const sourceUpdatedAt = hasValidUpdateDate
    ? new Intl.DateTimeFormat('en-UG', { dateStyle: 'long', timeZone: 'Africa/Kampala' }).format(new Date(opportunity.sourceUpdatedAt!))
    : 'Not provided for this listing';

  return (
 <div className="min-h-screen bg-white text-black">
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Investments', path: '/investments/' },
          { name: opportunity.title, path: `/investments/${id}/` },
        ])}
      />
      {/* Breadcrumb band */}
      <div className="border-b border-neutral-200 bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-red-600 hover:underline underline-offset-4">Home</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li>
              <Link href="/investments" className="text-red-600 hover:underline underline-offset-4">Investments</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li className="font-semibold text-black" aria-current="page">{opportunity.title}</li>
          </ol>
        </nav>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 sm:pt-14">
        {/* Title block */}
        <header className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span className="text-red-600">{opportunity.category}</span>
              <span className="text-neutral-500">· {opportunity.priority} priority</span>
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{opportunity.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700 sm:text-lg">{opportunity.description}</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-white p-2">
            <Image src={opportunity.logoPath} alt={`${opportunity.agency} logo`} width={56} height={56} className="object-contain" />
          </div>
        </header>

        {/* Key metrics row */}
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-l-4 border-yellow-400 bg-neutral-50 py-5 pl-5 pr-4 md:grid-cols-4">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">Investment range</dt>
            <dd className="font-data mt-1 text-sm font-bold text-black">{opportunity.investmentRange}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">Expected ROI</dt>
            <dd className="font-data mt-1 text-sm font-bold text-black">{opportunity.roi}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">Timeline</dt>
            <dd className="font-data mt-1 text-sm font-bold text-black">{opportunity.timeline}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">Market size</dt>
            <dd className="mt-1 text-sm font-bold text-black">{opportunity.marketSize}</dd>
          </div>
        </dl>
        <section aria-label="Project listing source and currency" className="mt-4 grid gap-3 border border-neutral-200 bg-white px-4 py-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Source / lead agency</p>
            <p className="mt-1 font-semibold text-neutral-900">{opportunity.agency}</p>
            <a href={opportunity.sourceUrl ?? opportunity.contact.website} target="_blank" rel="noopener noreferrer" className={`${linkClass} mt-1 inline-block text-xs`}>Agency website</a>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Last updated</p>
            <p className="mt-1 text-neutral-800">{sourceUpdatedAt}</p>
          </div>
          <p className="text-xs leading-5 text-neutral-600 sm:col-span-2">Investment ranges, returns, market figures and timelines are published listing information. Confirm current details and requirements with the lead agency before making a decision.</p>
        </section>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-12 lg:col-span-2">
            <section>
              <h2 className={sectionHeadingClass}>Investment overview</h2>
              <div className="mt-4 space-y-4">
                {opportunity.fullDescription.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="leading-7 text-neutral-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            <section className={sectionClass}>
              <h2 className={sectionHeadingClass}>Key investment metrics</h2>
              <dl className="mt-5 grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-neutral-600">Market growth rate</dt>
                  <dd className="mt-1 text-lg font-semibold text-black">{opportunity.keyMetrics.marketGrowth}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-600">Current export value</dt>
                  <dd className="mt-1 text-lg font-semibold text-black">{opportunity.keyMetrics.exportValue}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-600">Employment potential</dt>
                  <dd className="mt-1 text-lg font-semibold text-black">{opportunity.keyMetrics.employmentPotential}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-600">Payback period</dt>
                  <dd className="mt-1 text-lg font-semibold text-black">{opportunity.keyMetrics.paybackPeriod}</dd>
                </div>
              </dl>
            </section>

            <section className={sectionClass}>
              <h2 className={sectionHeadingClass}>Government incentives</h2>
              <ul className="mt-5 grid grid-cols-1 gap-x-10 gap-y-3 md:grid-cols-2">
                {opportunity.incentives.map((incentive, index) => (
                  <li key={index} className="flex items-start gap-3 text-neutral-800">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-yellow-400" />
                    <span className="font-medium">{incentive}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={sectionClass}>
              <h2 className={sectionHeadingClass}>Required licenses and permits</h2>
              <ul className="mt-5 space-y-3">
                {opportunity.requiredLicenses.map((license, index) => (
                  <li key={index} className="flex items-start gap-3 text-neutral-800">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-red-600" />
                    <span className="font-medium">{license}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-10">
            <section>
              <h3 className="text-lg font-bold text-black">Key risk</h3>
              <p className="mt-3 border-l-4 border-red-600 pl-4 text-sm leading-6 text-neutral-800">{opportunity.keyRisks}</p>
            </section>

            <section className={sectionClass}>
              <h3 className="text-lg font-bold text-black">Contact information</h3>
              <p className="mt-3 font-semibold text-black">{opportunity.agency}</p>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                  <span className="text-neutral-700">{opportunity.contact.address}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                  <a href={`tel:${opportunity.contact.phone}`} className={linkClass}>{opportunity.contact.phone}</a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                  <a href={`mailto:${opportunity.contact.email}`} className={`${linkClass} break-all`}>{opportunity.contact.email}</a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                  <a href={opportunity.contact.website} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    Visit website
                  </a>
                </li>
              </ul>
            </section>

            {/* Client-side interactive components */}
            <InvestmentDetailClient opportunity={opportunity} />

            {opportunity.documents && opportunity.documents.length > 0 && (
              <section className={sectionClass}>
                <h3 className="text-lg font-bold text-black">Documents and resources</h3>
                <ul className="mt-3 divide-y divide-neutral-200">
                  {(opportunity.documents as Array<{name: string; type: string; size: string; url: string}>).map((doc, index) => (
                    <li key={index} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-black">{doc.name}</p>
                        <p className="text-xs text-neutral-600">{doc.type} • {doc.size}</p>
                      </div>
                      <Link
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-red-600 hover:text-black"
                        title={`Download ${doc.name}`}
                      >
                        <Download className="h-4 w-4" aria-label={`Download ${doc.name}`} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>

        <div className="mt-14 border-t border-neutral-200 pt-6">
          <Link href="/investments" className={linkClass}>Back to all opportunities</Link>
        </div>
      </div>
    </div>
  );
}
