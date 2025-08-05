// Production-Ready Data Validation and Sanitization System
// Comprehensive validation for Uganda-specific business requirements

export class DataValidator {
  constructor() {
    this.validationRules = new Map()
    this.customValidators = new Map()
    this.errorMessages = new Map()
    this.initializeDefaultRules()
  }

  initializeDefaultRules() {
    // Uganda-specific validation rules
    this.addRule('ugandaTIN', {
      pattern: /^\d{10}$/,
      message: 'Uganda TIN must be exactly 10 digits',
      sanitizer: (value) => value.replace(/\D/g, '')
    })

    this.addRule('ugandaPhone', {
      pattern: /^(\+256|0)[0-9]{9}$/,
      message: 'Invalid Uganda phone number format (+256XXXXXXXXX or 0XXXXXXXXX)',
      sanitizer: (value) => value.replace(/[\s-]/g, '')
    })

    this.addRule('businessName', {
      pattern: /^[a-zA-Z0-9\s-&.()]{2,100}$/,
      message: 'Business name must be 2-100 characters, letters, numbers, and common business symbols only',
      sanitizer: (value) => value.trim().replace(/\s+/g, ' ')
    })

    this.addRule('email', {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email format',
      sanitizer: (value) => value.trim().toLowerCase()
    })

    this.addRule('amount', {
      validator: (value) => {
        const num = parseFloat(value)
        return !isNaN(num) && num >= 0 && num <= 999999999999
      },
      message: 'Amount must be a positive number under 1 trillion UGX',
      sanitizer: (value) => parseFloat(value.toString().replace(/[,\s]/g, ''))
    })

    this.addRule('percentage', {
      validator: (value) => {
        const num = parseFloat(value)
        return !isNaN(num) && num >= 0 && num <= 100
      },
      message: 'Percentage must be between 0 and 100',
      sanitizer: (value) => parseFloat(value)
    })

    this.addRule('postalAddress', {
      pattern: /^[a-zA-Z0-9\s-,.]{5,200}$/,
      message: 'Postal address must be 5-200 characters',
      sanitizer: (value) => value.trim().replace(/\s+/g, ' ')
    })

    this.addRule('companyRegistrationNumber', {
      pattern: /^[A-Z0-9-]{5,20}$/,
      message: 'Invalid company registration number format',
      sanitizer: (value) => value.toUpperCase().trim()
    })

    this.addRule('vatNumber', {
      pattern: /^\d{10}$/,
      message: 'VAT number must be 10 digits',
      sanitizer: (value) => value.replace(/\D/g, '')
    })

    // Date validations
    this.addRule('futureDate', {
      validator: (value) => {
        const date = new Date(value)
        return date > new Date()
      },
      message: 'Date must be in the future',
      sanitizer: (value) => new Date(value).toISOString().split('T')[0]
    })

    this.addRule('pastDate', {
      validator: (value) => {
        const date = new Date(value)
        return date < new Date()
      },
      message: 'Date must be in the past',
      sanitizer: (value) => new Date(value).toISOString().split('T')[0]
    })

    // eslint-disable-next-line no-console
    console.log('📋 Data validation system initialized with Uganda-specific rules')
  }

  addRule(name, rule) {
    this.validationRules.set(name, rule)
  }

  addCustomValidator(name, validator) {
    this.customValidators.set(name, validator)
  }

  // Main validation method
  validate(data, schema) {
    const results = {
      isValid: true,
      errors: {},
      sanitizedData: {},
      warnings: []
    }

    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const value = data[fieldName]
      const fieldResult = this.validateField(fieldName, value, fieldSchema)
      
      if (!fieldResult.isValid) {
        results.isValid = false
        results.errors[fieldName] = fieldResult.errors
      }

      if (fieldResult.warnings.length > 0) {
        results.warnings.push(...fieldResult.warnings)
      }

      results.sanitizedData[fieldName] = fieldResult.sanitizedValue
    }

