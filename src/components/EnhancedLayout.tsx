'use client'

import React, { useEffect, useState } from 'react'
import { EnhancedSidebar } from './EnhancedSidebar'
import { useCommandPalette } from './CommandPalette'
import { ToastProvider } from './Toast'
import { ErrorBoundary } from './ErrorBoundary'
import { useAnnouncements } from '../hooks/useAccessibility'
import { usePWAInstall, useOfflineStatus } from '../hooks/usePWA'
import { useDeviceDetection } from '../hooks/useMobile'
import { 
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  PhotoIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ServerIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline'

interface EnhancedLayoutProps {
  children: React.ReactNode
}

// Define commands for the command palette
const commands = [
  {
    id: 'password-generator',
    label: 'Password Generator',
    description: 'Generate secure passwords',
    icon: <LockClosedIcon className="h-4 w-4" />,
    action: () => window.location.href = '/tools/password-generator',
    keywords: ['password', 'security', 'generate'],
    group: 'Generators'
  },
  {
    id: 'qr-generator',
    label: 'QR Code Generator',
    description: 'Create QR codes',
    icon: <GlobeAltIcon className="h-4 w-4" />,
    action: () => window.location.href = '/tools/qr-generator',
    keywords: ['qr', 'code', 'generate'],
    group: 'Generators'
  },
  {
    id: 'text-tools',
    label: 'Text Tools',
    description: 'Text manipulation utilities',
    icon: <DocumentTextIcon className="h-4 w-4" />,
    action: () => window.location.href = '/tools/text-tools',
    keywords: ['text', 'string', 'format'],
    group: 'Text & Data'
  },
  {
    id: 'regex-tools',
    label: 'Regex Tools',
    description: 'Regular expression tester',
    icon: <WrenchScrewdriverIcon className="h-4 w-4" />,
    action: () => window.location.href = '/tools/regex-tools',
    keywords: ['regex', 'pattern', 'match'],
    group: 'Text & Data'
  },
  {
    id: 'image-converter',
    label: 'Image Converter',
    description: 'Convert image formats',
    icon: <PhotoIcon className="h-4 w-4" />,
    action: () => window.location.href = '/tools/image-converter',
    keywords: ['image', 'convert', 'format'],
    group: 'Media & Files'
  },
  {
    id: 'pdf-tools',
    label: 'PDF Tools',
    description: 'PDF manipulation tools',
    icon: <DocumentTextIcon className="h-4 w-4" />,
    action: () => window.location.href = '/tools/pdf-tools',
    keywords: ['pdf', 'document', 'convert'],
    group: 'Media & Files'
  },
  {
    id: 'subnet-calculator',
    label: 'Subnet Calculator',
    description: 'Calculate network subnets',
    icon: <CalculatorIcon className="h-4 w-4" />,
    action: () => window.location.href = '/tools/subnet-calculator',
    keywords: ['subnet', 'network', 'calculate'],
    group: 'Network & System'
  },
  {
    id: 'docker-compose',
    label: 'Docker Compose',
    description: 'Docker compose generator',
    icon: <ServerIcon className="h-4 w-4" />,
    action: () => window.location.href = '/tools/docker-compose',
    keywords: ['docker', 'compose', 'container'],
    group: 'Network & System'
  },
  {
    id: 'kace-cir',
    label: 'KACE Rule Builder',
    description: 'Custom inventory rules',
    icon: <WrenchScrewdriverIcon className="h-4 w-4" />,
    action: () => window.location.href = '/tools/kace-cir',
    keywords: ['kace', 'inventory', 'rules'],
    group: 'Network & System'
  },
  {
    id: 'rack-planner',
    label: 'Rack Planner',
    description: 'Plan server racks',
    icon: <ServerIcon className="h-4 w-4" />,
    action: () => window.location.href = '/tools/rack-planner',
    keywords: ['rack', 'server', 'plan'],
    group: 'Network & System'
  }
]

export function EnhancedLayout({ children }: EnhancedLayoutProps) {
  const { isMobile } = useDeviceDetection()
  const { isInstallable, installApp } = usePWAInstall()
  const { isOnline, wasOffline } = useOfflineStatus()
  const { announce, AnnouncementRegion } = useAnnouncements()
  const { CommandPaletteComponent } = useCommandPalette(commands)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  // Show install prompt for PWA
  useEffect(() => {
    if (isInstallable && !localStorage.getItem('pwa-install-dismissed')) {
      setShowInstallPrompt(true)
    }
  }, [isInstallable])

  // Announce connectivity changes
  useEffect(() => {
    if (!isOnline) {
      announce('You are now offline. Some features may be limited.', 'assertive')
    } else if (wasOffline) {
      announce('You are back online.', 'polite')
    }
  }, [isOnline, wasOffline, announce])

  const handleInstallPWA = async () => {
    const success = await installApp()
    if (success) {
      announce('App installed successfully!', 'polite')
    }
    setShowInstallPrompt(false)
  }

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Skip Links for Accessibility */}
          <div className="sr-only focus-within:not-sr-only">
            <a
              href="#main-content"
              className="absolute top-0 left-0 z-50 bg-blue-600 text-white px-4 py-2 rounded-br-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Skip to main content
            </a>
            <a
              href="#navigation"
              className="absolute top-0 left-32 z-50 bg-blue-600 text-white px-4 py-2 rounded-br-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Skip to navigation
            </a>
          </div>

          <div className="flex">
            {/* Enhanced Sidebar Navigation */}
            <nav id="navigation" className="hidden lg:block">
              <EnhancedSidebar />
            </nav>

            {/* Mobile Navigation */}
            <EnhancedSidebar className="lg:hidden" />

            {/* Main Content */}
            <main id="main-content" className="flex-1 min-h-screen">
              {/* PWA Install Banner */}
              {showInstallPrompt && (
                <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                    Install Web Tools for quick access and offline use
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleInstallPWA}
                      className="text-sm bg-white text-blue-600 px-3 py-1 rounded font-medium hover:bg-gray-100"
                    >
                      Install
                    </button>
                    <button
                      onClick={dismissInstallPrompt}
                      className="text-sm text-blue-100 hover:text-white px-2"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Offline Banner */}
              {!isOnline && (
                <div className="bg-yellow-600 text-white px-4 py-2 text-center text-sm">
                You&apos;re offline. Some features may not work properly.
                </div>
              )}

              {/* Page Content */}
              <div className={`${isMobile ? 'pt-16' : ''}`}>
                {children}
              </div>
            </main>
          </div>

          {/* Command Palette */}
          <CommandPaletteComponent />

          {/* Announcement Region for Screen Readers */}
          {AnnouncementRegion()}

          {/* Loading indicator overlay */}
          <div id="loading-overlay" className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Loading...</span>
            </div>
          </div>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  )
}
