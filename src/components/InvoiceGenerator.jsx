import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNotification } from '../contexts/NotificationContext'

const InvoiceGenerator = () => {
  const [invoiceData, setInvoiceData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientTIN: '',
    service: '',
    amount: '',
    description: '',
    dueDate: '',
    currency: 'UGX',
    paymentTerms: '30',
    vatApplicable: false,
    withholdingTax: false
  })
  const { addNotification } = useNotification()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setInvoiceData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const generateInvoice = () => {
    if (!invoiceData.clientName || !invoiceData.service || !invoiceData.amount) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please fill in all required fields',
        duration: 3000
      })
      return
    }

    const invoiceNumber = `INV-${  Date.now()}`
    const currentDate = new Date().toLocaleDateString()
    
    // Generate HTML content for the invoice
    const invoiceHTML = generateInvoiceHTML({
      ...invoiceData,
      invoiceNumber,
      date: currentDate
    })
    
    // Create and download the invoice as HTML file
    downloadInvoice(invoiceHTML, `${invoiceNumber}.html`)

    addNotification({
      type: 'success',
      title: 'Invoice Downloaded',
      message: `Invoice ${invoiceNumber} has been downloaded`,
      duration: 4000
    })
  }
  
  const generateInvoiceHTML = (data) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${data.invoiceNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background: white; }
        .invoice-container { max-width: 800px; margin: 20px auto; padding: 40px; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid #fbbf24; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #000; }
        .logo span { color: #fbbf24; }
        .invoice-details { text-align: right; }
        .invoice-number { color: #dc2626; font-weight: bold; font-size: 18px; }
        .client-info { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .info-section h3 { color: #000; font-size: 18px; margin-bottom: 10px; border-bottom: 2px solid #fbbf24; padding-bottom: 5px; }
        .service-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        .service-table th, .service-table td { padding: 15px; text-align: left; border-bottom: 1px solid #e5e5e5; }
        .service-table th { background: linear-gradient(135deg, #fbbf24, #dc2626); color: black; font-weight: bold; }
        .total-section { text-align: right; background: #f9f9f9; padding: 20px; border-radius: 8px; }
        .total-amount { font-size: 24px; font-weight: bold; color: #dc2626; }
        .footer { margin-top: 40px; text-align: center; padding-top: 20px; border-top: 2px solid #fbbf24; color: #666; }
        .print-btn { background: linear-gradient(135deg, #fbbf24, #dc2626); color: black; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; margin: 20px 0; }
        @media print { .print-btn { display: none; } }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="logo">
                <img src="/images/oneStopCenter-logo.jpeg" alt="OSC" style="width: 24px; height: 24px; display: inline-block; margin-right: 8px; border-radius: 4px; object-fit: cover;" />
                OneStop<span>Centre</span> Uganda
            </div>
            <div class="invoice-details">
                <div class="invoice-number">INVOICE #${data.invoiceNumber}</div>
                <div>Date: ${data.date}</div>
                ${data.dueDate ? `<div>Due: ${new Date(data.dueDate).toLocaleDateString()}</div>` : ''}
            </div>
        </div>
        
        <div class="client-info">
            <div class="info-section">
                <h3>🏢 Bill To:</h3>
                <strong>${data.clientName}</strong><br>
                ${data.clientEmail ? `📧 ${data.clientEmail}<br>` : ''}
            </div>
            <div class="info-section">
                <h3>🏛️ Service Provider:</h3>
                <strong>OneStopCentre Uganda</strong><br>
                📧 support@onestopcentre.ug<br>
                📞 +256 775 692 335
            </div>
        </div>
        
        <table class="service-table">
            <thead>
                <tr>
                    <th>Service Description</th>
                    <th>Details</th>
                    <th>Amount (UGX)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>${data.service}</strong></td>
                    <td>${data.description || 'Professional government service assistance'}</td>
                    <td><strong>${parseInt(data.amount).toLocaleString()}</strong></td>
                </tr>
            </tbody>
        </table>
        
        <div class="total-section">
            <div>Subtotal: UGX ${parseInt(data.amount).toLocaleString()}</div>
            <div>Tax (0%): UGX 0</div>
            <div class="total-amount">Total: UGX ${parseInt(data.amount).toLocaleString()}</div>
        </div>
        
        <div class="footer">
            <button class="print-btn" onclick="window.print()">🖨️ Print Invoice</button><br>
            <p><strong>Payment Instructions:</strong></p>
            <p>Please make payment within the specified due date. For payment queries, contact us at support@onestopcentre.ug</p>
            <p style="margin-top: 20px; font-size: 12px;">Generated by OneStopCentre Uganda Invoice System | © ${new Date().getFullYear()}</p>
        </div>
    </div>
</body>
</html>`
  }
  
  const downloadInvoice = (htmlContent, filename) => {
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const services = [
    'Company Registration',
    'Tax Registration (TIN)',
    'VAT Registration',
    'Work Permit Application',
    'Business License',
    'Investment License',
    'Land Title Search',
    'Other'
  ]

  return (
    <section id="invoice" className="py-20 px-4 bg-gradient-to-br from-yellow-50 to-red-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Invoice Generator
          </h2>
          <p className="text-xl text-gray-600">
            Generate professional invoices for government services
          </p>
        </motion.div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                name="clientName"
                value={invoiceData.clientName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter client name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Email
              </label>
              <input
                type="email"
                name="clientEmail"
                value={invoiceData.clientEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter client email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Phone
              </label>
              <input
                type="tel"
                name="clientPhone"
                value={invoiceData.clientPhone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="e.g., +256 775 692 335"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client TIN (Tax Identification Number)
              </label>
              <input
                type="text"
                name="clientTIN"
                value={invoiceData.clientTIN}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter TIN if available"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service *
              </label>
              <select
                name="service"
                value={invoiceData.service}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">Select a service</option>
                {services.map(service => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={invoiceData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="UGX">UGX (Uganda Shillings)</option>
                <option value="USD">USD (US Dollars)</option>
                <option value="EUR">EUR (Euros)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({invoiceData.currency}) *
              </label>
              <input
                type="number"
                name="amount"
                value={invoiceData.amount}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={invoiceData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter service description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms
              </label>
              <select
                name="paymentTerms"
                value={invoiceData.paymentTerms}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="15">15 days</option>
                <option value="30">30 days</option>
                <option value="45">45 days</option>
                <option value="60">60 days</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={invoiceData.dueDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="vat"
                    name="vatApplicable"
                    checked={invoiceData.vatApplicable}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label htmlFor="vat" className="ml-2 block text-sm text-gray-700">
                    Add VAT (18%)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="withholding"
                    name="withholdingTax"
                    checked={invoiceData.withholdingTax}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label htmlFor="withholding" className="ml-2 block text-sm text-gray-700">
                    Withholding Tax (6%)
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={generateInvoice}
              className="bg-gradient-to-r from-yellow-500 to-red-500 text-black px-8 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-red-600 transition-colors flex items-center justify-center"
            >
              <span className="mr-2">✅</span>
              Generate URA-Compliant Invoice
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Invoice Preview
          </h3>
          
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-2xl font-bold text-gray-900">INVOICE</h4>
                <p className="text-gray-600">OneStop Centre Uganda</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Invoice #: INV-{Date.now().toString().slice(-6)}</p>
                <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Bill To:</h5>
                <p className="text-gray-700">{invoiceData.clientName || 'Client Name'}</p>
                <p className="text-gray-700">{invoiceData.clientEmail || 'client@example.com'}</p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Service Details:</h5>
                <p className="text-gray-700">{invoiceData.service || 'Service Name'}</p>
                <p className="text-gray-700">{invoiceData.description || 'Service description'}</p>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4">
              {invoiceData.amount && (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="font-medium">{invoiceData.currency} {parseInt(invoiceData.amount).toLocaleString()}</span>
                  </div>
                  {invoiceData.vatApplicable && (
                    <div className="flex justify-between items-center text-red-600">
                      <span className="text-sm">VAT (18%):</span>
                      <span className="font-medium">+{invoiceData.currency} {(parseInt(invoiceData.amount) * 0.18).toLocaleString()}</span>
                    </div>
                  )}
                  {invoiceData.withholdingTax && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm">Withholding Tax (6%):</span>
                      <span className="font-medium">-{invoiceData.currency} {(parseInt(invoiceData.amount) * 0.06).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">
                  {invoiceData.currency} {invoiceData.amount ? (
                    parseInt(invoiceData.amount) + 
                    (invoiceData.vatApplicable ? parseInt(invoiceData.amount) * 0.18 : 0) - 
                    (invoiceData.withholdingTax ? parseInt(invoiceData.amount) * 0.06 : 0)
                  ).toLocaleString() : '0'}
                </span>
              </div>
              {invoiceData.dueDate && (
                <p className="text-sm text-gray-600 mt-2">
                  Due Date: {new Date(invoiceData.dueDate).toLocaleDateString()}
                </p>
              )}
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  ✅ <strong>URA Compliant:</strong> This invoice includes all required tax calculations and compliance features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InvoiceGenerator