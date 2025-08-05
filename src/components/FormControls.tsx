import React, { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface MultiSelectProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  searchable?: boolean
  maxDisplayed?: number
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  searchable = false,
  maxDisplayed = 3,
  className = '',
  disabled = false
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  const selectedOptions = options.filter(option => value.includes(option.value))

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const displayText = () => {
    if (selectedOptions.length === 0) return placeholder
    if (selectedOptions.length <= maxDisplayed) {
      return selectedOptions.map(option => option.label).join(', ')
    }
    return `${selectedOptions.slice(0, maxDisplayed).map(option => option.label).join(', ')} +${selectedOptions.length - maxDisplayed} more`
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left border rounded-md bg-white
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
        `}
      >
        <div className="flex items-center justify-between">
          <span className={selectedOptions.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
            {displayText()}
          </span>
          <ChevronDownIcon
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {searchable && (
            <div className="p-2 border-b">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search options..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
          
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => !option.disabled && toggleOption(option.value)}
                  className={`
                    px-3 py-2 cursor-pointer flex items-center justify-between
                    ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                    ${value.includes(option.value) ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                  `}
                >
                  <span>{option.label}</span>
                  {value.includes(option.value) && (
                    <CheckIcon className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface ComboBoxProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  allowCustom?: boolean
  className?: string
  disabled?: boolean
}

export function ComboBox({
  options,
  value,
  onChange,
  placeholder = 'Type or select...',
  allowCustom = false,
  className = '',
  disabled = false
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  )

  useEffect(() => {
    const selectedOption = options.find(option => option.value === value)
    setInputValue(selectedOption?.label || value || '')
  }, [value, options])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setIsOpen(true)

    if (allowCustom) {
      onChange(newValue)
    }
  }

  const selectOption = (option: Option) => {
    onChange(option.value)
    setInputValue(option.label)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-md bg-white
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
        `}
      />

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {allowCustom ? 'Press Enter to add custom value' : 'No options found'}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => !option.disabled && selectOption(option)}
                className={`
                  px-3 py-2 cursor-pointer
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                  ${option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                `}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
