'use client'

import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { 
  ArrowDownTrayIcon, 
  DocumentDuplicateIcon, 
  CheckIcon
} from '@heroicons/react/24/outline'
import { QROptions, FileFormat } from '../types'
import { getFileExtension, estimateFileSize } from '../utils'
import { useThemeContext } from '@/components/ThemeProvider'

interface QRPreviewProps {
  value: string
  options: QROptions
  qrName?: string
}

export default function QRPreview({ value, options }: QRPreviewProps) {
  const { resolvedTheme } = useThemeContext()
  const [downloadStarted, setDownloadStarted] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [fileFormat, setFileFormat] = useState<FileFormat>('image/png')

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
    const filename = `qrcode.${getFileExtension(fileFormat)}`
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

  return (
    <>
      <div className="flex-grow flex items-center justify-center p-5">
        <div className={`p-6 rounded-lg ${
          resolvedTheme === 'dark' 
            ? 'bg-gray-700' 
            : 'bg-gray-100'
        } ${options.includeMargin ? 'border border-gray-200' : ''}`}>
          <QRCodeCanvas
            value={value}
            size={options.size}
            level={options.level}
            includeMargin={options.includeMargin}
            fgColor={options.foreground}
            bgColor={options.background}
          />
        </div>
      </div>
      
      {/* Download Controls */}
      <div className={`p-5 border-t ${
        resolvedTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className="flex flex-col gap-3">
          {/* Format Selection */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Download Format</label>
            <select
              value={fileFormat}
              onChange={(e) => setFileFormat(e.target.value as FileFormat)}
              className={`w-full px-3 py-2 rounded border focus:ring-blue-500 focus:border-blue-500 ${
                resolvedTheme === 'dark'
                  ? 'bg-gray-600 text-gray-100 border-gray-500'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            >
              <option value="image/png">PNG - Lossless with transparency</option>
              <option value="image/jpeg">JPG - Smaller file size</option>
              <option value="image/webp">WebP - Modern format</option>
              <option value="image/svg+xml">SVG - Vector format</option>
            </select>
            <p className={`text-xs mt-1 ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Estimated file size: ~{estimateFileSize(options.size, fileFormat)}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={copyQRToClipboard}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                resolvedTheme === 'dark'
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300'
                  : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {copiedToClipboard ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="h-4 w-4" />
                  Copy
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
                <CheckIcon className="h-4 w-4" />
                Downloading...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download QR Code
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
