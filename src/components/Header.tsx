'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()

  return (
    <nav className="bg-slate-900 text-white p-4 border-b border-slate-800">
      <div className="container mx-auto flex justify-between items-center">
        <Link 
          href="/" 
          className="text-xl font-bold hover:text-blue-400 transition-colors"
        >
          CloudFriends
        </Link>
        <div className="flex gap-2">
          <Link 
            href="/tools/password-generator" 
            className={`px-3 py-2 rounded-md transition-all ${
              pathname === '/tools/password-generator' 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
                : 'text-gray-300 hover:bg-slate-800'
            }`}
          >
            Password Generator
          </Link>
          <Link 
            href="/tools/qr-generator" 
            className={`px-3 py-2 rounded-md transition-all ${
              pathname === '/tools/qr-generator' 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
                : 'text-gray-300 hover:bg-slate-800'
            }`}
          >
            QR Generator
          </Link>
          <Link 
            href="/tools/image-converter" 
            className={`px-3 py-2 rounded-md transition-all ${
              pathname === '/tools/image-converter' 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
                : 'text-gray-300 hover:bg-slate-800'
            }`}
          >
            Image Converter
          </Link>
          <Link 
            href="/about" 
            className={`px-3 py-2 rounded-md transition-all ${
              pathname === '/about' 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
                : 'text-gray-300 hover:bg-slate-800'
            }`}
          >
            About
          </Link>
        </div>
      </div>
    </nav>
  )
}