'use client'

import { useState, useEffect } from 'react'
import { KeyIcon, EyeIcon, EyeSlashIcon, ArrowPathIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { generatePassword, generatePassphrase, checkPasswordStrength, checkPassphraseStrength, copyToClipboard } from './utils'
import { StrengthIndicator } from './components/StrengthIndicator'
import { motion, AnimatePresence } from 'framer-motion'

type GeneratorType = 'password' | 'passphrase'
type PasswordHistoryItem = { value: string; timestamp: number; type: GeneratorType }

export default function PasswordGenerator() {
  const [generatorType, setGeneratorType] = useState<GeneratorType>('password')
  const [password, setPassword] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistoryItem[]>([])

  // Enhanced password options
  const [passwordOptions, setPasswordOptions] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    includeEmoji: false,
    pronounceable: false,
  })

  const [passphraseOptions, setPassphraseOptions] = useState({
    wordCount: 4,
    separator: '-',
    capitalize: true,
    includeNumber: true,
    includeSpecial: false,
  })

  // Auto-generate on initial load and when options change
  useEffect(() => {
    if (generatorType === 'password') {
      handleGeneratePassword();
    } else {
      handleGeneratePassphrase();
    }
  }, [generatorType, passwordOptions.length, passphraseOptions.wordCount]);

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(passwordOptions)
    setPassword(newPassword)
    addToHistory(newPassword, 'password')
  }

  const handleGeneratePassphrase = () => {
    const newPassphrase = generatePassphrase(passphraseOptions)
    setPassphrase(newPassphrase)
    addToHistory(newPassphrase, 'passphrase')
  }

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  const addToHistory = (value: string, type: GeneratorType) => {
    setPasswordHistory(prev => {
      const newHistory = [{ value, timestamp: Date.now(), type }, ...prev.slice(0, 4)]
      return newHistory
    })
  }
  
  const getCurrentPassword = () => generatorType === 'password' ? password : passphrase
  const getCurrentStrength = () => generatorType === 'password' 
    ? checkPasswordStrength(password) 
    : checkPassphraseStrength(passphrase)

  return (
    <div
      className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center"
      style={{ paddingTop: '5.5rem' }}
    >
      <div className="w-full max-w-2xl mx-auto px-4">
        {/* Title */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <KeyIcon className="h-12 w-12 text-blue-500 inline-block" />
            <h1 className="text-3xl font-bold mt-3">Secure Password Generator</h1>
            <p className="mt-2 text-gray-600">Create strong, unique passwords and passphrases</p>
          </motion.div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-6 mb-6">
          {/* Generator type tabs */}
          <div className="flex justify-center mb-6 gap-2">
            <button
              onClick={() => {
                setGeneratorType('password')
                setPassword('')
                setPassphrase('')
              }}
              className={`px-6 py-3 rounded-lg text-base font-semibold transition-all ${
                generatorType === 'password'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => {
                setGeneratorType('passphrase')
                setPassword('')
                setPassphrase('')
              }}
              className={`px-6 py-3 rounded-lg text-base font-semibold transition-all ${
                generatorType === 'passphrase'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Passphrase
            </button>
          </div>
          
          {/* Output field always at top for better UX */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={`output-${generatorType}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <div>
                <h3 className="text-lg font-semibold mb-2">Your {generatorType}</h3>
                <div className="flex w-full mb-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={getCurrentPassword()}
                    readOnly
                    className="w-full px-4 py-3 text-lg font-mono rounded-l-lg bg-gray-100 text-gray-900"
                    aria-label={`Generated ${generatorType}`}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 bg-gray-100 hover:bg-gray-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? 
                      <EyeSlashIcon className="h-5 w-5" /> : 
                      <EyeIcon className="h-5 w-5" />
                    }
                  </button>
                  <button
                    onClick={() => generatorType === 'password' ? handleGeneratePassword() : handleGeneratePassphrase()}
                    className="px-3 bg-gray-100 hover:bg-gray-200"
                    aria-label="Generate new"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleCopy(getCurrentPassword())}
                    className="px-4 py-2 rounded-r-lg font-semibold transition-colors bg-blue-500 hover:bg-blue-600 text-white"
                    aria-label="Copy to clipboard"
                  >
                    {copied ? 'Copied!' : <ClipboardDocumentIcon className="h-5 w-5" />}
                  </button>
                </div>
                <StrengthIndicator strength={getCurrentStrength()} className="w-full" />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Options panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`options-${generatorType}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              {generatorType === 'password' ? (
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between">
                      <label className="block text-sm font-semibold mb-1">
                        Length
                      </label>
                      <span className="text-sm px-2 py-1 rounded-full bg-gray-200">
                        {passwordOptions.length} chars
                      </span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="128"
                      value={passwordOptions.length}
                      onChange={(e) =>
                        setPasswordOptions({
                          ...passwordOptions,
                          length: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs opacity-60">
                      <span>8</span>
                      <span>32</span>
                      <span>64</span>
                      <span>96</span>
                      <span>128</span>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      {
                        key: 'includeUppercase',
                        label: 'Uppercase (A-Z)',
                      },
                      {
                        key: 'includeLowercase',
                        label: 'Lowercase (a-z)',
                      },
                      {
                        key: 'includeNumbers',
                        label: 'Numbers (0-9)',
                      },
                      {
                        key: 'includeSymbols',
                        label: 'Symbols (!@#$...)',
                      },
                      {
                        key: 'excludeSimilar',
                        label: 'No similar chars (i, l, 1, O, 0)',
                      },
                      {
                        key: 'includeEmoji',
                        label: 'Include emoji 😎',
                      },
                      {
                        key: 'pronounceable',
                        label: 'Make pronounceable',
                      },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center p-2 rounded-lg hover:bg-gray-100">
                        <input
                          type="checkbox"
                          checked={Boolean(passwordOptions[key as keyof typeof passwordOptions])}
                          onChange={(e) =>
                            setPasswordOptions({
                              ...passwordOptions,
                              [key]: e.target.checked,
                            })
                          }
                          className="rounded mr-3 border-gray-300"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleGeneratePassword}
                    className="w-full py-3 rounded-lg transition-colors text-white font-semibold bg-blue-500 hover:bg-blue-600"
                  >
                    Generate New Password
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between">
                      <label className="block text-sm font-semibold mb-1">Word Count</label>
                      <span className="text-sm px-2 py-1 rounded-full bg-gray-200">
                        {passphraseOptions.wordCount} words
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="10"
                      value={passphraseOptions.wordCount}
                      onChange={(e) =>
                        setPassphraseOptions({
                          ...passphraseOptions,
                          wordCount: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs opacity-60">
                      <span>3</span>
                      <span>5</span>
                      <span>7</span>
                      <span>10</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Separator</label>
                      <select
                        value={passphraseOptions.separator}
                        onChange={(e) =>
                          setPassphraseOptions({
                            ...passphraseOptions,
                            separator: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded text-base bg-gray-100 text-gray-900"
                      >
                        <option value="-">Hyphen (-)</option>
                        <option value=".">Dot (.)</option>
                        <option value="_">Underscore (_)</option>
                        <option value=" ">Space</option>
                        <option value="">None</option>
                        <option value="*">Asterisk (*)</option>
                        <option value="+">Plus (+)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      {[
                        {
                          key: 'capitalize',
                          label: 'Capitalize Words',
                        },
                        {
                          key: 'includeNumber',
                          label: 'Include Number',
                        },
                        {
                          key: 'includeSpecial',
                          label: 'Add Special Character',
                        },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center p-2 rounded-lg hover:bg-gray-100">
                          <input
                            type="checkbox"
                            checked={Boolean(passphraseOptions[key as keyof typeof passphraseOptions])}
                            onChange={(e) =>
                              setPassphraseOptions({
                                ...passphraseOptions,
                                [key]: e.target.checked,
                              })
                            }
                            className="rounded mr-3 border-gray-300"
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleGeneratePassphrase}
                    className="w-full py-3 rounded-lg transition-colors text-white font-semibold bg-blue-500 hover:bg-blue-600"
                  >
                    Generate New Passphrase
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* History section */}
        {passwordHistory.length > 0 && (
          <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-blue-600 font-bold mb-3 text-lg">Recently Generated</h2>
            <ul className="space-y-2">
              {passwordHistory.map((item, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className={`font-mono text-sm ${showPassword ? '' : 'filter blur-sm hover:blur-none'} transition-all`}>
                    {item.value.length > 30 ? `${item.value.substring(0, 30)}...` : item.value}
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs mr-3 text-gray-500">
                      {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <button
                      onClick={() => handleCopy(item.value)}
                      className="p-1 rounded hover:bg-gray-100"
                      aria-label="Copy to clipboard"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Info section */}
        <div className="mt-6 mb-12 bg-blue-50 border border-blue-200 rounded-xl p-5 text-base">
          <h2 className="text-blue-600 font-bold mb-2 text-xl">Password Security Tips</h2>
          <p className="text-gray-700 mb-3">
            Strong, unique passwords are your first line of defense against unauthorized access to your accounts.
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-3 space-y-1">
            <li>Never reuse passwords across different accounts</li>
            <li>Longer passwords (16+ characters) provide better security</li>
            <li>Use a mix of character types for maximum entropy</li>
            <li>Consider a password manager to securely store credentials</li>
            <li>Enable two-factor authentication whenever possible</li>
          </ul>
          <p className="text-gray-500 font-medium">
            <strong>Pro Tip:</strong> Passphrases made of random words are both secure and easier to memorize than complex passwords!
          </p>
        </div>
      </div>
    </div>
  )
}
