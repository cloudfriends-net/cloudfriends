import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  PhotoIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ServerIcon,
  CalculatorIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useDeviceDetection } from '../hooks/useMobile'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  badge?: string
  isNew?: boolean
}

interface NavGroup {
  name: string
  items: NavItem[]
  icon?: React.ComponentType<{ className?: string }>
  collapsible?: boolean
}

const navigationGroups: NavGroup[] = [
  {
    name: 'Home',
    items: [
      {
        name: 'Dashboard',
        href: '/',
        icon: HomeIcon,
        description: 'Main dashboard'
      }
    ]
  },
  {
    name: 'Text & Data',
    collapsible: true,
    icon: DocumentTextIcon,
    items: [
      {
        name: 'Text Tools',
        href: '/tools/text-tools',
        icon: DocumentTextIcon,
        description: 'Text manipulation utilities'
      },
      {
        name: 'Regex Tools',
        href: '/tools/regex-tools',
        icon: WrenchScrewdriverIcon,
        description: 'Regular expression tester'
      }
    ]
  },
  {
    name: 'Generators',
    collapsible: true,
    icon: WrenchScrewdriverIcon,
    items: [
      {
        name: 'Password Generator',
        href: '/tools/password-generator',
        icon: LockClosedIcon,
        description: 'Generate secure passwords'
      },
      {
        name: 'QR Generator',
        href: '/tools/qr-generator',
        icon: GlobeAltIcon,
        description: 'Create QR codes'
      }
    ]
  },
  {
    name: 'Media & Files',
    collapsible: true,
    icon: PhotoIcon,
    items: [
      {
        name: 'Image Converter',
        href: '/tools/image-converter',
        icon: PhotoIcon,
        description: 'Convert image formats'
      },
      {
        name: 'PDF Tools',
        href: '/tools/pdf-tools',
        icon: DocumentTextIcon,
        description: 'PDF manipulation tools'
      }
    ]
  },
  {
    name: 'Network & System',
    collapsible: true,
    icon: ServerIcon,
    items: [
      {
        name: 'Subnet Calculator',
        href: '/tools/subnet-calculator',
        icon: CalculatorIcon,
        description: 'Calculate network subnets'
      },
      {
        name: 'Docker Compose',
        href: '/tools/docker-compose',
        icon: ServerIcon,
        description: 'Docker compose generator'
      },
      {
        name: 'KACE Rule Builder',
        href: '/tools/kace-cir',
        icon: WrenchScrewdriverIcon,
        description: 'Custom inventory rules'
      },
      {
        name: 'Rack Planner',
        href: '/tools/rack-planner',
        icon: ServerIcon,
        description: 'Plan server racks'
      }
    ]
  }
]

interface EnhancedSidebarProps {
  className?: string
}

export function EnhancedSidebar({ className = '' }: EnhancedSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const pathname = usePathname()
  const { isMobile } = useDeviceDetection()

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    }
  }, [pathname, isMobile])

  // Handle group collapse/expand
  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupName)) {
        newSet.delete(groupName)
      } else {
        newSet.add(groupName)
      }
      return newSet
    })
  }

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const hasActiveChild = (items: NavItem[]) => {
    return items.some(item => isActiveRoute(item.href))
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Web Tools</h2>
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-md"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1">
          {navigationGroups.map((group) => {
            const isCollapsed = collapsedGroups.has(group.name)
            const hasActive = hasActiveChild(group.items)

            return (
              <div key={group.name}>
                {/* Group Header */}
                {group.collapsible ? (
                  <button
                    onClick={() => toggleGroup(group.name)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-sm font-medium
                      hover:bg-gray-800 transition-colors
                      ${hasActive ? 'text-blue-300' : 'text-gray-300'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {group.icon && <group.icon className="h-4 w-4" />}
                      <span>{group.name}</span>
                    </div>
                    {isCollapsed ? (
                      <ChevronRightIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {group.name}
                  </div>
                )}

                {/* Group Items */}
                {(!group.collapsible || !isCollapsed) && (
                  <div className={group.collapsible ? 'ml-4' : ''}>
                    {group.items.map((item) => {
                      const isActive = isActiveRoute(item.href)
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`
                            group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md mx-2
                            transition-colors relative
                            ${isActive
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }
                          `}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate">{item.name}</span>
                              {item.isNew && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  New
                                </span>
                              )}
                              {item.badge && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <div className="text-xs text-gray-400 truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Web Tools v1.0</span>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md shadow-lg lg:hidden"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        {/* Mobile Sidebar Overlay */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="fixed top-0 left-0 h-full w-80 z-50">
              <SidebarContent />
            </div>
          </>
        )}
      </>
    )
  }

  // Desktop Sidebar
  return (
    <div className={`w-64 h-screen sticky top-0 ${className}`}>
      <SidebarContent />
    </div>
  )
}

// Hook for getting current navigation state
export function useNavigation() {
  const pathname = usePathname()
  
  const currentTool = navigationGroups
    .flatMap(group => group.items)
    .find(item => pathname.startsWith(item.href) && item.href !== '/')

  const currentGroup = navigationGroups
    .find(group => group.items.some(item => pathname.startsWith(item.href) && item.href !== '/'))

  return {
    currentTool,
    currentGroup,
    pathname,
    navigationGroups
  }
}
