'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount?: number; // Discount percentage
}

interface InvoiceData {
  // Client Information
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientTin: string;

  // Agency Information
  selectedAgency: string;

  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;

  // Services/Items
  items: InvoiceItem[];

  // Additional Details
  notes: string;
  terms: string;

  // Currency
  currency: string;

  // Discount and fees
  generalDiscount: number; // General discount percentage
  lateFee: number; // Late payment fee percentage
}

export default function InvoiceGenerator() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    // Client Information
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientTin: '',

    // Agency Information
    selectedAgency: 'UIA',

    // Invoice Details
    invoiceNumber: `INV-${Date.now()}`,
    invoiceDate: new Date().toISOString().split('T')[0] || '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',

    // Services/Items
    items: [
      {
        id: 1,
        description: 'Investment Consultation Service',
        quantity: 1,
        unitPrice: 500000,
        taxRate: 18,
        discount: 0
      }
    ],

    // Additional Details
    notes: 'Thank you for choosing Uganda Investment Authority services.',
    terms: 'Payment is due within 30 days of invoice date. Late payments may incur additional charges.',

    // Currency
    currency: 'UGX',

    // Discount and fees
    generalDiscount: 0,
    lateFee: 0
  });

  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const agencyOptions = [
    { key: 'UIA', name: 'Uganda Investment Authority' },
    { key: 'URA', name: 'Uganda Revenue Authority' },
    { key: 'URSB', name: 'Uganda Registration Services Bureau' },
    { key: 'UTB', name: 'Uganda Tourism Board' },
    { key: 'BOU', name: 'Bank of Uganda' },
    { key: 'KCCA', name: 'Kampala Capital City Authority' },
    { key: 'NEMA', name: 'National Environment Management Authority' }
  ];

  // Validation function
  const validateInvoice = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!invoiceData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    if (!invoiceData.clientEmail.trim()) {
      newErrors.clientEmail = 'Client email is required';
    } else if (!/\S+@\S+\.\S+/.test(invoiceData.clientEmail)) {
      newErrors.clientEmail = 'Please enter a valid email address';
    }

    if (!invoiceData.invoiceDate) {
      newErrors.invoiceDate = 'Invoice date is required';
    }

    if (!invoiceData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (new Date(invoiceData.dueDate) <= new Date(invoiceData.invoiceDate)) {
      newErrors.dueDate = 'Due date must be after invoice date';
    }

    // Validate items
    invoiceData.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = `Item ${index + 1} description is required`;
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = `Item ${index + 1} quantity must be greater than 0`;
      }
      if (item.unitPrice <= 0) {
        newErrors[`item_${index}_unitPrice`] = `Item ${index + 1} unit price must be greater than 0`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof InvoiceData, value: unknown) => {
    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: unknown) => {
    // Clear errors for this item field
    const errorKey = `item_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }

    const newItems = [...invoiceData.items];
    const currentItem = newItems[index];
    if (currentItem) {
      newItems[index] = { ...currentItem, [field]: value };
      setInvoiceData(prev => ({ ...prev, items: newItems }));
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 18,
      discount: 0
    };
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index: number) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const baseAmount = item.quantity * item.unitPrice;
    const itemDiscount = baseAmount * ((item.discount || 0) / 100);
    const discountedAmount = baseAmount - itemDiscount;
    const tax = discountedAmount * (item.taxRate / 100);
    return {
      baseAmount,
      itemDiscount,
      discountedAmount,
      tax,
      total: discountedAmount + tax
    };
  };

  const calculateInvoiceTotal = () => {
    let subtotal = 0;
    let totalItemDiscounts = 0;
    let totalTax = 0;

    invoiceData.items.forEach(item => {
      const itemCalc = calculateItemTotal(item);
      subtotal += itemCalc.baseAmount;
      totalItemDiscounts += itemCalc.itemDiscount;
      totalTax += itemCalc.tax;
    });

    const subtotalAfterItemDiscounts = subtotal - totalItemDiscounts;
    const generalDiscountAmount = subtotalAfterItemDiscounts * (invoiceData.generalDiscount / 100);
    const finalSubtotal = subtotalAfterItemDiscounts - generalDiscountAmount;
    const lateFeeAmount = finalSubtotal * (invoiceData.lateFee / 100);
    const grandTotal = finalSubtotal + totalTax + lateFeeAmount;

    return {
      subtotal,
      totalItemDiscounts,
      generalDiscountAmount,
      subtotalAfterDiscounts: finalSubtotal,
      totalTax,
      lateFeeAmount,
      total: grandTotal
    };
  };

  const generatePDF = async () => {
    if (!validateInvoice()) {
      alert('Please fix all errors before generating PDF');
      return;
    }
    import('@/lib/track').then(({ trackEvent }) =>
      trackEvent('tool_usage', 'invoice-generator')
    );

    try {
      // Simulate PDF generation with enhanced functionality
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a simplified PDF content as HTML and trigger download
      const pdfContent = generatePDFContent();
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceData.invoiceNumber}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      alert(`PDF generated successfully!\nInvoice: ${invoiceData.invoiceNumber}\nTotal: UGX ${totals.total.toLocaleString()}\n\nNote: In production, this would generate an actual PDF using libraries like jsPDF or Puppeteer.`);

    } catch {
      alert('Error generating PDF. Please try again.');
    }
  };

  const generatePDFContent = (): string => {
    const selectedAgency = agencyOptions.find(a => a.key === invoiceData.selectedAgency);
    const totals = calculateInvoiceTotal();

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice ${invoiceData.invoiceNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .client-info, .agency-info { width: 45%; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; }
        .totals { margin-top: 20px; text-align: right; }
        .total-row { font-weight: bold; font-size: 1.2em; }
        .notes { margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #333; }
    </style>
</head>
<body>
    <div class="header">
        <h1>INVOICE</h1>
        <h2>${invoiceData.invoiceNumber}</h2>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="invoice-details">
        <div class="agency-info">
            <h3>From:</h3>
            <p><strong>${selectedAgency?.name}</strong></p>
            <p>Government of Uganda</p>
            <p>Official Invoice</p>
        </div>
        <div class="client-info">
            <h3>To:</h3>
            <p><strong>${invoiceData.clientName}</strong></p>
            <p>${invoiceData.clientEmail}</p>
            <p>${invoiceData.clientPhone}</p>
            ${invoiceData.clientAddress ? `<p>${invoiceData.clientAddress}</p>` : ''}
            ${invoiceData.clientTin ? `<p>TIN: ${invoiceData.clientTin}</p>` : ''}
        </div>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <p><strong>Invoice Date:</strong> ${invoiceData.invoiceDate}</p>
        <p><strong>Due Date:</strong> ${invoiceData.dueDate}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Tax Rate</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${invoiceData.items.map(item => {
              const itemTotal = calculateItemTotal(item);
              return `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>UGX ${item.unitPrice.toLocaleString()}</td>
                    <td>${item.discount || 0}%</td>
                    <td>${item.taxRate}%</td>
                    <td>UGX ${itemTotal.total.toLocaleString()}</td>
                </tr>
              `;
            }).join('')}
        </tbody>
    </table>

    <div class="totals">
        <p>Subtotal: UGX ${totals.subtotal.toLocaleString()}</p>
        ${totals.totalItemDiscounts > 0 ? `<p>Item Discounts: -UGX ${totals.totalItemDiscounts.toLocaleString()}</p>` : ''}
        ${totals.generalDiscountAmount > 0 ? `<p>General Discount (${invoiceData.generalDiscount}%): -UGX ${totals.generalDiscountAmount.toLocaleString()}</p>` : ''}
        <p>Total Tax: UGX ${totals.totalTax.toLocaleString()}</p>
        ${totals.lateFeeAmount > 0 ? `<p>Late Fee (${invoiceData.lateFee}%): UGX ${totals.lateFeeAmount.toLocaleString()}</p>` : ''}
        <p class="total-row">TOTAL: UGX ${totals.total.toLocaleString()}</p>
    </div>

    ${invoiceData.notes ? `
    <div class="notes">
        <h4>Notes:</h4>
        <p>${invoiceData.notes}</p>
    </div>
    ` : ''}

    ${invoiceData.terms ? `
    <div class="notes">
        <h4>Terms & Conditions:</h4>
        <p>${invoiceData.terms}</p>
    </div>
    ` : ''}

    <div style="margin-top: 40px; text-align: center; color: #666; font-size: 0.9em;">
        <p>This is an official invoice generated by Uganda OneStopCentre</p>
        <p>For inquiries, please contact the issuing agency directly</p>
    </div>
</body>
</html>
    `.trim();
  };

  const totals = calculateInvoiceTotal();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-black min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-4 sm:mb-6 lg:mb-8"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-4">
          Professional Invoice Generator
        </h2>
        <p className="text-xl text-neutral-400">
          Create professional invoices for Uganda government services and business transactions.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Invoice Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-neutral-900 rounded-xl shadow-lg border border-yellow-900/30 p-6"
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-yellow-300 mb-6">
            Invoice Details
          </h3>

          <div className="space-y-6">
            {/* Invoice Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-yellow-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder:text-neutral-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                  Agency
                </label>
                <select
                  value={invoiceData.selectedAgency}
                  onChange={(e) => handleInputChange('selectedAgency', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-yellow-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {agencyOptions.map((agency) => (
                    <option key={agency.key} value={agency.key}>
                      {agency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceData.invoiceDate}
                  onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-yellow-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-yellow-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            {/* Client Information */}
            <div>
              <h4 className="text-lg font-semibold text-yellow-300 mb-4">Client Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={invoiceData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-yellow-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder:text-neutral-500"
                    placeholder="Enter client name"
                  />
                  {errors.clientName && (
                    <p className="text-red-400 text-sm mt-1">{errors.clientName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={invoiceData.clientEmail}
                      onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-yellow-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder:text-neutral-500"
                      placeholder="client@example.com"
                    />
                    {errors.clientEmail && (
                      <p className="text-red-400 text-sm mt-1">{errors.clientEmail}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={invoiceData.clientPhone}
                      onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-yellow-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder:text-neutral-500"
                      placeholder="+256 XXX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                    Address
                  </label>
                  <textarea
                    value={invoiceData.clientAddress}
                    onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-yellow-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder:text-neutral-500"
                    rows={3}
                    placeholder="Client address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                    TIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={invoiceData.clientTin}
                    onChange={(e) => handleInputChange('clientTin', e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-yellow-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder:text-neutral-500"
                    placeholder="Tax Identification Number"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-lg font-semibold text-yellow-300 mb-4">Services/Items</h4>
              <div className="space-y-4">
                {invoiceData.items.map((item, index) => (
                  <div key={item.id} className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-yellow-200">Item {index + 1}</h5>
                      {invoiceData.items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-yellow-200/80 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-yellow-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder:text-neutral-500"
                          placeholder="Service description"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-yellow-200/80 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-yellow-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-yellow-200/80 mb-1">
                            Unit Price
                          </label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-yellow-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-yellow-200/80 mb-1">
                            Tax %
                          </label>
                          <input
                            type="number"
                            value={item.taxRate}
                            onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-yellow-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-semibold text-yellow-300">
                          Total: UGX {calculateItemTotal(item).total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addItem}
                  className="w-full py-2 px-4 border border-dashed border-neutral-600 rounded-md text-neutral-400 hover:border-yellow-600 hover:text-yellow-400 hover:bg-yellow-900/10 active:scale-[0.98] transition-all duration-200"
                >
                  + Add Another Item
                </button>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                  Notes
                </label>
                <textarea
                  value={invoiceData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-yellow-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder:text-neutral-500"
                  rows={3}
                  placeholder="Additional notes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  value={invoiceData.terms}
                  onChange={(e) => handleInputChange('terms', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-yellow-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder:text-neutral-500"
                  rows={3}
                  placeholder="Payment terms and conditions"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex-1 bg-yellow-600 text-black py-3 px-6 rounded-lg font-semibold hover:bg-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20 active:scale-95 transition-all duration-200"
              >
                {showPreview ? 'Edit Invoice' : 'Preview Invoice'}
              </button>
              <button
                onClick={generatePDF}
                className="flex-1 bg-red-700 text-neutral-100 py-3 px-6 rounded-lg font-semibold hover:bg-red-600 hover:shadow-lg hover:shadow-red-900/30 active:scale-95 transition-all duration-200"
              >
                Generate PDF
              </button>
            </div>
          </div>
        </motion.div>

        {/* Invoice Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-neutral-900 rounded-xl shadow-lg border border-yellow-900/30 p-6"
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-yellow-400 mb-6">
            Invoice Preview
          </h3>

          <div className="bg-neutral-800 rounded-lg p-6 space-y-6">
            {/* Invoice Header */}
            <div className="text-center border-b border-neutral-600 pb-6">
              <h2 className="text-3xl font-bold text-yellow-400">INVOICE</h2>
              <p className="text-neutral-400">{invoiceData.invoiceNumber}</p>
            </div>

            {/* Agency & Client Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">From:</h4>
                <p className="text-yellow-200">
                  {agencyOptions.find(a => a.key === invoiceData.selectedAgency)?.name}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">To:</h4>
                <div className="text-yellow-200">
                  <p>{invoiceData.clientName}</p>
                  <p>{invoiceData.clientEmail}</p>
                  <p>{invoiceData.clientPhone}</p>
                  {invoiceData.clientAddress && <p className="text-sm">{invoiceData.clientAddress}</p>}
                  {invoiceData.clientTin && <p className="text-sm">TIN: {invoiceData.clientTin}</p>}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span className="font-medium text-neutral-400">Invoice Date:</span> <span className="text-yellow-200">{invoiceData.invoiceDate}</span>
              </div>
              <div>
                <span className="font-medium text-neutral-400">Due Date:</span> <span className="text-yellow-200">{invoiceData.dueDate}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-600">
                    <th className="text-left py-2 text-yellow-300">Description</th>
                    <th className="text-right py-2 text-yellow-300">Qty</th>
                    <th className="text-right py-2 text-yellow-300">Price</th>
                    <th className="text-right py-2 text-yellow-300">Tax</th>
                    <th className="text-right py-2 text-yellow-300">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item) => (
                    <tr key={item.id} className="border-b border-neutral-700">
                      <td className="py-2 text-neutral-300">{item.description}</td>
                      <td className="text-right py-2 text-neutral-300">{item.quantity}</td>
                      <td className="text-right py-2 text-neutral-300">UGX {item.unitPrice.toLocaleString()}</td>
                      <td className="text-right py-2 text-neutral-300">{item.taxRate}%</td>
                      <td className="text-right py-2 text-neutral-300">UGX {calculateItemTotal(item).total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-neutral-600 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-neutral-400">Subtotal:</span>
                <span className="text-yellow-200">UGX {totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-neutral-400">Total Tax:</span>
                <span className="text-yellow-200">UGX {totals.totalTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-neutral-600 pt-2">
                <span className="text-neutral-400">Total:</span>
                <span className="text-yellow-400">UGX {totals.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Notes and Terms */}
            {invoiceData.notes && (
              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">Notes:</h4>
                <p className="text-neutral-400 text-sm">{invoiceData.notes}</p>
              </div>
            )}

            {invoiceData.terms && (
              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">Terms & Conditions:</h4>
                <p className="text-neutral-400 text-sm">{invoiceData.terms}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
