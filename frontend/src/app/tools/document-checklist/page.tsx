'use client';

import React, { useState, useEffect } from 'react';
import { Building, FileText, LandPlot, CheckCircle } from 'lucide-react';
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'registration': return 'bg-neutral-900 border-yellow-800/40';
      case 'tax': return 'bg-neutral-900 border-red-800/40';
      case 'investment': return 'bg-neutral-900 border-yellow-600/40';
      default: return 'bg-neutral-900 border-neutral-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'registration':
        return <Building className="w-6 h-6 text-yellow-400" />;
      case 'tax':
        return <FileText className="w-6 h-6 text-red-400" />;
      case 'investment':
        return <LandPlot className="w-6 h-6 text-yellow-500" />;
      default:
        return null;
    }
  };

  const totalProgress = getTotalProgress();
  const progressPercentage = totalProgress.total > 0
    ? Math.round((totalProgress.checked / totalProgress.total) * 100)
    : 0;

  return (
    <div className="bg-black min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-yellow-400 mb-6">
              Document Checklist
            </h1>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
              Comprehensive checklist for business registration and licensing documents required in Uganda.
              Make sure you have all necessary documents before starting your application.
            </p>
          </div>

          {/* Overall Progress Bar */}
          <div className="bg-neutral-900 rounded-lg shadow-md border border-yellow-900/30 p-6 mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-yellow-400">Overall Progress</h3>
              <span className="text-sm font-medium text-neutral-400">
                {totalProgress.checked} of {totalProgress.total} documents checked ({progressPercentage}%)
              </span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-yellow-500 h-4 transition-all duration-300 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={resetAll}
                className="px-4 py-2 bg-red-700 text-neutral-100 text-sm font-medium rounded-lg hover:bg-red-600 hover:shadow-lg hover:shadow-red-900/30 active:scale-95 transition-all duration-200"
              >
                Reset All
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {checklists.map((checklist) => {
              const progress = getProgress(checklist.category, checklist.documents.length);
              const categoryPercentage = checklist.documents.length > 0
                ? Math.round((progress.checked / progress.total) * 100)
                : 0;

              return (
                <div key={checklist.category} className={`rounded-xl p-6 border-2 ${getCategoryColor(checklist.category)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {getCategoryIcon(checklist.category)}
                      <h2 className="text-2xl font-bold text-yellow-400 ml-3">{checklist.title}</h2>
                    </div>
                    <span className="text-sm font-medium text-neutral-400">
                      {progress.checked}/{progress.total} ({categoryPercentage}%)
                    </span>
                  </div>

                  {/* Category Progress Bar */}
                  <div className="mb-6">
                    <div className="w-full bg-neutral-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-yellow-500 h-2 transition-all duration-300 ease-in-out"
                        style={{ width: `${categoryPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {checklist.documents.map((document, index) => {
                      const isChecked = checkedItems[checklist.category]?.[index] || false;

                      return (
                        <div key={document.id} className="flex items-start space-x-4 bg-neutral-800 rounded-lg p-4 border border-neutral-700 hover:border-yellow-700/50 hover:bg-neutral-800/80 hover:shadow-md hover:shadow-black/30 transition-all duration-200 cursor-pointer">
                          <div className="flex-shrink-0 mt-1">
                            <button
                              onClick={() => toggleCheckbox(checklist.category, index)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 active:scale-90 ${
                                isChecked
                                  ? 'border-yellow-500 bg-yellow-500 shadow-sm shadow-yellow-500/30'
                                  : 'border-neutral-500 hover:border-yellow-400 hover:shadow-sm hover:shadow-yellow-500/20'
                              }`}
                            >
                              {isChecked && (
                                <CheckCircle className="w-3 h-3 text-black" />
                              )}
                            </button>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className={`text-lg font-semibold ${isChecked ? 'text-neutral-400 line-through' : 'text-yellow-200'}`}>
                                {document.name}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                document.required
                                  ? 'bg-red-900/40 text-red-300'
                                  : 'bg-neutral-700 text-neutral-400'
                              }`}>
                                {document.required ? 'Required' : 'Optional'}
                              </span>
                            </div>
                            <p className={`mt-1 ${isChecked ? 'text-neutral-500' : 'text-neutral-400'}`}>
                              {document.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 bg-gradient-to-r from-red-950 via-red-900 to-neutral-900 rounded-xl p-8 border border-red-800/50 text-center">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Ready to Start Your Application?</h2>
            <p className="text-neutral-300 mb-6 max-w-2xl mx-auto">
              Once you have gathered all the required documents, you can begin your business registration
              process through our streamlined online platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/business/registration"
                className="bg-yellow-600 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20 active:scale-95 transition-all duration-200"
              >
                Start Registration
              </Link>
              <button
                onClick={downloadChecklist}
                className="bg-neutral-800 text-yellow-400 border border-yellow-700 px-8 py-3 rounded-lg font-semibold hover:bg-neutral-700 hover:border-yellow-500 active:scale-95 transition-all duration-200"
              >
                Download Checklist
              </button>
            </div>
          </div>

          <div className="mt-8 bg-yellow-900/20 rounded-lg p-6 border border-yellow-700/30">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-400 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-yellow-200 mb-2">Important Notice</h3>
                <p className="text-yellow-200">
                  Document requirements may vary depending on your specific business type and circumstances.
                  It&apos;s recommended to consult with our support team or visit the relevant government agency
                  for the most up-to-date requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
