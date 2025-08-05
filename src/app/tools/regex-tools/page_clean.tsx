'use client'

import { useState, useRef } from 'react'
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'
import LightThemeLayout from '../../components/LightThemeLayout'

export default function RegexTester() {
  const [text, setText] = useState('')
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [replace, setReplace] = useState('')
  const [output, setOutput] = useState('')
  const [regexError, setRegexError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLTextAreaElement>(null)

  const handleTest = () => {
    try {
      setRegexError(null)
      const re = new RegExp(pattern, flags)
      
      if (replace) {
        // Replace mode
        const replaced = text.replace(re, replace)
        setOutput(replaced)
      } else {
        // Match mode
        const matches = [...text.matchAll(re)]
        if (matches.length === 0) {
          setOutput('No matches found')
        } else {
          setOutput(matches.map((match, index) => {
            const fullMatch = match[0]
            const groups = match.slice(1)
            let result = `Match ${index + 1}: "${fullMatch}"`
            if (groups.length > 0 && groups.some(group => group !== undefined)) {
              result += `\\nGroups: [${groups.map(g => g === undefined ? 'undefined' : `"${g}"`).join(', ')}]`
            }
            result += `\\nPosition: ${match.index}-${match.index! + fullMatch.length}`
            return result
          }).join('\\n\\n'))
        }
      }
    } catch (e) {
      setRegexError(e instanceof Error ? e.message : 'Invalid regex pattern')
      setOutput('')
    }
  }

  const copyToClipboard = () => {
    if (outputRef.current) {
      outputRef.current.select()
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <LightThemeLayout>
      <main className="min-h-screen bg-gray-100 flex flex-col items-center px-2 pb-20" style={{ paddingTop: '5.5rem' }}>
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Regex Tester</h1>
          <p className="text-blue-600 text-center mb-6 text-sm">
            Test and debug your regular expressions with real-time feedback.
          </p>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pattern Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Regular Expression Pattern
                </label>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="Enter your regex pattern..."
                />
                {regexError && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                    Error: {regexError}
                  </div>
                )}
              </div>

              {/* Flags Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flags
                </label>
                <input
                  type="text"
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="g, i, m, s, u, y"
                />
              </div>

              {/* Test Text Section */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  rows={4}
                  placeholder="Enter text to test against your regex..."
                />
              </div>

              {/* Replace Section */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Replacement Text (Optional)
                </label>
                <input
                  type="text"
                  value={replace}
                  onChange={(e) => setReplace(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="Enter replacement text for substitution..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleTest}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Test Regex
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Results</h2>
              {output && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  <ClipboardDocumentCheckIcon className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            <textarea
              ref={outputRef}
              value={output}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
              rows={8}
              placeholder="Results will appear here..."
            />
          </div>
        </div>
      </main>
    </LightThemeLayout>
  )
}
