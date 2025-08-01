'use client'

import { useState, useEffect, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { createRoot } from 'react-dom/client'
import Image from 'next/image';
import { 
  QrCodeIcon, 
  ArrowDownTrayIcon,
  BookmarkIcon,
  DocumentDuplicateIcon,
  PaintBrushIcon,
  PhoneIcon,
  WifiIcon,
  EnvelopeIcon,
  LinkIcon,
  DocumentTextIcon,
  UserCircleIcon,
  TrashIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
  ChevronDownIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard'
type FileFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/svg+xml'
type PreviewMode = 'plain' | 'phone' | 'card' | 'poster'

interface QROptions {
  size: number
  level: 'L' | 'M' | 'Q' | 'H'
  includeMargin: boolean
  foreground: string
  background: string
}

interface SavedQRCode {
  id: string
  name: string
  type: QRType
  value: string
  options: QROptions
  dateCreated: string
}

const QR_TYPE_INFO = {
  url: { 
    title: 'Website URL', 
    description: 'Create a QR code that opens a website when scanned',
    icon: LinkIcon,
    placeholder: 'https://example.com'
  },
  text: { 
    title: 'Plain Text', 
    description: 'Create a QR code that shows text when scanned',
    icon: DocumentTextIcon,
    placeholder: 'Enter your text message here'
  },
  email: { 
    title: 'Email Address', 
    description: 'Create a QR code that opens an email composer',
    icon: EnvelopeIcon,
    placeholder: 'contact@example.com'
  },
  phone: { 
    title: 'Phone Number', 
    description: 'Create a QR code that initiates a phone call',
    icon: PhoneIcon,
    placeholder: '+1234567890'
  },
  wifi: { 
    title: 'WiFi Network', 
    description: 'Create a QR code that connects to a WiFi network',
    icon: WifiIcon
  },
  vcard: { 
    title: 'Contact Card (vCard)', 
    description: 'Create a QR code with contact information',
    icon: UserCircleIcon
  }
}

const COLOR_PALETTES = [
  { name: "Classic", fg: "#000000", bg: "#FFFFFF" },
  { name: "Night Mode", fg: "#FFFFFF", bg: "#121212" },
  { name: "Blue Sky", fg: "#0055AA", bg: "#F0F8FF" },
  { name: "Forest", fg: "#006600", bg: "#EFFFEF" },
  { name: "Sunset", fg: "#D62828", bg: "#FFF1E6" },
  { name: "Ocean", fg: "#023E8A", bg: "#CAF0F8" },
  { name: "Purple Rain", fg: "#5A189A", bg: "#F8EDFF" },
  { name: "Gold", fg: "#A67C00", bg: "#FFF8E1" }
]

export default function QRGenerator() {
  // Basic QR code options
  const [qrType, setQRType] = useState<QRType>('url')
  const [qrValue, setQRValue] = useState('https://')
  const [options, setOptions] = useState<QROptions>({
    size: 256,
    level: 'M',
    includeMargin: true,
    foreground: '#000000',
    background: '#ffffff',
  })
  const [fileFormat, setFileFormat] = useState<FileFormat>('image/png')

  // Type-specific form states
  const [wifiForm, setWifiForm] = useState({ ssid: '', password: '', encryption: 'WPA' })
  const [vcardForm, setVcardForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    title: '',
    url: '',
  })

  // UI state
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('plain')
  const [downloadStarted, setDownloadStarted] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [customSize, setCustomSize] = useState(1024) // Default custom size
  
  // Saved QR codes
  const [savedQRs, setSavedQRs] = useState<SavedQRCode[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showSavedQRs, setShowSavedQRs] = useState(false)
  const [qrName, setQRName] = useState('')
  
  // Logo overlay
  const [showLogoOptions, setShowLogoOptions] = useState(false)
  const [logoImage, setLogoImage] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState(64)
  const logoInputRef = useRef<HTMLInputElement>(null)
  
  // Load saved QR codes on mount
  useEffect(() => {
    const saved = localStorage.getItem('saved_qr_codes')
    if (saved) {
      try {
        setSavedQRs(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading saved QR codes:', error)
      }
    }
  }, [])
  
  // Update QR value when switching types
  useEffect(() => {
    if (qrType === 'url' && !qrValue) {
      setQRValue('https://')
    } else if (qrType !== 'url' && qrValue === 'https://') {
      setQRValue('')
    }
  }, [qrType, qrValue])

  // Generate the actual QR code value based on type
  const generateQRValue = () => {
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
  const getFileExtension = (format: FileFormat) => {
    switch (format) {
      case 'image/jpeg': return 'jpg'
      case 'image/png': return 'png'
      case 'image/webp': return 'webp'
      case 'image/svg+xml': return 'svg'
      default: return 'png'
    }
  }
  
  // Format file size for display
  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} bytes`
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    else return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }
  
  // Estimate file size based on dimensions
  const estimateFileSize = () => {
    const size = options.size
    if (fileFormat === 'image/jpeg') return formatFileSize(size * size * 0.25)
    if (fileFormat === 'image/png') return formatFileSize(size * size * 0.15)
    if (fileFormat === 'image/webp') return formatFileSize(size * size * 0.1)
    return formatFileSize(size * 40) // SVG rough estimate
  }
  
  // Get error correction info text
  const getErrorCorrectionInfo = (level: 'L' | 'M' | 'Q' | 'H') => {
    switch(level) {
      case 'L': return '~7% damage recovery'
      case 'M': return '~15% damage recovery'
      case 'Q': return '~25% damage recovery'
      case 'H': return '~30% damage recovery'
      default: return ''
    }
  }

  // Copy QR code to clipboard
  const copyQRToClipboard = async () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    
    try {
      const dataUrl = canvas.toDataURL('image/png')
      const blob = await (await fetch(dataUrl)).blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  // Download the QR code
  const downloadQR = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    
    setDownloadStarted(true)
    setTimeout(() => setDownloadStarted(false), 1500)

    const link = document.createElement('a')
    const filename = qrName ? 
      `${qrName.toLowerCase().replace(/\s+/g, '-')}.${getFileExtension(fileFormat)}` : 
      `qrcode.${getFileExtension(fileFormat)}`
    link.download = filename

    if (fileFormat === 'image/svg+xml') {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('width', canvas.width.toString())
      svg.setAttribute('height', canvas.height.toString())

      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      image.setAttribute('width', '100%')
      image.setAttribute('height', '100%')
      image.setAttribute('href', canvas.toDataURL('image/png'))

      svg.appendChild(image)

      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      link.href = URL.createObjectURL(svgBlob)
      link.click()
      URL.revokeObjectURL(link.href)
    } else {
      canvas.toBlob(
        (blob) => {
          if (!blob) return
          link.href = URL.createObjectURL(blob)
          link.click()
          URL.revokeObjectURL(link.href)
        },
        fileFormat,
        fileFormat === 'image/jpeg' ? 0.9 : undefined
      )
    }
  }

  // Download custom size QR code
  const downloadCustomQR = () => {
    setDownloadStarted(true)
    
    // Create a temporary QR code element
    const tempDiv = document.createElement('div')
    document.body.appendChild(tempDiv)

    // Render temporary QR code with custom size
    const root = createRoot(tempDiv)
    root.render(
      <QRCodeCanvas
        value={generateQRValue()}
        size={customSize}
        level={options.level}
        includeMargin={options.includeMargin}
        fgColor={options.foreground}
        bgColor={options.background}
      />
    )

    // Wait for the canvas to be rendered
    setTimeout(() => {
      const canvas = tempDiv.querySelector('canvas')
      if (canvas) {
        const link = document.createElement('a')
        const filename = qrName ? 
          `${qrName.toLowerCase().replace(/\s+/g, '-')}-large.${getFileExtension(fileFormat)}` : 
          `qrcode-large.${getFileExtension(fileFormat)}`
        link.download = filename

        if (fileFormat === 'image/svg+xml') {
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
          svg.setAttribute('width', canvas.width.toString())
          svg.setAttribute('height', canvas.height.toString())

          const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
          image.setAttribute('width', '100%')
          image.setAttribute('height', '100%')
          image.setAttribute('href', canvas.toDataURL('image/png'))

          svg.appendChild(image)

          const svgData = new XMLSerializer().serializeToString(svg)
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
          link.href = URL.createObjectURL(svgBlob)
          link.click()
          URL.revokeObjectURL(link.href)
        } else {
          canvas.toBlob(
            (blob) => {
              if (!blob) return
              link.href = URL.createObjectURL(blob)
              link.click()
              URL.revokeObjectURL(link.href)
            },
            fileFormat,
            0.9
          )
        }
      }

      // Clean up
      root.unmount()
      document.body.removeChild(tempDiv)
      setDownloadStarted(false)
    }, 100)
  }
  
  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setLogoImage(e.target.result)
      }
    }
    reader.readAsDataURL(file)
  }
  
  // Remove logo
  const removeLogo = () => {
    setLogoImage(null)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  // Save the current QR code
  const saveQRCode = () => {
    if (!qrName.trim()) return
    
    const newQR: SavedQRCode = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name: qrName,
      type: qrType,
      value: qrType === 'wifi' ? JSON.stringify(wifiForm) : 
             qrType === 'vcard' ? JSON.stringify(vcardForm) : qrValue,
      options: {...options},
      dateCreated: new Date().toISOString()
    }
    
    const updatedSavedQRs = [...savedQRs, newQR]
    setSavedQRs(updatedSavedQRs)
    localStorage.setItem('saved_qr_codes', JSON.stringify(updatedSavedQRs))
    
    setShowSaveDialog(false)
    setQRName('')
  }
  
  // Load a saved QR code
  const loadSavedQR = (qr: SavedQRCode) => {
    setQRType(qr.type)
    setOptions({...qr.options})
    
    if (qr.type === 'wifi') {
      setWifiForm(JSON.parse(qr.value))
      setQRValue('')
    } else if (qr.type === 'vcard') {
      setVcardForm(JSON.parse(qr.value))
      setQRValue('')
    } else {
      setQRValue(qr.value)
    }
    
    setQRName(qr.name)
    setShowSavedQRs(false)
  }
  
  // Delete a saved QR code
  const deleteSavedQR = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const updatedSavedQRs = savedQRs.filter(qr => qr.id !== id)
    setSavedQRs(updatedSavedQRs)
    localStorage.setItem('saved_qr_codes', JSON.stringify(updatedSavedQRs))
  }
  
  // Apply a color palette
  const applyColorPalette = (fg: string, bg: string) => {
    setOptions(prev => ({...prev, foreground: fg, background: bg}))
  }
  
  // Clear current QR code
  const clearQRCode = () => {
    if (qrType === 'url') {
      setQRValue('https://')
    } else {
      setQRValue('')
    }
    setWifiForm({ ssid: '', password: '', encryption: 'WPA' })
    setVcardForm({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      company: '',
      title: '',
      url: '',
    })
    setQRName('')
    setOptions({
      size: 256,
      level: 'M',
      includeMargin: true,
      foreground: '#000000',
      background: '#ffffff',
    })
    removeLogo()
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ paddingTop: '5.5rem' }}>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <QrCodeIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1>
                <p className="text-blue-600 text-sm">
                  Create custom QR codes for websites, WiFi, contacts, and more
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowSavedQRs(true)}
                className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <BookmarkIcon className="h-4 w-4" /> My QR Codes
              </button>
              
              <button
                onClick={clearQRCode}
                className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <TrashIcon className="h-4 w-4" /> Clear
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-8">
            <h2 className="text-lg font-semibold mb-2">What can you do with QR codes?</h2>
            <p className="text-gray-600 text-sm mb-4">
              QR codes can be scanned by smartphone cameras to quickly access websites, connect to WiFi networks, 
              save contact information, and more - without typing long URLs or information.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Website URLs</span>
                </div>
                <p className="text-xs text-gray-600">Direct people to your website, social profiles, or specific pages.</p>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <WifiIcon className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">WiFi Networks</span>
                </div>
                <p className="text-xs text-gray-600">Let visitors connect to your WiFi without typing the password.</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <UserCircleIcon className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Contact Info</span>
                </div>
                <p className="text-xs text-gray-600">Share your contact details to be saved directly to phones.</p>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <DocumentTextIcon className="h-4 w-4 text-amber-600" />
                  <span className="font-medium">Text & Messages</span>
                </div>
                <p className="text-xs text-gray-600">Display text information, SMS messages, or any text content.</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {/* Options panel - 3 columns */}
            <div className="md:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button 
                    className={`py-3 px-5 font-medium text-sm flex items-center gap-1.5 ${activeTab === 'content' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    onClick={() => setActiveTab('content')}
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    Content
                  </button>
                  <button 
                    className={`py-3 px-5 font-medium text-sm flex items-center gap-1.5 ${activeTab === 'design' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    onClick={() => setActiveTab('design')}
                  >
                    <PaintBrushIcon className="w-4 h-4" />
                    Design
                  </button>
                </div>
              </div>

              <div className="p-5">
                {/* Content tab - QR code content */}
                {activeTab === 'content' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Type</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                        {(Object.entries(QR_TYPE_INFO) as [QRType, typeof QR_TYPE_INFO.url][]).map(([type, info]) => (
                          <button
                            key={type}
                            onClick={() => setQRType(type)}
                            className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center transition-colors ${
                              qrType === type
                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <info.icon className="h-5 w-5 mb-1" />
                            <span className="text-xs font-medium">{info.title}</span>
                          </button>
                        ))}
                      </div>
                      
                      <div className="bg-blue-50 rounded-md p-3 mb-4">
                        <p className="text-sm text-blue-800">
                          {QR_TYPE_INFO[qrType].description}
                        </p>
                      </div>
                    </div>

                    {/* Dynamic input fields based on type */}
                    {qrType === 'wifi' && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Network Name (SSID)</label>
                          <input
                            type="text"
                            placeholder="Enter WiFi network name"
                            value={wifiForm.ssid}
                            onChange={(e) => setWifiForm({ ...wifiForm, ssid: e.target.value })}
                            className="w-full bg-white text-gray-900 px-3 py-2 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                          <input
                            type="password"
                            placeholder="Enter WiFi password"
                            value={wifiForm.password}
                            onChange={(e) => setWifiForm({ ...wifiForm, password: e.target.value })}
                            className="w-full bg-white text-gray-900 px-3 py-2 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Security Type</label>
                          <select
                            value={wifiForm.encryption}
                            onChange={(e) => setWifiForm({ ...wifiForm, encryption: e.target.value })}
                            className="w-full bg-white text-gray-900 px-3 py-2 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="WPA">WPA/WPA2/WPA3</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">No Password</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {qrType === 'vcard' && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                              type="text"
                              placeholder="First Name"
                              value={vcardForm.firstName}
                              onChange={(e) => setVcardForm({ ...vcardForm, firstName: e.target.value })}
                              className="w-full bg-white text-gray-900 px-3 py-2 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                              type="text"
                              placeholder="Last Name"
                              value={vcardForm.lastName}
                              onChange={(e) => setVcardForm({ ...vcardForm, lastName: e.target.value })}
                              className="w-full bg-white text-gray-900 px-3 py-2 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            value={vcardForm.phone}
                            onChange={(e) => setVcardForm({ ...vcardForm, phone: e.target.value })}
                            className="w-full bg-white text-gray-900 px-3 py-2 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            placeholder="Email Address"
                            value={vcardForm.email}
                            onChange={(e) => setVcardForm({ ...vcardForm, email: e.target.value })}
                            className="w-full bg-white text-gray-900 px-3 py-2 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                          <input
                            type="text"
                            placeholder="Company"
                            value={vcardForm.company}
                            onChange={(e) => setVcardForm({ ...vcardForm, company: e.target.value })}
                            className="w-full bg-white text-gray-900 px-3 py-2 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                          <input
                            type="text"
                            placeholder="Job Title"
                            value={vcardForm.title}
                            onChange={(e) => setVcardForm({ ...vcardForm, title: e.target.value })}
                            className="w-full bg-white text-gray-900 px-3 py-2 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                          <input
                            type="url"
                            placeholder="Website URL"
                            value={vcardForm.url}
                            onChange={(e) => setVcardForm({ ...vcardForm, url: e.target.value })}
                            className="w-full bg-white text-gray-900 px-3 py-2 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {qrType !== 'wifi' && qrType !== 'vcard' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {QR_TYPE_INFO[qrType].title}
                        </label>
                        <input
                          type={qrType === 'email' ? 'email' : qrType === 'url' ? 'url' : qrType === 'phone' ? 'tel' : 'text'}
                          placeholder={QR_TYPE_INFO[qrType].placeholder}
                          value={qrValue}
                          onChange={(e) => setQRValue(e.target.value)}
                          className="w-full bg-white text-gray-900 px-3 py-2 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Download Format</label>
                      <select
                        value={fileFormat}
                        onChange={(e) => setFileFormat(e.target.value as FileFormat)}
                        className="w-full bg-white text-gray-900 px-3 py-2 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="image/png">PNG - Lossless with transparency</option>
                        <option value="image/jpeg">JPG - Smaller file size</option>
                        <option value="image/webp">WebP - Modern format, good compression</option>
                        <option value="image/svg+xml">SVG - Vector format, scales perfectly</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Estimated file size: ~{estimateFileSize()}
                      </p>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Display Preview</h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setPreviewMode('plain')}
                          className={`px-3 py-1.5 text-xs rounded-md ${
                            previewMode === 'plain'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          Plain
                        </button>
                        <button
                          onClick={() => setPreviewMode('phone')}
                          className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1 ${
                            previewMode === 'phone'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          <DevicePhoneMobileIcon className="h-3 w-3" />
                          Phone
                        </button>
                        <button
                          onClick={() => setPreviewMode('card')}
                          className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1 ${
                            previewMode === 'card'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          <DocumentDuplicateIcon className="h-3 w-3" />
                          Business Card
                        </button>
                        <button
                          onClick={() => setPreviewMode('poster')}
                          className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1 ${
                            previewMode === 'poster'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          <PhotoIcon className="h-3 w-3" />
                          Poster
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Design tab - QR code appearance */}
                {activeTab === 'design' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Size: {options.size}px
                      </label>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-2">Small</span>
                        <input
                          type="range"
                          min="128"
                          max="512"
                          step="8"
                          value={options.size}
                          onChange={(e) => setOptions({ ...options, size: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500 ml-2">Large</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Error Correction Level</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['L', 'M', 'Q', 'H'] as const).map(level => (
                          <button
                            key={level}
                            onClick={() => setOptions({...options, level})}
                            className={`p-2 rounded-lg border text-center transition-colors ${
                              options.level === level
                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <div className="font-medium">{level}</div>
                            <div className="text-xs mt-1">{getErrorCorrectionInfo(level)}</div>
                          </button>
                        ))}
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Higher error correction levels make QR codes more resistant to damage but increase their complexity.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color Palette</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {COLOR_PALETTES.map(palette => (
                          <button
                            key={palette.name}
                            onClick={() => applyColorPalette(palette.fg, palette.bg)}
                            className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 flex flex-col items-center"
                          >
                            <div className="h-8 w-full rounded overflow-hidden flex mb-1">
                              <div className="w-1/2" style={{backgroundColor: palette.bg}}></div>
                              <div className="w-1/2" style={{backgroundColor: palette.fg}}></div>
                            </div>
                            <span className="text-xs font-medium text-gray-600">{palette.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custom Colors</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs block mb-1">QR Code Color</span>
                          <div className="flex">
                            <div className="w-10 h-10 rounded-l border border-gray-300" style={{backgroundColor: options.foreground}}></div>
                            <input
                              type="color"
                              value={options.foreground}
                              onChange={(e) => setOptions({ ...options, foreground: e.target.value })}
                              className="flex-grow rounded-r border-t border-r border-b border-gray-300 p-1"
                            />
                          </div>
                        </div>
                        <div>
                          <span className="text-xs block mb-1">Background Color</span>
                          <div className="flex">
                            <div className="w-10 h-10 rounded-l border border-gray-300" style={{backgroundColor: options.background}}></div>
                            <input
                              type="color"
                              value={options.background}
                              onChange={(e) => setOptions({ ...options, background: e.target.value })}
                              className="flex-grow rounded-r border-t border-r border-b border-gray-300 p-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-4">
                      <input
                        type="checkbox"
                        id="includeMargin"
                        checked={options.includeMargin}
                        onChange={(e) => setOptions({ ...options, includeMargin: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="includeMargin" className="ml-2 text-sm text-gray-700">
                        Include Quiet Zone (white margin)
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      A quiet zone helps scanners identify your QR code clearly.
                    </p>

                    <div>
                      <button
                        onClick={() => setShowLogoOptions(!showLogoOptions)}
                        className="flex items-center justify-between w-full text-left p-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <PhotoIcon className="h-5 w-5 text-gray-700" />
                          <span className="font-medium text-gray-700">Add Logo (Experimental)</span>
                        </div>
                        <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${showLogoOptions ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showLogoOptions && (
                        <div className="p-3 border border-gray-300 border-t-0 rounded-b-lg bg-gray-50">
                          <div className="flex flex-col gap-3">
                            <p className="text-xs text-gray-600">
                              Adding a logo may reduce scannability. Use a higher error correction level (Q or H) when adding logos.
                            </p>
                            
                            {logoImage ? (
                              <div className="flex flex-col items-center gap-3">
                                <Image 
                                  src={logoImage} 
                                  alt="QR Code Logo" 
                                  width={60} 
                                  height={60} 
                                  className="max-w-full max-h-full object-contain"
                                />
                                <button
                                  onClick={removeLogo}
                                  className="text-xs text-red-600 hover:text-red-700"
                                >
                                  Remove Logo
                                </button>
                                
                                <label className="block w-full text-xs font-medium text-gray-700">
                                  Logo Size: {logoSize}px
                                  <input
                                    type="range"
                                    min="32"
                                    max="128"
                                    value={logoSize}
                                    onChange={(e) => setLogoSize(parseInt(e.target.value))}
                                    className="w-full mt-1"
                                  />
                                </label>
                              </div>
                            ) : (
                              <div>
                                <input
                                  ref={logoInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleLogoUpload}
                                  className="hidden"
                                  id="logo-upload"
                                />
                                <label
                                  htmlFor="logo-upload"
                                  className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md cursor-pointer text-sm"
                                >
                                  <PhotoIcon className="h-4 w-4" />
                                  Choose Logo Image
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custom Size for Download</label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="number"
                          min="128"
                          max="4096"
                          step="8"
                          value={customSize}
                          onChange={(e) => setCustomSize(parseInt(e.target.value) || 1024)}
                          className="w-24 bg-white text-gray-900 px-3 py-2 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-sm text-gray-500">pixels (preview shows a smaller version)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Preview panel - 2 columns */}
            <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">QR Code Preview</h2>
                  {qrName && (
                    <div className="text-sm text-blue-700 font-medium">{qrName}</div>
                  )}
                </div>
              </div>
              
              <div className="flex-grow flex items-center justify-center p-5">
                {previewMode === 'plain' && (
                  <div className={`bg-gray-100 p-4 rounded-lg ${options.includeMargin ? 'border border-gray-200' : ''}`}>
                    <QRCodeCanvas
                      value={generateQRValue()}
                      size={options.size}
                      level={options.level}
                      includeMargin={options.includeMargin}
                      fgColor={options.foreground}
                      bgColor={options.background}
                    />
                  </div>
                )}
                
                {previewMode === 'phone' && (
                  <div className="relative">
                    <div className="w-[260px] h-[500px] bg-gray-800 rounded-[36px] p-3 shadow-lg">
                      <div className="w-full h-full bg-white rounded-[28px] overflow-hidden flex flex-col">
                        <div className="h-7 bg-gray-800 flex justify-center items-end pb-1">
                          <div className="w-20 h-4 bg-black rounded-b-xl"></div>
                        </div>
                        <div className="flex-grow bg-gray-100 flex items-center justify-center p-4">
                          <div className={`bg-white p-4 rounded-lg shadow-md ${options.includeMargin ? 'border border-gray-200' : ''}`}>
                            <QRCodeCanvas
                              value={generateQRValue()}
                              size={Math.min(180, options.size)}
                              level={options.level}
                              includeMargin={options.includeMargin}
                              fgColor={options.foreground}
                              bgColor={options.background}
                            />
                          </div>
                        </div>
                        <div className="h-12 bg-white border-t border-gray-200 flex justify-center items-center">
                          <div className="w-36 h-5 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {previewMode === 'card' && (
                  <div className="relative">
                    <div className="w-[340px] h-[200px] bg-white rounded-lg shadow-md flex p-4 border border-gray-200">
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <div className="w-32 h-6 bg-gray-800 rounded mb-2"></div>
                          <div className="w-40 h-4 bg-gray-300 rounded mb-1"></div>
                          <div className="w-36 h-4 bg-gray-300 rounded"></div>
                        </div>
                        <div>
                          <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                          <div className="w-28 h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center ml-2">
                        <div className={`bg-white p-1 ${options.includeMargin ? 'border border-gray-200' : ''}`}>
                          <QRCodeCanvas
                            value={generateQRValue()}
                            size={Math.min(120, options.size)}
                            level={options.level}
                            includeMargin={options.includeMargin}
                            fgColor={options.foreground}
                            bgColor={options.background}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {previewMode === 'poster' && (
                  <div className="relative">
                    <div className="w-[280px] h-[380px] bg-white rounded-lg shadow-md p-4 border border-gray-200 flex flex-col items-center">
                      <div className="w-full h-40 bg-gray-800 rounded-lg mb-3 flex items-center justify-center">
                        <div className="w-24 h-5 bg-white rounded-full"></div>
                      </div>
                      
                      <div className="flex-grow w-full flex items-center justify-center">
                        <div className={`bg-white p-2 ${options.includeMargin ? 'border border-gray-200' : ''}`}>
                          <QRCodeCanvas
                            value={generateQRValue()}
                            size={Math.min(160, options.size)}
                            level={options.level}
                            includeMargin={options.includeMargin}
                            fgColor={options.foreground}
                            bgColor={options.background}
                          />
                        </div>
                      </div>
                      
                      <div className="w-full h-8 mt-3 flex justify-center">
                        <div className="w-40 h-4 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-5 border-t border-gray-200">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowSaveDialog(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <BookmarkIcon className="h-4 w-4" /> Save
                    </button>
                    
                    <button 
                      onClick={copyQRToClipboard}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {copiedToClipboard ? (
                        <>
                          <CheckIcon className="h-4 w-4 text-green-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <DocumentDuplicateIcon className="h-4 w-4" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  
                  <button
                    onClick={downloadQR}
                    disabled={downloadStarted}
                    className={`flex items-center justify-center gap-1.5 ${
                      downloadStarted 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                  >
                    {downloadStarted ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="h-4 w-4" /> Download QR Code
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={downloadCustomQR}
                    className="flex items-center justify-center gap-1.5 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-1 rounded-lg text-xs font-medium transition-colors"
                  >
                    Download Custom Size ({customSize}px)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Usage tips section */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">QR Code Usage Tips</h2>
            </div>
            <div className="p-5">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900">Optimal Size</h3>
                  <p className="text-sm text-gray-600">For printed materials, ensure your QR code is at least 2 x 2 cm (0.8 x 0.8 inches). The scanning distance should be approximately 10x the size of the code.</p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900">Color Contrast</h3>
                  <p className="text-sm text-gray-600">Maintain high contrast between the QR code and its background. Dark codes on light backgrounds work best. Avoid low-contrast color combinations.</p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900">Testing</h3>
                  <p className="text-sm text-gray-600">Always test your QR code with multiple devices before finalizing. Consider what happens after scanning - ensure landing pages are mobile-friendly.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer informational text */}
          <div className="mt-8 text-center text-gray-500 text-xs">
            <p>QR codes created with this tool are generated entirely in your browser. No data is sent to any server.</p>
            <p className="mt-1">QR Code is a registered trademark of DENSO WAVE INCORPORATED.</p>
          </div>
        </div>
      </main>

      {/* Save QR Code Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowSaveDialog(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Save QR Code</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="qrName" className="block text-sm font-medium text-gray-700 mb-1">
                  QR Code Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="qrName"
                  value={qrName}
                  onChange={(e) => setQRName(e.target.value)}
                  className="w-full bg-gray-50 text-gray-900 rounded px-3 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter a name for this QR code"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveQRCode}
                  disabled={!qrName.trim()}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    qrName.trim()
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-blue-200 text-blue-500 cursor-not-allowed'
                  }`}
                >
                  Save QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved QR Codes Dialog */}
      {showSavedQRs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button
              onClick={() => setShowSavedQRs(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved QR Codes</h2>
            <div className="space-y-4">
              {savedQRs.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  You don&rsquo;t have any saved QR codes yet.
                </p>
              ) : (
                savedQRs.map((qr) => (
                  <div
                    key={qr.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col sm:flex-row gap-4 cursor-pointer transition-transform hover:scale[1.01]"
                    onClick={() => loadSavedQR(qr)}
                  >
                    <div className="flex-shrink-0">
                      <QRCodeCanvas
                        value={qr.value}
                        size={80}
                        level={qr.options.level}
                        includeMargin={qr.options.includeMargin}
                        fgColor={qr.options.foreground}
                        bgColor={qr.options.background}
                        className="rounded"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-sm font-medium text-gray-900">{qr.name}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(qr.dateCreated).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSavedQR(qr.id, e) }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
