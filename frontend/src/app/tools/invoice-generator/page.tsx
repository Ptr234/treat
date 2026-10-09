'use client';

import PageHeader from '@/components/ui/PageHeader';
import { useState } from 'react';

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
}

const inputClass = 'gov-input';
const labelClass = 'gov-label';
const smallLabelClass = 'mb-1 block text-sm font-bold text-black';
const sectionHeadingClass = 'text-lg font-bold text-black';

export default function InvoiceGeneratorPage() {
  // Form state
  const [businessName, setBusinessName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { description: '', quantity: 1, rate: 0 }
  ]);
  const [showPreview, setShowPreview] = useState(false);

  const addLineItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0 }]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value } as LineItem;
    setItems(newItems);
  };

  const removeLineItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% VAT
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleGenerateInvoice = () => {
    if (!businessName || !clientName || !invoiceNumber) {
      alert('Please fill in all required fields (Business Name, Client Name, Invoice Number)');
      return;
    }
    setShowPreview(true);
  };

  const handleSaveDraft = () => {
    const draft = {
      businessName,
      taxId,
      businessAddress,
      clientName,
      clientEmail,
      invoiceNumber,
      issueDate,
      dueDate,
      items,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('invoice_draft', JSON.stringify(draft));
    alert('Draft saved successfully! You can reload it later from localStorage.');
  };

  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Business tools', href: '/tools' }, { label: 'Invoice generator' }]}
        caption="Business tools"
        title="Invoice generator"
        lead="Create a clear invoice for your sales and services, with totals calculated for you. Print it or save it for your records."
      />

      <div className="gov-container py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Invoice form */}
          <section aria-labelledby="invoice-form-heading">
            <h2 id="invoice-form-heading" className="gov-title-l border-b-2 border-black pb-3">Invoice details</h2>

            <div className="mt-8 space-y-10">
              {/* Business information */}
              <div>
                <h3 className={`${sectionHeadingClass} mb-4`}>Your business information</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="inv-business" className={labelClass}>Business name <span className="text-red-600">*</span></label>
                    <input id="inv-business" type="text" placeholder="Your Company Ltd" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="inv-tin" className={labelClass}>Tax ID / TIN</label>
                    <input id="inv-tin" type="text" placeholder="1234567890" value={taxId} onChange={(e) => setTaxId(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="inv-address" className={labelClass}>Business address</label>
                  <textarea id="inv-address" placeholder="Plot 123, Street Name, City, Uganda" rows={3} value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} className={inputClass} />
                </div>
              </div>

              {/* Client information */}
              <div>
                <h3 className={`${sectionHeadingClass} mb-4`}>Client information</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="inv-client" className={labelClass}>Client name <span className="text-red-600">*</span></label>
                    <input id="inv-client" type="text" placeholder="Client Company Ltd" value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="inv-email" className={labelClass}>Email</label>
                    <input id="inv-email" type="email" placeholder="client@email.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Invoice dates */}
              <div>
                <h3 className={`${sectionHeadingClass} mb-4`}>Invoice details</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label htmlFor="inv-number" className={labelClass}>Invoice number <span className="text-red-600">*</span></label>
                    <input id="inv-number" type="text" placeholder="INV-001" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="inv-issue" className={labelClass}>Issue date</label>
                    <input id="inv-issue" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="inv-due" className={labelClass}>Due date</label>
                    <input id="inv-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className={sectionHeadingClass}>Line items</h3>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className=" px-1 text-sm font-bold text-black hover:border-red-600 hover:text-red-600"
                  >
                    + Add item
                  </button>
                </div>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 items-end gap-2 border-t border-neutral-200 pt-4">
                      <div className="col-span-12 sm:col-span-5">
                        <label htmlFor={`inv-desc-${index}`} className={smallLabelClass}>Description</label>
                        <input id={`inv-desc-${index}`} type="text" placeholder="Item description" value={item.description} onChange={(e) => updateLineItem(index, 'description', e.target.value)} className={`${inputClass} px-2 py-2`} />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <label htmlFor={`inv-qty-${index}`} className={smallLabelClass}>Qty</label>
                        <input id={`inv-qty-${index}`} type="number" min="1" value={item.quantity} onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)} className={`${inputClass} px-2 py-2`} />
                      </div>
                      <div className="col-span-5 sm:col-span-3">
                        <label htmlFor={`inv-rate-${index}`} className={smallLabelClass}>Rate (UGX)</label>
                        <input id={`inv-rate-${index}`} type="number" min="0" value={item.rate} onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)} className={`${inputClass} px-2 py-2`} />
                      </div>
                      <div className="col-span-3 flex items-center sm:col-span-2">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLineItem(index)}
                            className="p-2 text-sm font-semibold text-red-600 hover:text-black"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={handleGenerateInvoice}
                  className="gov-btn flex-1"
                >
                  Generate invoice
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="gov-btn gov-btn--outline flex-1"
                >
                  Save draft
                </button>
              </div>
            </div>
          </section>

          {/* Preview */}
          <section aria-labelledby="invoice-preview-heading">
            <h2 id="invoice-preview-heading" className="gov-title-l border-b-2 border-black pb-3">Invoice preview</h2>

            {!showPreview ? (
              <div className="mt-8 py-8 pl-6">
                <p className="text-lg font-bold text-black">Invoice preview</p>
                <p className="mt-2 text-sm text-neutral-700">Fill out the form and click Generate invoice.</p>
              </div>
            ) : (
              <div className="mt-8 min-h-96">
                {/* Invoice header */}
                <div className="border-b border-neutral-200 pb-4">
                  <h3 className="text-3xl font-bold tracking-tight">INVOICE</h3>
                  <p className="mt-1 text-sm text-neutral-700">Invoice #{invoiceNumber}</p>
                </div>

                {/* From and bill to */}
                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-600">From</p>
                    <p className="font-bold">{businessName}</p>
                    {taxId && <p className="text-sm text-neutral-700">TIN: {taxId}</p>}
                    {businessAddress && <p className="whitespace-pre-line text-sm text-neutral-700">{businessAddress}</p>}
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-600">Bill to</p>
                    <p className="font-bold">{clientName}</p>
                    {clientEmail && <p className="text-sm text-neutral-700">{clientEmail}</p>}
                  </div>
                </div>

                {/* Dates */}
                <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
                  {issueDate && (
                    <div>
                      <p className="text-neutral-600">Issue date</p>
                      <p className="font-semibold">{issueDate}</p>
                    </div>
                  )}
                  {dueDate && (
                    <div>
                      <p className="text-neutral-600">Due date</p>
                      <p className="font-semibold">{dueDate}</p>
                    </div>
                  )}
                </div>

                {/* Line items */}
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th scope="col" className="py-2 text-left font-bold">Description</th>
                        <th scope="col" className="py-2 text-right font-bold">Qty</th>
                        <th scope="col" className="py-2 text-right font-bold">Rate</th>
                        <th scope="col" className="py-2 text-right font-bold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.filter(item => item.description).map((item, index) => (
                        <tr key={index} className="border-b border-neutral-200">
                          <td className="py-2 text-neutral-800">{item.description}</td>
                          <td className="py-2 text-right text-neutral-800">{item.quantity}</td>
                          <td className="py-2 text-right text-neutral-800">UGX {item.rate.toLocaleString()}</td>
                          <td className="py-2 text-right font-semibold">UGX {(item.quantity * item.rate).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-6 flex justify-end">
                  <dl className="w-72 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-neutral-700">Subtotal</dt>
                      <dd className="font-semibold">UGX {calculateSubtotal().toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-700">VAT (18%)</dt>
                      <dd className="font-semibold">UGX {calculateTax().toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between border-t border-neutral-200 pt-3 text-lg">
                      <dt className="font-bold">Total</dt>
                      <dd className="font-bold text-red-600">UGX {calculateTotal().toLocaleString()}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Features */}
        <section className="mt-16 border-t border-neutral-200 pt-10" aria-labelledby="invoice-features-heading">
          <h2 id="invoice-features-heading" className="text-lg font-bold">Invoice features</h2>
          <ul className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
            <li className=" pt-4">
              <h3 className="font-bold">Professional design</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">Clean, professional invoice templates that look great.</p>
            </li>
            <li className=" pt-4">
              <h3 className="font-bold">Multiple formats</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">Download as PDF, send via email, or print directly.</p>
            </li>
            <li className=" pt-4">
              <h3 className="font-bold">Tax compliance</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">Automatically calculates taxes according to Uganda regulations.</p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
