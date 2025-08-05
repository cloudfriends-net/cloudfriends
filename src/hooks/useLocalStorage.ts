import { useState, useCallback } from 'react'

/**
 * Custom hook for localStorage with JSON serialization, error handling, and SSR safety
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    serialize?: boolean
  }
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const { serialize = true } = options || {}

  // Get initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      if (item === null) {
        return initialValue
      }

      if (serialize) {
        return JSON.parse(item)
      }
      return item as T
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Set value function
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        if (serialize) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } else {
          window.localStorage.setItem(key, valueToStore as string)
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, serialize, storedValue])

  // Remove value function
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

/**
 * Hook for managing localStorage with encryption (basic XOR for demo)
 */
export function useSecureLocalStorage<T>(
  key: string,
  initialValue: T,
  encryptionKey?: string
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const encrypt = useCallback((data: string): string => {
    if (!encryptionKey) return data
    let result = ''
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length)
      )
    }
    return btoa(result)
  }, [encryptionKey])

  const decrypt = useCallback((data: string): string => {
    if (!encryptionKey) return data
    try {
      const decoded = atob(data)
      let result = ''
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length)
        )
      }
      return result
    } catch {
      return data // Return as-is if decryption fails
    }
  }, [encryptionKey])

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      if (item === null) {
        return initialValue
      }

      const decrypted = decrypt(item)
      return JSON.parse(decrypted)
    } catch (error) {
      console.warn(`Error reading secure localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        const encrypted = encrypt(JSON.stringify(valueToStore))
        window.localStorage.setItem(key, encrypted)
      }
    } catch (error) {
      console.warn(`Error setting secure localStorage key "${key}":`, error)
    }
  }, [key, encrypt, storedValue])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing secure localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

/**
 * Hook for managing localStorage with compression
 */
export function useCompressedLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Simple compression using JSON + base64 (for demo - in production use proper compression)
  const compress = useCallback((data: string): string => {
    try {
      return btoa(data)
    } catch {
      return data
    }
  }, [])

  const decompress = useCallback((data: string): string => {
    try {
      return atob(data)
    } catch {
      return data
    }
  }, [])

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      if (item === null) {
        return initialValue
      }

      const decompressed = decompress(item)
      return JSON.parse(decompressed)
    } catch (error) {
      console.warn(`Error reading compressed localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        const compressed = compress(JSON.stringify(valueToStore))
        window.localStorage.setItem(key, compressed)
      }
    } catch (error) {
      console.warn(`Error setting compressed localStorage key "${key}":`, error)
    }
  }, [key, compress, storedValue])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing compressed localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
