'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-slate-900 text-white p-4 border-b border-slate-800">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link 
            href="/" 
            className="text-xl font-bold hover:text-blue-400 transition-colors"
          >
            CloudFriends
          </Link>
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
          <div className="hidden md:flex gap-2">
            <NavLinks pathname={pathname} />
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-2">
            <NavLinks pathname={pathname} />
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <>
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
        href="/tools/pdf-tools" 
        className={`px-3 py-2 rounded-md transition-all ${
          pathname === '/tools/pdf-tools' 
            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
            : 'text-gray-300 hover:bg-slate-800'
        }`}
      >
        PDF Tools
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
    </>
  )
}