const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'
const SIMILAR_CHARS = 'iIlL1oO0'


export const generatePassword = (options: {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
}): string => {
  let chars = ''
  if (options.includeLowercase) chars += LOWERCASE
  if (options.includeUppercase) chars += UPPERCASE
  if (options.includeNumbers) chars += NUMBERS
  if (options.includeSymbols) chars += SYMBOLS
  
  if (options.excludeSimilar) {
    chars = chars.split('').filter(char => !SIMILAR_CHARS.includes(char)).join('')
  }

  if (chars.length === 0) return ''

  let password = ''
  const array = new Uint32Array(options.length)
  crypto.getRandomValues(array)
  
  for (let i = 0; i < options.length; i++) {
    password += chars[array[i] % chars.length]
  }

  return password
}

export type PasswordStrength = {
  score: number // 0-4
  label: string
  color: string
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  let score = 0
  
  // Length check
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  
  // Complexity check
  const uniqueChars = new Set(password).size
  if (uniqueChars >= password.length * 0.7) score += 1
  
  score = Math.min(Math.floor(score / 2), 4)
  
  const strengths: Record<number, { label: string; color: string }> = {
    0: { label: 'Very Weak', color: 'text-red-500' },
    1: { label: 'Weak', color: 'text-orange-500' },
    2: { label: 'Moderate', color: 'text-yellow-500' },
    3: { label: 'Strong', color: 'text-green-500' },
    4: { label: 'Very Strong', color: 'text-emerald-500' }
  }

  return {
    score,
    ...strengths[score]
  }
}

// Update the generatePassphrase function to use the new word list
import { WORD_LIST } from './wordlist'

export const generatePassphrase = (options: {
  wordCount: number
  separator: string
  capitalize: boolean
  includeNumber: boolean
}): string => {
  const array = new Uint32Array(options.wordCount)
  crypto.getRandomValues(array)
  
  let words = Array.from(array).map(num => WORD_LIST[num % WORD_LIST.length])
  
  if (options.capitalize) {
    words = words.map(word => word.charAt(0).toUpperCase() + word.slice(1))
  }
  
  let passphrase = words.join(options.separator)
  
  if (options.includeNumber) {
    const number = Math.floor(Math.random() * 1000)
    passphrase += options.separator + number
  }
  
  return passphrase
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy text:', error)
    return false
  }
}

export const checkPassphraseStrength = (passphrase: string): PasswordStrength => {
  let score = 0
  
  // Word count/length check
  const wordCount = passphrase.split(/[-_. ]/).length
  if (wordCount >= 3) score += 1
  if (wordCount >= 4) score += 1
  if (passphrase.length >= 20) score += 1
  
  // Character variety checks
  if (/[A-Z]/.test(passphrase)) score += 1
  if (/[0-9]/.test(passphrase)) score += 1
  
  // Special character check (separators)
  if (/[-_.]/.test(passphrase)) score += 1
  
  score = Math.min(Math.floor(score / 2), 4)
  
  const strengths: Record<number, { label: string; color: string }> = {
    0: { label: 'Very Weak', color: 'text-red-500' },
    1: { label: 'Weak', color: 'text-orange-500' },
    2: { label: 'Moderate', color: 'text-yellow-500' },
    3: { label: 'Strong', color: 'text-green-500' },
    4: { label: 'Very Strong', color: 'text-emerald-500' }
  }

  return {
    score,
    ...strengths[score]
  }
}
