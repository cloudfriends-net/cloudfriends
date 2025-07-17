'use client'

import { useState, useRef } from 'react'
import { InformationCircleIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'
import LightThemeLayout from '../../components/LightThemeLayout' // Import the LightThemeLayout component

// Tooltip component
function Tooltip({ text }: { text: string }) {
  return (
    <span className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-max bg-gray-200 text-xs text-gray-900 rounded px-2 py-1 shadow-lg border border-gray-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
      {text}
    </span>
  )
}

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
        setOutput(text.replace(re, replace))
      } else {
        const matches = [...text.matchAll(re)]
        if (matches.length === 0) {
          setOutput('No matches found.')
        } else {
          setOutput(
            matches
              .map(
                (m, i) =>
                  `Match ${i + 1}: "${m[0]}" at index ${m.index}` +
                  (m.length > 1
                    ? '\n  Groups: ' +
                      m
                        .slice(1)
                        .map((g, gi) => `(${gi + 1}): ${g ?? '<empty>'}`)
                        .join(', ')
                    : '')
              )
              .join('\n')
          )
        }
      }
    } catch (e) {
      setRegexError(e instanceof Error ? e.message : String(e))
      setOutput('')
    }
  }

  const copyToClipboard = () => {
    if (outputRef.current) {
      outputRef.current.select()
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <LightThemeLayout>
      <main className="min-h-screen bg-gray-100 flex flex-col items-center px-2" style={{ paddingTop: '5.5rem' }}>
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Regex Tester & Creator</h1>
          <p className="text-blue-600 text-center mb-2 text-sm">
            🔒 All processing happens in your browser. No data leaves your device.
          </p>
          <p className="text-gray-600 text-center mb-6 text-sm">
            Enter a <b>regular expression</b> pattern and flags, then test it against your text. 
            Optionally, provide a replacement string to see the result of a replace operation.<br />
          </p>

          <div className="mb-2 relative group flex items-center">
            <label className="text-gray-700 text-sm mr-2">Pattern</label>
            <InformationCircleIcon className="h-4 w-4 text-blue-600 cursor-pointer" />
            <Tooltip text="Enter your regular expression pattern. Example: \\d+ matches numbers, [A-Za-z]+ matches words, ^\\w+ matches start of lines" />
          </div>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            className="w-full bg-gray-200 text-gray-900 rounded-lg px-3 py-2 border border-gray-300 mb-2"
            placeholder="Regex pattern (e.g. \\d+)"
          />

          <div className="mb-2 relative group flex items-center">
            <label className="text-gray-700 text-sm mr-2">Flags</label>
            <InformationCircleIcon className="h-4 w-4 text-blue-600 cursor-pointer" />
            <Tooltip text="Regex flags: g (global), i (ignore case), m (multiline), etc." />
          </div>
          <input
            type="text"
            value={flags}
            onChange={e => setFlags(e.target.value)}
            className="bg-gray-200 text-gray-900 rounded-lg px-3 py-2 border border-gray-300 mb-2"
            placeholder="Flags (e.g. g, i, m)"
            maxLength={5}
            style={{ width: '8em' }}
          />

          <div className="mb-2 relative group flex items-center">
            <label className="text-gray-700 text-sm mr-2">Replacement</label>
            <InformationCircleIcon className="h-4 w-4 text-blue-600 cursor-pointer" />
            <Tooltip text="Optional: Enter a replacement string to see the result of a replace operation." />
          </div>
          <input
            type="text"
            value={replace}
            onChange={e => setReplace(e.target.value)}
            className="w-full bg-gray-200 text-gray-900 rounded-lg px-3 py-2 border border-gray-300 mb-2"
            placeholder="Replacement (optional)"
          />

          <div className="mb-2 relative group flex items-center">
            <label className="text-gray-700 text-sm mr-2">Test Text</label>
            <InformationCircleIcon className="h-4 w-4 text-blue-600 cursor-pointer" />
            <Tooltip text="Paste or type the text you want to test your regex against." />
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full h-32 bg-gray-200 text-gray-900 rounded-lg p-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            placeholder="Paste or type your test text here..."
          />

          {regexError && <div className="text-red-500 text-xs mb-2">{regexError}</div>}

          <div className="flex gap-2 mb-2">
            <button
              onClick={handleTest}
              className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Test Regex
            </button>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-500 transition-colors"
            >
              <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
              {copied ? 'Copied!' : 'Copy Output'}
            </button>
          </div>

          <textarea
            ref={outputRef}
            value={output}
            readOnly
            className="w-full h-32 bg-gray-200 text-gray-900 rounded-lg p-4 border border-gray-300 focus:outline-none mb-2"
          />
        </div>
      </main>
    </LightThemeLayout>
  )
}