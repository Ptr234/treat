// Professional Invoice Generator - Advanced, Comprehensive Solution
import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '../contexts/NotificationContext'
import { getContactInfo } from '../data/contactDatabase'
import { networkErrorHandler } from '../utils/networkErrorHandler'
import LazyImage from './LazyImage'

const ProfessionalInvoiceGenerator = ({ isOpen = true, onClose = () => {} }) => {
  const { addNotification } = useNotification()
  
  // Invoice state
  const [invoiceData, setInvoiceData] = useState({
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
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
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
    currency: 'UGX',
    exchangeRate: 1
  })

  // Agency options with logos
  const agencyOptions = useMemo(() => [
    { key: 'UIA', name: 'Uganda Investment Authority' },
    { key: 'URA', name: 'Uganda Revenue Authority' },
    { key: 'URSB', name: 'Uganda Registration Services Bureau' },
    { key: 'UTB', name: 'Uganda Tourism Board' },
    { key: 'BOU', name: 'Bank of Uganda' },
    { key: 'KCCA', name: 'Kampala Capital City Authority' },
    { key: 'NEMA', name: 'National Environment Management Authority' },
    { key: 'MAAIF', name: 'Ministry of Agriculture' },
    { key: 'MEMD', name: 'Ministry of Energy and Mineral Development' },
    { key: 'MTIC', name: 'Ministry of Trade, Industry and Cooperatives' },
    { key: 'NITA', name: 'National Information Technology Authority' },
    { key: 'UCC', name: 'Uganda Communications Commission' },
    { key: 'UNEB', name: 'Uganda National Examinations Board' },
    { key: 'UHEB', name: 'Uganda Higher Education Board' },
    { key: 'CIVIL_AVIATION', name: 'Civil Aviation Authority' },
    { key: 'DRUG_AUTHORITY', name: 'National Drug Authority' },
    { key: 'PAU', name: 'Patents and Trademarks Office' },
    { key: 'UMR', name: 'Uganda Manufacturers Association' }
  ], [])

  // Get current agency info
  const currentAgency = useMemo(() => getContactInfo(invoiceData.selectedAgency), [invoiceData.selectedAgency])

  // Service options based on agency
  const serviceOptions = useMemo(() => {
    const services = {
      'UIA': [
        { description: 'Investment License Application', price: 500000 },
        { description: 'Investment Consultation Service', price: 300000 },
        { description: 'Investment Promotion Package', price: 750000 },
        { description: 'Investment Aftercare Service', price: 400000 }
      ],
      'URA': [
        { description: 'Tax Registration (TIN)', price: 0 },
        { description: 'VAT Registration', price: 0 },
        { description: 'Tax Compliance Certificate', price: 50000 },
        { description: 'Tax Clearance Certificate', price: 100000 }
      ],
      'URSB': [
        { description: 'Company Registration', price: 105000 },
        { description: 'Business Name Registration', price: 50000 },
        { description: 'Annual Return Filing', price: 75000 },
        { description: 'Certificate Amendment', price: 150000 }
      ],
      'UTB': [
        { description: 'Tourism License', price: 200000 },
        { description: 'Tourism Promotion Service', price: 400000 },
        { description: 'Tourism Certification', price: 150000 },
        { description: 'Tourism Marketing Package', price: 600000 }
      ],
      'default': [
        { description: 'Consultation Service', price: 200000 },
        { description: 'Processing Fee', price: 100000 },
        { description: 'Certificate Fee', price: 150000 },
        { description: 'Administrative Fee', price: 50000 }
      ]
    }
    return services[invoiceData.selectedAgency] || services['default']
  }, [invoiceData.selectedAgency])

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = invoiceData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    )
    const totalTax = invoiceData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0
    )
    const total = subtotal + totalTax

    return {
      subtotal,
      totalTax,
      total,
      subtotalFormatted: new Intl.NumberFormat('en-UG').format(subtotal),
      totalTaxFormatted: new Intl.NumberFormat('en-UG').format(totalTax),
      totalFormatted: new Intl.NumberFormat('en-UG').format(total)
    }
  }, [invoiceData.items])

  // Update invoice data
  const updateInvoiceData = useCallback((field, value) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Add new item
  const addItem = useCallback(() => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 18
    }
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }, [])

  // Update item
  const updateItem = useCallback((id, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }, [])

  // Remove item
  const removeItem = useCallback((id) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }, [])

  // Add predefined service
  const addPredefinedService = useCallback((service) => {
    const newItem = {
      id: Date.now(),
      description: service.description,
      quantity: 1,
      unitPrice: service.price,
      taxRate: 18
    }
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
    addNotification({
      type: 'success',
      title: 'Service Added',
      message: `${service.description} added to invoice`,
      duration: 3000
    })
  }, [addNotification])

  // Generate and download invoice
  const generateInvoice = useCallback(async () => {
    const operation = async () => {
      // Validate required fields
      if (!invoiceData.clientName.trim()) {
        addNotification({
          type: 'error',
          title: 'Validation Error',
          message: 'Client name is required',
          duration: 5000
        })
        return
      }

      if (invoiceData.items.length === 0) {
        addNotification({
          type: 'error',
          title: 'Validation Error', 
          message: 'At least one item is required',
          duration: 5000
        })
        return
      }

      const invoiceHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoiceData.invoiceNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: white; }
        .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid #FFD700; padding-bottom: 20px; }
        .logo-section { display: flex; align-items: center; gap: 15px; }
        .logo { width: 80px; height: 80px; object-fit: contain; }
        .agency-info h1 { color: #000; font-size: 1.8rem; margin-bottom: 5px; }
        .agency-info p { color: #666; font-size: 0.9rem; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { color: #DC2626; font-size: 2rem; margin-bottom: 10px; }
        .invoice-number { background: #FFD700; color: #000; padding: 8px 15px; border-radius: 5px; font-weight: bold; }
        
        .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .bill-to, .invoice-info { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .bill-to h3, .invoice-info h3 { color: #000; margin-bottom: 15px; border-bottom: 2px solid #FFD700; padding-bottom: 5px; }
        
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .items-table th { background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; padding: 15px; text-align: left; font-weight: bold; }
        .items-table td { padding: 12px 15px; border-bottom: 1px solid #eee; }
        .items-table tr:nth-child(even) { background: #f8f9fa; }
        .items-table tr:hover { background: #fff3cd; }
        
        .totals { max-width: 400px; margin-left: auto; background: #fff; border: 2px solid #FFD700; border-radius: 8px; overflow: hidden; }
        .totals-row { display: flex; justify-content: space-between; padding: 12px 20px; }
        .totals-row:not(:last-child) { border-bottom: 1px solid #eee; }
        .totals-row.total { background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; font-weight: bold; font-size: 1.1rem; }
        
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; }
        .footer-section { margin-bottom: 20px; }
        .footer-section h4 { color: #000; margin-bottom: 10px; }
        .footer-section p { color: #666; font-size: 0.9rem; }
        
        .contact-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .contact-info h4 { color: #DC2626; margin-bottom: 10px; }
        .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        
        @media print { 
            body { -webkit-print-color-adjust: exact; } 
            .invoice-container { max-width: none; margin: 0; padding: 15px; }
        }
        
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); 
                    font-size: 6rem; color: rgba(255, 215, 0, 0.1); z-index: -1; font-weight: bold; 
                    pointer-events: none; user-select: none; }
    </style>
</head>
<body>
    <div class="watermark">UGANDA INVESTMENT</div>
    <div class="invoice-container">
        <div class="header">
            <div class="logo-section">
                <img src="${currentAgency.logo}" alt="${currentAgency.agency}" class="logo" onerror="this.src='/images/uganda-coat-of-arms.png'">
                <div class="agency-info">
                    <h1>${currentAgency.agency}</h1>
                    <p>Official Government Service Provider</p>
                    <p><strong>Republic of Uganda</strong></p>
                </div>
            </div>
            <div class="invoice-title">
                <h2>OFFICIAL INVOICE</h2>
                <div class="invoice-number">#${invoiceData.invoiceNumber}</div>
            </div>
        </div>

        <div class="invoice-details">
            <div class="bill-to">
                <h3>📋 BILL TO</h3>
                <p><strong>${invoiceData.clientName || 'Client Name'}</strong></p>
                <p>📧 ${invoiceData.clientEmail || 'client@email.com'}</p>
                <p>📞 ${invoiceData.clientPhone || '+256 XXX XXX XXX'}</p>
                <p>📍 ${invoiceData.clientAddress || 'Client Address'}</p>
                ${invoiceData.clientTin ? `<p><strong>TIN:</strong> ${invoiceData.clientTin}</p>` : ''}
            </div>
            <div class="invoice-info">
                <h3>🗓️ INVOICE DETAILS</h3>
                <p><strong>Invoice Date:</strong> ${new Date(invoiceData.invoiceDate).toLocaleDateString('en-GB')}</p>
                <p><strong>Due Date:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString('en-GB')}</p>
                <p><strong>Currency:</strong> ${invoiceData.currency}</p>
                <p><strong>Payment Terms:</strong> Net 30 Days</p>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 50%">📋 DESCRIPTION</th>
                    <th style="width: 10%">QTY</th>
                    <th style="width: 15%">UNIT PRICE</th>
                    <th style="width: 10%">TAX %</th>
                    <th style="width: 15%">TOTAL</th>
                </tr>
            </thead>
            <tbody>
                ${invoiceData.items.map(item => `
                    <tr>
                        <td><strong>${item.description}</strong></td>
                        <td>${item.quantity}</td>
                        <td>${invoiceData.currency} ${new Intl.NumberFormat('en-UG').format(item.unitPrice)}</td>
                        <td>${item.taxRate}%</td>
                        <td><strong>${invoiceData.currency} ${new Intl.NumberFormat('en-UG').format(item.quantity * item.unitPrice)}</strong></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row">
                <span>Subtotal:</span>
                <span><strong>${invoiceData.currency} ${totals.subtotalFormatted}</strong></span>
            </div>
            <div class="totals-row">
                <span>Total Tax (VAT):</span>
                <span><strong>${invoiceData.currency} ${totals.totalTaxFormatted}</strong></span>
            </div>
            <div class="totals-row total">
                <span>TOTAL AMOUNT:</span>
                <span><strong>${invoiceData.currency} ${totals.totalFormatted}</strong></span>
            </div>
        </div>

        <div class="footer">
            ${invoiceData.notes ? `
            <div class="footer-section">
                <h4>📝 NOTES</h4>
                <p>${invoiceData.notes}</p>
            </div>` : ''}
            
            <div class="footer-section">
                <h4>📋 TERMS & CONDITIONS</h4>
                <p>${invoiceData.terms}</p>
            </div>

            <div class="contact-info">
                <h4>📞 AGENCY CONTACT INFORMATION</h4>
                <div class="contact-grid">
                    <p><strong>📧 Email:</strong> ${currentAgency.email}</p>
                    <p><strong>📞 Phone:</strong> ${currentAgency.phone}</p>
                    <p><strong>🌐 Website:</strong> ${currentAgency.website}</p>
                    <p><strong>📍 Address:</strong> ${currentAgency.address}</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`

      // Create and download
      const blob = new Blob([invoiceHTML], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Invoice_${invoiceData.invoiceNumber}_${currentAgency.agency.replace(/\s+/g, '_')}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      addNotification({
        type: 'success',
        title: 'Invoice Generated Successfully',
        message: `Professional invoice ${invoiceData.invoiceNumber} downloaded`,
        duration: 5000
      })
    }

    // Use network error handler for comprehensive error handling
    const result = await networkErrorHandler.safeExecute(operation, null, 'generating invoice')
    
    if (!result.success) {
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: result.error || 'Failed to generate invoice. Please try again.',
        duration: 5000
      })
    }
  }, [invoiceData, currentAgency, totals, addNotification])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-red-500 text-black p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Professional Invoice Generator</h2>
                  <p className="opacity-90">Generate official invoices for Uganda government services</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Agency Selection */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <LazyImage
                  src={currentAgency.logo}
                  alt={currentAgency.agency}
                  className="w-8 h-8 object-contain mr-3"
                  fallbackSrc="/images/uganda-coat-of-arms.png"
                />
                Select Government Agency
              </h3>
              <select
                value={invoiceData.selectedAgency}
                onChange={(e) => updateInvoiceData('selectedAgency', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                {agencyOptions.map(agency => (
                  <option key={agency.key} value={agency.key}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Client Information</h3>
                <input
                  type="text"
                  placeholder="Client Name"
                  value={invoiceData.clientName}
                  onChange={(e) => updateInvoiceData('clientName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Client Email"
                  value={invoiceData.clientEmail}
                  onChange={(e) => updateInvoiceData('clientEmail', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <input
                  type="tel"
                  placeholder="Client Phone"
                  value={invoiceData.clientPhone}
                  onChange={(e) => updateInvoiceData('clientPhone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Client Address"
                  value={invoiceData.clientAddress}
                  onChange={(e) => updateInvoiceData('clientAddress', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Client TIN (Optional)"
                  value={invoiceData.clientTin}
                  onChange={(e) => updateInvoiceData('clientTin', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Invoice Details</h3>
                <input
                  type="text"
                  placeholder="Invoice Number"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => updateInvoiceData('invoiceNumber', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={invoiceData.invoiceDate}
                  onChange={(e) => updateInvoiceData('invoiceDate', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => updateInvoiceData('dueDate', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <select
                  value={invoiceData.currency}
                  onChange={(e) => updateInvoiceData('currency', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="UGX">Ugandan Shilling (UGX)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
            </div>

            {/* Quick Add Services */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Add Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {serviceOptions.map((service, index) => (
                  <button
                    key={index}
                    onClick={() => addPredefinedService(service)}
                    className="p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                  >
                    <div className="font-medium text-sm">{service.description}</div>
                    <div className="text-green-600 font-semibold">{invoiceData.currency} {new Intl.NumberFormat('en-UG').format(service.price)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Invoice Items</h3>
                <button
                  onClick={addItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-3">
                {invoiceData.items.map((item) => (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="md:col-span-2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Tax %"
                      value={item.taxRate}
                      onChange={(e) => updateItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-green-600">
                        {invoiceData.currency} {new Intl.NumberFormat('en-UG').format(item.quantity * item.unitPrice)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gradient-to-r from-yellow-50 to-red-50 rounded-xl p-6">
              <div className="max-w-md ml-auto space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">{invoiceData.currency} {totals.subtotalFormatted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Tax:</span>
                  <span className="font-semibold">{invoiceData.currency} {totals.totalTaxFormatted}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold border-t pt-3">
                  <span>Total:</span>
                  <span className="text-green-600">{invoiceData.currency} {totals.totalFormatted}</span>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={invoiceData.notes}
                  onChange={(e) => updateInvoiceData('notes', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Terms & Conditions</label>
                <textarea
                  value={invoiceData.terms}
                  onChange={(e) => updateInvoiceData('terms', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={4}
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateInvoice}
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-red-500 text-black font-semibold rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Generate Professional Invoice</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProfessionalInvoiceGenerator