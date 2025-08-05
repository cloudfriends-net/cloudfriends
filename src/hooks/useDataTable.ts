import { useState, useMemo, useCallback } from 'react'

// Hook for advanced search functionality
export function useSearch<T>(
  data: T[],
  searchFields: (keyof T)[],
  options: {
    fuzzy?: boolean
    caseSensitive?: boolean
    threshold?: number
  } = {}
) {
  const [query, setQuery] = useState('')
  const { fuzzy = false, caseSensitive = false, threshold = 0.6 } = options

  const searchResults = useMemo(() => {
    if (!query.trim()) return data

    const searchTerm = caseSensitive ? query : query.toLowerCase()

    return data.filter(item => {
      return searchFields.some(field => {
        const fieldValue = String(item[field] || '')
        const value = caseSensitive ? fieldValue : fieldValue.toLowerCase()

        if (fuzzy) {
          return fuzzyMatch(value, searchTerm, threshold)
        }

        return value.includes(searchTerm)
      })
    })
  }, [data, query, searchFields, fuzzy, caseSensitive, threshold])

  const highlightMatch = useCallback((text: string, query: string): string => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }, [])

  return {
    query,
    setQuery,
    results: searchResults,
    highlightMatch
  }
}

// Fuzzy matching algorithm
function fuzzyMatch(text: string, pattern: string, threshold: number): boolean {
  const textLength = text.length
  const patternLength = pattern.length

  if (patternLength === 0) return true
  if (textLength === 0) return false

  // Levenshtein distance calculation
  const matrix: number[][] = []

  for (let i = 0; i <= textLength; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= patternLength; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= textLength; i++) {
    for (let j = 1; j <= patternLength; j++) {
      if (text[i - 1] === pattern[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + 1  // substitution
        )
      }
    }
  }

  const distance = matrix[textLength][patternLength]
  const similarity = 1 - (distance / Math.max(textLength, patternLength))

  return similarity >= threshold
}

// Hook for filtering data with multiple criteria
export function useFilter<T>(data: T[]) {
  const [filters, setFilters] = useState<Record<string, any>>({})

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null || value === '') return true

        const itemValue = (item as any)[key]

        if (Array.isArray(value)) {
          return value.includes(itemValue)
        }

        if (typeof value === 'object' && value.min !== undefined || value.max !== undefined) {
          const numValue = Number(itemValue)
          if (value.min !== undefined && numValue < value.min) return false
          if (value.max !== undefined && numValue > value.max) return false
          return true
        }

        if (typeof value === 'string') {
          return String(itemValue).toLowerCase().includes(value.toLowerCase())
        }

        return itemValue === value
      })
    })
  }, [data, filters])

  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const removeFilter = useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  return {
    filteredData,
    filters,
    setFilter,
    removeFilter,
    clearFilters
  }
}

// Hook for sorting data
export function useSort<T>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null
    direction: 'asc' | 'desc'
  }>({
    key: null,
    direction: 'asc'
  })

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [data, sortConfig])

  const sort = useCallback((key: keyof T) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  const clearSort = useCallback(() => {
    setSortConfig({ key: null, direction: 'asc' })
  }, [])

  return {
    sortedData,
    sortConfig,
    sort,
    clearSort
  }
}

// Hook for pagination
export function usePagination<T>(data: T[], itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }, [totalPages])

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }, [])

  const goToFirst = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const goToLast = useCallback(() => {
    setCurrentPage(totalPages)
  }, [totalPages])

  // Reset to first page when data changes
  useMemo(() => {
    setCurrentPage(1)
  }, [data.length])

  return {
    currentData,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems: data.length,
    goToPage,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  }
}

// Combined hook for search, filter, sort, and pagination
export function useDataTable<T>(
  data: T[],
  searchFields: (keyof T)[],
  itemsPerPage = 10
) {
  const { query, setQuery, results: searchResults } = useSearch(data, searchFields)
  const { filteredData, filters, setFilter, removeFilter, clearFilters } = useFilter(searchResults)
  const { sortedData, sortConfig, sort, clearSort } = useSort(filteredData)
  const pagination = usePagination(sortedData, itemsPerPage)

  return {
    // Search
    query,
    setQuery,
    
    // Filter
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    
    // Sort
    sortConfig,
    sort,
    clearSort,
    
    // Pagination
    ...pagination,
    
    // Data
    data: pagination.currentData,
    totalFilteredItems: sortedData.length
  }
}
