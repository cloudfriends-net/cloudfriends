'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { 
  ClipboardDocumentCheckIcon, 
  ArrowsRightLeftIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import ThemeAwareLayout from '../../../components/ThemeAwareLayout'
import { useThemeContext } from '../../../components/ThemeProvider'

type Operation = 'case' | 'transform' | 'clean' | 'count'
type CaseOption = 'upper' | 'lower' | 'title' | 'sentence'
type TransformOption = 'reverse' | 'sort' | 'shuffle' | 'removeDuplicates'
type CleanOption = 'extraSpaces' | 'extraLines' | 'html' | 'trim'

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

type FrequencyMap = {
  item: string;
  count: number;
  percentage: string;
}

export default function TextTools() {
  const { resolvedTheme } = useThemeContext()
  const [text, setText] = useState('')
  const [output, setOutput] = useState('')
  const [selectedOperation, setSelectedOperation] = useState<Operation>('case')
  const [selectedCaseOption, setSelectedCaseOption] = useState<CaseOption>('upper')
  const [selectedTransformOption, setSelectedTransformOption] = useState<TransformOption>('reverse')
  const [selectedCleanOption, setSelectedCleanOption] = useState<CleanOption>('extraSpaces')
  const [stats, setStats] = useState({ chars: 0, words: 0, lines: 0 })
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const outputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processText = useCallback(() => {
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
  }, [text, selectedOperation, selectedCaseOption, selectedTransformOption, selectedCleanOption])

  useEffect(() => {
    if (text) {
      processText()
    } else {
      setOutput('')
    }
  }, [text, selectedOperation, selectedCaseOption, selectedTransformOption, selectedCleanOption, processText])

  useEffect(() => {
    updateStats(text)
  }, [text])

  const updateStats = (text: string) => {
    const chars = text.length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const lines = text.trim() ? text.split('\n').length : 0
    setStats({ chars, words, lines })
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

  const copyToClipboard = async () => {
    if (output) {
      try {
        await navigator.clipboard.writeText(output)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Fallback for browsers that don't support clipboard API
        if (outputRef.current) {
          outputRef.current.select()
          document.execCommand('copy')
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      }
    }
  }

  const clearText = () => {
    setText('')
    setOutput('')
    setStats({ chars: 0, words: 0, lines: 0 })
  }

  const swapTexts = () => {
    setText(output)
    setOutput(text)
  }

  const downloadOutput = () => {
    if (!output) return
    
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transformed-text.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const uploadFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setText(content || '')
    }
    reader.readAsText(file)
    
    // Reset the input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getWordFrequency = (text: string): FrequencyMap[] => {
    if (!text.trim()) return [];
    
    const words = text.toLowerCase().match(/\b[^\s]+\b/g) || [];
    const wordCount: Record<string, number> = {};
    const totalWords = words.length;
    
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .map(([word, count]) => ({
        item: word,
        count,
        percentage: ((count / totalWords) * 100).toFixed(1) + '%'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 words
  };

  const getCharFrequency = (text: string): FrequencyMap[] => {
    if (!text.trim()) return [];
    
    const chars = text.replace(/\s/g, '');
    const charCount: Record<string, number> = {};
    const totalChars = chars.length;
    
    for (const char of chars) {
      charCount[char] = (charCount[char] || 0) + 1;
    }
    
    return Object.entries(charCount)
      .map(([char, count]) => ({
        item: char,
        count,
        percentage: ((count / totalChars) * 100).toFixed(1) + '%'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 characters
  };

  return (
    <ThemeAwareLayout showThemeToggle={false}>
      <main className={`min-h-screen flex flex-col items-center px-2 transition-colors duration-300 ${
        resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      }`} style={{ paddingTop: '5.5rem' }}>
        <div className="w-full max-w-3xl">
          <div className={`flex justify-between items-center mb-4`}>
            <h1 className={`text-3xl font-bold ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Text Tools</h1>
          </div>
          
          <div className={`mb-6 p-4 rounded-lg border ${
            resolvedTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center mb-2">
              <span className={`mr-2 text-xl ${
                resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>🔒</span>
            <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              All processing happens in your browser. No data leaves your device.
            </p>
          </div>
          <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Paste or type your text below, then choose an operation to transform, clean, or analyze your text.
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6`}>
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className={`font-medium ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Input</label>
              <div className="flex space-x-1">
                <button
                  onClick={uploadFile}
                  className={`p-1.5 rounded ${resolvedTheme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
                  title="Upload file"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={clearText}
                  className={`p-1.5 rounded ${resolvedTheme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
                  title="Clear text"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="text/*,.txt,.md,.csv,.json,.html,.xml,.js,.jsx,.ts,.tsx,.css"
                />
              </div>
            </div>
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`w-full h-48 rounded-lg p-4 border resize-none focus:outline-none focus:ring-2 ${
                resolvedTheme === 'dark' 
                  ? 'bg-gray-800 text-gray-200 border-gray-700 focus:ring-blue-700'
                  : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Paste or type your text here..."
            />
            <div className={`text-xs ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {stats.chars} characters | {stats.words} words | {stats.lines} lines
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className={`font-medium ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Output</label>
              <div className="flex space-x-1">
                <button
                  onClick={swapTexts}
                  className={`p-1.5 rounded ${resolvedTheme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
                  title="Swap input/output"
                >
                  <ArrowsRightLeftIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`p-1.5 rounded flex items-center ${
                    copied 
                      ? (resolvedTheme === 'dark' ? 'bg-green-700 text-green-200' : 'bg-green-200 text-green-700') 
                      : (resolvedTheme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                  } transition-colors`}
                  title="Copy to clipboard"
                >
                  <ClipboardDocumentCheckIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={downloadOutput}
                  className={`p-1.5 rounded ${resolvedTheme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
                  title="Download output"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <textarea
              ref={outputRef}
              value={output}
              readOnly
              className={`w-full h-48 rounded-lg p-4 border resize-none focus:outline-none ${
                resolvedTheme === 'dark' 
                  ? 'bg-gray-800 text-gray-200 border-gray-700'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            />
          </div>
        </div>

        <div className={`p-5 rounded-lg mb-6 ${resolvedTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
          <h2 className={`font-bold mb-3 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Text Operations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={`block mb-1 text-sm font-medium ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Operation Type</label>
              <select
                value={selectedOperation}
                onChange={e => setSelectedOperation(e.target.value as Operation)}
                className={`w-full rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-700 text-gray-200 border-gray-600 focus:ring-blue-700'
                    : 'bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="case">Change Case</option>
                <option value="transform">Transform</option>
                <option value="clean">Clean</option>
                <option value="count">Count</option>
              </select>
            </div>
            
            <div>
              {selectedOperation === 'case' && (
                <>
                  <label className={`block mb-1 text-sm font-medium ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Case Options</label>
                  <select
                    value={selectedCaseOption}
                    onChange={e => setSelectedCaseOption(e.target.value as CaseOption)}
                    className={`w-full rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 ${
                      resolvedTheme === 'dark' 
                        ? 'bg-gray-700 text-gray-200 border-gray-600 focus:ring-blue-700'
                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="upper">UPPERCASE</option>
                    <option value="lower">lowercase</option>
                    <option value="title">Title Case</option>
                    <option value="sentence">Sentence case</option>
                  </select>
                </>
              )}

              {selectedOperation === 'transform' && (
                <>
                  <label className={`block mb-1 text-sm font-medium ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Transform Options</label>
                  <select
                    value={selectedTransformOption}
                    onChange={e => setSelectedTransformOption(e.target.value as TransformOption)}
                    className={`w-full rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 ${
                      resolvedTheme === 'dark' 
                        ? 'bg-gray-700 text-gray-200 border-gray-600 focus:ring-blue-700'
                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="reverse">Reverse Text</option>
                    <option value="sort">Sort Lines</option>
                    <option value="shuffle">Shuffle Lines</option>
                    <option value="removeDuplicates">Remove Duplicates</option>
                  </select>
                </>
              )}

              {selectedOperation === 'clean' && (
                <>
                  <label className={`block mb-1 text-sm font-medium ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Clean Options</label>
                  <select
                    value={selectedCleanOption}
                    onChange={e => setSelectedCleanOption(e.target.value as CleanOption)}
                    className={`w-full rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 ${
                      resolvedTheme === 'dark' 
                        ? 'bg-gray-700 text-gray-200 border-gray-600 focus:ring-blue-700'
                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="extraSpaces">Remove Extra Spaces</option>
                    <option value="extraLines">Remove Extra Lines</option>
                    <option value="html">Remove HTML Tags</option>
                    <option value="trim">Trim Lines</option>
                  </select>
                </>
              )}
            </div>
          </div>
          
          <div className={`mt-3 p-3 rounded-lg ${resolvedTheme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
            <p className="text-sm">
              {selectedOperation === 'case' && caseDescriptions[selectedCaseOption]}
              {selectedOperation === 'transform' && transformDescriptions[selectedTransformOption]}
              {selectedOperation === 'clean' && cleanDescriptions[selectedCleanOption]}
              {selectedOperation === 'count' && operationDescriptions.count}
            </p>
          </div>
        </div>

        {selectedOperation === 'count' && (
          <>
            <div className={`grid grid-cols-3 gap-4 mb-6`}>
              <div className={`p-4 rounded-lg text-center ${resolvedTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
                <div className={`text-2xl font-bold ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{stats.chars}</div>
                <div className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Characters</div>
              </div>
              <div className={`p-4 rounded-lg text-center ${resolvedTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
                <div className={`text-2xl font-bold ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{stats.words}</div>
                <div className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Words</div>
              </div>
              <div className={`p-4 rounded-lg text-center ${resolvedTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
                <div className={`text-2xl font-bold ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{stats.lines}</div>
                <div className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Lines</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className={`p-4 rounded-lg ${resolvedTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
                <h3 className={`text-lg font-medium mb-3 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Top 10 Words</h3>
                {text ? (
                  <div className={`max-h-60 overflow-y-auto ${resolvedTheme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'}`}>
                    <table className="w-full">
                      <thead>
                        <tr className={`text-left text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          <th className="pb-2">Word</th>
                          <th className="pb-2">Count</th>
                          <th className="pb-2">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getWordFrequency(text).map((item, index) => (
                          <tr key={index} className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <td className="py-1">{item.item}</td>
                            <td className="py-1">{item.count}</td>
                            <td className="py-1">{item.percentage}</td>
                          </tr>
                        ))}
                        {getWordFrequency(text).length === 0 && (
                          <tr>
                            <td colSpan={3} className={`py-4 text-center ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              No words to analyze
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={`py-8 text-center ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Enter text to see word frequency
                  </div>
                )}
              </div>
              
              <div className={`p-4 rounded-lg ${resolvedTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
                <h3 className={`text-lg font-medium mb-3 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Top 10 Characters</h3>
                {text ? (
                  <div className={`max-h-60 overflow-y-auto ${resolvedTheme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'}`}>
                    <table className="w-full">
                      <thead>
                        <tr className={`text-left text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          <th className="pb-2">Character</th>
                          <th className="pb-2">Count</th>
                          <th className="pb-2">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCharFrequency(text).map((item, index) => (
                          <tr key={index} className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <td className="py-1">{item.item === ' ' ? '(space)' : item.item}</td>
                            <td className="py-1">{item.count}</td>
                            <td className="py-1">{item.percentage}</td>
                          </tr>
                        ))}
                        {getCharFrequency(text).length === 0 && (
                          <tr>
                            <td colSpan={3} className={`py-4 text-center ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              No characters to analyze
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={`py-8 text-center ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Enter text to see character frequency
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
    </ThemeAwareLayout>
  )
}