    return results
  }

  validateField(fieldName, value, schema) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedValue: value
    }

    // Handle empty values
    if (this.isEmpty(value)) {
      if (schema.required) {
        result.isValid = false
        result.errors.push(`${fieldName} is required`)
      }
      return result
    }

    // Sanitize first
    if (schema.sanitizer) {
      result.sanitizedValue = schema.sanitizer(value)
    } else if (schema.rule && this.validationRules.has(schema.rule)) {
      const rule = this.validationRules.get(schema.rule)
      if (rule.sanitizer) {
        result.sanitizedValue = rule.sanitizer(value)
      }
    }

    // Apply validation rules
    if (schema.rule) {
      const ruleResult = this.applyRule(schema.rule, result.sanitizedValue)
      if (!ruleResult.isValid) {
        result.isValid = false
        result.errors.push(ruleResult.message)
      }
    }

    // Apply custom validator
    if (schema.validator) {
      const customResult = schema.validator(result.sanitizedValue)
      if (!customResult) {
        result.isValid = false
        result.errors.push(schema.message || `Invalid ${fieldName}`)
      }
    }

    // Length validation
    if (schema.minLength && result.sanitizedValue.length < schema.minLength) {
      result.isValid = false
      result.errors.push(`${fieldName} must be at least ${schema.minLength} characters`)
    }

    if (schema.maxLength && result.sanitizedValue.length > schema.maxLength) {
      result.isValid = false
      result.errors.push(`${fieldName} must be no more than ${schema.maxLength} characters`)
    }

    // Range validation for numbers
    if (schema.min !== undefined && parseFloat(result.sanitizedValue) < schema.min) {
      result.isValid = false
      result.errors.push(`${fieldName} must be at least ${schema.min}`)
    }

    if (schema.max !== undefined && parseFloat(result.sanitizedValue) > schema.max) {
      result.isValid = false
      result.errors.push(`${fieldName} must be no more than ${schema.max}`)
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(result.sanitizedValue)) {
      result.isValid = false
      result.errors.push(`${fieldName} must be one of: ${schema.enum.join(', ')}`)
    }

    // Security checks
    if (this.containsSuspiciousContent(result.sanitizedValue)) {
      result.isValid = false
      result.errors.push(`${fieldName} contains suspicious content`)
      this.logSecurityViolation(fieldName, result.sanitizedValue)
    }

    return result
  }

  applyRule(ruleName, value) {
    const rule = this.validationRules.get(ruleName)
    if (!rule) {
      return { isValid: false, message: `Unknown validation rule: ${ruleName}` }
    }

    let isValid = true
    
    if (rule.pattern) {
      isValid = rule.pattern.test(value.toString())
    } else if (rule.validator) {
      isValid = rule.validator(value)
    }

    return {
      isValid,
      message: rule.message || `Validation failed for rule: ${ruleName}`
    }
  }

  // Specialized validation methods for common Uganda business scenarios
  validateBusinessRegistration(data) {
    const schema = {
      businessName: { rule: 'businessName', required: true },
      ownerName: { 
        pattern: /^[a-zA-Z\s]{2,50}$/,
        message: 'Owner name must be 2-50 characters, letters only',
        required: true
      },
      businessType: {
        enum: ['sole_proprietorship', 'partnership', 'limited_company', 'ngo'],
        required: true
      },
      tin: { rule: 'ugandaTIN', required: false },
      phone: { rule: 'ugandaPhone', required: true },
      email: { rule: 'email', required: true },
      address: { rule: 'postalAddress', required: true },
      sector: {
        enum: ['agriculture', 'tourism', 'manufacturing', 'ict', 'mining', 'services', 'other'],
        required: true
      }
    }

    return this.validate(data, schema)
  }

  validateTaxCalculation(data) {
    const schema = {
      calculationType: {
        enum: ['paye', 'corporate', 'investment'],
        required: true
      },
      income: { rule: 'amount', required: true },
      annualTurnover: { rule: 'amount', required: false },
      employeeCount: {
        validator: (value) => Number.isInteger(Number(value)) && Number(value) >= 0,
        message: 'Employee count must be a non-negative integer',
        required: false
      },
      vatApplicable: {
        validator: (value) => typeof value === 'boolean',
        message: 'VAT applicable must be true or false',
        required: true
      }
    }

    return this.validate(data, schema)
  }

  validateInvestmentData(data) {
    const schema = {
      investmentAmount: { rule: 'amount', required: true, min: 1000000 }, // Minimum 1M UGX
      sector: {
        enum: ['agriculture', 'tourism', 'manufacturing', 'ict', 'mining', 'energy', 'healthcare'],
        required: true
      },
      projectDuration: {
        validator: (value) => [3, 5, 7, 10].includes(Number(value)),
        message: 'Project duration must be 3, 5, 7, or 10 years',
        required: true
      },
      expectedRevenue: { rule: 'amount', required: true },
      location: {
        enum: ['kampala', 'central', 'western', 'eastern', 'northern', 'other'],
        required: true
      },
      isATMSQualified: {
        validator: (value) => typeof value === 'boolean',
        message: 'ATMS qualification must be true or false',
        required: true
      }
    }

    return this.validate(data, schema)
  }

  validateInvoiceData(data) {
    const schema = {
      clientName: { rule: 'businessName', required: true },
      clientTIN: { rule: 'ugandaTIN', required: false },
      invoiceNumber: {
        pattern: /^INV\d{4,10}$/,
        message: 'Invoice number must start with INV followed by 4-10 digits',
        required: true
      },
      items: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one invoice item is required',
        required: true
      },
      vatRate: { rule: 'percentage', required: true },
      dueDate: { rule: 'futureDate', required: true }
    }

    const result = this.validate(data, schema)

    // Validate individual items
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item, index) => {
        const itemResult = this.validateInvoiceItem(item)
        if (!itemResult.isValid) {
          result.isValid = false
          result.errors[`item_${index}`] = itemResult.errors
        }
      })
    }

    return result
  }

  validateInvoiceItem(item) {
    const schema = {
      description: {
        pattern: /^[a-zA-Z0-9\s-&.()]{2,200}$/,
        message: 'Item description must be 2-200 characters',
        required: true
      },
      quantity: {
        validator: (value) => Number(value) > 0,
        message: 'Quantity must be greater than 0',
        required: true
      },
      unitPrice: { rule: 'amount', required: true, min: 0.01 },
      total: { rule: 'amount', required: true }
    }

    const result = this.validate(item, schema)

    // Cross-validation: total should equal quantity * unitPrice
    if (result.isValid) {
      const calculatedTotal = Number(item.quantity) * Number(item.unitPrice)
      const providedTotal = Number(item.total)
      
      if (Math.abs(calculatedTotal - providedTotal) > 0.01) {
        result.isValid = false
        result.errors.total = ['Total must equal quantity × unit price']
      }
    }

    return result
  }

  // Security validation
  containsSuspiciousContent(value) {
    if (typeof value !== 'string') return false

    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /function\s*\(/gi,
      /\.innerHTML/gi,
      /document\./gi,
      /window\./gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /vbscript:/gi,
      /file:\/\//gi,
      /\bexec\b/gi,
      /\bselect\b.*\bfrom\b/gi,
      /\bunion\b.*\bselect\b/gi,
      /\bdrop\b.*\btable\b/gi,
      /\bdelete\b.*\bfrom\b/gi,
      /\binsert\b.*\binto\b/gi,
      /\bupdate\b.*\bset\b/gi
    ]

    return suspiciousPatterns.some(pattern => pattern.test(value))
  }

  logSecurityViolation(fieldName, value) {
    // eslint-disable-next-line no-console
    console.error('🚨 Security violation detected:', {
      field: fieldName,
      value: value.substring(0, 100),
      timestamp: new Date().toISOString()
    })

    // In production, send to security monitoring service
    if (typeof window !== 'undefined' && window.securityManager) {
      window.securityManager.logSuspiciousActivity('form-validation', 'SUSPICIOUS_INPUT', {
        field: fieldName,
        content: value.substring(0, 100)
      })
    }
  }

  // Utility methods
  isEmpty(value) {
    return value === null || 
           value === undefined || 
           value === '' || 
           (typeof value === 'string' && value.trim() === '') ||
           (Array.isArray(value) && value.length === 0)
  }

  sanitizeHTML(html) {
    const div = document.createElement('div')
    div.textContent = html
    return div.innerHTML
  }

  formatCurrency(amount, currency = 'UGX') {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  formatPhone(phone) {
    // Convert to Uganda format
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('256')) {
      return `+${cleaned}`
    } else if (cleaned.startsWith('0')) {
      return `+256${cleaned.substring(1)}`
    }
    return phone
  }

  // Bulk validation for forms
  validateForm(formData, validationType) {
    switch (validationType) {
      case 'business_registration':
        return this.validateBusinessRegistration(formData)
      case 'tax_calculation':
        return this.validateTaxCalculation(formData)
      case 'investment':
        return this.validateInvestmentData(formData)
      case 'invoice':
        return this.validateInvoiceData(formData)
      default:
        return { isValid: false, errors: { general: ['Unknown validation type'] } }
    }
  }

  // Generate validation report
  generateValidationReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        isValid: results.isValid,
        totalErrors: Object.keys(results.errors).length,
        totalWarnings: results.warnings.length
      },
      details: {
        errors: results.errors,
        warnings: results.warnings,
        sanitizedData: results.sanitizedData
      },
      recommendations: this.generateRecommendations(results)
    }

    return report
  }

  generateRecommendations(results) {
    const recommendations = []

    if (!results.isValid) {
      recommendations.push('Please fix all validation errors before submitting')
    }

    if (results.warnings.length > 0) {
      recommendations.push('Review warnings to ensure data accuracy')
    }

    // Specific recommendations based on error types
    const errorFields = Object.keys(results.errors)
    
    if (errorFields.some(field => field.includes('phone'))) {
      recommendations.push('Ensure phone numbers are in Uganda format (+256XXXXXXXXX)')
    }

    if (errorFields.some(field => field.includes('tin'))) {
      recommendations.push('TIN should be exactly 10 digits as issued by URA')
    }

    if (errorFields.some(field => field.includes('email'))) {
      recommendations.push('Use a valid email address for communication')
    }

    return recommendations
  }

  // Export validation schema for documentation
  exportSchema(validationType) {
    const schemas = {
      business_registration: {
        businessName: 'Business Name (2-100 chars, alphanumeric)',
        ownerName: 'Owner Full Name (2-50 chars, letters only)',
        businessType: 'Type: sole_proprietorship, partnership, limited_company, ngo',
        tin: 'Uganda TIN (10 digits, optional)',
        phone: 'Uganda Phone (+256XXXXXXXXX or 0XXXXXXXXX)',
        email: 'Valid Email Address',
        address: 'Postal Address (5-200 chars)',
        sector: 'Sector: agriculture, tourism, manufacturing, ict, mining, services, other'
      },
      tax_calculation: {
        calculationType: 'Type: paye, corporate, investment',
        income: 'Income Amount (UGX, positive number)',
        annualTurnover: 'Annual Turnover (UGX, optional)',
        employeeCount: 'Number of Employees (non-negative integer)',
        vatApplicable: 'VAT Applicable (true/false)'
      },
      investment: {
        investmentAmount: 'Investment Amount (UGX, minimum 1,000,000)',
        sector: 'Sector: agriculture, tourism, manufacturing, ict, mining, energy, healthcare',
        projectDuration: 'Duration: 3, 5, 7, or 10 years',
        expectedRevenue: 'Expected Annual Revenue (UGX)',
        location: 'Location: kampala, central, western, eastern, northern, other',
        isATMSQualified: 'ATMS Qualified (true/false)'
      }
    }

    return schemas[validationType] || {}
  }
}

// Export singleton instance
export const dataValidator = new DataValidator()

// Make globally available for debugging
if (typeof window !== 'undefined') {
  window.dataValidator = dataValidator
}

export default dataValidator