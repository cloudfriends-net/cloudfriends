import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Modal } from './Modal'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

interface Command {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  action: () => void
  keywords?: string[]
  group?: string
}

interface CommandPaletteProps {
  commands: Command[]
  isOpen: boolean
  onClose: () => void
  placeholder?: string
}

export function CommandPalette({
  commands,
  isOpen,
  onClose,
  placeholder = 'Type a command or search...'
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands

    const searchTerm = query.toLowerCase()
    return commands.filter(command => {
      const searchableText = [
        command.label,
        command.description || '',
        ...(command.keywords || [])
      ].join(' ').toLowerCase()

      return searchableText.includes(searchTerm)
    }).sort((a, b) => {
      // Prioritize exact matches in label
      const aLabelMatch = a.label.toLowerCase().startsWith(searchTerm)
      const bLabelMatch = b.label.toLowerCase().startsWith(searchTerm)
      
      if (aLabelMatch && !bLabelMatch) return -1
      if (!aLabelMatch && bLabelMatch) return 1
      
      return a.label.localeCompare(b.label)
    })
  }, [commands, query])

  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    
    filteredCommands.forEach(command => {
      const group = command.group || 'Commands'
      if (!groups[group]) groups[group] = []
      groups[group].push(command)
    })
    
    return groups
  }, [filteredCommands])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredCommands])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          onClose()
          setQuery('')
        }
        break
      case 'Escape':
        onClose()
        setQuery('')
        break
    }
  }, [isOpen, filteredCommands, selectedIndex, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const executeCommand = (command: Command) => {
    command.action()
    onClose()
    setQuery('')
  }

  const renderCommand = (command: Command, index: number, globalIndex: number) => (
    <div
      key={command.id}
      onClick={() => executeCommand(command)}
      className={`
        px-4 py-3 cursor-pointer flex items-center gap-3 border-l-2
        ${globalIndex === selectedIndex 
          ? 'bg-blue-50 border-blue-500 text-blue-700' 
          : 'border-transparent hover:bg-gray-50'
        }
      `}
    >
      {command.icon && (
        <div className="flex-shrink-0 w-5 h-5 text-gray-400">
          {command.icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900">
          {highlightMatch(command.label, query)}
        </div>
        {command.description && (
          <div className="text-sm text-gray-500 truncate">
            {highlightMatch(command.description, query)}
          </div>
        )}
      </div>
    </div>
  )

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
      className="mt-[10vh]"
    >
      <div className="border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 border border-gray-200 rounded text-xs text-gray-500">
            ESC
          </kbd>
        </div>
      </div>

      <div className="max-h-96 overflow-auto">
        {filteredCommands.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            {query.trim() ? 'No commands found' : 'Type to search commands'}
          </div>
        ) : (
          <div>
            {Object.entries(groupedCommands).map(([groupName, groupCommands]) => {
              let globalIndex = 0
              
              // Calculate global index for this group
              Object.entries(groupedCommands).forEach(([prevGroupName, prevCommands]) => {
                if (prevGroupName === groupName) return
                globalIndex += prevCommands.length
              })

              return (
                <div key={groupName}>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b">
                    {groupName}
                  </div>
                  {groupCommands.map((command, index) => {
                    const currentGlobalIndex = globalIndex + index
                    return renderCommand(command, index, currentGlobalIndex)
                  })}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="border-t px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 border border-gray-200 rounded text-xs">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 border border-gray-200 rounded text-xs">Enter</kbd>
            Select
          </span>
        </div>
        <span>{filteredCommands.length} commands</span>
      </div>
    </Modal>
  )
}

// Hook for managing command palette
export function useCommandPalette(commands: Command[]) {
  const [isOpen, setIsOpen] = useState(false)

  // Global shortcut to open command palette
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      action: () => setIsOpen(true),
      description: 'Open command palette'
    },
    {
      key: 'k',
      metaKey: true, // Cmd on Mac
      action: () => setIsOpen(true),
      description: 'Open command palette'
    }
  ])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  return {
    isOpen,
    open,
    close,
    CommandPaletteComponent: () => (
      <CommandPalette
        commands={commands}
        isOpen={isOpen}
        onClose={close}
      />
    )
  }
}
