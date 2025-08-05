export type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard'
export type FileFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/svg+xml'
export type PreviewMode = 'plain'

export interface QROptions {
  size: number
  level: 'L' | 'M' | 'Q' | 'H'
  includeMargin: boolean
  foreground: string
  background: string
}

export interface SavedQRCode {
  id: string
  name: string
  type: QRType
  value: string
  options: QROptions
  dateCreated: string
}

export interface WifiForm {
  ssid: string
  password: string
  encryption: string
}

export interface VCardForm {
  firstName: string
  lastName: string
  phone: string
  email: string
  company: string
  title: string
  url: string
}

export interface ColorPalette {
  name: string
  fg: string
  bg: string
}
