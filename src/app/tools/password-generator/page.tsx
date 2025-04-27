'use client'

import { useState } from 'react'
import { KeyIcon } from '@heroicons/react/24/outline'
import { generatePassword, generatePassphrase, checkPasswordStrength, checkPassphraseStrength, copyToClipboard } from './utils'
import { StrengthIndicator } from './components/StrengthIndicator'

type GeneratorType = 'password' | 'passphrase'

export default function PasswordGenerator() {
  const [generatorType, setGeneratorType] = useState<GeneratorType>('password')
  const [password, setPassword] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [copied, setCopied] = useState(false)
  
  const [passwordOptions, setPasswordOptions] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
  })
  
  const [passphraseOptions, setPassphraseOptions] = useState({
    wordCount: 4,
    separator: '-',
    capitalize: true,
    includeNumber: true,
  })

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(passwordOptions)
    setPassword(newPassword)
  }

  const handleGeneratePassphrase = () => {
    const newPassphrase = generatePassphrase(passphraseOptions)
    setPassphrase(newPassphrase)
  }

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <KeyIcon className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Password Generator</h1>
          </div>

          {/* Generator Type Toggle */}
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-6">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setGeneratorType('password')
                  setPassword('')
                  setPassphrase('')
                }}
                className={`py-2 px-4 rounded transition-colors ${
                  generatorType === 'password'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
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
                className={`py-2 px-4 rounded transition-colors ${
                  generatorType === 'passphrase'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Passphrase
              </button>
            </div>
          </div>

          {/* Generator Sections */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            {generatorType === 'password' ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Generate Password</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Length: {passwordOptions.length}
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="64"
                      value={passwordOptions.length}
                      onChange={(e) => setPasswordOptions({
                        ...passwordOptions,
                        length: parseInt(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    {[
                      { key: 'includeUppercase', label: 'Uppercase (A-Z)' },
                      { key: 'includeLowercase', label: 'Lowercase (a-z)' },
                      { key: 'includeNumbers', label: 'Numbers (0-9)' },
                      { key: 'includeSymbols', label: 'Symbols (!@#$...)' },
                      { key: 'excludeSimilar', label: 'Exclude Similar Characters (i, l, 1, O, 0)' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={Boolean(passwordOptions[key as keyof typeof passwordOptions])}
                          onChange={(e) => setPasswordOptions({
                            ...passwordOptions,
                            [key]: e.target.checked
                          })}
                          className="rounded border-gray-600"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={handleGeneratePassword}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Generate Password
                  </button>

                  {password && (
                    <>
                      <div className="mt-4">
                        <div className="flex">
                          <input
                            type="text"
                            value={password}
                            readOnly
                            className="w-full bg-slate-900 text-gray-100 px-3 py-2 rounded-l"
                          />
                          <button
                            onClick={() => handleCopy(password)}
                            className="bg-blue-600 px-4 rounded-r hover:bg-blue-700"
                          >
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <StrengthIndicator strength={checkPasswordStrength(password)} />
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">Generate Passphrase</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Word Count: {passphraseOptions.wordCount}
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="8"
                      value={passphraseOptions.wordCount}
                      onChange={(e) => setPassphraseOptions({
                        ...passphraseOptions,
                        wordCount: parseInt(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Separator
                    </label>
                    <select
                      value={passphraseOptions.separator}
                      onChange={(e) => setPassphraseOptions({
                        ...passphraseOptions,
                        separator: e.target.value
                      })}
                      className="w-full bg-slate-900 text-gray-100 px-3 py-2 rounded"
                    >
                      <option value="-">Hyphen (-)</option>
                      <option value=".">Dot (.)</option>
                      <option value="_">Underscore (_)</option>
                      <option value=" ">Space</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={passphraseOptions.capitalize}
                        onChange={(e) => setPassphraseOptions({
                          ...passphraseOptions,
                          capitalize: e.target.checked
                        })}
                        className="rounded border-gray-600"
                      />
                      <span>Capitalize Words</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={passphraseOptions.includeNumber}
                        onChange={(e) => setPassphraseOptions({
                          ...passphraseOptions,
                          includeNumber: e.target.checked
                        })}
                        className="rounded border-gray-600"
                      />
                      <span>Include Number</span>
                    </label>
                  </div>

                  <button
                    onClick={handleGeneratePassphrase}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Generate Passphrase
                  </button>

                  {passphrase && (
                    <div className="mt-4">
                      <div className="flex">
                        <input
                          type="text"
                          value={passphrase}
                          readOnly
                          className="w-full bg-slate-900 text-gray-100 px-3 py-2 rounded-l"
                        />
                        <button
                          onClick={() => handleCopy(passphrase)}
                          className="bg-blue-600 px-4 rounded-r hover:bg-blue-700"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <StrengthIndicator strength={checkPassphraseStrength(passphrase)} />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}