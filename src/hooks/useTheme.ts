import { useState, useEffect, useCallback } from 'react'

export type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setTheme(savedTheme)
      }
    }
  }, [])

  // Listen to system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light')
      }
    }

    // Set initial resolved theme
    if (theme === 'system') {
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light')
    } else {
      setResolvedTheme(theme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [resolvedTheme])

  const setAndSaveTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }

    // Immediately resolve theme if not system
    if (newTheme !== 'system') {
      setResolvedTheme(newTheme)
    }
  }, [])

  return {
    theme,
    resolvedTheme,
    setTheme: setAndSaveTheme
  }
}

// Hook for component-specific theme preferences
export function useComponentTheme(componentName: string) {
  const [preferences, setPreferences] = useState<Record<string, any>>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`component-theme-${componentName}`)
      if (saved) {
        try {
          setPreferences(JSON.parse(saved))
        } catch (error) {
          console.warn(`Failed to parse theme preferences for ${componentName}:`, error)
        }
      }
    }
  }, [componentName])

  const updatePreference = useCallback((key: string, value: any) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value }
      if (typeof window !== 'undefined') {
        localStorage.setItem(`component-theme-${componentName}`, JSON.stringify(updated))
      }
      return updated
    })
  }, [componentName])

  const getPreference = useCallback((key: string, defaultValue?: any) => {
    return preferences[key] ?? defaultValue
  }, [preferences])

  return {
    preferences,
    updatePreference,
    getPreference
  }
}
