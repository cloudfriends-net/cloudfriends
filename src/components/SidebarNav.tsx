'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

const tools = [
  { name: 'Password Generator', path: '/tools/password-generator', keywords: ['password', 'secure', 'generator'] },
  { name: 'QR Generator', path: '/tools/qr-generator', keywords: ['qr', 'code', 'generator'] },
  { name: 'Image Converter', path: '/tools/image-converter', keywords: ['image', 'convert', 'jpg', 'png'] },
  { name: 'PDF Tools', path: '/tools/pdf-tools', keywords: ['pdf', 'merge', 'split', 'convert'] },
  { name: 'Text Tools', path: '/tools/text-tools', keywords: ['text', 'case', 'clean', 'count'] },
  { name: 'Regex Tools', path: '/tools/regex-tools', keywords: ['regex', 'clean', 'pattern', 'match'] },
  { name: 'Subnet Calculator', path: '/tools/subnet-calculator', keywords: ['subnet', 'ip', 'network', 'cidr', 'calculator'] },
  { name: 'Docker Compose Generator', path: '/tools/docker-compose', keywords: ['docker', 'compose', 'yaml', 'container', 'generator'] },
  { name: 'Kace CIR Builder', path: '/tools/kace-cir', keywords: ['kace', 'quest', 'inventory', 'rule', 'builder', 'cir'] },
  { name: 'Rack Planner', path: '/tools/rack-planner', keywords: ['network', 'server', 'rack', 'planner'] }
]

export function SidebarNav() {
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth >= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.keywords.some(k => k.includes(search.toLowerCase()))
  )

  return (
    <>
      {/* Mobile top bar with logo and menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 flex items-center h-16 px-4 shadow-sm">
        <Link href="/" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
          <Image
            src="/logo-dark.png"
            alt="CloudFriends Logo"
            width={250}
            height={32}
            priority
            className="rounded"
          />
        </Link>
        <button
          className="ml-auto bg-white border border-gray-300 rounded-md p-2 text-gray-700"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Hide sidebar" : "Show sidebar"}
        >
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>
      {/* Sidebar */}
      <aside
        className={`
          bg-white border-r border-gray-200 h-screen w-64 flex flex-col pt-0 pb-6
          md:sticky md:top-0 md:h-screen md:overflow-y-auto
          fixed md:static z-30 transition-transform duration-200
          px-4
          transform-gpu
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          top-0 left-0
        `}
      >
        {/* Logo at the very top (hidden on mobile, visible on desktop) */}
        <div className="hidden md:flex items-center gap-2 h-20 px-2 border-b border-gray-200 mb-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 hover:text-blue-500 transition-colors"
          >
            <Image
              src="/logo-dark.png"
              alt="CloudFriends Logo"
              width={250}
              height={36}
              priority
            />
            <span className="sr-only">CloudFriends Home</span>
          </Link>
        </div>
        {/* Search */}
        <div className="mb-4 mt-20 md:mt-0">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded bg-gray-100 text-gray-700 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* Tools List */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-2">
          {filteredTools.length === 0 && (
            <span className="text-gray-500 px-2 py-1 text-sm font-light">No tools found.</span>
          )}
          {filteredTools.map(tool => (
            <Link
              key={tool.path}
              href={tool.path}
              className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all font-[Outfit] text-sm ${
                pathname === tool.path
                  ? 'bg-blue-100 text-blue-600 border border-blue-200'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              onClick={() => setOpen(false)}
            >
              {/* Compact Icon */}
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-md ${
                  pathname === tool.path ? 'bg-blue-200' : 'bg-gray-100'
                }`}
              >
                <span className="text-xs font-bold text-gray-500">
                  {tool.name.charAt(0)}
                </span>
              </div>
              <span className="truncate font-medium">{tool.name}</span>
            </Link>
          ))}
        </nav>
        {/* Divider and Main Navigation Links */}
        <div className="mt-8 border-t border-gray-200 pt-6 flex flex-col gap-2 px-1">
          <Link
            href="/"
            className={`px-4 py-3 rounded-md transition-all font-[Outfit] text-base font-normal flex items-center gap-2 ${
              pathname === '/'
                ? 'bg-blue-100 text-blue-600 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`px-4 py-3 rounded-md transition-all font-[Outfit] text-base font-normal flex items-center gap-2 ${
              pathname === '/about'
                ? 'bg-blue-100 text-blue-600 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setOpen(false)}
          >
            About
          </Link>
        </div>
      </aside>
      {/* Overlay for mobile when sidebar is open */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
