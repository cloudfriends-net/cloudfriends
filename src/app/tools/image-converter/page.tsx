'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { ArrowUpTrayIcon, PhotoIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import JSZip from 'jszip'
import ThemeAwareLayout from '../../../components/ThemeAwareLayout'
import { useThemeContext } from '../../../components/ThemeProvider'

type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp'

interface ImageFile {
  file: File
  previewUrl: string
  status: 'pending' | 'converting' | 'completed' | 'error'
  convertedUrl?: string
}

export default function ImageConverter() {
  const { resolvedTheme } = useThemeContext()
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('image/jpeg')
  const [isConverting, setIsConverting] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    
    const newImageFiles = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending' as const
      }))
    
    setImageFiles(prev => [...prev, ...newImageFiles])
  }
  
  const removeFile = (index: number) => {
    setImageFiles(prev => {
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index].previewUrl)
      if (prev[index].convertedUrl) {
        URL.revokeObjectURL(prev[index].convertedUrl)
      }
      
      return prev.filter((_, i) => i !== index)
    })
  }

  const clearAllFiles = () => {
    // Clean up all object URLs
    imageFiles.forEach(file => {
      URL.revokeObjectURL(file.previewUrl)
      if (file.convertedUrl) {
        URL.revokeObjectURL(file.convertedUrl)
      }
    })
    setImageFiles([])
  }

  const convertImage = async (imageFile: ImageFile, index: number) => {
    if (!canvasRef.current) return null
    
    try {
      setImageFiles(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'converting' } : item
      ))
      
      const img = new window.Image()
      img.src = imageFile.previewUrl

      const blob = await new Promise<Blob | null>((resolve) => {
        img.onload = () => {
          const canvas = canvasRef.current!
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0)

          canvas.toBlob((blob) => resolve(blob), targetFormat, 0.9)
        }
        img.onerror = () => resolve(null)
      })
      
      if (blob) {
        const convertedUrl = URL.createObjectURL(blob)
        setImageFiles(prev => prev.map((item, i) => 
          i === index ? { 
            ...item, 
            status: 'completed', 
            convertedUrl 
          } : item
        ))
        return blob
      }
      
      throw new Error('Failed to convert image')
    } catch (error) {
      console.error(`Error converting image ${imageFile.file.name}:`, error)
      setImageFiles(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'error' } : item
      ))
      return null
    }
  }

  const convertAllImages = async () => {
    if (!imageFiles.length || !canvasRef.current) return
    
    setIsConverting(true)
    setConversionProgress(0)
    
    const results: (Blob | null)[] = []
    
    for (let i = 0; i < imageFiles.length; i++) {
      if (imageFiles[i].status !== 'completed') {
        const blob = await convertImage(imageFiles[i], i)
        results.push(blob)
      } else {
        results.push(null)
      }
      setConversionProgress(Math.round(((i + 1) / imageFiles.length) * 100))
    }
    
    setIsConverting(false)
    return results.filter(Boolean) as Blob[]
  }

  const downloadSingleFile = (index: number) => {
    const imageFile = imageFiles[index]
    if (!imageFile.convertedUrl) return
    
    const a = document.createElement('a')
    a.href = imageFile.convertedUrl
    const extension = targetFormat.split('/')[1]
    a.download = `${imageFile.file.name.split('.')[0]}.${extension}`
    a.click()
  }

  const downloadAllAsZip = async () => {
    // First ensure all images are converted
    if (imageFiles.some(file => file.status === 'pending')) {
      await convertAllImages();
    }
    
    // Get all completed files
    const completedFiles = imageFiles.filter(file => file.status === 'completed');
    if (completedFiles.length === 0) return;
    
    try {
      const zip = new JSZip();
      const extension = targetFormat.split('/')[1];
      
      // Add each file to the zip - we need to fetch all blobs first
      const fetchPromises = completedFiles.map(async (imageFile) => {
        // Convert data URL to blob
        const response = await fetch(imageFile.convertedUrl!);
        const blob = await response.blob();
        const fileName = `${imageFile.file.name.split('.')[0]}.${extension}`;
        
        // Add to zip
        zip.file(fileName, blob);
      });
      
      // Wait for all files to be added to the zip
      await Promise.all(fetchPromises);
      
      // Generate and download the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = 'converted-images.zip';
      a.click();
      
      // Clean up
      URL.revokeObjectURL(zipUrl);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      alert('Failed to create ZIP file. Please try again.');
    }
  }
  
  return (
    <ThemeAwareLayout showThemeToggle={false}>
      <div className={`min-h-screen ${
        resolvedTheme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
      }`} style={{ paddingTop: '5.5rem' }}>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <PhotoIcon className="h-8 w-8 text-blue-500" />
              <h1 className={`text-3xl font-bold ${
                resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>Bulk Image Converter</h1>
            </div>

            {/* How to use */}
            <div className={`mb-8 ${
              resolvedTheme === 'dark' 
                ? 'bg-blue-900/20 border-blue-700' 
                : 'bg-blue-100 border-blue-300'
            } border rounded-lg p-5`}>
              <h2 className={`text-xl font-semibold mb-2 ${
                resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>How to use</h2>
              <ul className={`list-disc list-inside ${
                resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <li>Click the upload area or drag and drop multiple image files.</li>
                <li>Select your desired output format (JPG, PNG, or WebP).</li>
                <li>Click <span className={`font-semibold ${
                  resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}>Convert All</span> to process all images.</li>
                <li>Download individual images or all images as a ZIP file.</li>
              </ul>
            </div>

            <div className={`${
              resolvedTheme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-300'
            } p-6 rounded-lg border shadow mb-8`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>Upload Images</h2>

              <div className={`border-2 border-dashed ${
                resolvedTheme === 'dark' 
                  ? 'border-gray-600 hover:border-gray-500' 
                  : 'border-gray-300 hover:border-gray-400'
              } rounded-lg p-8 text-center transition-colors`}>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="imageInput"
                multiple
              />
              <label htmlFor="imageInput" className="cursor-pointer">
                <ArrowUpTrayIcon className={`h-12 w-12 mx-auto mb-4 ${
                  resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Drop images here or click to select multiple files
                </p>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className="w-full md:w-auto flex-1">
                <label className={`block text-sm font-medium mb-2 ${
                  resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>Convert to:</label>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === 'dark'
                      ? 'bg-gray-700 text-gray-100 border-gray-600'
                      : 'bg-gray-200 text-gray-900 border-gray-300'
                  }`}
                >
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
              
              <div className="w-full md:w-auto flex gap-2">
                <button
                  onClick={convertAllImages}
                  disabled={!imageFiles.length || isConverting}
                  className={`flex-1 px-4 py-2 rounded transition-colors ${
                    !imageFiles.length || isConverting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isConverting ? `Converting... ${conversionProgress}%` : 'Convert All'}
                </button>
                
                <button
                  onClick={downloadAllAsZip}
                  disabled={!imageFiles.some(file => file.status === 'completed')}
                  className={`flex-1 px-4 py-2 rounded transition-colors ${
                    !imageFiles.some(file => file.status === 'completed')
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Download All (ZIP)
                </button>
                
                {imageFiles.length > 0 && (
                  <button
                    onClick={clearAllFiles}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Image List */}
          {imageFiles.length > 0 && (
            <div className={`${
              resolvedTheme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-300'
            } p-6 rounded-lg border shadow`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>Images ({imageFiles.length})</h2>
              
              <div className="overflow-auto max-h-[600px]">
                <table className={`min-w-full divide-y ${
                  resolvedTheme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  <thead className={resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>Preview</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>Filename</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>Size</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>Status</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`${
                    resolvedTheme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                  } divide-y`}>
                    {imageFiles.map((imageFile, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-16 h-16 relative">
                            <Image
                              src={imageFile.previewUrl}
                              alt="Preview"
                              fill
                              className="object-contain rounded"
                              unoptimized
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${
                            resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                          }`}>{imageFile.file.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${
                            resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {(imageFile.file.size / 1024).toFixed(1)} KB
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${imageFile.status === 'pending' ? 'bg-gray-100 text-gray-800' : ''}
                            ${imageFile.status === 'converting' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${imageFile.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                            ${imageFile.status === 'error' ? 'bg-red-100 text-red-800' : ''}
                          `}>
                            {imageFile.status.charAt(0).toUpperCase() + imageFile.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                          {imageFile.status === 'completed' && (
                            <button 
                              onClick={() => downloadSingleFile(index)}
                              className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700"
                            >
                              Download
                            </button>
                          )}
                          <button 
                            onClick={() => removeFile(index)}
                            className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />

          {/* How does it work */}
          <div className={`mt-10 mb-8 ${
            resolvedTheme === 'dark' 
              ? 'bg-blue-900/20 border-blue-700' 
              : 'bg-blue-100 border-blue-300'
          } border rounded-lg p-5`}>
            <h2 className={`text-xl font-semibold mb-2 ${
              resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>How does it work?</h2>
            <ul className={`list-disc list-inside ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>
                <span className="font-semibold">Privacy:</span> All image processing happens <span className={
                  resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }>locally in your browser</span>. Your images are never uploaded to any server.
              </li>
              <li>
                <span className="font-semibold">Bulk Processing:</span> Convert multiple images at once and download them individually or as a ZIP archive.
              </li>
              <li>
                <span className="font-semibold">Conversion:</span> The tool uses the HTML5 Canvas API to decode your image and re-encode it in the selected format.
              </li>
            </ul>
          </div>
        </div>
      </main>
      </div>
    </ThemeAwareLayout>
  )
}
