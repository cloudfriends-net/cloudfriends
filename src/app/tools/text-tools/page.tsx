'use client'

import { useState, useRef, useEffect } from 'react'
import { DocumentTextIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'

type Operation = 'case' | 'transform' | 'clean' | 'count'
type CaseOption = 'upper' | 'lower' | 'title' | 'sentence'
type TransformOption = 'reverse' | 'sort' | 'shuffle' | 'removeDuplicates'
type CleanOption = 'extraSpaces' | 'extraLines' | 'html' | 'trim'

export default function TextTools() {
  const [text, setText] = useState('')
  const [output, setOutput] = useState('')
  const [selectedOperation, setSelectedOperation] = useState<Operation>('case')
  const [selectedCaseOption, setSelectedCaseOption] = useState<CaseOption>('upper')
  const [selectedTransformOption, setSelectedTransformOption] = useState<TransformOption>('reverse')
  const [selectedCleanOption, setSelectedCleanOption] = useState<CleanOption>('extraSpaces')
  const [stats, setStats] = useState({ chars: 0, words: 0, lines: 0 })
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLTextAreaElement>(null)

  // Process text whenever relevant state changes
  useEffect(() => {
    if (text) {
      processText()
    }
  }, [text, selectedOperation, selectedCaseOption, selectedTransformOption, selectedCleanOption])

  // Update stats whenever text changes
  useEffect(() => {
    updateStats(text)
  }, [text])

  const updateStats = (text: string) => {
    const chars = text.length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const lines = text.trim() ? text.split('\n').length : 0
    setStats({ chars, words, lines })
  }

  const processText = () => {
    let result = text

    switch (selectedOperation) {
      case 'case':
        result = processCaseOperation(text, selectedCaseOption)
        break
      case 'transform':
        result = processTransformOperation(text, selectedTransformOption)
        break
      case 'clean':
        result = processCleanOperation(text, selectedCleanOption)
        break
      case 'count':
        // Count operation just shows stats, no text transformation
        result = text
        break
    }

    setOutput(result)
  }

  const processCaseOperation = (text: string, option: CaseOption): string => {
    switch (option) {
      case 'upper':
        return text.toUpperCase()
      case 'lower':
        return text.toLowerCase()
      case 'title':
        return text
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      case 'sentence':
        return text
          .toLowerCase()
          .replace(/(^\s*\w|[.!?]\s*\w)/g, match => match.toUpperCase())
      default:
        return text
    }
  }

  const processTransformOperation = (text: string, option: TransformOption): string => {
    switch (option) {
      case 'reverse':
        return text.split('').reverse().join('')
      case 'sort':
        return text.split('\n').sort().join('\n')
      case 'shuffle':
        const arr = text.split('\n')
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
        }
        return arr.join('\n')
      case 'removeDuplicates':
        return [...new Set(text.split('\n'))].join('\n')
      default:
        return text
    }
  }

  const processCleanOperation = (text: string, option: CleanOption): string => {
    switch (option) {
      case 'extraSpaces':
        return text.replace(/\s+/g, ' ')
      case 'extraLines':
        return text.replace(/\n+/g, '\n')
      case 'html':
        return text.replace(/<[^>]*>/g, '')
      case 'trim':
        return text.split('\n').map(line => line.trim()).join('\n')
      default:
        return text
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
    <main className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">Text Tools</h1>

        <div className="max-w-4xl mx-auto mb-8 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg text-center">
          <p className="text-blue-400 text-lg">
            🔒 Your text is processed entirely in your browser. No data is sent to any server.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Operation Selection */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setSelectedOperation('case')}
              className={`flex-1 py-3 px-4 rounded-lg text-center transition-colors ${
                selectedOperation === 'case'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Change Case
            </button>
            <button
              onClick={() => setSelectedOperation('transform')}
              className={`flex-1 py-3 px-4 rounded-lg text-center transition-colors ${
                selectedOperation === 'transform'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Transform
            </button>
            <button
              onClick={() => setSelectedOperation('clean')}
              className={`flex-1 py-3 px-4 rounded-lg text-center transition-colors ${
                selectedOperation === 'clean'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Clean Text
            </button>
            <button
              onClick={() => setSelectedOperation('count')}
              className={`flex-1 py-3 px-4 rounded-lg text-center transition-colors ${
                selectedOperation === 'count'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Count
            </button>
          </div>

          {/* Sub-options based on operation */}
          <div className="mb-6">
            {selectedOperation === 'case' && (
              <div className="flex space-x-2">
                {[
                  { value: 'upper', label: 'UPPERCASE' },
                  { value: 'lower', label: 'lowercase' },
                  { value: 'title', label: 'Title Case' },
                  { value: 'sentence', label: 'Sentence case' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedCaseOption(option.value as CaseOption)}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg text-center transition-colors ${
                      selectedCaseOption === option.value
                        ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {selectedOperation === 'transform' && (
              <div className="flex space-x-2">
                {[
                  { value: 'reverse', label: 'Reverse Text' },
                  { value: 'sort', label: 'Sort Lines' },
                  { value: 'shuffle', label: 'Shuffle Lines' },
                  { value: 'removeDuplicates', label: 'Remove Duplicates' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedTransformOption(option.value as TransformOption)}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg text-center transition-colors ${
                      selectedTransformOption === option.value
                        ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {selectedOperation === 'clean' && (
              <div className="flex space-x-2">
                {[
                  { value: 'extraSpaces', label: 'Remove Extra Spaces' },
                  { value: 'extraLines', label: 'Remove Extra Lines' },
                  { value: 'html', label: 'Remove HTML Tags' },
                  { value: 'trim', label: 'Trim Lines' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedCleanOption(option.value as CleanOption)}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg text-center transition-colors ${
                      selectedCleanOption === option.value
                        ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input/Output Area */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input */}
            <div className="space-y-2">
              <label className="block text-slate-300 text-sm font-medium mb-2">Input Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-64 bg-slate-800 text-slate-200 rounded-lg p-4 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your text here..."
              ></textarea>
              <div className="text-xs text-slate-400">
                {stats.chars} characters | {stats.words} words | {stats.lines} lines
              </div>
            </div>

            {/* Output */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-slate-300 text-sm font-medium">Result</label>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
              <textarea
                ref={outputRef}
                value={output}
                readOnly
                className="w-full h-64 bg-slate-800 text-slate-200 rounded-lg p-4 border border-slate-700 focus:outline-none"
              ></textarea>

              {/* Stats Display for Count Operation */}
              {selectedOperation === 'count' && (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mt-4">
                  <h3 className="text-white font-semibold mb-3">Text Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                      <div className="text-blue-400 text-xl font-bold">{stats.chars}</div>
                      <div className="text-slate-400 text-sm">Characters</div>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                      <div className="text-blue-400 text-xl font-bold">{stats.words}</div>
                      <div className="text-slate-400 text-sm">Words</div>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                      <div className="text-blue-400 text-xl font-bold">{stats.lines}</div>
                      <div className="text-slate-400 text-sm">Lines</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}