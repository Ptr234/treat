'use client';

import { useState } from 'react';

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
}

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
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-black to-brand-darkGreen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-yellow-400">
              Professional Invoice Generator
            </h1>
            <p className="text-xl text-yellow-100 mb-8 max-w-3xl mx-auto">
              Generate professional, tax-compliant invoices for your business transactions with our easy-to-use invoice generator.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Invoice Form */}
          <div className="bg-neutral-900 rounded-lg shadow-lg p-6 border border-yellow-900/30">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-6">Invoice Details</h2>

            <div className="space-y-6">
              {/* Business Information */}
              <div>
                <h3 className="text-lg font-medium text-yellow-300 mb-4">Your Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Your Company Ltd"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-neutral-800 text-yellow-100 placeholder:text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                      Tax ID / TIN
                    </label>
                    <input
                      type="text"
                      placeholder="1234567890"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-neutral-800 text-yellow-100 placeholder:text-neutral-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                    Business Address
                  </label>
                  <textarea
                    placeholder="Plot 123, Street Name, City, Uganda"
                    rows={3}
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-neutral-800 text-yellow-100 placeholder:text-neutral-500"
                  />
                </div>
              </div>

              {/* Client Information */}
              <div>
                <h3 className="text-lg font-medium text-yellow-300 mb-4">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Client Company Ltd"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-neutral-800 text-yellow-100 placeholder:text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="client@email.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-neutral-800 text-yellow-100 placeholder:text-neutral-500"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div>
                <h3 className="text-lg font-medium text-yellow-300 mb-4">Invoice Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                      Invoice Number *
                    </label>
                    <input
                      type="text"
                      placeholder="INV-001"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-neutral-800 text-yellow-100 placeholder:text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-neutral-800 text-yellow-100 placeholder:text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-neutral-800 text-yellow-100 placeholder:text-neutral-500"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-yellow-300">Line Items</h3>
                  <button
                    onClick={addLineItem}
                    className="text-sm bg-yellow-600 text-black px-3 py-1 rounded-lg hover:bg-yellow-500 hover:shadow-md hover:shadow-yellow-500/20 active:scale-95 transition-all duration-200"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <label className="block text-xs font-medium text-yellow-200/80 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          className="w-full px-2 py-2 text-sm border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-neutral-800 text-yellow-100 placeholder:text-neutral-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-yellow-200/80 mb-1">
                          Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-2 text-sm border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-neutral-800 text-yellow-100 placeholder:text-neutral-500"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-yellow-200/80 mb-1">
                          Rate (UGX)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-2 text-sm border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-neutral-800 text-yellow-100 placeholder:text-neutral-500"
                        />
                      </div>
                      <div className="col-span-2 flex items-center">
                        {items.length > 1 && (
                          <button
                            onClick={() => removeLineItem(index)}
                            className="text-red-400 hover:text-red-300 text-sm p-2"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleGenerateInvoice}
                  className="flex-1 bg-yellow-600 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20 active:scale-95 transition-all duration-200"
                >
                  Generate Invoice
                </button>
                <button
                  onClick={handleSaveDraft}
                  className="flex-1 bg-neutral-800 text-yellow-400 border border-yellow-700 py-3 rounded-lg font-semibold hover:bg-neutral-700 hover:border-yellow-500 active:scale-95 transition-all duration-200"
                >
                  Save Draft
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-neutral-900 rounded-lg shadow-lg p-6 border border-yellow-900/30">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-6">Invoice Preview</h2>

            {!showPreview ? (
              <div className="bg-neutral-800 rounded-lg p-6 min-h-96">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-neutral-400">Invoice Preview</p>
                  <p className="text-sm mt-2 text-neutral-400">Fill out the form and click Generate Invoice</p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-yellow-900/50 rounded-lg p-6 bg-neutral-800 min-h-96">
                {/* Invoice Header */}
                <div className="border-b-2 border-neutral-600 pb-4 mb-4">
                  <h3 className="text-3xl font-bold text-yellow-400">INVOICE</h3>
                  <p className="text-sm text-neutral-400 mt-1">Invoice #{invoiceNumber}</p>
                </div>

                {/* Business & Client Info */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-xs font-semibold text-yellow-500 uppercase mb-2">From</p>
                    <p className="font-bold text-yellow-200">{businessName}</p>
                    {taxId && <p className="text-sm text-neutral-400">TIN: {taxId}</p>}
                    {businessAddress && <p className="text-sm text-neutral-400 whitespace-pre-line">{businessAddress}</p>}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-yellow-500 uppercase mb-2">Bill To</p>
                    <p className="font-bold text-yellow-200">{clientName}</p>
                    {clientEmail && <p className="text-sm text-neutral-400">{clientEmail}</p>}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
                  {issueDate && (
                    <div>
                      <p className="text-neutral-500">Issue Date:</p>
                      <p className="font-medium text-yellow-200">{issueDate}</p>
                    </div>
                  )}
                  {dueDate && (
                    <div>
                      <p className="text-neutral-500">Due Date:</p>
                      <p className="font-medium text-yellow-200">{dueDate}</p>
                    </div>
                  )}
                </div>

                {/* Line Items Table */}
                <div className="mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-neutral-600">
                        <th className="text-left py-2 text-yellow-300 font-semibold">Description</th>
                        <th className="text-right py-2 text-yellow-300 font-semibold">Qty</th>
                        <th className="text-right py-2 text-yellow-300 font-semibold">Rate</th>
                        <th className="text-right py-2 text-yellow-300 font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.filter(item => item.description).map((item, index) => (
                        <tr key={index} className="border-b border-neutral-700">
                          <td className="py-2 text-neutral-300">{item.description}</td>
                          <td className="text-right py-2 text-neutral-300">{item.quantity}</td>
                          <td className="text-right py-2 text-neutral-300">UGX {item.rate.toLocaleString()}</td>
                          <td className="text-right py-2 text-yellow-200 font-medium">
                            UGX {(item.quantity * item.rate).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="border-t-2 border-neutral-600 pt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Subtotal:</span>
                        <span className="font-medium text-yellow-200">UGX {calculateSubtotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">VAT (18%):</span>
                        <span className="font-medium text-yellow-200">UGX {calculateTax().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t-2 border-yellow-700 pt-2">
                        <span className="text-yellow-400">Total:</span>
                        <span className="text-yellow-400">UGX {calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 bg-neutral-900 rounded-lg p-6 border border-yellow-900/30">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4">Invoice Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center group hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-yellow-900/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-yellow-800/30 group-hover:shadow-md group-hover:shadow-yellow-500/15 transition-all duration-300">
                <svg className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-yellow-300 mb-2">Professional Design</h4>
              <p className="text-sm text-neutral-400">Clean, professional invoice templates that look great</p>
            </div>
            <div className="text-center group hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-red-800/30 group-hover:shadow-md group-hover:shadow-red-500/15 transition-all duration-300">
                <svg className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-yellow-300 mb-2">Multiple Formats</h4>
              <p className="text-sm text-neutral-400">Download as PDF, send via email, or print directly</p>
            </div>
            <div className="text-center group hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-neutral-700 group-hover:shadow-md group-hover:shadow-yellow-500/15 transition-all duration-300">
                <svg className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-yellow-300 mb-2">Tax Compliance</h4>
              <p className="text-sm text-neutral-400">Automatically calculates taxes according to Uganda regulations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
