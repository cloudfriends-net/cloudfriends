'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { ArrowUpTrayIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { PDFDocument } from 'pdf-lib'
import { useDropzone } from 'react-dropzone'
import JSZip from 'jszip'
import dynamic from 'next/dynamic'
import ThemeAwareLayout from '../../../components/ThemeAwareLayout'

// Import PDF preview component dynamically with SSR disabled
type PDFPreviewProps = {
  previewUrl: string;
  fileName: string;
  onClose: () => void;
  onPageCountDetermined: (pageCount: number) => void;
};

const PDFPreview = dynamic<PDFPreviewProps>(() => import('./PDFPreview'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg">Loading PDF viewer...</div>
  </div>
});

type Operation = 'merge' | 'split' | 'compress'

type PageRange = {
  start: number;
  end: number;
}

type PDFFile = {
  file: File
  previewUrl?: string
  pageCount?: number
  isProcessing?: boolean
  isProcessed?: boolean
  result?: {
    name: string
    url: string
  }
  compressionStats?: CompressionResult
  selectedPages?: PageRange[] // Add this line
}

type CompressionResult = {
  originalSize: number
  compressedSize: number
  reduction: number
}

export default function PDFTools() {
  const [selectedOperation, setSelectedOperation] = useState<Operation>('merge')
  const [mergeFiles, setMergeFiles] = useState<PDFFile[]>([])
  const [splitFiles, setSplitFiles] = useState<PDFFile[]>([])
  const [compressFiles, setCompressFiles] = useState<PDFFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState<{fileIndex: number, operation: Operation} | null>(null)
  const [pageSelections, setPageSelections] = useState<Record<number, PageRange[]>>({})
  
  // Reference to store created object URLs for cleanup
  const objectUrlsRef = useRef<string[]>([])

  const onMergeDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter((file) => file.type === 'application/pdf')
    const newFiles = pdfFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }))
    
    // Store URLs for cleanup
    newFiles.forEach(file => {
      if (file.previewUrl) objectUrlsRef.current.push(file.previewUrl)
    })
    
    setMergeFiles(prev => [...prev, ...newFiles])
  }, [])

  const onSplitDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter((file) => file.type === 'application/pdf')
    const newFiles = pdfFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }))
    
    // Store URLs for cleanup
    newFiles.forEach(file => {
      if (file.previewUrl) objectUrlsRef.current.push(file.previewUrl)
    })
    
    setSplitFiles(prev => [...prev, ...newFiles])
  }, [])

  const onCompressDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter((file) => file.type === 'application/pdf')
    const newFiles = pdfFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }))
    
    // Store URLs for cleanup
    newFiles.forEach(file => {
      if (file.previewUrl) objectUrlsRef.current.push(file.previewUrl)
    })
    
    setCompressFiles(prev => [...prev, ...newFiles])
  }, [])

  const mergePDFs = async () => {
    if (mergeFiles.length < 2) {
      setError('Please select at least 2 PDF files to merge')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      
      const mergedPdf = await PDFDocument.create()

      for (const [fileIndex, file] of mergeFiles.entries()) {
        const fileBuffer = await file.file.arrayBuffer()
        const pdf = await PDFDocument.load(fileBuffer)
        
        // Get selected page ranges or use all pages
        const selectedRanges = pageSelections[fileIndex] || 
          (file.pageCount ? [{ start: 1, end: file.pageCount }] : []);
        
        if (selectedRanges.length > 0) {
          // Process only selected pages
          const pageIndices: number[] = [];
          const processedPages = new Set();
          
          for (const range of selectedRanges) {
            for (let pageNum = range.start; pageNum <= range.end; pageNum++) {
              if (processedPages.has(pageNum)) continue;
              processedPages.add(pageNum);
              
              // PDF pages are 0-indexed in pdf-lib, but 1-indexed in our UI
              const pageIndex = pageNum - 1;
              if (pageIndex >= 0 && pageIndex < pdf.getPageCount()) {
                pageIndices.push(pageIndex);
              }
            }
          }
          
          if (pageIndices.length > 0) {
            const pages = await mergedPdf.copyPages(pdf, pageIndices)
            pages.forEach(page => mergedPdf.addPage(page))
          }
        } else {
          // Add all pages if no selection
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
          pages.forEach(page => mergedPdf.addPage(page))
        }
      }

      const mergedPdfFile = await mergedPdf.save()
      const blob = new Blob([mergedPdfFile], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      objectUrlsRef.current.push(url)

      // Set a single result for merge operation
      const mergeResult = {
        name: 'merged.pdf',
        url
      }
      
      // Update all files to show they're processed
      setMergeFiles(prev => prev.map(file => ({
        ...file,
        isProcessed: true,
        result: mergeResult
      })))
    } catch (err) {
      setError('Error merging PDFs. Please try again.')
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const splitPDF = async () => {
    if (splitFiles.length === 0) {
      setError('Please select at least one PDF file to split')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      setProcessingProgress(0)
      
      let processed = 0;
      const totalFiles = splitFiles.length;

      // Process each file one by one
      for (let fileIndex = 0; fileIndex < splitFiles.length; fileIndex++) {
        // Skip already processed files
        if (splitFiles[fileIndex].isProcessed) {
          processed++;
          setProcessingProgress(Math.round((processed / totalFiles) * 100));
          continue;
        }
        
        // Mark current file as processing
        setSplitFiles(prev => {
          const updated = [...prev];
          updated[fileIndex] = { ...updated[fileIndex], isProcessing: true };
          return updated;
        });

        const currentFile = splitFiles[fileIndex];
        const fileBuffer = await currentFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const pageCount = pdf.getPageCount();
        
        // Get page ranges for this file
        const selectedRanges = pageSelections[fileIndex] || [{ start: 1, end: pageCount }];
        
        // Create a zip file for this PDF's pages
        const zip = new JSZip();
        
        // Track which pages we've processed to avoid duplicates
        const processedPages = new Set();
        
        // Extract selected pages based on ranges
        for (const range of selectedRanges) {
          for (let pageNum = range.start; pageNum <= range.end; pageNum++) {
            if (processedPages.has(pageNum)) continue;
            processedPages.add(pageNum);
            
            // PDF pages are 0-indexed in pdf-lib, but 1-indexed in our UI
            const pageIndex = pageNum - 1;
            
            if (pageIndex < 0 || pageIndex >= pageCount) {
              continue;
            }
            
            const newPdf = await PDFDocument.create();
            const [page] = await newPdf.copyPages(pdf, [pageIndex]);
            newPdf.addPage(page);
            
            const pdfBytes = await newPdf.save();
            zip.file(`page-${pageNum}.pdf`, pdfBytes);
          }
        }
        
        // Generate the zip file
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(zipBlob);
        objectUrlsRef.current.push(zipUrl);
        
        // Update the file's status
        setSplitFiles(prev => {
          const updated = [...prev];
          updated[fileIndex] = {
            ...updated[fileIndex],
            isProcessing: false,
            isProcessed: true,
            pageCount,
            result: {
              name: `${currentFile.file.name.replace('.pdf', '')}_pages.zip`,
              url: zipUrl
            }
          };
          return updated;
        });
        
        processed++;
        setProcessingProgress(Math.round((processed / totalFiles) * 100));
      }
      
    } catch (err) {
      setError('Error splitting PDF. Please try again.')
      console.error('Error splitting PDF:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const compressPDF = async () => {
    if (compressFiles.length === 0) {
      setError('Please select at least one PDF file to compress')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      setProcessingProgress(0)
      
      let processed = 0;
      const totalFiles = compressFiles.length;

      // Process each file one by one
      for (let fileIndex = 0; fileIndex < compressFiles.length; fileIndex++) {
        // Skip already processed files
        if (compressFiles[fileIndex].isProcessed) {
          processed++;
          setProcessingProgress(Math.round((processed / totalFiles) * 100));
          continue;
        }
        
        // Mark current file as processing
        setCompressFiles(prev => {
          const updated = [...prev];
          updated[fileIndex] = { ...updated[fileIndex], isProcessing: true };
          return updated;
        });

        const currentFile = compressFiles[fileIndex];
        const fileBuffer = await currentFile.file.arrayBuffer();
        const originalSize = fileBuffer.byteLength;
        const pdf = await PDFDocument.load(fileBuffer);

        const compressedPdfFile = await pdf.save({
          useObjectStreams: true,
        });

        const compressedSize = compressedPdfFile.byteLength;
        const reduction = ((originalSize - compressedSize) / originalSize) * 100;

        const compressionStats = {
          originalSize,
          compressedSize,
          reduction,
        };

        const blob = new Blob([compressedPdfFile], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        objectUrlsRef.current.push(url);
        
        // Update the file's status
        setCompressFiles(prev => {
          const updated = [...prev];
          updated[fileIndex] = {
            ...updated[fileIndex],
            isProcessing: false,
            isProcessed: true,
            compressionStats,
            result: {
              name: `${currentFile.file.name.replace('.pdf', '')}_compressed.pdf`,
              url
            }
          };
          return updated;
        });
        
        processed++;
        setProcessingProgress(Math.round((processed / totalFiles) * 100));
      }
      
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

  const downloadAllAsZip = async (operation: Operation) => {
    try {
      const files = operation === 'merge' 
        ? mergeFiles
        : operation === 'split' 
          ? splitFiles 
          : compressFiles;
      
      const processedFiles = files.filter(file => file.isProcessed && file.result);
      if (processedFiles.length === 0) return;
      
      const zip = new JSZip();
      
      // Add each file to the zip - we need to fetch all blobs first
      const fetchPromises = processedFiles.map(async (pdfFile) => {
        if (!pdfFile.result) return;
        
        // Convert URL to blob
        const response = await fetch(pdfFile.result.url);
        const blob = await response.blob();
        
        // Add to zip
        zip.file(pdfFile.result.name, blob);
      });
      
      // Wait for all files to be added to the zip
      await Promise.all(fetchPromises);
      
      // Generate and download the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `${operation}-pdfs.zip`;
      a.click();
      
      // Clean up
      URL.revokeObjectURL(zipUrl);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      setError('Failed to create ZIP file. Please try again.');
    }
  }

  const togglePreview = (fileIndex: number, operation: Operation) => {
    if (showPreview && showPreview.fileIndex === fileIndex && showPreview.operation === operation) {
      setShowPreview(null);
    } else {
      setShowPreview({ fileIndex, operation });
    }
  }

  // Removed unused cleanup function referencing undefined 'processedFiles'

  const removeMergeFile = (index: number) => {
    setMergeFiles(prev => {
      const newFiles = [...prev]
      // Revoke the URL to prevent memory leaks
      if (newFiles[index].previewUrl) {
        URL.revokeObjectURL(newFiles[index].previewUrl)
        // Remove from ref array
        objectUrlsRef.current = objectUrlsRef.current.filter(url => url !== newFiles[index].previewUrl)
      }
      if (newFiles[index].result?.url) {
        URL.revokeObjectURL(newFiles[index].result.url)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const removeSplitFile = (index: number) => {
    setSplitFiles(prev => {
      const newFiles = [...prev]
      // Revoke the URL to prevent memory leaks
      if (newFiles[index].previewUrl) {
        URL.revokeObjectURL(newFiles[index].previewUrl)
        // Remove from ref array
        objectUrlsRef.current = objectUrlsRef.current.filter(url => url !== newFiles[index].previewUrl)
      }
      if (newFiles[index].result?.url) {
        URL.revokeObjectURL(newFiles[index].result.url)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const removeCompressFile = (index: number) => {
    setCompressFiles(prev => {
      const newFiles = [...prev]
      // Revoke the URL to prevent memory leaks
      if (newFiles[index].previewUrl) {
        URL.revokeObjectURL(newFiles[index].previewUrl)
        // Remove from ref array
        objectUrlsRef.current = objectUrlsRef.current.filter(url => url !== newFiles[index].previewUrl)
      }
      if (newFiles[index].result?.url) {
        URL.revokeObjectURL(newFiles[index].result.url)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const clearFiles = (operation: Operation) => {
    if (operation === 'merge') {
      mergeFiles.forEach(file => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl)
        if (file.result?.url) URL.revokeObjectURL(file.result.url)
      })
      setMergeFiles([])
    } else if (operation === 'split') {
      splitFiles.forEach(file => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl)
        if (file.result?.url) URL.revokeObjectURL(file.result.url)
      })
      setSplitFiles([])
    } else if (operation === 'compress') {
      compressFiles.forEach(file => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl)
        if (file.result?.url) URL.revokeObjectURL(file.result.url)
      })
      setCompressFiles([])
    }
  }

  // Cleanup function
  useEffect(() => {
    return () => {
      // Revoke all object URLs to prevent memory leaks
      objectUrlsRef.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Keep existing dropzone setup
  const { getRootProps: getMergeRootProps, getInputProps: getMergeInputProps } = useDropzone({
    onDrop: onMergeDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  })

  const { getRootProps: getSplitRootProps, getInputProps: getSplitInputProps } = useDropzone({
    onDrop: onSplitDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true, // Changed to true for bulk processing
  })

  const { getRootProps: getCompressRootProps, getInputProps: getCompressInputProps } = useDropzone({
    onDrop: onCompressDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true, // Changed to true for bulk processing
  })

  const MergeFileTable = () => {
    if (mergeFiles.length === 0) return null;
    
    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-700">Files ({mergeFiles.length})</h3>
          <button
            onClick={() => clearFiles('merge')}
            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
          >
            Clear All
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mergeFiles.map((file, index) => (
                <React.Fragment key={index}>
                  <tr className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="truncate max-w-[200px]">{file.file.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-sm">
                      {(file.file.size / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <span 
                        className={`text-xs px-2 py-1 rounded-full ${
                          file.isProcessed ? 'bg-green-100 text-green-800' : 
                          file.isProcessing ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {file.isProcessed ? 'Processed' : file.isProcessing ? 'Processing' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => togglePreview(index, 'merge')} 
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Preview
                        </button>
                        <button 
                          onClick={() => removeMergeFile(index)} 
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Add page selector for merge files too */}
                  <tr>
                    <td colSpan={4} className="p-0">
                      <div className="px-4 pb-3">
                        {file.pageCount ? (
                          <PageRangeSelector fileIndex={index} pageCount={file.pageCount} />
                        ) : (
                          <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-blue-50">
                            <p className="text-sm text-blue-700 font-medium">
                              Click &rdquo;Preview&rdquo; to determine page count and enable page selection
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {mergeFiles.some(file => file.isProcessed) && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => downloadFile(mergeFiles[0].result!.url, mergeFiles[0].result!.name)}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Download Merged PDF
            </button>
          </div>
        )}
      </div>
    );
  };
  
  const SplitFileTable = () => {
    if (splitFiles.length === 0) return null;
    
    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-700">Files ({splitFiles.length})</h3>
          <div className="flex gap-2">
            {splitFiles.some(file => file.isProcessed) && (
              <button
                onClick={() => downloadAllAsZip('split')}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              >
                Download All (ZIP)
              </button>
            )}
            <button
              onClick={() => clearFiles('split')}
              className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
            >
              Clear All
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pages</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {splitFiles.map((file, index) => (
                <React.Fragment key={index}>
                  <tr className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="truncate max-w-[200px]">{file.file.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-sm">
                      {(file.file.size / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-sm">
                      {file.pageCount || '-'}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <span 
                        className={`text-xs px-2 py-1 rounded-full ${
                          file.isProcessed ? 'bg-green-100 text-green-800' : 
                          file.isProcessing ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {file.isProcessed ? 'Processed' : file.isProcessing ? 'Processing' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => togglePreview(index, 'split')} 
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Preview
                        </button>
                        {file.isProcessed && file.result && (
                          <button 
                            onClick={() => file.result && downloadFile(file.result.url, file.result.name)}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                          >
                            Download
                          </button>
                        )}
                        <button 
                          onClick={() => removeSplitFile(index)} 
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="p-0">
                      <div className="px-4 pb-3">
                        {file.pageCount ? (
                          <PageRangeSelector fileIndex={index} pageCount={file.pageCount} />
                        ) : (
                          <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-blue-50">
                            <p className="text-sm text-blue-700 font-medium">
                              Click &rdquo;Preview&rdquo; to determine page count and enable page selection
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  const CompressFileTable = () => {
    if (compressFiles.length === 0) return null;
    
    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-700">Files ({compressFiles.length})</h3>
          <div className="flex gap-2">
            {compressFiles.some(file => file.isProcessed) && (
              <button
                onClick={() => downloadAllAsZip('compress')}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              >
                Download All (ZIP)
              </button>
            )}
            <button
              onClick={() => clearFiles('compress')}
              className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
            >
              Clear All
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compressed Size</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {compressFiles.map((file, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-3 px-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="truncate max-w-[200px]">{file.file.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-sm">
                    {(file.file.size / 1024).toFixed(1)} KB
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-sm">
                    {file.compressionStats ? 
                      `${(file.compressionStats.compressedSize / 1024).toFixed(1)} KB (${file.compressionStats.reduction.toFixed(1)}% reduction)` : 
                      '-'}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200">
                    <span 
                      className={`text-xs px-2 py-1 rounded-full ${
                        file.isProcessed ? 'bg-green-100 text-green-800' : 
                        file.isProcessing ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {file.isProcessed ? 'Processed' : file.isProcessing ? 'Processing' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => togglePreview(index, 'compress')} 
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        Preview
                      </button>
                      {file.isProcessed && file.result && (
                        <button 
                          onClick={() => file.result && downloadFile(file.result.url, file.result.name)}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          Download
                        </button>
                      )}
                      <button 
                        onClick={() => removeCompressFile(index)} 
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const PDFPreviewModal = () => {
    if (!showPreview) return null;
    
    const { fileIndex, operation } = showPreview;
    let file;
    
    if (operation === 'merge') {
      file = mergeFiles[fileIndex];
    } else if (operation === 'split') {
      file = splitFiles[fileIndex];
    } else {
      file = compressFiles[fileIndex];
    }
    
    if (!file || !file.previewUrl) return null;

    const handlePageCountDetermined = (pageCount: number) => {
      // Update the page count if not already set (for split operation)
      if (operation === 'split' && !file.pageCount) {
        setSplitFiles(prev => {
          const updated = [...prev];
          updated[fileIndex] = { ...updated[fileIndex], pageCount };
          return updated;
        });
      }
    };
    
    return (
      <PDFPreview 
        previewUrl={file.previewUrl} 
        fileName={file.file.name}
        onClose={() => setShowPreview(null)}
        onPageCountDetermined={handlePageCountDetermined}
      />
    );
  };

  // Add this component inside your PDFTools function
  const PageRangeSelector = ({ fileIndex, pageCount }: { fileIndex: number, pageCount: number }) => {
    const [inputValue, setInputValue] = useState('')
    const [error, setError] = useState<string | null>(null)

    const currentSelections = pageSelections[fileIndex] || []

    const handleAddRange = () => {
      setError(null)
      
      // Parse the input (examples: "1-5", "7", "1,3,5-9")
      try {
        const ranges: PageRange[] = []
        
        // Split by commas to handle multiple entries
        const parts = inputValue.split(',').map(p => p.trim()).filter(Boolean)
        
        for (const part of parts) {
          if (part.includes('-')) {
            // Range like "1-5"
            const [start, end] = part.split('-').map(num => parseInt(num.trim(), 10))
            
            if (isNaN(start) || isNaN(end)) {
              setError('Invalid range format')
              return
            }
            
            if (start < 1 || end > pageCount || start > end) {
              setError(`Range ${start}-${end} is invalid. Pages must be between 1 and ${pageCount}`)
              return
            }
            
            ranges.push({ start, end })
          } else {
            // Single page like "7"
            const page = parseInt(part.trim(), 10)
            
            if (isNaN(page)) {
              setError('Invalid page number')
              return
            }
            
            if (page < 1 || page > pageCount) {
              setError(`Page ${page} is invalid. Pages must be between 1 and ${pageCount}`)
              return
            }
            
            ranges.push({ start: page, end: page })
          }
        }
        
        // Update the selections
        setPageSelections(prev => ({
          ...prev,
          [fileIndex]: [...(prev[fileIndex] || []), ...ranges]
        }))
        
        setInputValue('')
      } catch (err) {
        console.error('Error parsing page ranges:', err);
        setError('Invalid format. Use patterns like "1-5", "7", or "1,3,5-9"')
      }
    }

    const handleRemoveRange = (rangeIndex: number) => {
      setPageSelections(prev => {
        const updated = { ...prev }
        updated[fileIndex] = updated[fileIndex].filter((_, i) => i !== rangeIndex)
        return updated
      })
    }

    const handleSelectAll = () => {
      setPageSelections(prev => ({
        ...prev,
        [fileIndex]: [{ start: 1, end: pageCount }]
      }))
    }

    const handleClearAll = () => {
      setPageSelections(prev => {
        const updated = { ...prev }
        delete updated[fileIndex]
        return updated
      })
    }

    const totalSelectedPages = currentSelections.reduce(
      (sum, range) => sum + (range.end - range.start + 1), 0
    )

    return (
      <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Select pages to include:</h4>
        
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g., 1-5, 7, 9-12"
            className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
          />
          <button
            onClick={handleAddRange}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        
        {error && (
          <p className="text-red-600 text-xs mb-3">{error}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          {currentSelections.map((range, i) => (
            <div key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
              {range.start === range.end ? 
                `Page ${range.start}` : 
                `Pages ${range.start}-${range.end}`
              }
              <button 
                onClick={() => handleRemoveRange(i)}
                className="ml-1 text-blue-800 hover:text-blue-900"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between">
          <div className="text-xs text-gray-500">
            {currentSelections.length > 0 
              ? `${totalSelectedPages} page${totalSelectedPages !== 1 ? 's' : ''} selected` 
              : 'No pages selected (all pages will be included)'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ThemeAwareLayout>
      <main className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-8" style={{ paddingTop: '5.5rem' }}>
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">PDF Tools</h1>

        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">How to Use</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>
              <b>Merge:</b> Select two or more PDF files to combine them into a single document.
            </li>
            <li>
              <b>Split:</b> Upload multiple PDF files to split each into separate pages.
            </li>
            <li>
              <b>Compress:</b> Select multiple PDF files to reduce their file sizes.
            </li>
          </ul>
        </div>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setSelectedOperation('merge')}
            className={`flex-1 py-3 px-4 rounded-lg text-center transition-colors ${
              selectedOperation === 'merge' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
            }`}
          >
            Merge PDFs
          </button>
          <button
            onClick={() => setSelectedOperation('split')}
            className={`flex-1 py-3 px-4 rounded-lg text-center transition-colors ${
              selectedOperation === 'split' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
            }`}
          >
            Split PDFs
          </button>
          <button
            onClick={() => setSelectedOperation('compress')}
            className={`flex-1 py-3 px-4 rounded-lg text-center transition-colors ${
              selectedOperation === 'compress' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
            }`}
          >
            Compress PDFs
          </button>
        </div>

        {/* Operation UI */}
        <div className="space-y-8">
          {selectedOperation === 'merge' && (
            <div className="bg-white p-6 rounded-lg border border-gray-300">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Merge PDFs</h2>
              <div {...getMergeRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input {...getMergeInputProps()} />
                <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-700 mb-4">
                  Drop PDF files here or click to select multiple files
                </p>
              </div>
              
              <MergeFileTable />
              
              {mergeFiles.length >= 2 && !isProcessing && !mergeFiles.some(f => f.isProcessed) && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={mergePDFs}
                    disabled={isProcessing}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                  >
                    {isProcessing ? `Processing...` : 'Merge PDFs'}
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedOperation === 'split' && (
            <div className="bg-white p-6 rounded-lg border border-gray-300">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Split PDFs</h2>
              <div {...getSplitRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input {...getSplitInputProps()} />
                <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-700 mb-4">
                  Drop PDF files here or click to select multiple files
                </p>
              </div>
              
              <SplitFileTable />
              
              {splitFiles.length > 0 && !isProcessing && !splitFiles.some(f => f.isProcessed) && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={splitPDF}
                    disabled={isProcessing}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                  >
                    {isProcessing ? `Processing... ${processingProgress}%` : 'Split PDFs'}
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedOperation === 'compress' && (
            <div className="bg-white p-6 rounded-lg border border-gray-300">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Compress PDFs</h2>
              <div {...getCompressRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input {...getCompressInputProps()} />
                <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-700 mb-4">
                  Drop PDF files here or click to select multiple files
                </p>
              </div>
              
              <CompressFileTable />
              
              {compressFiles.length > 0 && !isProcessing && !compressFiles.some(f => f.isProcessed) && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={compressPDF}
                    disabled={isProcessing}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                  >
                    {isProcessing ? `Processing... ${processingProgress}%` : 'Compress PDFs'}
                  </button>
                </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="bg-white p-4 rounded-lg border border-gray-300">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p className="text-center mt-2 text-gray-600">
                Processing... {processingProgress}%
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded mb-4">
              {error}
            </div>
          )}
          
          {/* PDF Preview Modal */}
          <PDFPreviewModal />
        </div>
      </div>
    </main>
    </ThemeAwareLayout>
  )
}

