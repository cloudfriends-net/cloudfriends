'use client'

import React from 'react'
import { useThemeContext } from './ThemeProvider'
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon 
} from '@heroicons/react/24/outline'

interface ThemeAwareLayoutProps {
  children: React.ReactNode
  showThemeToggle?: boolean
}

export default function ThemeAwareLayout({ 
  children, 
  showThemeToggle = true 
}: ThemeAwareLayoutProps) {
  const { theme, resolvedTheme, setTheme } = useThemeContext()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon className="w-5 h-5" />
      case 'dark':
        return <MoonIcon className="w-5 h-5" />
      case 'system':
        return <ComputerDesktopIcon className="w-5 h-5" />
      default:
        return <SunIcon className="w-5 h-5" />
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'system':
        return 'System'
      default:
        return 'Light'
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      resolvedTheme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {showThemeToggle && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
              resolvedTheme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 border-gray-600 text-white'
                : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-900'
            } shadow-lg hover:shadow-xl`}
            title={`Current theme: ${getThemeLabel()}. Click to cycle through themes.`}
          >
            {getThemeIcon()}
            <span className="text-sm font-medium">{getThemeLabel()}</span>
          </button>
        </div>
      )}
      {children}
    </div>
  )
}
