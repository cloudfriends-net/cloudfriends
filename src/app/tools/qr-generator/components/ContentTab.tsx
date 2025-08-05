'use client'

import { QRType, WifiForm, VCardForm } from '../types'
import { QR_TYPE_INFO } from '../constants'
import { useThemeContext } from '../../../../components/ThemeProvider'

interface ContentTabProps {
  qrType: QRType
  qrValue: string
  wifiForm: WifiForm
  vcardForm: VCardForm
  onQRTypeChange: (type: QRType) => void
  onQRValueChange: (value: string) => void
  onWifiFormChange: (form: WifiForm) => void
  onVCardFormChange: (form: VCardForm) => void
}

export default function ContentTab({
  qrType,
  qrValue,
  wifiForm,
  vcardForm,
  onQRTypeChange,
  onQRValueChange,
  onWifiFormChange,
  onVCardFormChange
}: ContentTabProps) {
  const { resolvedTheme } = useThemeContext()
  
  return (
    <div className="space-y-5">
      <div>
        <label className={`block text-sm font-medium mb-1 ${
          resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>QR Code Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {(Object.entries(QR_TYPE_INFO) as [QRType, typeof QR_TYPE_INFO.url][]).map(([type, info]) => (
            <button
              key={type}
              onClick={() => onQRTypeChange(type)}
              className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center transition-colors ${
                qrType === type
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : resolvedTheme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <info.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{info.title}</span>
            </button>
          ))}
        </div>
        
        <div className={`rounded-md p-3 mb-4 ${
          resolvedTheme === 'dark' 
            ? 'bg-blue-900/20 border border-blue-700' 
            : 'bg-blue-50'
        }`}>
          <p className={`text-sm ${
            resolvedTheme === 'dark' ? 'text-blue-300' : 'text-blue-800'
          }`}>
            {QR_TYPE_INFO[qrType].description}
          </p>
        </div>
      </div>

      {/* WiFi Form */}
      {qrType === 'wifi' && (
        <div className={`space-y-4 p-4 rounded-lg border ${
          resolvedTheme === 'dark' 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Network Name (SSID)</label>
            <input
              type="text"
              placeholder="Enter WiFi network name"
              value={wifiForm.ssid}
              onChange={(e) => onWifiFormChange({ ...wifiForm, ssid: e.target.value })}
              className={`w-full px-3 py-2 rounded border focus:ring-blue-500 focus:border-blue-500 ${
                resolvedTheme === 'dark'
                  ? 'bg-gray-600 text-gray-100 border-gray-500 placeholder-gray-400'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Password</label>
            <input
              type="password"
              placeholder="Enter WiFi password"
              value={wifiForm.password}
              onChange={(e) => onWifiFormChange({ ...wifiForm, password: e.target.value })}
              className={`w-full px-3 py-2 rounded border focus:ring-blue-500 focus:border-blue-500 ${
                resolvedTheme === 'dark'
                  ? 'bg-gray-600 text-gray-100 border-gray-500 placeholder-gray-400'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Security Type</label>
            <select
              value={wifiForm.encryption}
              onChange={(e) => onWifiFormChange({ ...wifiForm, encryption: e.target.value })}
              className={`w-full px-3 py-2 rounded border focus:ring-blue-500 focus:border-blue-500 ${
                resolvedTheme === 'dark'
                  ? 'bg-gray-600 text-gray-100 border-gray-500'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            >
              <option value="WPA">WPA/WPA2/WPA3</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No Password</option>
            </select>
          </div>
        </div>
      )}

      {/* VCard Form */}
      {qrType === 'vcard' && (
        <div className={`space-y-4 p-4 rounded-lg border ${
          resolvedTheme === 'dark' 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>First Name</label>
              <input
                type="text"
                placeholder="First Name"
                value={vcardForm.firstName}
                onChange={(e) => onVCardFormChange({ ...vcardForm, firstName: e.target.value })}
                className={`w-full px-3 py-2 rounded border focus:ring-blue-500 focus:border-blue-500 ${
                  resolvedTheme === 'dark'
                    ? 'bg-gray-600 text-gray-100 border-gray-500 placeholder-gray-400'
                    : 'bg-white text-gray-900 border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Last Name</label>
              <input
                type="text"
                placeholder="Last Name"
                value={vcardForm.lastName}
                onChange={(e) => onVCardFormChange({ ...vcardForm, lastName: e.target.value })}
                className={`w-full px-3 py-2 rounded border focus:ring-blue-500 focus:border-blue-500 ${
                  resolvedTheme === 'dark'
                    ? 'bg-gray-600 text-gray-100 border-gray-500 placeholder-gray-400'
                    : 'bg-white text-gray-900 border-gray-300'
                }`}
              />
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Phone Number</label>
            <input
              type="tel"
              placeholder="Phone Number"
              value={vcardForm.phone}
              onChange={(e) => onVCardFormChange({ ...vcardForm, phone: e.target.value })}
              className={`w-full px-3 py-2 rounded border focus:ring-blue-500 focus:border-blue-500 ${
                resolvedTheme === 'dark'
                  ? 'bg-gray-600 text-gray-100 border-gray-500 placeholder-gray-400'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Email Address</label>
            <input
              type="email"
              placeholder="Email Address"
              value={vcardForm.email}
              onChange={(e) => onVCardFormChange({ ...vcardForm, email: e.target.value })}
              className={`w-full px-3 py-2 rounded border focus:ring-blue-500 focus:border-blue-500 ${
                resolvedTheme === 'dark'
                  ? 'bg-gray-600 text-gray-100 border-gray-500 placeholder-gray-400'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Company</label>
            <input
              type="text"
              placeholder="Company"
              value={vcardForm.company}
              onChange={(e) => onVCardFormChange({ ...vcardForm, company: e.target.value })}
              className={`w-full px-3 py-2 rounded border focus:ring-blue-500 focus:border-blue-500 ${
                resolvedTheme === 'dark'
                  ? 'bg-gray-600 text-gray-100 border-gray-500 placeholder-gray-400'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Job Title</label>
            <input
              type="text"
              placeholder="Job Title"
              value={vcardForm.title}
              onChange={(e) => onVCardFormChange({ ...vcardForm, title: e.target.value })}
              className={`w-full px-3 py-2 rounded border focus:ring-blue-500 focus:border-blue-500 ${
                resolvedTheme === 'dark'
                  ? 'bg-gray-600 text-gray-100 border-gray-500 placeholder-gray-400'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Website URL</label>
            <input
              type="url"
              placeholder="Website URL"
              value={vcardForm.url}
              onChange={(e) => onVCardFormChange({ ...vcardForm, url: e.target.value })}
              className={`w-full px-3 py-2 rounded border focus:ring-blue-500 focus:border-blue-500 ${
                resolvedTheme === 'dark'
                  ? 'bg-gray-600 text-gray-100 border-gray-500 placeholder-gray-400'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            />
          </div>
        </div>
      )}

      {/* Simple input for other types */}
      {qrType !== 'wifi' && qrType !== 'vcard' && (
        <div>
          <label className={`block text-sm font-medium mb-1 ${
            resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {QR_TYPE_INFO[qrType].title}
          </label>
          <input
            type={qrType === 'email' ? 'email' : qrType === 'url' ? 'url' : qrType === 'phone' ? 'tel' : 'text'}
            placeholder={QR_TYPE_INFO[qrType].placeholder}
            value={qrValue}
            onChange={(e) => onQRValueChange(e.target.value)}
            className={`w-full px-3 py-2 rounded border focus:ring-blue-500 focus:border-blue-500 ${
              resolvedTheme === 'dark'
                ? 'bg-gray-600 text-gray-100 border-gray-500 placeholder-gray-400'
                : 'bg-white text-gray-900 border-gray-300'
            }`}
          />
        </div>
      )}
    </div>
  )
}
