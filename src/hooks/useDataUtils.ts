import { useCallback } from 'react'

// Hook for exporting data in various formats
export function useDataExport() {
  const exportToJSON = useCallback((data: any, filename = 'data.json') => {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    downloadBlob(blob, filename)
  }, [])

  const exportToCSV = useCallback((data: any[], filename = 'data.csv') => {
    if (!data.length) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape quotes and wrap in quotes if contains comma or quote
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    downloadBlob(blob, filename)
  }, [])

  const exportToTXT = useCallback((content: string, filename = 'data.txt') => {
    const blob = new Blob([content], { type: 'text/plain' })
    downloadBlob(blob, filename)
  }, [])

  const exportToXML = useCallback((data: any, filename = 'data.xml', rootElement = 'root') => {
    const toXML = (obj: any, indent = 0): string => {
      const spaces = '  '.repeat(indent)
      
      if (Array.isArray(obj)) {
        return obj.map(item => toXML(item, indent)).join('\n')
      }
      
      if (typeof obj === 'object' && obj !== null) {
        return Object.entries(obj).map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            return `${spaces}<${key}>\n${toXML(value, indent + 1)}\n${spaces}</${key}>`
          }
          return `${spaces}<${key}>${value}</${key}>`
        }).join('\n')
      }
      
      return `${spaces}${obj}`
    }

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n${toXML(data, 1)}\n</${rootElement}>`
    const blob = new Blob([xmlContent], { type: 'application/xml' })
    downloadBlob(blob, filename)
  }, [])

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    exportToJSON,
    exportToCSV,
    exportToTXT,
    exportToXML
  }
}

// Hook for data validation
export function useDataValidation() {
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [])

  const validateURL = useCallback((url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }, [])

  const validatePhone = useCallback((phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
  }, [])

  const validatePassword = useCallback((password: string): {
    isValid: boolean
    score: number
    issues: string[]
  } => {
    const issues: string[] = []
    let score = 0

    if (password.length < 8) {
      issues.push('Must be at least 8 characters long')
    } else {
      score += 1
    }

    if (!/[A-Z]/.test(password)) {
      issues.push('Must contain uppercase letters')
    } else {
      score += 1
    }

    if (!/[a-z]/.test(password)) {
      issues.push('Must contain lowercase letters')
    } else {
      score += 1
    }

    if (!/\d/.test(password)) {
      issues.push('Must contain numbers')
    } else {
      score += 1
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      issues.push('Must contain special characters')
    } else {
      score += 1
    }

    return {
      isValid: issues.length === 0,
      score,
      issues
    }
  }, [])

  const validateJSON = useCallback((jsonString: string): { isValid: boolean; error?: string } => {
    try {
      JSON.parse(jsonString)
      return { isValid: true }
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON'
      }
    }
  }, [])

  const validateXML = useCallback((xmlString: string): { isValid: boolean; error?: string } => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(xmlString, 'application/xml')
      const errors = doc.getElementsByTagName('parsererror')
      
      if (errors.length > 0) {
        return { isValid: false, error: errors[0].textContent || 'Invalid XML' }
      }
      
      return { isValid: true }
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Invalid XML'
      }
    }
  }, [])

  return {
    validateEmail,
    validateURL,
    validatePhone,
    validatePassword,
    validateJSON,
    validateXML
  }
}

// Hook for data formatting
export function useDataFormatting() {
  const formatBytes = useCallback((bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
  }, [])

  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }, [])

  const formatNumber = useCallback((number: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat('en-US', options).format(number)
  }, [])

  const formatCurrency = useCallback((amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount)
  }, [])

  const formatDate = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', options).format(dateObj)
  }, [])

  const formatPercentage = useCallback((value: number, decimals = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`
  }, [])

  const truncateText = useCallback((text: string, maxLength: number, suffix = '...'): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - suffix.length) + suffix
  }, [])

  const capitalizeWords = useCallback((text: string): string => {
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    )
  }, [])

  const slugify = useCallback((text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
  }, [])

  return {
    formatBytes,
    formatDuration,
    formatNumber,
    formatCurrency,
    formatDate,
    formatPercentage,
    truncateText,
    capitalizeWords,
    slugify
  }
}
