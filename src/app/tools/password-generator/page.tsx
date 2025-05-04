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
    <div
      className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center"
      style={{ paddingTop: '5.5rem' }} // Adjust this value to match your header height
    >
      <div className="w-full max-w-xl mx-auto">
        {/* Title outside the generator card */}
        <div className="mb-6 text-center">
          <KeyIcon className="h-10 w-10 text-blue-400 inline-block" />
          <h1 className="text-2xl font-bold mt-2">Password Generator</h1>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl shadow-xl p-6">
          <div className="flex justify-center mb-6 gap-2">
            <button
              onClick={() => {
                setGeneratorType('password')
                setPassword('')
                setPassphrase('')
              }}
              className={`px-4 py-2 rounded-t-md text-base font-semibold transition-colors ${
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
              className={`px-4 py-2 rounded-t-md text-base font-semibold transition-colors ${
                generatorType === 'passphrase'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Passphrase
            </button>
          </div>
          {generatorType === 'password' ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Length: <span className="font-bold">{passwordOptions.length}</span>
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={passwordOptions.length}
                    onChange={(e) =>
                      setPasswordOptions({
                        ...passwordOptions,
                        length: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'includeUppercase', label: 'Uppercase (A-Z)' },
                    { key: 'includeLowercase', label: 'Lowercase (a-z)' },
                    { key: 'includeNumbers', label: 'Numbers (0-9)' },
                    { key: 'includeSymbols', label: 'Symbols (!@#$...)' },
                    { key: 'excludeSimilar', label: 'No similar chars (i, l, 1, O, 0)' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(passwordOptions[key as keyof typeof passwordOptions])}
                        onChange={(e) =>
                          setPasswordOptions({
                            ...passwordOptions,
                            [key]: e.target.checked,
                          })
                        }
                        className="rounded border-gray-600"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleGeneratePassword}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-base font-semibold"
                >
                  Generate Password
                </button>
                {password && (
                  <div className="mt-4">
                    <div className="flex">
                      <input
                        type="text"
                        value={password}
                        readOnly
                        className="w-full bg-slate-900 text-gray-100 px-3 py-2 rounded-l text-base"
                      />
                      <button
                        onClick={() => handleCopy(password)}
                        className="bg-blue-600 px-4 rounded-r hover:bg-blue-700 text-base font-semibold"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <StrengthIndicator strength={checkPasswordStrength(password)} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Word Count: <span className="font-bold">{passphraseOptions.wordCount}</span>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="8"
                    value={passphraseOptions.wordCount}
                    onChange={(e) =>
                      setPassphraseOptions({
                        ...passphraseOptions,
                        wordCount: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Separator</label>
                  <select
                    value={passphraseOptions.separator}
                    onChange={(e) =>
                      setPassphraseOptions({
                        ...passphraseOptions,
                        separator: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 text-gray-100 px-3 py-2 rounded text-base"
                  >
                    <option value="-">Hyphen (-)</option>
                    <option value=".">Dot (.)</option>
                    <option value="_">Underscore (_)</option>
                    <option value=" ">Space</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={passphraseOptions.capitalize}
                      onChange={(e) =>
                        setPassphraseOptions({
                          ...passphraseOptions,
                          capitalize: e.target.checked,
                        })
                      }
                      className="rounded border-gray-600"
                    />
                    Capitalize Words
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={passphraseOptions.includeNumber}
                      onChange={(e) =>
                        setPassphraseOptions({
                          ...passphraseOptions,
                          includeNumber: e.target.checked,
                        })
                      }
                      className="rounded border-gray-600"
                    />
                    Include Number
                  </label>
                </div>
                <button
                  onClick={handleGeneratePassphrase}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-base font-semibold"
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
                        className="w-full bg-slate-900 text-gray-100 px-3 py-2 rounded-l text-base"
                      />
                      <button
                        onClick={() => handleCopy(passphrase)}
                        className="bg-blue-600 px-4 rounded-r hover:bg-blue-700 text-base font-semibold"
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
        <div className="mt-8 bg-blue-500/10 border border-blue-400/20 rounded-xl p-5 text-base">
          <h2 className="text-blue-300 font-bold mb-2 text-xl">Why strong passwords matter</h2>
          <p className="text-slate-200 mb-2">
            Secure passwords and passphrases protect your accounts from hackers and data breaches.
            Avoid using the same password for multiple sites and always prefer long, random combinations.
          </p>
          <ul className="list-disc list-inside text-slate-400 mb-2">
            <li>Use a unique password for every account</li>
            <li>Longer passwords are harder to crack</li>
            <li>Mix uppercase, lowercase, numbers, and symbols</li>
            <li>Consider a password manager for storage</li>
          </ul>
          <p className="text-slate-500">
            <strong>Tip:</strong> Passphrases (random words) are secure and easy to remember!
          </p>
        </div>
      </div>
    </div>
  )
}