'use client'

import { useState, useRef, useEffect } from 'react'
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'

type Operation = 'case' | 'transform' | 'clean' | 'count'
type CaseOption = 'upper' | 'lower' | 'title' | 'sentence'
type TransformOption = 'reverse' | 'sort' | 'shuffle' | 'removeDuplicates'
type CleanOption = 'extraSpaces' | 'extraLines' | 'html' | 'trim'

// Add these helper objects above your component:
const operationDescriptions: Record<Operation, string> = {
  case: 'Change the capitalization style of your text.',
  transform: 'Rearrange, sort, or modify lines in your text.',
  clean: 'Remove unwanted spaces, lines, or HTML tags.',
  count: 'Count the number of characters, words, and lines.',
}

const caseDescriptions: Record<CaseOption, string> = {
  upper: 'Convert all text to UPPERCASE.',
  lower: 'Convert all text to lowercase.',
  title: 'Capitalize the first letter of each word.',
  sentence: 'Capitalize the first letter of each sentence.',
}

const transformDescriptions: Record<TransformOption, string> = {
  reverse: 'Reverse the entire text.',
  sort: 'Sort all lines alphabetically.',
  shuffle: 'Randomly shuffle all lines.',
  removeDuplicates: 'Remove duplicate lines.',
}

const cleanDescriptions: Record<CleanOption, string> = {
  extraSpaces: 'Replace multiple spaces with a single space.',
  extraLines: 'Replace multiple blank lines with a single line.',
  html: 'Remove all HTML tags from the text.',
  trim: 'Trim spaces from the start and end of each line.',
}

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
    } else {
      setOutput('')
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
    <main className="min-h-screen bg-gray-950 flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">Text Tools</h1>
        <p className="text-blue-400 text-center mb-2 text-sm">
          🔒 All processing happens in your browser. No data leaves your device.
        </p>
        <p className="text-slate-400 text-center mb-6 text-sm">
          Paste or type your text below, then choose an operation to transform, clean, or analyze your text. 
          The result will appear instantly in the output box. Use the "Copy" button to quickly copy the result.
        </p>

        {/* Input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-40 bg-slate-800 text-slate-200 rounded-lg p-4 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          placeholder="Paste or type your text here..."
        />

        {/* Operation selection */}
        <div className="flex flex-wrap gap-2 mb-1 justify-center">
          <select
            value={selectedOperation}
            onChange={e => setSelectedOperation(e.target.value as Operation)}
            className="bg-slate-800 text-slate-200 rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
          >
            <option value="case">Change Case</option>
            <option value="transform">Transform</option>
            <option value="clean">Clean</option>
            <option value="count">Count</option>
          </select>

          {selectedOperation === 'case' && (
            <select
              value={selectedCaseOption}
              onChange={e => setSelectedCaseOption(e.target.value as CaseOption)}
              className="bg-slate-800 text-slate-200 rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
            >
              <option value="upper">UPPERCASE</option>
              <option value="lower">lowercase</option>
              <option value="title">Title Case</option>
              <option value="sentence">Sentence case</option>
            </select>
          )}

          {selectedOperation === 'transform' && (
            <select
              value={selectedTransformOption}
              onChange={e => setSelectedTransformOption(e.target.value as TransformOption)}
              className="bg-slate-800 text-slate-200 rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
            >
              <option value="reverse">Reverse Text</option>
              <option value="sort">Sort Lines</option>
              <option value="shuffle">Shuffle Lines</option>
              <option value="removeDuplicates">Remove Duplicates</option>
            </select>
          )}

          {selectedOperation === 'clean' && (
            <select
              value={selectedCleanOption}
              onChange={e => setSelectedCleanOption(e.target.value as CleanOption)}
              className="bg-slate-800 text-slate-200 rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
            >
              <option value="extraSpaces">Remove Extra Spaces</option>
              <option value="extraLines">Remove Extra Lines</option>
              <option value="html">Remove HTML Tags</option>
              <option value="trim">Trim Lines</option>
            </select>
          )}
        </div>

        {/* Dynamic helper text */}
        <div className="mb-3 text-center text-xs text-slate-400 min-h-[1.5em]">
          {selectedOperation === 'case' && caseDescriptions[selectedCaseOption]}
          {selectedOperation === 'transform' && transformDescriptions[selectedTransformOption]}
          {selectedOperation === 'clean' && cleanDescriptions[selectedCleanOption]}
          {selectedOperation === 'count' && operationDescriptions.count}
          {!['case', 'transform', 'clean', 'count'].includes(selectedOperation) && operationDescriptions[selectedOperation]}
        </div>

        {/* Output */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-slate-400 text-xs">
            {stats.chars} chars | {stats.words} words | {stats.lines} lines
          </span>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <textarea
          ref={outputRef}
          value={output}
          readOnly
          className="w-full h-40 bg-slate-800 text-slate-200 rounded-lg p-4 border border-slate-700 focus:outline-none mb-2"
        />

        {/* Stats for Count */}
        {selectedOperation === 'count' && (
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mt-2 flex justify-around text-center">
            <div>
              <div className="text-blue-400 text-lg font-bold">{stats.chars}</div>
              <div className="text-slate-400 text-xs">Characters</div>
            </div>
            <div>
              <div className="text-blue-400 text-lg font-bold">{stats.words}</div>
              <div className="text-slate-400 text-xs">Words</div>
            </div>
            <div>
              <div className="text-blue-400 text-lg font-bold">{stats.lines}</div>
              <div className="text-slate-400 text-xs">Lines</div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}