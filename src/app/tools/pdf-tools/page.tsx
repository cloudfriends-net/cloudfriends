'use client'

import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { PDFDocument, PDFName } from 'pdf-lib'

type Operation = 'merge' | 'split' | 'compress'

type CompressionResult = {
  originalSize: number;
  compressedSize: number;
  reduction: number;
}

export default function PDFTools() {
  const [selectedOperation, setSelectedOperation] = useState<Operation>('merge')
  const [mergeFiles, setMergeFiles] = useState<File[]>([])
  const [splitFile, setSplitFile] = useState<File | null>(null)
  const [compressFile, setCompressFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [processedFiles, setProcessedFiles] = useState<{
    type: Operation;
    files: { name: string; url: string }[];
  } | null>(null)
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null)

  const onMergeDrop = useCallback((acceptedFiles: File[]) => {
    setMergeFiles(acceptedFiles.filter(file => file.type === 'application/pdf'))
  }, [])

  const { getRootProps: getMergeRootProps, getInputProps: getMergeInputProps } = useDropzone({
    onDrop: onMergeDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true
  })

  const onSplitDrop = useCallback((acceptedFiles: File[]) => {
    setSplitFile(acceptedFiles[0])
  }, [])

  const { getRootProps: getSplitRootProps, getInputProps: getSplitInputProps } = useDropzone({
    onDrop: onSplitDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  })

  const onCompressDrop = useCallback((acceptedFiles: File[]) => {
    setCompressFile(acceptedFiles[0])
  }, [])

  const { getRootProps: getCompressRootProps, getInputProps: getCompressInputProps } = useDropzone({
    onDrop: onCompressDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  })

  const mergePDFs = async () => {
    if (mergeFiles.length < 2) {
      setError('Please select at least 2 PDF files to merge')
      return
    }

    try {
      setIsProcessing(true)
      setError('')
      setProcessedFiles(null)

      const mergedPdf = await PDFDocument.create()

      for (const file of mergeFiles) {
        const fileBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(fileBuffer)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(page => mergedPdf.addPage(page))
      }

      const mergedPdfFile = await mergedPdf.save()
      const blob = new Blob([mergedPdfFile], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      setProcessedFiles({
        type: 'merge',
        files: [{ name: 'merged.pdf', url }]
      })
    } catch (err) {
      setError('Error merging PDFs. Please try again.')
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const splitPDF = async () => {
    if (!splitFile) {
      setError('Please select a PDF file to split')
      return
    }

    try {
      setIsProcessing(true)
      setError('')
      setProcessedFiles(null)

      const fileBuffer = await splitFile.arrayBuffer()
      const pdf = await PDFDocument.load(fileBuffer)
      const pageCount = pdf.getPageCount()
      const files: { name: string; url: string }[] = []

      for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create()
        const [page] = await newPdf.copyPages(pdf, [i])
        newPdf.addPage(page)
        
        const pdfBytes = await newPdf.save()
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        files.push({ name: `page-${i + 1}.pdf`, url })
      }

      setProcessedFiles({
        type: 'split',
        files
      })
    } catch (err) {
      setError('Error splitting PDF. Please try again.')
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const compressPDF = async () => {
    if (!compressFile) {
      setError('Please select a PDF file to compress')
      return
    }

    try {
      setIsProcessing(true)
      setError('')
      setProcessedFiles(null)
      setCompressionStats(null)

      const fileBuffer = await compressFile.arrayBuffer()
      const originalSize = fileBuffer.byteLength
      const pdf = await PDFDocument.load(fileBuffer)
      
      // Save with compression settings
      const compressedPdfFile = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 20,
        updateFieldAppearances: false,
      })
      
      const compressedSize = compressedPdfFile.byteLength
      const reduction = ((originalSize - compressedSize) / originalSize) * 100

      setCompressionStats({
        originalSize,
        compressedSize,
        reduction
      })
      
      const blob = new Blob([compressedPdfFile], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      setProcessedFiles({
        type: 'compress',
        files: [{ 
          name: `${compressFile.name.replace('.pdf', '')}_compressed.pdf`,
          url 
        }]
      })
    } catch (err) {
      setError('Error compressing PDF. Please try again.')
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const cleanup = () => {
    if (processedFiles) {
      processedFiles.files.forEach(file => URL.revokeObjectURL(file.url))
      setProcessedFiles(null)
    }
  }

  useEffect(() => {
    return () => cleanup()
  }, [])

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">PDF Tools</h1>

      {error && (
        <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-400/20 rounded-lg text-center">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto mb-8 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg text-center">
        <p className="text-blue-400 text-lg">
          🔒 Your PDFs are processed entirely in your browser. No files are uploaded to any server.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Operation Selection */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setSelectedOperation('merge')}
            className={`flex-1 py-3 px-4 rounded-lg text-center transition-colors ${
              selectedOperation === 'merge'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Merge PDFs
          </button>
          <button
            onClick={() => setSelectedOperation('split')}
            className={`flex-1 py-3 px-4 rounded-lg text-center transition-colors ${
              selectedOperation === 'split'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Split PDF
          </button>
          <button
            onClick={() => setSelectedOperation('compress')}
            className={`flex-1 py-3 px-4 rounded-lg text-center transition-colors ${
              selectedOperation === 'compress'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Compress PDF
          </button>
        </div>

        {/* Operation UI */}
        <div className="space-y-8">
          {selectedOperation === 'merge' && (
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-2xl font-semibold text-white mb-4">Merge PDFs</h2>
              <div {...getMergeRootProps()} className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                <input {...getMergeInputProps()} />
                <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-300 mb-4">
                  {mergeFiles.length > 0 
                    ? `Selected ${mergeFiles.length} files`
                    : 'Drop PDF files here or click to select'}
                </p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    mergePDFs()
                  }}
                  disabled={isProcessing || mergeFiles.length < 2}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-slate-600"
                >
                  {isProcessing ? 'Processing...' : 'Merge Files'}
                </button>
              </div>
            </div>
          )}

          {selectedOperation === 'split' && (
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-2xl font-semibold text-white mb-4">Split PDF</h2>
              <div {...getSplitRootProps()} className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                <input {...getSplitInputProps()} />
                <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-300 mb-4">
                  {splitFile ? splitFile.name : 'Drop a PDF file here or click to select'}
                </p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    splitPDF()
                  }}
                  disabled={isProcessing || !splitFile}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-slate-600"
                >
                  {isProcessing ? 'Processing...' : 'Split PDF'}
                </button>
              </div>
            </div>
          )}

          {selectedOperation === 'compress' && (
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-2xl font-semibold text-white mb-4">Compress PDF</h2>
              <div {...getCompressRootProps()} className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                <input {...getCompressInputProps()} />
                <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-300 mb-4">
                  {compressFile ? compressFile.name : 'Drop a PDF file here or click to select'}
                </p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    compressPDF()
                  }}
                  disabled={isProcessing || !compressFile}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-slate-600"
                >
                  {isProcessing ? 'Processing...' : 'Compress PDF'}
                </button>
              </div>
            </div>
          )}

          {processedFiles && processedFiles.type === 'merge' && (
  <div className="mt-6 p-4 bg-slate-700 rounded-lg">
    <h3 className="text-white font-semibold mb-3">Processed Files</h3>
    {processedFiles.files.map((file, index) => (
      <button
        key={index}
        onClick={() => downloadFile(file.url, file.name)}
        className="w-full text-left p-3 bg-slate-600 hover:bg-slate-500 rounded flex items-center justify-between text-white mb-2"
      >
        <span>{file.name}</span>
        <span className="text-blue-300">Download</span>
      </button>
    ))}
  </div>
)}

          {processedFiles && processedFiles.type === 'split' && (
  <div className="mt-6 p-4 bg-slate-700 rounded-lg">
    <h3 className="text-white font-semibold mb-3">Split Pages</h3>
    {processedFiles.files.map((file, index) => (
      <button
        key={index}
        onClick={() => downloadFile(file.url, file.name)}
        className="w-full text-left p-3 bg-slate-600 hover:bg-slate-500 rounded flex items-center justify-between text-white mb-2"
      >
        <span>{file.name}</span>
        <span className="text-blue-300">Download</span>
      </button>
    ))}
  </div>
)}

          {processedFiles && processedFiles.type === 'compress' && (
  <div className="mt-6 p-4 bg-slate-700 rounded-lg">
    <h3 className="text-white font-semibold mb-3">Compressed File</h3>
    {compressionStats && (
      <div className="mb-4 text-sm text-slate-300">
        <p>Original size: {(compressionStats.originalSize / 1024).toFixed(2)} KB</p>
        <p>Compressed size: {(compressionStats.compressedSize / 1024).toFixed(2)} KB</p>
        <p className="text-blue-300 font-semibold">
          Size reduced by {compressionStats.reduction.toFixed(1)}%
        </p>
      </div>
    )}
    {processedFiles.files.map((file, index) => (
      <button
        key={index}
        onClick={() => downloadFile(file.url, file.name)}
        className="w-full text-left p-3 bg-slate-600 hover:bg-slate-500 rounded flex items-center justify-between text-white mb-2"
      >
        <span>{file.name}</span>
        <span className="text-blue-300">Download</span>
      </button>
    ))}
  </div>
)}
        </div>
      </div>
    </main>
  )
}