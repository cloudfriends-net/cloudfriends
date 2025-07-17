'use client'

import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { QrCodeIcon } from '@heroicons/react/24/outline'
import { createRoot } from 'react-dom/client'

type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard'
type FileFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/svg+xml'

interface QROptions {
  size: number
  level: 'L' | 'M' | 'Q' | 'H'
  includeMargin: boolean
  foreground: string
  background: string
}

export default function QRGenerator() {
  const [qrType, setQRType] = useState<QRType>('url')
  const [qrValue, setQRValue] = useState('')
  const [options, setOptions] = useState<QROptions>({
    size: 256,
    level: 'M',
    includeMargin: true,
    foreground: '#000000',
    background: '#ffffff',
  })
  const [fileFormat, setFileFormat] = useState<FileFormat>('image/jpeg')

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

  const [showCustomSize, setShowCustomSize] = useState(false)
  const [customSize, setCustomSize] = useState(1024)

  const generateQRValue = () => {
    switch (qrType) {
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
        return qrValue
    }
  }

  const getFileExtension = (format: FileFormat) => {
    switch (format) {
      case 'image/jpeg':
        return 'jpg'
      case 'image/png':
        return 'png'
      case 'image/webp':
        return 'webp'
      case 'image/svg+xml':
        return 'svg'
      default:
        return 'jpg'
    }
  }

  const downloadQR = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `qrcode.${getFileExtension(fileFormat)}`

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
    } else {
      canvas.toBlob(
        (blob) => {
          if (!blob) return
          link.href = URL.createObjectURL(blob)
          link.click()
          URL.revokeObjectURL(link.href)
        },
        fileFormat
      )
      return
    }

    link.click()
    if (link.href.startsWith('blob:')) {
      URL.revokeObjectURL(link.href)
    }
  }

  const downloadCustomQR = () => {
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
        link.download = `qrcode-large.${getFileExtension(fileFormat)}`

        if (fileFormat === 'image/svg+xml') {
          // Same SVG conversion as above
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
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900" style={{ paddingTop: '5.5rem' }}>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <QrCodeIcon className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold">QR Code Generator</h1>
          </div>

          <div className="mb-8 bg-blue-100 border border-blue-300 rounded-lg p-5">
            <h2 className="text-xl font-semibold mb-2 text-blue-600">How to use</h2>
            <ul className="list-disc list-inside text-gray-700">
              <li>Select the QR code type (URL, Text, Email, Phone, WiFi, vCard).</li>
              <li>Fill in the required information for your QR code.</li>
              <li>Customize size, error correction, and colors as needed.</li>
              <li>Preview your QR code on the right.</li>
              <li>
                Choose your download format and click{' '}
                <span className="font-semibold text-blue-600">Download</span>.
              </li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-300 shadow">
              <h2 className="text-xl font-semibold mb-4">QR Code Options</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={qrType}
                    onChange={(e) => setQRType(e.target.value as QRType)}
                    className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                  >
                    <option value="url">URL</option>
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="wifi">WiFi</option>
                    <option value="vcard">vCard</option>
                  </select>
                </div>

                {/* Dynamic input fields based on type */}
                {qrType === 'wifi' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Network Name (SSID)"
                      value={wifiForm.ssid}
                      onChange={(e) => setWifiForm({ ...wifiForm, ssid: e.target.value })}
                      className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={wifiForm.password}
                      onChange={(e) => setWifiForm({ ...wifiForm, password: e.target.value })}
                      className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                    />
                    <select
                      value={wifiForm.encryption}
                      onChange={(e) => setWifiForm({ ...wifiForm, encryption: e.target.value })}
                      className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">No Encryption</option>
                    </select>
                  </div>
                )}

                {qrType === 'vcard' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={vcardForm.firstName}
                      onChange={(e) => setVcardForm({ ...vcardForm, firstName: e.target.value })}
                      className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={vcardForm.lastName}
                      onChange={(e) => setVcardForm({ ...vcardForm, lastName: e.target.value })}
                      className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={vcardForm.phone}
                      onChange={(e) => setVcardForm({ ...vcardForm, phone: e.target.value })}
                      className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={vcardForm.email}
                      onChange={(e) => setVcardForm({ ...vcardForm, email: e.target.value })}
                      className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={vcardForm.company}
                      onChange={(e) => setVcardForm({ ...vcardForm, company: e.target.value })}
                      className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={vcardForm.title}
                      onChange={(e) => setVcardForm({ ...vcardForm, title: e.target.value })}
                      className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                    />
                    <input
                      type="url"
                      placeholder="Website URL"
                      value={vcardForm.url}
                      onChange={(e) => setVcardForm({ ...vcardForm, url: e.target.value })}
                      className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                    />
                  </div>
                )}

                {qrType !== 'wifi' && qrType !== 'vcard' && (
                  <input
                    type={qrType === 'email' ? 'email' : 'text'}
                    placeholder={`Enter ${qrType}...`}
                    value={qrValue}
                    onChange={(e) => setQRValue(e.target.value)}
                    className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                  />
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Size: {options.size}px</label>
                  <input
                    type="range"
                    min="128"
                    max="512"
                    value={options.size}
                    onChange={(e) => setOptions({ ...options, size: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Error Correction Level</label>
                  <select
                    value={options.level}
                    onChange={(e) => setOptions({ ...options, level: e.target.value as 'L' | 'M' | 'Q' | 'H' })}
                    className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                  >
                    <option value="L">Low</option>
                    <option value="M">Medium</option>
                    <option value="Q">Quartile</option>
                    <option value="H">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Colors</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs block mb-1">Foreground</span>
                      <input
                        type="color"
                        value={options.foreground}
                        onChange={(e) => setOptions({ ...options, foreground: e.target.value })}
                        className="w-full h-10 rounded"
                      />
                    </div>
                    <div>
                      <span className="text-xs block mb-1">Background</span>
                      <input
                        type="color"
                        value={options.background}
                        onChange={(e) => setOptions({ ...options, background: e.target.value })}
                        className="w-full h-10 rounded"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.includeMargin}
                    onChange={(e) => setOptions({ ...options, includeMargin: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span>Include Margin</span>
                </label>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-300 shadow">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <div className="bg-gray-200 p-4 rounded-lg flex items-center justify-center">
                <QRCodeCanvas
                  value={generateQRValue()}
                  size={options.size}
                  level={options.level}
                  includeMargin={options.includeMargin}
                  fgColor={options.foreground}
                  bgColor={options.background}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Download Format</label>
                <select
                  value={fileFormat}
                  onChange={(e) => setFileFormat(e.target.value as FileFormat)}
                  className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                >
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                  <option value="image/svg+xml">SVG</option>
                </select>
              </div>

              <button
                onClick={downloadQR}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Download QR Code
              </button>

              <div className="mt-2 text-center">
                <button
                  onClick={() => setShowCustomSize(!showCustomSize)}
                  className="text-blue-600 text-sm underline hover:text-blue-800"
                >
                  Not big enough?
                </button>
              </div>

              {showCustomSize && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Custom Size (px)</label>
                  <input
                    type="number"
                    min="128"
                    max="2048"
                    value={customSize}
                    onChange={(e) => setCustomSize(parseInt(e.target.value))}
                    className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                  />
                  <button
                    onClick={downloadCustomQR}
                    className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Download Custom QR Code
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
