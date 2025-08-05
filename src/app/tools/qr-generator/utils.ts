import { QRType, FileFormat, WifiForm, VCardForm } from './types'

// Generate the actual QR code value based on type
export const generateQRValue = (
  qrType: QRType,
  qrValue: string,
  wifiForm: WifiForm,
  vcardForm: VCardForm
): string => {
  switch (qrType) {
    case 'url':
      return qrValue.trim().length > 0 ? qrValue : 'https://example.com'
    case 'email':
      return qrValue.trim().length > 0 ? `mailto:${qrValue}` : 'mailto:contact@example.com'
    case 'phone':
      return qrValue.trim().length > 0 ? `tel:${qrValue}` : 'tel:+1234567890'
    case 'wifi':
      return `WIFI:T:${wifiForm.encryption};S:${wifiForm.ssid};P:${wifiForm.password};;`
    case 'vcard':
      return `BEGIN:VCARD
VERSION:3.0
N:${vcardForm.lastName};${vcardForm.firstName};;;
FN:${vcardForm.firstName} ${vcardForm.lastName}
TEL:${vcardForm.phone}
EMAIL:${vcardForm.email}
ORG:${vcardForm.company}
TITLE:${vcardForm.title}
URL:${vcardForm.url}
END:VCARD`
    default:
      return qrValue || 'Empty QR Code'
  }
}

// Get file extension based on format
export const getFileExtension = (format: FileFormat): string => {
  switch (format) {
    case 'image/jpeg': return 'jpg'
    case 'image/png': return 'png'
    case 'image/webp': return 'webp'
    case 'image/svg+xml': return 'svg'
    default: return 'png'
  }
}

// Format file size for display
export const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} bytes`
  else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  else return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

// Estimate file size based on dimensions and format
export const estimateFileSize = (size: number, format: FileFormat): string => {
  if (format === 'image/jpeg') return formatFileSize(size * size * 0.25)
  if (format === 'image/png') return formatFileSize(size * size * 0.15)
  if (format === 'image/webp') return formatFileSize(size * size * 0.1)
  return formatFileSize(size * 40) // SVG rough estimate
}

// Get error correction info text
export const getErrorCorrectionInfo = (level: 'L' | 'M' | 'Q' | 'H'): string => {
  switch(level) {
    case 'L': return '~7% damage recovery'
    case 'M': return '~15% damage recovery'
    case 'Q': return '~25% damage recovery'
    case 'H': return '~30% damage recovery'
    default: return ''
  }
}

// Copy QR code to clipboard
export const copyQRToClipboard = async (): Promise<boolean> => {
  const canvas = document.querySelector('canvas')
  if (!canvas) return false
  
  try {
    const dataUrl = canvas.toDataURL('image/png')
    const blob = await (await fetch(dataUrl)).blob()
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
    return true
  } catch (err) {
    console.error('Failed to copy: ', err)
    return false
  }
}
