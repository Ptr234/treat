import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, Globe, MapPin, Download } from 'lucide-react';
import { getInvestmentById, getInvestmentIds } from '@/lib/investments';
import { breadcrumbLd, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import InvestmentDetailClient from './InvestmentDetailClient';
import PageHeader from '@/components/ui/PageHeader';

const linkClass = 'gov-link';

const sectionClass = 'border-t-4 border-black pt-5';
const sectionHeadingClass = 'gov-title-m';

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
 <div className="bg-white">
        <div className="gov-container py-24">
          <h1 className="gov-title-xl">Investment opportunity not found</h1>
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
 <div className="bg-white">
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Investments', path: '/investments/' },
          { name: opportunity.title, path: `/investments/${id}/` },
        ])}
      />
      <PageHeader
        crumbs={[{ label: 'Investment projects', href: '/investments' }, { label: opportunity.title }]}
        caption={<>{opportunity.category} · {opportunity.priority} priority</>}
        title={opportunity.title}
        lead={opportunity.description}
        aside={
          <div className="flex items-center gap-4 border-t-4 border-black bg-white p-5">
            <span className="grid h-16 w-16 shrink-0 place-items-center border border-[#dcd8cf] bg-white p-2">
              <Image src={opportunity.logoPath} alt="" width={56} height={56} className="object-contain" />
            </span>
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.12em] text-[#5c5850]">Lead agency</span>
              <span className="mt-1 block font-bold leading-snug">{opportunity.agency}</span>
            </span>
          </div>
        }
      />

      <div className="gov-container pb-16 pt-10">
        {/* Key metrics row */}
        <dl className="grid grid-cols-2 border-t-2 border-black md:grid-cols-4">
          <div className="border-b border-[#dcd8cf] py-4 pr-4 md:border-b-0">
            <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Investment range</dt>
            <dd className="mt-1 font-display text-2xl font-semibold leading-tight text-black">{opportunity.investmentRange}</dd>
          </div>
          <div className="border-b border-[#dcd8cf] py-4 pr-4 md:border-b-0">
            <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Expected ROI</dt>
            <dd className="mt-1 font-display text-2xl font-semibold leading-tight text-black">{opportunity.roi}</dd>
          </div>
          <div className="border-b border-[#dcd8cf] py-4 pr-4 md:border-b-0">
            <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Timeline</dt>
            <dd className="mt-1 font-display text-2xl font-semibold leading-tight text-black">{opportunity.timeline}</dd>
          </div>
          <div className="border-b border-[#dcd8cf] py-4 pr-4 md:border-b-0">
            <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Market size</dt>
            <dd className="mt-1 font-display text-2xl font-semibold leading-tight text-black">{opportunity.marketSize}</dd>
          </div>
        </dl>
        <section aria-label="Project listing source and currency" className="gov-inset gov-inset--black mt-6 grid gap-3 text-sm sm:grid-cols-2">
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
                  <dt className="text-sm font-bold text-[#5c5850]">Market growth rate</dt>
                  <dd className="mt-1 text-xl font-bold text-black">{opportunity.keyMetrics.marketGrowth}</dd>
                </div>
                <div>
                  <dt className="text-sm font-bold text-[#5c5850]">Current export value</dt>
                  <dd className="mt-1 text-xl font-bold text-black">{opportunity.keyMetrics.exportValue}</dd>
                </div>
                <div>
                  <dt className="text-sm font-bold text-[#5c5850]">Employment potential</dt>
                  <dd className="mt-1 text-xl font-bold text-black">{opportunity.keyMetrics.employmentPotential}</dd>
                </div>
                <div>
                  <dt className="text-sm font-bold text-[#5c5850]">Payback period</dt>
                  <dd className="mt-1 text-xl font-bold text-black">{opportunity.keyMetrics.paybackPeriod}</dd>
                </div>
              </dl>
            </section>

            <section className={sectionClass}>
              <h2 className={sectionHeadingClass}>Government incentives</h2>
              <ul className="mt-5 grid grid-cols-1 gap-x-10 gap-y-3 md:grid-cols-2">
                {opportunity.incentives.map((incentive, index) => (
                  <li key={index} className="flex items-start gap-3 text-neutral-800">
                    <span aria-hidden="true" className="mt-1.5 h-3 w-3 shrink-0 bg-[#ffd700] ring-1 ring-black" />
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
                    <span aria-hidden="true" className="mt-1.5 h-3 w-3 shrink-0 bg-[#ce1126]" />
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
              <p className="gov-inset gov-inset--red mt-3 text-[15px] leading-6">{opportunity.keyRisks}</p>
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

        <div className="mt-14 border-t border-[#dcd8cf] pt-6">
          <Link href="/investments" className={linkClass}>← Back to all investment projects</Link>
        </div>
      </div>
    </div>
  );
}
