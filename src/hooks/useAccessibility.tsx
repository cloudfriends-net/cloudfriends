import { useEffect, useRef, useCallback, useState } from 'react'
import React from 'react'

// Hook for managing focus within modals
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    // Focus first element when modal opens
    firstElement?.focus()

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isActive])

  return containerRef
}

// Hook for announcing content to screen readers
export function useAnnouncements() {
  const announceRef = useRef<HTMLDivElement>(null)

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceRef.current) return

    announceRef.current.setAttribute('aria-live', priority)
    announceRef.current.textContent = message

    // Clear after announcement
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = ''
      }
    }, 1000)
  }, [])

  const AnnouncementRegion = useCallback(() => (
    <div
      ref={announceRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  ), [])

  return {
    announce,
    AnnouncementRegion
  }
}

// Hook for managing skip links
export function useSkipLinks() {
  const skipLinksRef = useRef<HTMLDivElement>(null)

  const SkipLinks = useCallback(() => (
    <div ref={skipLinksRef} className="sr-only focus-within:not-sr-only">
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
  ), [])

  return { SkipLinks }
}

// Hook for enhanced keyboard navigation
export function useKeyboardNavigation(items: HTMLElement[], isActive = true) {
  const currentIndexRef = useRef(0)

  const focusItem = useCallback((index: number) => {
    if (items[index]) {
      items[index].focus()
      currentIndexRef.current = index
    }
  }, [items])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || items.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        focusItem((currentIndexRef.current + 1) % items.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        focusItem((currentIndexRef.current - 1 + items.length) % items.length)
        break
      case 'Home':
        e.preventDefault()
        focusItem(0)
        break
      case 'End':
        e.preventDefault()
        focusItem(items.length - 1)
        break
    }
  }, [isActive, items, focusItem])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { focusItem }
}

// Hook for reduced motion preferences
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Hook for color contrast detection
export function useColorContrast() {
  const checkContrast = useCallback((foreground: string, background: string): number => {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }

    // Calculate relative luminance
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const fg = hexToRgb(foreground)
    const bg = hexToRgb(background)

    if (!fg || !bg) return 0

    const fgLum = getLuminance(fg.r, fg.g, fg.b)
    const bgLum = getLuminance(bg.r, bg.g, bg.b)

    const lighter = Math.max(fgLum, bgLum)
    const darker = Math.min(fgLum, bgLum)

    return (lighter + 0.05) / (darker + 0.05)
  }, [])

  const meetsWCAG = useCallback((ratio: number, level: 'AA' | 'AAA' = 'AA') => {
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7
  }, [])

  return { checkContrast, meetsWCAG }
}
