import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: () => void
  description?: string
  preventDefault?: boolean
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
      const altMatches = !!shortcut.altKey === event.altKey
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey
      const metaMatches = !!shortcut.metaKey === event.metaKey

      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault()
        }
        shortcut.action()
        break
      }
    }
  }, [shortcuts, enabled])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

export function useGlobalKeyboardShortcuts() {
  useKeyboardShortcuts([
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="search" i]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: 'Focus search'
    },
    {
      key: 'Escape',
      action: () => {
        // Close any open modals
        const modalCloseButtons = document.querySelectorAll('[data-modal-close]')
        modalCloseButtons.forEach(button => {
          if (button instanceof HTMLElement) {
            button.click()
          }
        })
        
        // Clear focused elements
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
      },
      description: 'Close modals and clear focus'
    },
    {
      key: '?',
      shiftKey: true,
      action: () => {
        // Show keyboard shortcuts help
        console.log('Keyboard shortcuts help would open here')
      },
      description: 'Show keyboard shortcuts help'
    }
  ])
}

// Hook for common clipboard operations
export function useClipboardShortcuts(
  onCopy?: () => void,
  onPaste?: (text: string) => void,
  onCut?: () => void
) {
  useKeyboardShortcuts([
    {
      key: 'c',
      ctrlKey: true,
      action: () => onCopy?.(),
      description: 'Copy',
      preventDefault: false // Let default behavior handle it first
    },
    {
      key: 'v',
      ctrlKey: true,
      action: async () => {
        if (onPaste) {
          try {
            const text = await navigator.clipboard.readText()
            onPaste(text)
          } catch (error) {
            console.warn('Could not read clipboard:', error)
          }
        }
      },
      description: 'Paste',
      preventDefault: false
    },
    {
      key: 'x',
      ctrlKey: true,
      action: () => onCut?.(),
      description: 'Cut',
      preventDefault: false
    }
  ])
}
