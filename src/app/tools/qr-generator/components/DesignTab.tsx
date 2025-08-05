'use client'

import { QROptions } from '../types'
import { COLOR_PALETTES } from '../constants'
import { getErrorCorrectionInfo } from '../utils'
import { useThemeContext } from '@/components/ThemeProvider'

interface DesignTabProps {
  options: QROptions
  customSize: number
  onOptionsChange: (options: QROptions) => void
  onCustomSizeChange: (size: number) => void
  onApplyColorPalette: (fg: string, bg: string) => void
}

export default function DesignTab({
  options,
  customSize,
  onOptionsChange,
  onCustomSizeChange,
  onApplyColorPalette
}: DesignTabProps) {
  const { resolvedTheme } = useThemeContext()

  return (
    <div className="space-y-5">
      {/* Size Control */}
      <div>
        <label className={`block text-sm font-medium mb-1 ${
          resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Size: {options.size}px
        </label>
        <div className="flex items-center">
          <span className={`text-xs mr-2 ${
            resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>Small</span>
          <input
            type="range"
            min="128"
            max="512"
            step="8"
            value={options.size}
            onChange={(e) => onOptionsChange({ ...options, size: parseInt(e.target.value) })}
            className="w-full"
          />
          <span className={`text-xs ml-2 ${
            resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>Large</span>
        </div>
      </div>

      {/* Error Correction Level */}
      <div>
        <label className={`block text-sm font-medium mb-1 ${
          resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>Error Correction Level</label>
        <div className="grid grid-cols-4 gap-2">
          {(['L', 'M', 'Q', 'H'] as const).map(level => (
            <button
              key={level}
              onClick={() => onOptionsChange({...options, level})}
              className={`p-2 rounded-lg border text-center transition-colors ${
                options.level === level
                  ? resolvedTheme === 'dark'
                    ? 'bg-blue-900 border-blue-600 text-blue-200'
                    : 'bg-blue-50 border-blue-300 text-blue-700'
                  : resolvedTheme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{level}</div>
              <div className="text-xs mt-1">{getErrorCorrectionInfo(level)}</div>
            </button>
          ))}
        </div>
        
        <p className={`text-xs mt-2 ${
          resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Higher error correction levels make QR codes more resistant to damage but increase their complexity.
        </p>
      </div>

      {/* Color Palettes */}
      <div>
        <label className={`block text-sm font-medium mb-1 ${
          resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>Color Palette</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COLOR_PALETTES.map(palette => (
            <button
              key={palette.name}
              onClick={() => onApplyColorPalette(palette.fg, palette.bg)}
              className={`p-2 rounded-lg border transition-colors flex flex-col items-center ${
                resolvedTheme === 'dark'
                  ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="h-8 w-full rounded overflow-hidden flex mb-1">
                <div className="w-1/2" style={{backgroundColor: palette.bg}}></div>
                <div className="w-1/2" style={{backgroundColor: palette.fg}}></div>
              </div>
              <span className={`text-xs font-medium ${
                resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>{palette.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div>
        <label className={`block text-sm font-medium mb-3 ${
          resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>Custom Colors</label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* QR Code Color */}
          <div className={`p-4 rounded-lg border ${
            resolvedTheme === 'dark' 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-medium ${
                resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Foreground</span>
              <span className={`text-xs px-2 py-1 rounded ${
                resolvedTheme === 'dark' 
                  ? 'bg-gray-600 text-gray-300' 
                  : 'bg-white text-gray-600'
              }`}>{options.foreground}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg border-2 shadow-sm ${
                resolvedTheme === 'dark' ? 'border-gray-500' : 'border-gray-300'
              }`} style={{backgroundColor: options.foreground}}></div>
              
              <div className="flex-grow">
                <input
                  type="color"
                  value={options.foreground}
                  onChange={(e) => onOptionsChange({ ...options, foreground: e.target.value })}
                  className={`w-full h-10 rounded-lg border cursor-pointer ${
                    resolvedTheme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                  }`}
                  title="Choose QR code color"
                />
              </div>
            </div>
            
            <p className={`text-xs mt-2 ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              The main QR code pattern color
            </p>
          </div>

          {/* Background Color */}
          <div className={`p-4 rounded-lg border ${
            resolvedTheme === 'dark' 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-medium ${
                resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Background</span>
              <span className={`text-xs px-2 py-1 rounded ${
                resolvedTheme === 'dark' 
                  ? 'bg-gray-600 text-gray-300' 
                  : 'bg-white text-gray-600'
              }`}>{options.background}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg border-2 shadow-sm ${
                resolvedTheme === 'dark' ? 'border-gray-500' : 'border-gray-300'
              }`} style={{backgroundColor: options.background}}></div>
              
              <div className="flex-grow">
                <input
                  type="color"
                  value={options.background}
                  onChange={(e) => onOptionsChange({ ...options, background: e.target.value })}
                  className={`w-full h-10 rounded-lg border cursor-pointer ${
                    resolvedTheme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                  }`}
                  title="Choose background color"
                />
              </div>
            </div>
            
            <p className={`text-xs mt-2 ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              The background color behind the QR code
            </p>
          </div>
        </div>

        {/* Color Contrast Warning */}
        <div className={`mt-3 p-3 rounded-lg border-l-4 ${
          resolvedTheme === 'dark'
            ? 'bg-yellow-900/20 border-yellow-600 text-yellow-300'
            : 'bg-yellow-50 border-yellow-400 text-yellow-700'
        }`}>
          <div className="flex items-center">
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">
              Ensure good contrast between foreground and background colors for optimal scanning
            </span>
          </div>
        </div>

        {/* Quick Reset to Defaults */}
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => onOptionsChange({ 
              ...options, 
              foreground: '#000000', 
              background: '#ffffff' 
            })}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
              resolvedTheme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Reset to Default (Black & White)
          </button>
        </div>
      </div>
      
      {/* Include Margin */}
      <div className="flex items-center mt-4">
        <input
          type="checkbox"
          id="includeMargin"
          checked={options.includeMargin}
          onChange={(e) => onOptionsChange({ ...options, includeMargin: e.target.checked })}
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="includeMargin" className={`ml-2 text-sm ${
          resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Include Quiet Zone (margin around the QR code)
        </label>
      </div>
      <p className={`text-xs mt-1 ${
        resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        A quiet zone helps scanners identify your QR code clearly.
      </p>

      {/* Custom Size for Download */}
      <div>
        <label className={`block text-sm font-medium mb-1 ${
          resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>Custom Size for Download</label>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            min="128"
            max="4096"
            step="8"
            value={customSize}
            onChange={(e) => onCustomSizeChange(parseInt(e.target.value) || 1024)}
            className={`w-24 px-3 py-2 rounded border focus:ring-blue-500 focus:border-blue-500 ${
              resolvedTheme === 'dark'
                ? 'bg-gray-600 text-gray-100 border-gray-500'
                : 'bg-white text-gray-900 border-gray-300'
            }`}
          />
          <span className={`text-sm ${
            resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>pixels (preview shows a smaller version)</span>
        </div>
      </div>
    </div>
  )
}
