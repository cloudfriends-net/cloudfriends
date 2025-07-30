'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon, HomeIcon, InformationCircleIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'
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
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)

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
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-dark.png"
            alt="CloudFriends Logo"
            width={200}
            height={32}
            priority
            className="rounded"
          />
        </Link>
        <button
          className="ml-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md p-2 text-white hover:shadow-md transition-all"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Hide sidebar" : "Show sidebar"}
        >
          {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
        </button>
      </div>
      
      {/* Sidebar */}
      <aside
        className={`
          bg-white border-r border-gray-200 h-screen flex flex-col
          md:sticky md:top-0 md:h-screen md:overflow-y-auto md:w-72
          fixed md:static z-30 transition-all duration-300 w-64
          shadow-lg md:shadow-none
          transform-gpu
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          top-0 left-0
        `}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent opacity-50 pointer-events-none"></div>
        
        {/* Content container */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo at the very top */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-white">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image
                src="/logo-dark.png"
                alt="CloudFriends Logo"
                width={250}
                height={36}
                priority
                className="rounded"
              />
            </Link>
            <button
              className="md:hidden bg-white text-gray-500 rounded-md p-1"
              onClick={() => setOpen(false)}
              aria-label="Hide sidebar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Search */}
          <div className="p-4 pb-2">
            <div className="relative group">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-3 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search tools..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Tools Category */}
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 px-2 mb-2">
              <RocketLaunchIcon className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tools</span>
            </div>
          </div>
          
          {/* Tools List */}
          <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-4">
            {filteredTools.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                  <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm font-medium">No tools found for &rdquo;{search}&rdquo;</p>
                <button 
                  onClick={() => setSearch('')}
                  className="mt-2 text-blue-500 text-sm hover:text-blue-700 transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}
            
            <div className="space-y-1">
              {filteredTools.map(tool => (
                <Link
                  key={tool.path}
                  href={tool.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                    ${pathname === tool.path
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                      : 'hover:bg-blue-50 text-gray-700'
                    }
                  `}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setHoveredTool(tool.name)}
                  onMouseLeave={() => setHoveredTool(null)}
                >
                  {/* Tool Icon */}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-md
                      ${pathname === tool.path 
                        ? 'bg-white/20 text-white' 
                        : hoveredTool === tool.name 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-500'
                      }
                      transition-all
                    `}
                  >
                    <span className="text-xs font-bold">
                      {tool.name.charAt(0)}
                    </span>
                  </div>
                  <span className={`truncate font-medium ${pathname === tool.path ? 'font-semibold' : ''}`}>
                    {tool.name}
                  </span>
                </Link>
              ))}
            </div>
          </nav>
          
          {/* Divider and Main Navigation Links */}
          <div className="mt-4 mb-4 border-t border-gray-200 pt-4 px-4">
            <div className="flex items-center gap-2 px-2 mb-2">
              <InformationCircleIcon className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Navigation</span>
            </div>
            
            <div className="space-y-1">
              <Link
                href="/"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${pathname === '/'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                    : 'hover:bg-blue-50 text-gray-700'
                  }
                `}
                onClick={() => setOpen(false)}
              >
                <HomeIcon className={`h-5 w-5 ${pathname === '/' ? 'text-white' : 'text-gray-500'}`} />
                <span className="font-medium">Home</span>
              </Link>
              
              <Link
                href="/about"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${pathname === '/about'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                    : 'hover:bg-blue-50 text-gray-700'
                  }
                `}
                onClick={() => setOpen(false)}
              >
                <InformationCircleIcon className={`h-5 w-5 ${pathname === '/about' ? 'text-white' : 'text-gray-500'}`} />
                <span className="font-medium">About</span>
              </Link>
            </div>
          </div>
          
          {/* Removed Pro Version section */}
        </div>
      </aside>
      
      {/* Overlay for mobile when sidebar is open */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm transition-all"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
