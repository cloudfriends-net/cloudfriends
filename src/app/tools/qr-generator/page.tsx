'use client'

import { useState, useEffect } from 'react'
import { QrCodeIcon, TrashIcon, DocumentTextIcon, PaintBrushIcon } from '@heroicons/react/24/outline'
import ThemeAwareLayout from '../../../components/ThemeAwareLayout'
import { useThemeContext } from '../../../components/ThemeProvider'

// Import types and components
import { QRType, QROptions, WifiForm, VCardForm } from './types'
import { generateQRValue } from './utils'
import QRPreview from './components/QRPreview'
import ContentTab from './components/ContentTab'
import DesignTab from './components/DesignTab'

export default function QRGenerator() {
  const { resolvedTheme } = useThemeContext()
  
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

  // Type-specific form states
  const [wifiForm, setWifiForm] = useState<WifiForm>({ ssid: '', password: '', encryption: 'WPA' })
  const [vcardForm, setVcardForm] = useState<VCardForm>({
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
  const [customSize, setCustomSize] = useState(1024)
  
  // QR name
  const [qrName, setQRName] = useState('')

  // Update QR value when switching types
  useEffect(() => {
    if (qrType === 'url' && !qrValue) {
      setQRValue('https://')
    } else if (qrType !== 'url' && qrValue === 'https://') {
      setQRValue('')
    }
  }, [qrType, qrValue])

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
  }

  const currentQRValue = generateQRValue(qrType, qrValue, wifiForm, vcardForm)

  return (
    <ThemeAwareLayout>
      <div className={`min-h-screen ${
        resolvedTheme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`} style={{ paddingTop: '5.5rem' }}>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <QrCodeIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${
                    resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>QR Code Generator</h1>
                  <p className="text-blue-600 text-sm">
                    Create custom QR codes for websites, WiFi, contacts, and more
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={clearQRCode}
                  className={`flex items-center gap-2 ${
                    resolvedTheme === 'dark' 
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300' 
                      : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                  } border px-3 py-2 rounded-lg text-sm font-medium transition-colors`}
                >
                  <TrashIcon className="h-4 w-4" /> Clear
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-5 gap-6">
              {/* Options panel - 3 columns */}
              <div className={`md:col-span-3 ${
                resolvedTheme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              } rounded-xl border shadow-sm overflow-hidden`}>
                <div className={`border-b ${
                  resolvedTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex">
                    <button 
                      className={`py-3 px-5 font-medium text-sm flex items-center gap-1.5 ${
                        activeTab === 'content' 
                          ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                          : resolvedTheme === 'dark'
                            ? 'text-gray-400 hover:text-gray-200'
                            : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => setActiveTab('content')}
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                      Content
                    </button>
                    <button 
                      className={`py-3 px-5 font-medium text-sm flex items-center gap-1.5 ${
                        activeTab === 'design' 
                          ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                          : resolvedTheme === 'dark'
                            ? 'text-gray-400 hover:text-gray-200'
                            : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => setActiveTab('design')}
                    >
                      <PaintBrushIcon className="w-4 h-4" />
                      Design
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  {activeTab === 'content' && (
                    <ContentTab
                      qrType={qrType}
                      qrValue={qrValue}
                      wifiForm={wifiForm}
                      vcardForm={vcardForm}
                      onQRTypeChange={setQRType}
                      onQRValueChange={setQRValue}
                      onWifiFormChange={setWifiForm}
                      onVCardFormChange={setVcardForm}
                    />
                  )}

                  {activeTab === 'design' && (
                    <DesignTab
                      options={options}
                      customSize={customSize}
                      onOptionsChange={setOptions}
                      onCustomSizeChange={setCustomSize}
                      onApplyColorPalette={applyColorPalette}
                    />
                  )}
                </div>
              </div>
              
              {/* Preview panel - 2 columns */}
              <div className={`md:col-span-2 ${
                resolvedTheme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              } rounded-xl border shadow-sm overflow-hidden flex flex-col`}>
                <div className={`p-5 ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-gray-700' 
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200'
                } border-b`}>
                  <div className="flex justify-between items-center">
                    <h2 className={`text-lg font-semibold ${
                      resolvedTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}>QR Code Preview</h2>
                    {qrName && (
                      <div className="text-sm text-blue-700 font-medium">{qrName}</div>
                    )}
                  </div>
                </div>
                
                <QRPreview
                  value={currentQRValue}
                  options={options}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeAwareLayout>
  )
}
