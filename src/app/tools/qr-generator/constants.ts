import { 
  LinkIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  WifiIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { ColorPalette } from './types'

export const QR_TYPE_INFO = {
  url: { 
    title: 'Website URL', 
    description: 'Create a QR code that opens a website when scanned',
    placeholder: 'https://example.com',
    icon: LinkIcon
  },
  text: { 
    title: 'Plain Text', 
    description: 'Display any text content when scanned',
    placeholder: 'Enter your text here',
    icon: DocumentTextIcon
  },
  email: { 
    title: 'Email Address', 
    description: 'Open email app with pre-filled recipient',
    placeholder: 'contact@example.com',
    icon: EnvelopeIcon
  },
  phone: { 
    title: 'Phone Number', 
    description: 'Dial a phone number when scanned',
    placeholder: '+1 (555) 123-4567',
    icon: PhoneIcon
  },
  wifi: { 
    title: 'WiFi Network', 
    description: 'Connect to WiFi network automatically',
    placeholder: '',
    icon: WifiIcon
  },
  vcard: { 
    title: 'Contact Card', 
    description: 'Share contact information to be saved in phone',
    placeholder: '',
    icon: UserCircleIcon
  }
} as const

export const COLOR_PALETTES: ColorPalette[] = [
  { name: 'Classic', fg: '#000000', bg: '#ffffff' },
  { name: 'Ocean', fg: '#1e40af', bg: '#dbeafe' },
  { name: 'Forest', fg: '#166534', bg: '#dcfce7' },
  { name: 'Sunset', fg: '#dc2626', bg: '#fef2f2' },
  { name: 'Purple', fg: '#7c3aed', bg: '#f3e8ff' },
  { name: 'Dark', fg: '#ffffff', bg: '#111827' },
  { name: 'Gold', fg: '#d97706', bg: '#fffbeb' },
  { name: 'Pink', fg: '#db2777', bg: '#fdf2f8' }
]
