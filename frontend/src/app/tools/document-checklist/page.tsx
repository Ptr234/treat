'use client';

import PageBand from '@/components/ui/PageBand';
import React, { useState, useEffect } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Document {
  id: string;
  name: string;
  required: boolean;
  description: string;
}

interface Checklist {
  title: string;
  category: string;
  documents: Document[];
}

export default function DocumentChecklistPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, Record<number, boolean>>>({});

  const checklists: Checklist[] = [
    {
      title: 'Business Registration Documents',
      category: 'registration',
      documents: [
        { id: 'reg-1', name: 'National ID or Passport (Copy)', required: true, description: 'Valid identification document of the business owner' },
        { id: 'reg-2', name: 'Memorandum of Association', required: true, description: 'For limited companies only' },
        { id: 'reg-3', name: 'Articles of Association', required: true, description: 'For limited companies only' },
        { id: 'reg-4', name: 'Board Resolution', required: true, description: 'Appointing directors and secretary' },
        { id: 'reg-5', name: 'Statutory Declaration', required: true, description: 'Declaration of compliance with legal requirements' },
        { id: 'reg-6', name: 'Certificate of Name Reservation', required: false, description: 'If you reserved a business name' },
        { id: 'reg-7', name: 'Proof of Physical Address', required: true, description: 'Utility bill or tenancy agreement' },
        { id: 'reg-8', name: 'Business License Application', required: true, description: 'Completed application form' }
      ]
    },
    {
      title: 'Tax Registration Documents',
      category: 'tax',
      documents: [
        { id: 'tax-1', name: 'Certificate of Incorporation', required: true, description: 'Business registration certificate' },
        { id: 'tax-2', name: 'National ID (Original & Copy)', required: true, description: 'Business owner identification' },
        { id: 'tax-3', name: 'Bank Account Opening Letter', required: true, description: 'From your chosen bank' },
        { id: 'tax-4', name: 'TIN Application Form', required: true, description: 'Completed URA form' },
        { id: 'tax-5', name: 'Proof of Business Address', required: true, description: 'Utility bill or lease agreement' },
        { id: 'tax-6', name: 'Partnership Agreement', required: false, description: 'For partnerships only' },
        { id: 'tax-7', name: 'Trading License', required: true, description: 'From local government' }
      ]
    },
    {
      title: 'Investment License Documents',
      category: 'investment',
      documents: [
        { id: 'inv-1', name: 'Investment Application Form', required: true, description: 'UIA investment application' },
        { id: 'inv-2', name: 'Business Plan', required: true, description: 'Detailed 3-5 year business plan' },
        { id: 'inv-3', name: 'Financial Projections', required: true, description: 'Cash flow and profit projections' },
        { id: 'inv-4', name: 'Source of Funds Evidence', required: true, description: 'Bank statements or funding letters' },
        { id: 'inv-5', name: 'Technical Feasibility Study', required: false, description: 'For technical projects' },
        { id: 'inv-6', name: 'Environmental Impact Assessment', required: false, description: 'For projects affecting environment' },
        { id: 'inv-7', name: 'Land Title or Lease Agreement', required: false, description: 'If land is involved' },
        { id: 'inv-8', name: 'Curriculum Vitae', required: true, description: 'CVs of key management personnel' }
      ]
    }
  ];

  // Load checked state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('document_checklist_state');
    if (savedState) {
      try {
        setCheckedItems(JSON.parse(savedState));
      } catch (e) {
        console.error('Failed to load saved checklist state', e);
      }
    }
  }, []);

  // Save to localStorage whenever checked items change
  useEffect(() => {
    if (Object.keys(checkedItems).length > 0) {
      localStorage.setItem('document_checklist_state', JSON.stringify(checkedItems));
    }
  }, [checkedItems]);

  const toggleCheckbox = (category: string, index: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [index]: !prev[category]?.[index]
      }
    }));
  };

  const getProgress = (category: string, totalDocs: number) => {
    const checked = checkedItems[category] || {};
    const checkedCount = Object.values(checked).filter(Boolean).length;
    return { checked: checkedCount, total: totalDocs };
  };

  const getTotalProgress = () => {
    let totalChecked = 0;
    let totalDocs = 0;
    checklists.forEach(checklist => {
      totalDocs += checklist.documents.length;
      const checked = checkedItems[checklist.category] || {};
      totalChecked += Object.values(checked).filter(Boolean).length;
    });
    return { checked: totalChecked, total: totalDocs };
  };

  const resetAll = () => {
    if (confirm('Are you sure you want to reset all checkboxes? This action cannot be undone.')) {
      setCheckedItems({});
      localStorage.removeItem('document_checklist_state');
    }
  };

  const downloadChecklist = () => {
    import('@/lib/track').then(({ trackEvent }) =>
      trackEvent('tool_usage', 'document-checklist')
    );
    let content = 'DOCUMENT CHECKLIST FOR BUSINESS REGISTRATION IN UGANDA\n';
    content += '='.repeat(60) + '\n\n';
    content += `Generated: ${new Date().toLocaleString()}\n\n`;

    checklists.forEach(checklist => {
      const progress = getProgress(checklist.category, checklist.documents.length);
      content += `\n${checklist.title}\n`;
      content += '-'.repeat(checklist.title.length) + '\n';
      content += `Progress: ${progress.checked}/${progress.total} documents checked\n\n`;

      checklist.documents.forEach((doc, index) => {
        const isChecked = checkedItems[checklist.category]?.[index];
        const checkbox = isChecked ? '[✓]' : '[ ]';
        const required = doc.required ? '(REQUIRED)' : '(Optional)';
        content += `${checkbox} ${doc.name} ${required}\n`;
        content += `    ${doc.description}\n\n`;
      });
    });

    const totalProgress = getTotalProgress();
    content += '\n' + '='.repeat(60) + '\n';
    content += `TOTAL PROGRESS: ${totalProgress.checked}/${totalProgress.total} documents checked\n`;
    content += '='.repeat(60) + '\n';

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-checklist-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalProgress = getTotalProgress();
  const progressPercentage = totalProgress.total > 0
    ? Math.round((totalProgress.checked / totalProgress.total) * 100)
    : 0;

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
            <li>
              <Link href="/tools" className="text-red-600 hover:underline underline-offset-4">Business tools</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li className="font-semibold text-black" aria-current="page">Document checklist</li>
          </ol>
        </nav>
      </div>

      {/* Title */}
      <PageBand>
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Document checklist</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700 sm:text-lg">
          Comprehensive checklist for business registration and licensing documents required in Uganda.
          Make sure you have all necessary documents before starting your application.
        </p>
      </section>
      </PageBand>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Overall progress */}
        <section aria-labelledby="overall-progress-heading" className="border-y border-neutral-200 py-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 id="overall-progress-heading" className="text-lg font-bold">Overall progress</h2>
            <p className="text-sm text-neutral-700" aria-live="polite">
              {totalProgress.checked} of {totalProgress.total} documents checked ({progressPercentage}%)
            </p>
          </div>
          <div
            className="mt-4 h-2 w-full bg-neutral-200"
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall checklist progress"
          >
            <div className="h-2 bg-yellow-400 transition-all duration-300 ease-in-out" style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={resetAll}
              className="text-sm font-bold text-red-600 underline decoration-red-600 underline-offset-4 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              Reset all
            </button>
          </div>
        </section>

        {/* Checklists */}
        <div className="mt-12 space-y-16">
          {checklists.map((checklist) => {
            const progress = getProgress(checklist.category, checklist.documents.length);
            const categoryPercentage = checklist.documents.length > 0
              ? Math.round((progress.checked / progress.total) * 100)
              : 0;

            return (
              <section key={checklist.category} aria-labelledby={`checklist-${checklist.category}`}>
                <div className="flex flex-col gap-2 border-b border-neutral-200 pb-3 sm:flex-row sm:items-baseline sm:justify-between">
                  <h2 id={`checklist-${checklist.category}`} className="text-xl font-bold sm:text-2xl">{checklist.title}</h2>
                  <p className="text-sm text-neutral-700">
                    {progress.checked}/{progress.total} ({categoryPercentage}%)
                  </p>
                </div>
                <div className="mt-4 h-1.5 w-full bg-neutral-200" aria-hidden="true">
                  <div className="h-1.5 bg-yellow-400 transition-all duration-300 ease-in-out" style={{ width: `${categoryPercentage}%` }} />
                </div>

                <ul className="mt-6 divide-y divide-neutral-200">
                  {checklist.documents.map((document, index) => {
                    const isChecked = checkedItems[checklist.category]?.[index] || false;
                    const inputId = `${checklist.category}-${index}`;

                    return (
                      <li key={document.id} className="flex items-start gap-4 py-5">
                        <input
                          id={inputId}
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheckbox(checklist.category, index)}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={inputId}
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-red-600 peer-focus-visible:ring-offset-2 ${
                            isChecked ? 'border-black bg-black' : 'border-black bg-white hover:bg-neutral-100'
                          }`}
                        >
                          {isChecked && <CheckIcon className="h-3.5 w-3.5 text-yellow-400" aria-hidden="true" />}
                          <span className="sr-only">Mark {document.name} as {isChecked ? 'not done' : 'done'}</span>
                        </label>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <h3 className={`text-base font-bold ${isChecked ? 'text-neutral-500 line-through' : 'text-black'}`}>
                              {document.name}
                            </h3>
                            <span className={`text-xs font-bold uppercase tracking-wider ${document.required ? 'text-red-600' : 'text-neutral-600'}`}>
                              {document.required ? 'Required' : 'Optional'}
                            </span>
                          </div>
                          <p className={`mt-1 text-sm leading-6 ${isChecked ? 'text-neutral-500' : 'text-neutral-700'}`}>
                            {document.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Next steps */}
        <section className="mt-16 pt-8" aria-labelledby="checklist-next-heading">
          <h2 id="checklist-next-heading" className="text-2xl font-bold">Ready to start your application?</h2>
          <p className="mt-3 max-w-2xl leading-7 text-neutral-700">
            Once you have gathered all the required documents, you can begin your business registration
            process through our streamlined online platform.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/business/registration"
              className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3 text-sm font-bold text-yellow-400 hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Start registration
            </Link>
            <button
              type="button"
              onClick={downloadChecklist}
              className="inline-flex items-center justify-center rounded-md border-2 border-black px-6 py-3 text-sm font-bold text-black hover:bg-black hover:text-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Download checklist
            </button>
          </div>
        </section>

        <section className="mt-12 border-l-4 border-red-600 pl-6" aria-labelledby="checklist-notice-heading">
          <h2 id="checklist-notice-heading" className="text-lg font-bold">Important notice</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-neutral-700">
            Document requirements may vary depending on your specific business type and circumstances.
            It&apos;s recommended to consult with our support team or visit the relevant government agency
            for the most up-to-date requirements.
          </p>
        </section>
      </div>
    </div>
  );
}
