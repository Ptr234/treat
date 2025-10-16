'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
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
        taxRate: 18
      }
    ],
    
    // Additional Details
    notes: 'Thank you for choosing Uganda Investment Authority services.',
    terms: 'Payment is due within 30 days of invoice date. Late payments may incur additional charges.',
    
    // Currency
    currency: 'UGX'
  });

  const [showPreview, setShowPreview] = useState(false);

  const agencyOptions = [
    { key: 'UIA', name: 'Uganda Investment Authority' },
    { key: 'URA', name: 'Uganda Revenue Authority' },
    { key: 'URSB', name: 'Uganda Registration Services Bureau' },
    { key: 'UTB', name: 'Uganda Tourism Board' },
    { key: 'BOU', name: 'Bank of Uganda' },
    { key: 'KCCA', name: 'Kampala Capital City Authority' },
    { key: 'NEMA', name: 'National Environment Management Authority' }
  ];

  // Removed unused serviceOptions

  const handleInputChange = (field: keyof InvoiceData, value: unknown) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: unknown) => {
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
      taxRate: 18
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
    const subtotal = item.quantity * item.unitPrice;
    const tax = subtotal * (item.taxRate / 100);
    return subtotal + tax;
  };

  const calculateInvoiceTotal = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalTax = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
    return { subtotal, totalTax, total: subtotal + totalTax };
  };

  const generatePDF = () => {
    // In a real implementation, you would use a PDF library like jsPDF or react-pdf
    alert('PDF generation would be implemented here using a library like jsPDF');
  };

  const totals = calculateInvoiceTotal();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Professional Invoice Generator
        </h2>
        <p className="text-xl text-gray-600">
          Create professional invoices for Uganda government services and business transactions.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Invoice Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Invoice Details
          </h3>

          <div className="space-y-6">
            {/* Invoice Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agency
                </label>
                <select
                  value={invoiceData.selectedAgency}
                  onChange={(e) => handleInputChange('selectedAgency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {agencyOptions.map((agency) => (
                    <option key={agency.key} value={agency.key}>
                      {agency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceData.invoiceDate}
                  onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Client Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={invoiceData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter client name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={invoiceData.clientEmail}
                      onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="client@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={invoiceData.clientPhone}
                      onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+256 XXX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={invoiceData.clientAddress}
                    onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Client address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={invoiceData.clientTin}
                    onChange={(e) => handleInputChange('clientTin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tax Identification Number"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Services/Items</h4>
              <div className="space-y-4">
                {invoiceData.items.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-gray-900">Item {index + 1}</h5>
                      {invoiceData.items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Service description"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Price
                          </label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tax %
                          </label>
                          <input
                            type="number"
                            value={item.taxRate}
                            onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-lg font-semibold text-gray-900">
                          Total: UGX {calculateItemTotal(item).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addItem}
                  className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-700 hover:border-gray-400 transition-colors"
                >
                  + Add Another Item
                </button>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={invoiceData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Additional notes"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  value={invoiceData.terms}
                  onChange={(e) => handleInputChange('terms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Payment terms and conditions"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {showPreview ? 'Edit Invoice' : 'Preview Invoice'}
              </button>
              <button
                onClick={generatePDF}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
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
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Invoice Preview
          </h3>

          <div className="bg-gray-50 rounded-lg p-6 space-y-6">
            {/* Invoice Header */}
            <div className="text-center border-b border-gray-200 pb-6">
              <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
              <p className="text-gray-600">{invoiceData.invoiceNumber}</p>
            </div>

            {/* Agency & Client Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">From:</h4>
                <p className="text-gray-700">
                  {agencyOptions.find(a => a.key === invoiceData.selectedAgency)?.name}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">To:</h4>
                <div className="text-gray-700">
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
                <span className="font-medium">Invoice Date:</span> {invoiceData.invoiceDate}
              </div>
              <div>
                <span className="font-medium">Due Date:</span> {invoiceData.dueDate}
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Tax</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-2">{item.description}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">UGX {item.unitPrice.toLocaleString()}</td>
                      <td className="text-right py-2">{item.taxRate}%</td>
                      <td className="text-right py-2">UGX {calculateItemTotal(item).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-300 pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>UGX {totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Total Tax:</span>
                <span>UGX {totals.totalTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                <span>Total:</span>
                <span>UGX {totals.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Notes and Terms */}
            {invoiceData.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                <p className="text-gray-700 text-sm">{invoiceData.notes}</p>
              </div>
            )}

            {invoiceData.terms && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h4>
                <p className="text-gray-700 text-sm">{invoiceData.terms}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}